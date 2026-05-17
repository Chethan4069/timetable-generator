from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.global_config import GlobalConfig

config_bp = Blueprint("config", __name__)


# ── GET current config ────────────────────────────────────────────────────────
@config_bp.route("/", methods=["GET"])
@jwt_required()
def get_config():
    config = GlobalConfig.query.first()

    if not config:
        return jsonify({"message": "No config found. Please set it up."}), 404

    return jsonify({"config": config.to_dict()}), 200


# ── CREATE or UPDATE config ───────────────────────────────────────────────────
@config_bp.route("/", methods=["POST"])
@jwt_required()
def save_config():
    data = request.get_json()

    # Validate required fields
    required = [
        "school_start_time",
        "lecture_duration_mins",
        "lectures_per_day",
        "break_after_lecture",
        "break_duration_mins",
        "working_days"
    ]
    for field in required:
        if data.get(field) is None:
            return jsonify({"error": f"'{field}' is required"}), 400

    # working_days comes in as a list ["Mon","Tue",...] — store as string
    working_days_str = ",".join(data["working_days"])

    # Check if config already exists — update it, else create new
    config = GlobalConfig.query.first()

    if config:
        config.school_start_time     = data["school_start_time"]
        config.lecture_duration_mins = data["lecture_duration_mins"]
        config.lectures_per_day      = data["lectures_per_day"]
        config.break_after_lecture   = data["break_after_lecture"]
        config.break_duration_mins   = data["break_duration_mins"]
        config.working_days          = working_days_str
    else:
        config = GlobalConfig(
            school_start_time     = data["school_start_time"],
            lecture_duration_mins = data["lecture_duration_mins"],
            lectures_per_day      = data["lectures_per_day"],
            break_after_lecture   = data["break_after_lecture"],
            break_duration_mins   = data["break_duration_mins"],
            working_days          = working_days_str
        )
        db.session.add(config)

    db.session.commit()

    return jsonify({
        "message": "Configuration saved successfully",
        "config": config.to_dict()
    }), 200


# ── GET generated timeslots preview ──────────────────────────────────────────
@config_bp.route("/timeslots", methods=["GET"])
@jwt_required()
def get_timeslots():
    config = GlobalConfig.query.first()

    if not config:
        return jsonify({"error": "Please save config first"}), 404

    slots = generate_timeslots(config)
    return jsonify({"timeslots": slots}), 200


def generate_timeslots(config):
    """Build the list of timeslots from config — GA will use this."""
    from datetime import datetime, timedelta

    slots  = []
    start  = datetime.strptime(config.school_start_time, "%H:%M")
    slot_n = 1

    for i in range(config.lectures_per_day):
        end = start + timedelta(minutes=config.lecture_duration_mins)
        slots.append({
            "slot_number": slot_n,
            "start_time":  start.strftime("%H:%M"),
            "end_time":    end.strftime("%H:%M")
        })
        slot_n += 1
        start = end

        # Add break after the configured lecture number
        if (i + 1) == config.break_after_lecture:
            start = start + timedelta(minutes=config.break_duration_mins)

    return slots