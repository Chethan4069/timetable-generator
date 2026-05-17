import { useEffect, useState, useRef } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    DndContext, closestCenter,
    PointerSensor, useSensor, useSensors, DragOverlay,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const SLOTS = [1, 2, 3, 4, 5, 6];

const COLORS = [
    { bg: "bg-blue-800", border: "border-blue-500" },
    { bg: "bg-purple-800", border: "border-purple-500" },
    { bg: "bg-green-800", border: "border-green-500" },
    { bg: "bg-amber-800", border: "border-amber-500" },
    { bg: "bg-red-800", border: "border-red-500" },
    { bg: "bg-teal-800", border: "border-teal-500" },
    { bg: "bg-pink-800", border: "border-pink-500" },
    { bg: "bg-indigo-800", border: "border-indigo-500" },
];

// ── Stable color map ──────────────────────────────────────────────────────────
function buildColorMap(subjects, electivePairs) {
    const map = {};
    let index = 0;

    // Elective paired subjects share the same color
    (electivePairs || []).forEach(pair => {
        if (map[pair.subject1_id] === undefined) {
            map[pair.subject1_id] = index % COLORS.length;
            map[pair.subject2_id] = index % COLORS.length;
            index++;
        }
    });

    // Remaining subjects get unique colors
    Object.values(subjects || {}).forEach(s => {
        if (map[s.id] === undefined) {
            map[s.id] = index % COLORS.length;
            index++;
        }
    });

    return map;
}

// ── Elective label helper ─────────────────────────────────────────────────────
function getSubjectLabel(subjectId, electivePairs, subjects) {
    const pair = (electivePairs || []).find(
        p => p.subject1_id === subjectId || p.subject2_id === subjectId
    );
    if (pair) return pair.label;
    return subjects[subjectId]?.name || "Subject";
}

// ── Draggable card ────────────────────────────────────────────────────────────
function DraggableCard({
    gene, subjects, teachers, rooms,
    electivePairs, colorMap, onEdit, isDragging
}) {
    const dragId = `${gene.day}-${gene.slot_number}-${gene.subject_id}`;
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: dragId,
    });

    const colorIdx = colorMap?.[gene.subject_id] ??
        (gene.subject_id % COLORS.length);
    const color = COLORS[colorIdx % COLORS.length];
    const label = getSubjectLabel(gene.subject_id, electivePairs, subjects);
    const teacher = teachers[gene.teacher_id];
    const room = rooms[gene.room_id];

    const style = transform
        ? {
            transform: `translate(${transform.x}px,${transform.y}px)`,
            zIndex: 999, opacity: 0.85
        }
        : {};

    return (
        <div ref={setNodeRef} style={style}
            className={`h-20 rounded-lg border-2 p-2 flex flex-col
                  justify-between cursor-grab active:cursor-grabbing
                  ${color.bg} ${color.border}
                  ${isDragging ? "opacity-40" : ""}
                  transition-shadow hover:shadow-lg`}>
            <div {...listeners} {...attributes}
                className="flex-1 overflow-hidden">
                <div className="text-white text-xs font-bold truncate">
                    {label}
                </div>
                <div className="text-gray-300 text-xs truncate mt-0.5">
                    👨‍🏫 {teacher?.name || "—"}
                </div>
                <div className="text-gray-400 text-xs truncate">
                    🚪 {room?.name || "—"}
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onEdit(gene); }}
                className="text-xs text-gray-300 hover:text-white
                   bg-black/30 hover:bg-black/50 rounded
                   px-1.5 py-0.5 mt-1 w-fit transition">
                ✏️ Edit
            </button>
        </div>
    );
}

