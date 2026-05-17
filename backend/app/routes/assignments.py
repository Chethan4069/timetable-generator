from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.assignment import Assignment

assignments_bp = Blueprint("assignments", __name__)


@assignments_bp.route("/", methods=["GET"])
@jwt_required()
def get_all():
    items = Assignment.query.all()
    return jsonify({"assignments": [a.to_dict() for a in items]}), 200


@assignments_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    data = request.get_json()
    required = ["class_id", "subject_id", "teacher_id"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    a = Assignment(
        class_id   = data["class_id"],
        subject_id = data["subject_id"],
        teacher_id = data["teacher_id"],
        priority   = data.get("priority", 1)
    )
    db.session.add(a)
    db.session.commit()
    return jsonify({"message": "Assignment created", "assignment": a.to_dict()}), 201


@assignments_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete(id):
    a = Assignment.query.get_or_404(id)
    db.session.delete(a)
    db.session.commit()
    return jsonify({"message": "Assignment deleted"}), 200