from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.class_model import Class

classes_bp = Blueprint("classes", __name__)


@classes_bp.route("/", methods=["GET"])
@jwt_required()
def get_all():
    classes = Class.query.all()
    return jsonify({"classes": [c.to_dict() for c in classes]}), 200


@classes_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_one(id):
    c = Class.query.get_or_404(id)
    return jsonify({"class": c.to_dict()}), 200


@classes_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    data = request.get_json()
    if not data.get("name") or not data.get("semester"):
        return jsonify({"error": "name and semester are required"}), 400

    c = Class(
        name          = data["name"],
        semester      = data["semester"],
        section       = data.get("section", "A"),
        student_count = data.get("student_count", 30)
    )
    db.session.add(c)
    db.session.commit()
    return jsonify({"message": "Class created", "class": c.to_dict()}), 201


@classes_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update(id):
    c    = Class.query.get_or_404(id)
    data = request.get_json()

    c.name          = data.get("name",          c.name)
    c.semester      = data.get("semester",      c.semester)
    c.section       = data.get("section",       c.section)
    c.student_count = data.get("student_count", c.student_count)

    db.session.commit()
    return jsonify({"message": "Class updated", "class": c.to_dict()}), 200


@classes_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete(id):
    c = Class.query.get_or_404(id)

    # Delete linked assignments first
    from app.models.assignment import Assignment
    Assignment.query.filter_by(class_id=id).delete()

    db.session.delete(c)
    db.session.commit()
    return jsonify({"message": "Class deleted"}), 200