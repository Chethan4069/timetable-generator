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
        return Gene(
            self.class_id, self.subject_id, self.teacher_id,
            self.room_id,  self.day,        self.slot_number
        )


class Chromosome:
    def __init__(self):
        self.genes         = []
        self.fitness_score = float("inf")

    def copy(self):
        c               = Chromosome()
        c.genes         = [g.copy() for g in self.genes]
        c.fitness_score = self.fitness_score
        return c


def build_initial_chromosome(assignments, rooms, working_days,
                              lectures_per_day, locked_genes=None):
    chrom = Chromosome()

    # Add locked genes first
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

    # All valid individual slots
    all_slots = [
        (day, slot)
        for day in working_days
        for slot in range(1, lectures_per_day + 1)
    ]

    # Valid consecutive START slots (slot N and N+1 both exist)
    consecutive_starts = [
        (day, slot)
        for day in working_days
        for slot in range(1, lectures_per_day)  # slot+1 must also be valid
    ]

    for assignment in assignments:
        if assignment["subject_id"] in locked_ids:
            continue

        subject_type = assignment.get("subject_type", "theory")
        room         = random.choice(rooms)

        if subject_type == "lab":
            # ── ALWAYS pick 2 consecutive slots on the same day ───────────────
            if not consecutive_starts:
                continue

            # Try to find a consecutive pair not already used
            shuffled = consecutive_starts.copy()
            random.shuffle(shuffled)

            placed = False
            for (day, start_slot) in shuffled:
                chrom.genes.append(Gene(
                    class_id   = assignment["class_id"],
                    subject_id = assignment["subject_id"],
                    teacher_id = assignment["teacher_id"],
                    room_id    = room["id"],
                    day        = day,
                    slot_number= start_slot,
                ))
                chrom.genes.append(Gene(
                    class_id   = assignment["class_id"],
                    subject_id = assignment["subject_id"],
                    teacher_id = assignment["teacher_id"],
                    room_id    = room["id"],
                    day        = day,
                    slot_number= start_slot + 1,
                ))
                placed = True
                break

        else:
            # ── Regular: assign exactly `credits` unique slots ────────────────
            credits = assignment.get("credits_per_week", 3)
            chosen  = random.sample(
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