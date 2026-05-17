from app import db
from datetime import datetime

class Timetable(db.Model):
    __tablename__ = "timetables"

    id            = db.Column(db.Integer, primary_key=True)
    class_id      = db.Column(db.Integer, db.ForeignKey("classes.id"), nullable=False)
    class_name    = db.Column(db.String(100), nullable=False)
    semester      = db.Column(db.Integer,     nullable=False)
    fitness_score = db.Column(db.Integer,     nullable=False, default=0)
    genes         = db.Column(db.Text,        nullable=False)  # stored as JSON string
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            "id":            self.id,
            "class_id":      self.class_id,
            "class_name":    self.class_name,
            "semester":      self.semester,
            "fitness_score": self.fitness_score,
            "genes":         json.loads(self.genes),
            "created_at":    self.created_at.strftime("%d %b %Y  %I:%M %p")
        }

    def to_history_dict(self):
        """Lighter version for history list — no genes."""
        return {
            "id":            self.id,
            "class_id":      self.class_id,
            "class_name":    self.class_name,
            "semester":      self.semester,
            "fitness_score": self.fitness_score,
            "created_at":    self.created_at.strftime("%d %b %Y  %I:%M %p")
        }