from app import db

class GlobalConfig(db.Model):
    __tablename__ = "global_config"

    id                    = db.Column(db.Integer, primary_key=True)
    school_start_time     = db.Column(db.String(10), nullable=False, default="09:00")
    lecture_duration_mins = db.Column(db.Integer,    nullable=False, default=50)
    lectures_per_day      = db.Column(db.Integer,    nullable=False, default=6)
    break_after_lecture   = db.Column(db.Integer,    nullable=False, default=3)
    break_duration_mins   = db.Column(db.Integer,    nullable=False, default=15)
    working_days          = db.Column(db.String(100),nullable=False, default="Mon,Tue,Wed,Thu,Fri")

    def to_dict(self):
        return {
            "id":                    self.id,
            "school_start_time":     self.school_start_time,
            "lecture_duration_mins": self.lecture_duration_mins,
            "lectures_per_day":      self.lectures_per_day,
            "break_after_lecture":   self.break_after_lecture,
            "break_duration_mins":   self.break_duration_mins,
            "working_days":          self.working_days.split(",")
        }