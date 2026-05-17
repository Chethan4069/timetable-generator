from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.teacher import Teacher, TeacherAvailability

teachers_bp = Blueprint("teachers", __name__)


@teachers_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_teachers():
    teachers = Teacher.query.all()
    return jsonify({"teachers": [t.to_dict() for t in teachers]}), 200


@teachers_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_teacher(id):
    teacher = Teacher.query.get_or_404(id)
    return jsonify({"teacher": teacher.to_dict()}), 200


@teachers_bp.route("/", methods=["POST"])
@jwt_required()
def create_teacher():
    data = request.get_json()
    if not data.get("name"):
        return jsonify({"error": "name is required"}), 400

    teacher = Teacher(
        name              = data["name"],
        subject_expertise = data.get("subject_expertise", ""),
        max_hours_per_week= data.get("max_hours_per_week", 20)
    )
    db.session.add(teacher)
    db.session.commit()
    return jsonify({"message": "Teacher created", "teacher": teacher.to_dict()}), 201


@teachers_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_teacher(id):
    teacher = Teacher.query.get_or_404(id)
    data    = request.get_json()

    teacher.name               = data.get("name",               teacher.name)
    teacher.subject_expertise  = data.get("subject_expertise",  teacher.subject_expertise)
    teacher.max_hours_per_week = data.get("max_hours_per_week", teacher.max_hours_per_week)

    db.session.commit()
    return jsonify({"message": "Teacher updated", "teacher": teacher.to_dict()}), 200


@teachers_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_teacher(id):
    teacher = Teacher.query.get_or_404(id)

    # Delete linked assignments first to avoid constraint error
    from app.models.assignment import Assignment
    Assignment.query.filter_by(teacher_id=id).delete()

    db.session.delete(teacher)
    db.session.commit()
    return jsonify({"message": "Teacher deleted"}), 200


# ── Availability ──────────────────────────────────────────────────────────────
@teachers_bp.route("/<int:id>/availability", methods=["POST"])
@jwt_required()
def set_availability(id):
    Teacher.query.get_or_404(id)
    data = request.get_json()

    # data["slots"] = [{"day":"Mon","slot_number":1,"is_available":true}, ...]
    if not data.get("slots"):
        return jsonify({"error": "slots array is required"}), 400

    # Delete old availability for this teacher then re-insert
    TeacherAvailability.query.filter_by(teacher_id=id).delete()

    for slot in data["slots"]:
        av = TeacherAvailability(
            teacher_id   = id,
            day          = slot["day"],
            slot_number  = slot["slot_number"],
            is_available = slot.get("is_available", True)
        )
        db.session.add(av)

    db.session.commit()
    return jsonify({"message": "Availability saved"}), 200


@teachers_bp.route("/<int:id>/availability", methods=["GET"])
@jwt_required()
def get_availability(id):
    Teacher.query.get_or_404(id)
    slots = TeacherAvailability.query.filter_by(teacher_id=id).all()
    return jsonify({"availability": [s.to_dict() for s in slots]}), 200