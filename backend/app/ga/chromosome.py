import random

class Gene:
    def __init__(self, class_id, subject_id, teacher_id,
                 room_id, day, slot_number):
        self.class_id    = class_id
        self.subject_id  = subject_id
        self.teacher_id  = teacher_id
        self.room_id     = room_id
        self.day         = day
        self.slot_number = slot_number

    def to_dict(self):
        return {
            "class_id":    self.class_id,
            "subject_id":  self.subject_id,
            "teacher_id":  self.teacher_id,
            "room_id":     self.room_id,
            "day":         self.day,
            "slot_number": self.slot_number,
        }

    def copy(self):
        return Gene(self.class_id, self.subject_id, self.teacher_id,
                    self.room_id, self.day, self.slot_number)


class Chromosome:
    def __init__(self):
        self.genes         = []
        self.fitness_score = float("inf")

    def copy(self):
        c = Chromosome()
        c.genes         = [g.copy() for g in self.genes]
        c.fitness_score = self.fitness_score
        return c


def build_initial_chromosome(assignments, rooms, working_days,
                              lectures_per_day, locked_genes=None):
    """
    locked_genes: list of gene dicts that are pre-fixed
    (used for elective subjects already scheduled in another section).
    """
    chrom = Chromosome()

    # Add locked genes first (elective subjects same-slot enforcement)
    locked_ids = set()
    if locked_genes:
        for g in locked_genes:
            chrom.genes.append(Gene(
                class_id   = g["class_id"],
                subject_id = g["subject_id"],
                teacher_id = g["teacher_id"],
                room_id    = g["room_id"],
                day        = g["day"],
                slot_number= g["slot_number"],
            ))
            locked_ids.add(g["subject_id"])

    # All valid (day, slot) pairs
    all_slots = [
        (day, slot)
        for day in working_days
        for slot in range(1, lectures_per_day + 1)
    ]

    # Consecutive slot pairs for lab subjects (slot N and slot N+1 same day)
    consecutive_pairs = [
        (day, slot)
        for day in working_days
        for slot in range(1, lectures_per_day)  # slot and slot+1 both valid
    ]

    for assignment in assignments:
        # Skip if this subject is already locked (elective)
        if assignment["subject_id"] in locked_ids:
            continue

        credits      = assignment["credits_per_week"]
        subject_type = assignment.get("subject_type", "theory")
        room         = random.choice(rooms)

        if subject_type == "lab":
            # ── Lab: assign exactly 2 CONSECUTIVE slots on the same day ──────
            if consecutive_pairs:
                day, start_slot = random.choice(consecutive_pairs)
                for offset in range(2):
                    chrom.genes.append(Gene(
                        class_id   = assignment["class_id"],
                        subject_id = assignment["subject_id"],
                        teacher_id = assignment["teacher_id"],
                        room_id    = room["id"],
                        day        = day,
                        slot_number= start_slot + offset,
                    ))
        else:
            # ── Regular: assign exactly `credits` unique slots ────────────────
            chosen = random.sample(
                all_slots, min(credits, len(all_slots))
            )
            for (day, slot) in chosen:
                chrom.genes.append(Gene(
                    class_id   = assignment["class_id"],
                    subject_id = assignment["subject_id"],
                    teacher_id = assignment["teacher_id"],
                    room_id    = random.choice(rooms)["id"],
                    day        = day,
                    slot_number= slot,
                ))

    return chrom