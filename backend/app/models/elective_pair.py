from app import db

class ElectivePair(db.Model):
    __tablename__ = "elective_pairs"

    id          = db.Column(db.Integer, primary_key=True)
    subject1_id = db.Column(db.Integer,
                            db.ForeignKey("subjects.id", ondelete="CASCADE"),
                            nullable=False)
    subject2_id = db.Column(db.Integer,
                            db.ForeignKey("subjects.id", ondelete="CASCADE"),
                            nullable=False)
    # Display label shown in timetable e.g. "CC / HCA"
    label       = db.Column(db.String(100), nullable=False)

    subject1    = db.relationship("Subject", foreign_keys=[subject1_id])
    subject2    = db.relationship("Subject", foreign_keys=[subject2_id])

    def to_dict(self):
        return {
            "id":           self.id,
            "subject1_id":  self.subject1_id,
            "subject2_id":  self.subject2_id,
            "label":        self.label,
            "subject1_name": self.subject1.name if self.subject1 else None,
            "subject2_name": self.subject2.name if self.subject2 else None,
        }