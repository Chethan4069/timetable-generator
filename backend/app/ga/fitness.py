def calculate_fitness(chromosome, teacher_availability,
                      existing_genes=None):
    score = 0
    genes = chromosome.genes
    all_genes_dicts = [
        {
            "teacher_id":  g.teacher_id,
            "day":         g.day,
            "slot_number": g.slot_number,
            "room_id":     g.room_id,
            "class_id":    g.class_id,
        }
        for g in genes
    ] + (existing_genes or [])

    # ── HARD: teacher double-booked across ALL sections ───────────────────────
    teacher_slots = {}
    for g in all_genes_dicts:
        key = (g["teacher_id"], g["day"], g["slot_number"])
        if key in teacher_slots:
            score -= 100
        else:
            teacher_slots[key] = True

    # ── HARD: room double-booked ──────────────────────────────────────────────
    room_slots = {}
    for g in genes:
        key = (g.room_id, g.day, g.slot_number)
        if key in room_slots:
            score -= 100
        else:
            room_slots[key] = True

    # ── HARD: class double-booked ─────────────────────────────────────────────
    class_slots = {}
    for g in genes:
        key = (g.class_id, g.day, g.slot_number)
        if key in class_slots:
            score -= 100
        else:
            class_slots[key] = True

    # ── HARD: teacher unavailable ─────────────────────────────────────────────
    for g in genes:
        key = (g.teacher_id, g.day, g.slot_number)
        if teacher_availability.get(key) is False:
            score -= 100

    # ── HARD: lab subjects must be 2 consecutive slots on the same day ────────
    # Group genes by (class_id, subject_id) — find lab pairs
    subject_class_genes = {}
    for g in genes:
        key = (g.class_id, g.subject_id)
        subject_class_genes.setdefault(key, []).append(g)

    for (class_id, subject_id), sg in subject_class_genes.items():
        if len(sg) == 2:
            g1, g2 = sg[0], sg[1]
            same_day   = g1.day == g2.day
            consecutive = abs(g1.slot_number - g2.slot_number) == 1
            if not same_day or not consecutive:
                # Lab pair is broken — heavy penalty
                score -= 100

    # ── SOFT: teacher more than 3 consecutive slots ───────────────────────────
    teacher_day_slots = {}
    for g in genes:
        key = (g.teacher_id, g.day)
        teacher_day_slots.setdefault(key, []).append(g.slot_number)

    for slots in teacher_day_slots.values():
        slots.sort()
        consecutive = 1
        for i in range(1, len(slots)):
            if slots[i] == slots[i - 1] + 1:
                consecutive += 1
                if consecutive > 3:
                    score -= 10
            else:
                consecutive = 1

    chromosome.fitness_score = score
    return score