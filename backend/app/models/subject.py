from app import db

class Subject(db.Model):
    __tablename__ = "subjects"

    id               = db.Column(db.Integer, primary_key=True)
    name             = db.Column(db.String(100), nullable=False)
    code             = db.Column(db.String(20),  nullable=False, unique=True)
    credits_per_week = db.Column(db.Integer,     nullable=False, default=3)
    subject_type     = db.Column(db.String(20),  nullable=False, default="theory")

    def to_dict(self):
        return {
            "id":               self.id,
            "name":             self.name,
            "code":             self.code,
            "credits_per_week": self.credits_per_week,
            "subject_type":     self.subject_type
        }