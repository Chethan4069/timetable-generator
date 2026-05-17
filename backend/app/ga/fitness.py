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

    # ── SOFT: teacher >3 consecutive slots ───────────────────────────────────
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