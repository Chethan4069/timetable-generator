from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db, bcrypt
from app.models.user import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    # Check all fields are present
    if not data.get("username") or not data.get("password") or not data.get("role"):
        return jsonify({"error": "username, password and role are required"}), 400

    # Check username not already taken
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already taken"}), 409

    # Hash password and save
    hashed = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    user = User(
        username      = data["username"],
        password_hash = hashed,
        role          = data["role"]
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Registered successfully",
        "user": user.to_dict()
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    # Check all fields are present
    if not data.get("username") or not data.get("password"):
        return jsonify({"error": "username and password are required"}), 400

    # Find user
    user = User.query.filter_by(username=data["username"]).first()

    # Check user exists and password is correct
    if not user or not bcrypt.check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "Invalid username or password"}), 401

    # Create token
    token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful",
        "access_token": token,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user    = User.query.get(int(user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200