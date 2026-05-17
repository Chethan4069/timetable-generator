from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.subject import Subject

subjects_bp = Blueprint("subjects", __name__)


@subjects_bp.route("/", methods=["GET"])
@jwt_required()
def get_all():
    subjects = Subject.query.all()
    return jsonify({"subjects": [s.to_dict() for s in subjects]}), 200


@subjects_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_one(id):
    s = Subject.query.get_or_404(id)
    return jsonify({"subject": s.to_dict()}), 200


@subjects_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    data = request.get_json()
    if not data.get("name") or not data.get("code"):
        return jsonify({"error": "name and code are required"}), 400

    if Subject.query.filter_by(code=data["code"]).first():
        return jsonify({"error": "Subject code already exists"}), 409

    s = Subject(
        name             = data["name"],
        code             = data["code"],
        credits_per_week = data.get("credits_per_week", 3),
        subject_type     = data.get("subject_type", "theory")
    )
    db.session.add(s)
    db.session.commit()
    return jsonify({"message": "Subject created", "subject": s.to_dict()}), 201


@subjects_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update(id):
    s    = Subject.query.get_or_404(id)
    data = request.get_json()

    s.name             = data.get("name",             s.name)
    s.code             = data.get("code",             s.code)
    s.credits_per_week = data.get("credits_per_week", s.credits_per_week)
    s.subject_type     = data.get("subject_type",     s.subject_type)

    db.session.commit()
    return jsonify({"message": "Subject updated", "subject": s.to_dict()}), 200


@subjects_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete(id):
    s = Subject.query.get_or_404(id)

    # Delete linked assignments first to avoid constraint error
    from app.models.assignment import Assignment
    Assignment.query.filter_by(subject_id=id).delete()

    db.session.delete(s)
    db.session.commit()
    return jsonify({"message": "Subject deleted"}), 200