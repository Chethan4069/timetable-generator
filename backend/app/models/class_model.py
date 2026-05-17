from app import db

class Class(db.Model):
    __tablename__ = "classes"

    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    semester      = db.Column(db.Integer,     nullable=False)
    section       = db.Column(db.String(10),  nullable=False, default="A")
    student_count = db.Column(db.Integer,     nullable=False, default=30)

    def to_dict(self):
        return {
            "id":            self.id,
            "name":          self.name,
            "semester":      self.semester,
            "section":       self.section,
            "student_count": self.student_count
        }