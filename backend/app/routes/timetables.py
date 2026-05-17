import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.timetable  import Timetable
from app.models.class_model import Class

timetables_bp = Blueprint("timetables", __name__)


# ── GET all timetables (history) ──────────────────────────────────────────────
@timetables_bp.route("/", methods=["GET"])
@jwt_required()
def get_all():
    items = Timetable.query.order_by(Timetable.created_at.desc()).all()
    return jsonify({"timetables": [t.to_history_dict() for t in items]}), 200


# ── GET one timetable (to view it) ────────────────────────────────────────────
@timetables_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_one(id):
    t = Timetable.query.get_or_404(id)
    return jsonify({"timetable": t.to_dict()}), 200


# ── SAVE a timetable ──────────────────────────────────────────────────────────
@timetables_bp.route("/", methods=["POST"])
@jwt_required()
def save():
    data = request.get_json()

    required = ["class_id", "genes", "fitness_score"]
    for field in required:
        if data.get(field) is None:
            return jsonify({"error": f"'{field}' is required"}), 400

    # Get class info
    class_obj = Class.query.get(data["class_id"])
    if not class_obj:
        return jsonify({"error": "Class not found"}), 404

    t = Timetable(
        class_id      = data["class_id"],
        class_name    = class_obj.name,
        semester      = class_obj.semester,
        fitness_score = data["fitness_score"],
        genes         = json.dumps(data["genes"])
    )
    db.session.add(t)
    db.session.commit()

    return jsonify({
        "message":    "Timetable saved to history",
        "timetable":  t.to_history_dict()
    }), 201


# ── DELETE a timetable ────────────────────────────────────────────────────────
@timetables_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete(id):
    t = Timetable.query.get_or_404(id)
    db.session.delete(t)
    db.session.commit()
    return jsonify({"message": "Timetable deleted from history"}), 200