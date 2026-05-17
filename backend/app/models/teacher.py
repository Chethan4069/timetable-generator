from app import db

class Teacher(db.Model):
    __tablename__ = "teachers"

    id               = db.Column(db.Integer, primary_key=True)
    name             = db.Column(db.String(100), nullable=False)
    subject_expertise = db.Column(db.String(200), nullable=True)
    max_hours_per_week = db.Column(db.Integer, nullable=False, default=20)

    availability = db.relationship("TeacherAvailability",
                                   backref="teacher",
                                   cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id":                 self.id,
            "name":               self.name,
            "subject_expertise":  self.subject_expertise,
            "max_hours_per_week": self.max_hours_per_week
        }


class TeacherAvailability(db.Model):
    __tablename__ = "teacher_availability"

    id           = db.Column(db.Integer, primary_key=True)
    teacher_id   = db.Column(db.Integer, db.ForeignKey("teachers.id"), nullable=False)
    day          = db.Column(db.String(10), nullable=False)
    slot_number  = db.Column(db.Integer,   nullable=False)
    is_available = db.Column(db.Boolean,   nullable=False, default=True)

    def to_dict(self):
        return {
            "id":           self.id,
            "teacher_id":   self.teacher_id,
            "day":          self.day,
            "slot_number":  self.slot_number,
            "is_available": self.is_available
        }