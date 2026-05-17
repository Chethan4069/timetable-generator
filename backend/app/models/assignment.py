from app import db

class Assignment(db.Model):
    __tablename__ = "assignments"

    id         = db.Column(db.Integer, primary_key=True)
    class_id   = db.Column(db.Integer,
                           db.ForeignKey("classes.id",  ondelete="CASCADE"),
                           nullable=False)
    subject_id = db.Column(db.Integer,
                           db.ForeignKey("subjects.id", ondelete="CASCADE"),
                           nullable=False)
    teacher_id = db.Column(db.Integer,
                           db.ForeignKey("teachers.id", ondelete="CASCADE"),
                           nullable=False)
    priority   = db.Column(db.Integer, nullable=False, default=1)

    class_obj  = db.relationship("Class",   backref="assignments",
                                 foreign_keys=[class_id])
    subject    = db.relationship("Subject", backref="assignments",
                                 foreign_keys=[subject_id])
    teacher    = db.relationship("Teacher", backref="assignments",
                                 foreign_keys=[teacher_id])

    def to_dict(self):
        return {
            "id":           self.id,
            "class_id":     self.class_id,
            "subject_id":   self.subject_id,
            "teacher_id":   self.teacher_id,
            "priority":     self.priority,
            "class_name":   self.class_obj.name if self.class_obj else None,
            "subject_name": self.subject.name   if self.subject   else None,
            "teacher_name": self.teacher.name   if self.teacher   else None
        }