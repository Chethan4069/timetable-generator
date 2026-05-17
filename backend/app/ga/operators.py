import random
from app.ga.chromosome import Chromosome


def selection(population, top_k=10):
    return sorted(population,
                  key=lambda c: c.fitness_score,
                  reverse=True)[:top_k]


def crossover(parent1, parent2):
    """
    Uniform crossover — each gene picked from either parent randomly.
    IMPORTANT: preserves exact gene count from parent1 so no genes
    are ever lost or duplicated.
    """
    child = Chromosome()
    for i, gene in enumerate(parent1.genes):
        if i < len(parent2.genes) and random.random() < 0.5:
            child.genes.append(parent2.genes[i].copy())
        else:
            child.genes.append(gene.copy())
    return child


def mutation(chromosome, working_days, lectures_per_day,
             mutation_rate=0.1):
    """
    Randomly change day+slot of a gene.
    For lab genes (pairs), always mutate both together
    so consecutive slots are preserved.
    """
    genes = chromosome.genes
    i = 0
    while i < len(genes):
        gene = genes[i]

        # Detect lab pair: next gene same subject+class on same day
        is_lab_start = (
            i + 1 < len(genes) and
            genes[i+1].subject_id == gene.subject_id and
            genes[i+1].class_id   == gene.class_id and
            genes[i+1].slot_number == gene.slot_number + 1
        )

        if is_lab_start:
            if random.random() < mutation_rate:
                # Pick a new consecutive pair
                valid_starts = [
                    (day, slot)
                    for day in working_days
                    for slot in range(1, lectures_per_day)
                ]
                new_day, new_slot = random.choice(valid_starts)
                genes[i].day         = new_day
                genes[i].slot_number = new_slot
                genes[i+1].day         = new_day
                genes[i+1].slot_number = new_slot + 1
            i += 2  # skip the pair
        else:
            if random.random() < mutation_rate:
                genes[i].day         = random.choice(working_days)
                genes[i].slot_number = random.randint(1, lectures_per_day)
            i += 1

    return chromosome


def elitism(population, elite_size=2):
    return [c.copy() for c in
            sorted(population,
                   key=lambda c: c.fitness_score,
                   reverse=True)[:elite_size]]