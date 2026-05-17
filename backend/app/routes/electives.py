from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.elective_pair import ElectivePair

electives_bp = Blueprint("electives", __name__)


@electives_bp.route("/", methods=["GET"])
@jwt_required()
def get_all():
    pairs = ElectivePair.query.all()
    return jsonify({"elective_pairs": [p.to_dict() for p in pairs]}), 200


@electives_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    data = request.get_json()
    required = ["subject1_id", "subject2_id", "label"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    pair = ElectivePair(
        subject1_id = data["subject1_id"],
        subject2_id = data["subject2_id"],
        label       = data["label"]
    )
    db.session.add(pair)
    db.session.commit()
    return jsonify({
        "message": "Elective pair created",
        "pair":    pair.to_dict()
    }), 201


@electives_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete(id):
    pair = ElectivePair.query.get_or_404(id)
    db.session.delete(pair)
    db.session.commit()
    return jsonify({"message": "Elective pair deleted"}), 200