// ── Droppable cell ────────────────────────────────────────────────────────────
function DroppableCell({ day, slot, children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${day}-${slot}`,
    });
    return (
        <td className="p-1.5">
            <div ref={setNodeRef}
                className={`min-h-20 rounded-lg transition-all
                    ${isOver
                        ? "bg-blue-900/40 border-2 border-blue-400 border-dashed scale-105"
                        : "bg-gray-900/30 border border-gray-700"}`}>
                {children}
            </div>
        </td>
    );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({
    gene, subjects, teachers, rooms,
    onSave, onClose, onDelete
}) {
    const [form, setForm] = useState({
        subject_id: gene.subject_id,
        teacher_id: gene.teacher_id,
        room_id: gene.room_id,
        day: gene.day,
        slot_number: gene.slot_number,
    });

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center
                    justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md
                      shadow-2xl border border-gray-600">

                <h2 className="text-xl font-bold text-white mb-6">
                    ✏️ Edit — {gene.day} Slot {gene.slot_number}
                </h2>

                <div className="space-y-4">
                    {/* Subject, Teacher, Room dropdowns */}
                    {[
                        {
                            label: "Subject", key: "subject_id",
                            opts: Object.values(subjects), disp: s => s.name
                        },
                        {
                            label: "Teacher", key: "teacher_id",
                            opts: Object.values(teachers), disp: t => t.name
                        },
                        {
                            label: "Room", key: "room_id",
                            opts: Object.values(rooms), disp: r => r.name
                        },
                    ].map(({ label, key, opts, disp }) => (
                        <div key={key}>
                            <label className="text-gray-400 text-sm block mb-1">
                                {label}
                            </label>
                            <select
                                value={form[key]}
                                onChange={(e) => setForm({
                                    ...form, [key]: Number(e.target.value)
                                })}
                                className="w-full bg-gray-700 text-white px-4 py-3
                           rounded-lg border border-gray-600
                           focus:outline-none focus:border-blue-500">
                                {opts.map(o => (
                                    <option key={o.id} value={o.id}>{disp(o)}</option>
                                ))}
                            </select>
                        </div>
                    ))}

                    {/* Day + Slot */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-sm block mb-1">
                                Day
                            </label>
                            <select value={form.day}
                                onChange={(e) => setForm({ ...form, day: e.target.value })}
                                className="w-full bg-gray-700 text-white px-4 py-3
                           rounded-lg border border-gray-600
                           focus:outline-none focus:border-blue-500">
                                {DAYS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm block mb-1">
                                Slot
                            </label>
                            <select value={form.slot_number}
                                onChange={(e) => setForm({
                                    ...form, slot_number: Number(e.target.value)
                                })}
                                className="w-full bg-gray-700 text-white px-4 py-3
                           rounded-lg border border-gray-600
                           focus:outline-none focus:border-blue-500">
                                {SLOTS.map(s => (
                                    <option key={s} value={s}>Slot {s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Save + Cancel */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => onSave(gene, form)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold py-3 rounded-lg
                       transition">
                        ✅ Save Changes
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-700 hover:bg-gray-600
                       text-white font-semibold py-3 rounded-lg
                       transition">
                        Cancel
                    </button>
                </div>

                {/* Delete slot */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                    <button
                        onClick={() => {
                            if (window.confirm(
                                `Delete "${subjects[gene.subject_id]?.name || "this slot"}" ` +
                                `from ${gene.day} Slot ${gene.slot_number}?\n\n` +
                                `Note: For lab subjects, both consecutive slots will be removed.`
                            )) {
                                onDelete(gene);
                            }
                        }}
                        className="w-full bg-red-900/50 hover:bg-red-800
                       border border-red-700 text-red-300
                       hover:text-red-200 font-semibold py-3
                       rounded-lg transition flex items-center
                       justify-center gap-2">
                        🗑️ Delete this slot from timetable
                    </button>
                </div>

            </div>
        </div>
    );
}

// ── Single class timetable grid ───────────────────────────────────────────────
function TimetableGrid({
    genes, subjects, teachers, rooms,
    electivePairs, colorMap, classInfo, onGenesChange
}) {
    const [editGene, setEditGene] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedId, setSavedId] = useState(null);
    const [exporting, setExporting] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        })
    );

    // Build display grid for this class
    const displayGrid = {};
    (genes || []).forEach(gene => {
        const key = `${gene.day}-${gene.slot_number}`;
        if (!displayGrid[key]) displayGrid[key] = { ...gene };
    });

    // ── Drag end ────────────────────────────────────────────────────────────────
    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        const srcParts = active.id.split("-");
        const destParts = over.id.split("-");
        const srcDay = srcParts[0];
        const srcSlot = Number(srcParts[1]);
        const destDay = destParts[0];
        const destSlot = Number(destParts[1]);

        if (srcDay === destDay && srcSlot === destSlot) return;

        const updated = (genes || []).map(g => {
            if (g.day === srcDay && g.slot_number === srcSlot)
                return { ...g, day: destDay, slot_number: destSlot };
            if (g.day === destDay && g.slot_number === destSlot)
                return { ...g, day: srcDay, slot_number: srcSlot };
            return g;
        });

        onGenesChange(updated);
        setHasChanges(true);
        setSavedId(null);
        toast.success(`Moved to ${destDay} Slot ${destSlot}`);
    };

    // ── Edit save ───────────────────────────────────────────────────────────────
    const handleEditSave = (originalGene, newData) => {
        const updated = (genes || []).map(g => {
            if (g.day === originalGene.day &&
                g.slot_number === originalGene.slot_number &&
                g.subject_id === originalGene.subject_id) {
                return { ...g, ...newData };
            }
            return g;
        });
        onGenesChange(updated);
        setEditGene(null);
        setHasChanges(true);
        setSavedId(null);
        toast.success("Slot updated!");
    };

    // ── Delete slot ─────────────────────────────────────────────────────────────
    const handleDeleteSlot = (geneToDelete) => {
        // Check if lab — same subject + class + day has 2 genes
        const labGenes = (genes || []).filter(
            x => x.subject_id === geneToDelete.subject_id &&
                x.class_id === geneToDelete.class_id &&
                x.day === geneToDelete.day
        );
        const isLab = labGenes.length === 2;

        const updated = (genes || []).filter(g => {
            if (isLab) {
                // Remove both consecutive lab slots
                return !(
                    g.subject_id === geneToDelete.subject_id &&
                    g.class_id === geneToDelete.class_id &&
                    g.day === geneToDelete.day
                );
            } else {
                // Remove only the exact slot
                return !(
                    g.subject_id === geneToDelete.subject_id &&
                    g.class_id === geneToDelete.class_id &&
                    g.day === geneToDelete.day &&
                    g.slot_number === geneToDelete.slot_number
                );
            }
        });

        onGenesChange(updated);
        setEditGene(null);
        setHasChanges(true);
        setSavedId(null);
        toast.success(
            isLab
                ? "Both lab slots deleted"
                : "Slot deleted from timetable"
        );
    };

    // ── Save to history ─────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await API.post("/timetables/", {
                class_id: classInfo.id,
                genes: genes,
                fitness_score: 0,
            });
            setSavedId(res.data.timetable.id);
            setHasChanges(false);
            toast.success(`${classInfo.name} saved to history!`);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    // ── Export PDF ──────────────────────────────────────────────────────────────
    const handleExportPDF = () => {
        setExporting(true);
        try {
            const pdf = new jsPDF({
                orientation: "landscape", unit: "mm", format: "a4"
            });

            // Dark background
            pdf.setFillColor(17, 24, 39);
            pdf.rect(
                0, 0,
                pdf.internal.pageSize.getWidth(),
                pdf.internal.pageSize.getHeight(),
                "F"
            );

            // Title
            pdf.setFontSize(16);
            pdf.setTextColor(99, 179, 237);
            pdf.text(
                `${classInfo.name} — Sem ${classInfo.semester} ` +
                `Section ${classInfo.section}`,
                14, 16
            );

            // Subtitle
            pdf.setFontSize(9);
            pdf.setTextColor(156, 163, 175);
            pdf.text(
                `Generated: ${new Date().toLocaleString()}   |   ` +
                `TimetableAI — Genetic Algorithm Scheduler`,
                14, 24
            );

            // Color map for PDF cells
            const pdfColorMap = {
                0: [30, 64, 175],
                1: [109, 40, 217],
                2: [4, 120, 87],
                3: [180, 83, 9],
                4: [185, 28, 28],
                5: [15, 118, 110],
                6: [157, 23, 77],
                7: [67, 56, 202],
            };

            // Build table data
            const head = [["Slot", ...DAYS]];
            const body = SLOTS.map(slot => {
                const row = [`Slot ${slot}`];
                DAYS.forEach(day => {
                    const gene = displayGrid[`${day}-${slot}`];
                    if (!gene) { row.push("—"); return; }
                    const lbl = getSubjectLabel(
                        gene.subject_id, electivePairs, subjects
                    );
                    const teacher = teachers[gene.teacher_id];
                    const room = rooms[gene.room_id];
                    row.push(
                        `${lbl}\n` +
                        `${teacher?.name || "—"}\n` +
                        `${room?.name || "—"}`
                    );
                });
                return row;
            });

            autoTable(pdf, {
                head,
                body,
                startY: 30,
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    textColor: [255, 255, 255],
                    fillColor: [31, 41, 55],
                    lineColor: [55, 65, 81],
                    lineWidth: 0.3,
                    valign: "middle",
                    overflow: "linebreak",
                    minCellHeight: 18,
                },
                headStyles: {
                    fillColor: [17, 24, 39],
                    textColor: [147, 197, 253],
                    fontSize: 9,
                    fontStyle: "bold",
                    halign: "center",
                },
                columnStyles: {
                    0: {
                        fillColor: [17, 24, 39],
                        textColor: [156, 163, 175],
                        fontStyle: "bold",
                        halign: "center",
                        cellWidth: 20,
                    },
                },
                didParseCell: (data) => {
                    if (data.section === "body" && data.column.index > 0) {
                        const slot = SLOTS[data.row.index];
                        const day = DAYS[data.column.index - 1];
                        const gene = displayGrid[`${day}-${slot}`];
                        if (gene) {
                            const ci = colorMap?.[gene.subject_id] ??
                                (gene.subject_id % 8);
                            const [r, g, b] = pdfColorMap[ci % 8] || [31, 41, 55];
                            data.cell.styles.fillColor = [r, g, b];
                            data.cell.styles.halign = "center";
                        }
                    }
                },
                theme: "grid",
            });

            // Footer
            const ph = pdf.internal.pageSize.getHeight();
            pdf.setFontSize(8);
            pdf.setTextColor(107, 114, 128);
            pdf.text("Generated by TimetableAI", 14, ph - 5);

            pdf.save(
                `timetable_${classInfo.name}_sec${classInfo.section}.pdf`
            );
            toast.success("PDF downloaded!");

        } catch (err) {
            toast.error("Export failed: " + err.message);
            console.error(err);
        } finally {
            setExporting(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-4 flex-wrap items-center">
                {hasChanges && (
                    <span className="bg-amber-900/50 border border-amber-600
                           text-amber-300 text-sm px-4 py-2 rounded-lg">
                        ⚠️ Unsaved changes
                    </span>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving || (!hasChanges && !!savedId)}
                    className="bg-green-600 hover:bg-green-700 text-white
                     font-semibold px-5 py-2 rounded-lg transition
                     disabled:opacity-50 text-sm">
                    {saving
                        ? "Saving..."
                        : (savedId && !hasChanges) ? "✅ Saved" : "💾 Save"}
                </button>
                <button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="bg-blue-600 hover:bg-blue-700 text-white
                     font-semibold px-5 py-2 rounded-lg transition
                     disabled:opacity-50 text-sm">
                    {exporting ? "Exporting..." : "📄 Export PDF"}
                </button>
            </div>

            {/* Timetable grid with DnD */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={(e) => setActiveId(e.active.id)}
                onDragEnd={handleDragEnd}
            >
                <div className="bg-gray-900 rounded-2xl overflow-auto p-4">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-3 text-gray-400 text-sm
                               font-semibold text-left w-20">
                                    Slot
                                </th>
                                {DAYS.map(day => (
                                    <th key={day}
                                        className="p-3 text-center text-white
                                 font-semibold bg-gray-700
                                 rounded-lg min-w-36">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {SLOTS.map(slot => (
                                <tr key={slot}>
                                    <td className="p-3 text-gray-400 text-sm font-medium">
                                        Slot {slot}
                                    </td>
                                    {DAYS.map(day => {
                                        const gene = displayGrid[`${day}-${slot}`];
                                        return (
                                            <DroppableCell key={day} day={day} slot={slot}>
                                                {gene && (
                                                    <DraggableCard
                                                        gene={gene}
                                                        subjects={subjects}
                                                        teachers={teachers}
                                                        rooms={rooms}
                                                        electivePairs={electivePairs}
                                                        colorMap={colorMap}
                                                        onEdit={setEditGene}
                                                        isDragging={
                                                            activeId ===
                                                            `${day}-${slot}-${gene.subject_id}`
                                                        }
                                                    />
                                                )}
                                            </DroppableCell>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Ghost card while dragging */}
                <DragOverlay>
                    {activeId && (() => {
                        const parts = activeId.split("-");
                        const gene = displayGrid[`${parts[0]}-${parts[1]}`];
                        if (!gene) return null;
                        const ci = colorMap?.[gene.subject_id] ??
                            (gene.subject_id % COLORS.length);
                        const color = COLORS[ci % COLORS.length];
                        return (
                            <div className={`h-20 w-44 rounded-lg border-2 p-2
                              opacity-90 shadow-2xl cursor-grabbing
                              ${color.bg} ${color.border}`}>
                                <div className="text-white text-xs font-bold truncate">
                                    {getSubjectLabel(
                                        gene.subject_id, electivePairs, subjects
                                    )}
                                </div>
                                <div className="text-gray-300 text-xs">
                                    {teachers[gene.teacher_id]?.name}
                                </div>
                                <div className="text-gray-400 text-xs">
                                    {rooms[gene.room_id]?.name}
                                </div>
                            </div>
                        );
                    })()}
                </DragOverlay>
            </DndContext>

            {/* Edit + Delete Modal */}
            {editGene && (
                <EditModal
                    gene={editGene}
                    subjects={subjects}
                    teachers={teachers}
                    rooms={rooms}
                    onSave={handleEditSave}
                    onClose={() => setEditGene(null)}
                    onDelete={handleDeleteSlot}
                />
            )}

        </div>
    );
}

// ── Main Timetable page ───────────────────────────────────────────────────────
export default function Timetable() {
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState({});
    const [teachers, setTeachers] = useState({});
    const [rooms, setRooms] = useState({});
    const [electivePairs, setElectivePairs] = useState([]);
    const [colorMap, setColorMap] = useState({});
    const [classInfoMap, setClassInfoMap] = useState({});
    const [activeTab, setActiveTab] = useState(0);

    // ── Load timetable + lookup data ────────────────────────────────────────────
    useEffect(() => {
        const saved = localStorage.getItem("timetable_result");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (typeof parsed === "object" && !Array.isArray(parsed)) {
                    // Multi-section: { "classId": [...genes] }
                    const built = Object.keys(parsed).map(classId => ({
                        classId: Number(classId),
                        genes: parsed[classId] || [],
                    }));
                    setSections(built);
                } else {
                    // Single section: array
                    const classId = Number(
                        localStorage.getItem("timetable_class") || "1"
                    );
                    setSections([{ classId, genes: parsed || [] }]);
                }
            } catch {
                setSections([]);
            }
        }

        // Load all lookup data in one shot
        Promise.all([
            API.get("/subjects/"),
            API.get("/teachers/"),
            API.get("/rooms/"),
            API.get("/electives/"),
        ]).then(([s, t, r, e]) => {

            const sm = {};
            s.data.subjects.forEach(x => (sm[x.id] = x));
            setSubjects(sm);

            const tm = {};
            t.data.teachers.forEach(x => (tm[x.id] = x));
            setTeachers(tm);

            const rm = {};
            r.data.rooms.forEach(x => (rm[x.id] = x));
            setRooms(rm);

            const pairs = e.data.elective_pairs || [];
            setElectivePairs(pairs);

            // Build stable color map after all subjects loaded
            setColorMap(buildColorMap(sm, pairs));

        }).catch(err => console.error("Load error:", err));
    }, []);

    // ── Load class info for each section ───────────────────────────────────────
    useEffect(() => {
        if (sections.length === 0) return;
        sections.forEach(sec => {
            API.get(`/classes/${sec.classId}`)
                .then(res => {
                    setClassInfoMap(prev => ({
                        ...prev,
                        [sec.classId]: res.data.class
                    }));
                })
                .catch(() => {
                    // Fallback if class fetch fails
                    setClassInfoMap(prev => ({
                        ...prev,
                        [sec.classId]: {
                            id: sec.classId,
                            name: `Class ${sec.classId}`,
                            semester: "—",
                            section: "—",
                        }
                    }));
                });
        });
    }, [sections]);

    // ── Handle genes change for a section ──────────────────────────────────────
    const handleGenesChange = (classId, newGenes) => {
        setSections(prev =>
            prev.map(s =>
                s.classId === classId ? { ...s, genes: newGenes } : s
            )
        );
        // Persist to localStorage
        try {
            const saved = localStorage.getItem("timetable_result");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed === "object" && !Array.isArray(parsed)) {
                    parsed[classId.toString()] = newGenes;
                    localStorage.setItem("timetable_result",
                        JSON.stringify(parsed));
                } else {
                    localStorage.setItem("timetable_result",
                        JSON.stringify(newGenes));
                }
            }
        } catch { /* ignore */ }
    };

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <Layout>

            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">
                    Generated Timetable
                </h1>
                <p className="text-gray-400 mt-1">
                    🖱️ <span className="text-blue-400">Drag</span> to swap •
                    ✏️ Click <span className="text-blue-400">Edit</span> to modify •
                    🗑️ Delete slot from Edit modal •
                    Each tab = one class section
                </p>
            </div>

            {/* No timetable state */}
            {sections.length === 0 ? (
                <div className="bg-gray-800 rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">🗓️</div>
                    <p className="text-gray-400 text-lg">
                        No timetable generated yet.
                    </p>
                    <p className="text-gray-500 mt-2">
                        Go to the Generate page and run the GA first.
                    </p>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-2xl p-6">

                    {/* Section tabs */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {sections.map((sec, idx) => {
                            const info = classInfoMap[sec.classId];
                            const label = info
                                ? `${info.name} — Sec ${info.section}`
                                : `Class ${sec.classId}`;
                            return (
                                <button key={sec.classId}
                                    onClick={() => setActiveTab(idx)}
                                    className={`px-5 py-2.5 rounded-xl text-sm
                              font-semibold transition border-2
                              ${activeTab === idx
                                            ? "bg-blue-600 border-blue-500 text-white"
                                            : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500"}`}>
                                    🗓️ {label}
                                    {info && (
                                        <span className="ml-2 text-xs opacity-70">
                                            Sem {info.semester}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Each section's timetable */}
                    {sections.map((sec, idx) => {
                        const info = classInfoMap[sec.classId] || {
                            id: sec.classId,
                            name: `Class ${sec.classId}`,
                            semester: "—",
                            section: "—",
                        };
                        return (
                            <div key={sec.classId}
                                className={activeTab === idx ? "block" : "hidden"}>

                                {/* Section info bar */}
                                <div className="flex items-center gap-4 mb-5 flex-wrap">
                                    <div className="bg-blue-900 border border-blue-700
                                  rounded-xl px-4 py-2">
                                        <p className="text-blue-300 text-xs">Class</p>
                                        <p className="text-white font-bold">{info.name}</p>
                                    </div>
                                    <div className="bg-gray-700 rounded-xl px-4 py-2">
                                        <p className="text-gray-400 text-xs">Semester</p>
                                        <p className="text-white font-bold">
                                            Sem {info.semester}
                                        </p>
                                    </div>
                                    <div className="bg-gray-700 rounded-xl px-4 py-2">
                                        <p className="text-gray-400 text-xs">Section</p>
                                        <p className="text-white font-bold">
                                            {info.section}
                                        </p>
                                    </div>
                                    <div className="bg-gray-700 rounded-xl px-4 py-2">
                                        <p className="text-gray-400 text-xs">Total Slots</p>
                                        <p className="text-white font-bold">
                                            {(sec.genes || []).length}
                                        </p>
                                    </div>
                                </div>

                                {/* The actual grid */}
                                <TimetableGrid
                                    genes={sec.genes || []}
                                    subjects={subjects}
                                    teachers={teachers}
                                    rooms={rooms}
                                    electivePairs={electivePairs}
                                    colorMap={colorMap}
                                    classInfo={info}
                                    onGenesChange={(newGenes) =>
                                        handleGenesChange(sec.classId, newGenes)
                                    }
                                />

                            </div>
                        );
                    })}

                </div>
            )}
        </Layout>
    );
}