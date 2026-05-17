import uuid
import threading
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.assignment    import Assignment
from app.models.room          import Room
from app.models.teacher       import TeacherAvailability
from app.models.global_config import GlobalConfig
from app.models.elective_pair import ElectivePair
from app.ga.engine            import run_ga, job_status

generate_bp = Blueprint("generate", __name__)


def run_multi_section(job_id, section_data, rooms, working_days,
                      lectures_per_day, teacher_availability,
                      elective_pairs):

    job_status[job_id] = {
        "status":       "running",
        "generation":   0,
        "best_fitness": None,
        "result":       {},
    }

    all_generated_genes = []   # grows after each section
    elective_slot_map   = {}   # subject_id → (day, slot_number)

    for idx, section in enumerate(section_data):
        class_id    = section["class_id"]
        assignments = section["assignments"]

        # ── Build locked genes from elective_slot_map ─────────────────────────
        # If a previous section already scheduled CC at Mon Slot 3,
        # force this section's CC to Mon Slot 3 as well.
        locked_genes = []
        non_elective_assignments = []

        elective_subject_ids = set()
        for pair in elective_pairs:
            elective_subject_ids.add(pair["subject1_id"])
            elective_subject_ids.add(pair["subject2_id"])

        for a in assignments:
            if a["subject_id"] in elective_subject_ids and \
               a["subject_id"] in elective_slot_map:
                # Lock this subject to the already-decided slot
                day, slot = elective_slot_map[a["subject_id"]]
                locked_genes.append({
                    "class_id":    class_id,
                    "subject_id":  a["subject_id"],
                    "teacher_id":  a["teacher_id"],
                    "room_id":     rooms[0]["id"],
                    "day":         day,
                    "slot_number": slot,
                })
            else:
                non_elective_assignments.append(a)

        # ── Run GA for non-elective subjects ──────────────────────────────────
        sub_job_id = f"{job_id}_{idx}"
        chrom = run_ga(
            job_id               = sub_job_id,
            assignments          = non_elective_assignments,
            rooms                = rooms,
            working_days         = working_days,
            lectures_per_day     = lectures_per_day,
            teacher_availability = teacher_availability,
            existing_genes       = all_generated_genes,
            locked_genes         = locked_genes,
        )

        genes = [g.to_dict() for g in chrom.genes]

        # ── After first section: record elective slot positions ───────────────
        if idx == 0:
            for g in genes:
                if g["subject_id"] in elective_subject_ids:
                    elective_slot_map[g["subject_id"]] = (
                        g["day"], g["slot_number"]
                    )
            # Also map paired subjects to same slot
            for pair in elective_pairs:
                s1 = pair["subject1_id"]
                s2 = pair["subject2_id"]
                if s1 in elective_slot_map and s2 not in elective_slot_map:
                    elective_slot_map[s2] = elective_slot_map[s1]
                elif s2 in elective_slot_map and s1 not in elective_slot_map:
                    elective_slot_map[s1] = elective_slot_map[s2]

        all_generated_genes.extend(genes)

        job_status[job_id]["result"][str(class_id)] = genes
        job_status[job_id]["generation"]   = (idx + 1) * 100
        job_status[job_id]["best_fitness"] = chrom.fitness_score

    job_status[job_id]["status"] = "completed"


@generate_bp.route("/", methods=["POST"])
@jwt_required()
def generate():
    data = request.get_json()

    class_ids = data.get("class_ids") or (
        [data["class_id"]] if data.get("class_id") else None
    )
    if not class_ids:
        return jsonify({"error": "class_ids array is required"}), 400

    config = GlobalConfig.query.first()
    if not config:
        return jsonify({"error": "Please set global config first"}), 400

    working_days     = config.working_days.split(",")
    lectures_per_day = config.lectures_per_day

    rooms = [{"id": r.id, "name": r.name} for r in Room.query.all()]
    if not rooms:
        return jsonify({"error": "No rooms found"}), 400

    av_records = TeacherAvailability.query.all()
    teacher_availability = {
        (av.teacher_id, av.day, av.slot_number): av.is_available
        for av in av_records
    }

    elective_pairs = [p.to_dict() for p in ElectivePair.query.all()]

    section_data = []
    for class_id in class_ids:
        db_assignments = Assignment.query.filter_by(
            class_id=class_id
        ).all()
        if not db_assignments:
            return jsonify({
                "error": f"No assignments for class_id {class_id}"
            }), 400

        section_data.append({
            "class_id": class_id,
            "assignments": [
                {
                    "class_id":        a.class_id,
                    "subject_id":      a.subject_id,
                    "teacher_id":      a.teacher_id,
                    "credits_per_week": a.subject.credits_per_week,
                    "subject_type":    a.subject.subject_type,  # ← NEW
                }
                for a in db_assignments
            ]
        })

    job_id = str(uuid.uuid4())
    thread = threading.Thread(
        target=run_multi_section,
        args=(job_id, section_data, rooms, working_days,
              lectures_per_day, teacher_availability, elective_pairs)
    )
    thread.daemon = True
    thread.start()

    return jsonify({
        "message":  "Generation started",
        "job_id":   job_id,
        "sections": len(class_ids),
    }), 202


@generate_bp.route("/status/<job_id>", methods=["GET"])
@jwt_required()
def status(job_id):
    job = job_status.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    return jsonify({
        "job_id":       job_id,
        "status":       job["status"],
        "generation":   job["generation"],
        "best_fitness": job["best_fitness"],
        "result": job["result"] if job["status"] == "completed" else None
    }), 200