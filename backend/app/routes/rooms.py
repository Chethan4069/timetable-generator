from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.room import Room

rooms_bp = Blueprint("rooms", __name__)


@rooms_bp.route("/", methods=["GET"])
@jwt_required()
def get_all():
    rooms = Room.query.all()
    return jsonify({"rooms": [r.to_dict() for r in rooms]}), 200


@rooms_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    data = request.get_json()
    if not data.get("name"):
        return jsonify({"error": "name is required"}), 400

    r = Room(
        name      = data["name"],
        capacity  = data.get("capacity",  30),
        room_type = data.get("room_type", "classroom")
    )
    db.session.add(r)
    db.session.commit()
    return jsonify({"message": "Room created", "room": r.to_dict()}), 201


@rooms_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update(id):
    r    = Room.query.get_or_404(id)
    data = request.get_json()

    r.name      = data.get("name",      r.name)
    r.capacity  = data.get("capacity",  r.capacity)
    r.room_type = data.get("room_type", r.room_type)

    db.session.commit()
    return jsonify({"message": "Room updated", "room": r.to_dict()}), 200


@rooms_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete(id):
    r = Room.query.get_or_404(id)
    db.session.delete(r)
    db.session.commit()
    return jsonify({"message": "Room deleted"}), 200