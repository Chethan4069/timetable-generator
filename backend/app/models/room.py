from app import db

class Room(db.Model):
    __tablename__ = "rooms"

    id        = db.Column(db.Integer, primary_key=True)
    name      = db.Column(db.String(50),  nullable=False)
    capacity  = db.Column(db.Integer,     nullable=False, default=30)
    room_type = db.Column(db.String(20),  nullable=False, default="classroom")

    def to_dict(self):
        return {
            "id":        self.id,
            "name":      self.name,
            "capacity":  self.capacity,
            "room_type": self.room_type
        }