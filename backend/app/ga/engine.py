import random
from app.ga.chromosome import build_initial_chromosome
from app.ga.fitness    import calculate_fitness
from app.ga.operators  import selection, crossover, mutation, elitism

job_status = {}


def run_ga(job_id, assignments, rooms, working_days,
           lectures_per_day, teacher_availability,
           existing_genes=None, locked_genes=None,
           population_size=50, generations=100):

    job_status[job_id] = {
        "status":       "running",
        "generation":   0,
        "best_fitness": None,
        "result":       None,
    }

    existing = existing_genes or []

    population = [
        build_initial_chromosome(
            assignments, rooms, working_days,
            lectures_per_day, locked_genes=locked_genes
        )
        for _ in range(population_size)
    ]

    best_chromosome = None

    for gen in range(generations):
        for chrom in population:
            calculate_fitness(chrom, teacher_availability,
                              existing_genes=existing)

        population.sort(key=lambda c: c.fitness_score, reverse=True)
        best_chromosome = population[0]

        job_status[job_id]["generation"]   = gen + 1
        job_status[job_id]["best_fitness"] = best_chromosome.fitness_score

        if best_chromosome.fitness_score == 0:
            break

        parents        = selection(population, top_k=10)
        new_population = elitism(population, elite_size=2)

        while len(new_population) < population_size:
            p1    = random.choice(parents)
            p2    = random.choice(parents)
            child = crossover(p1, p2)
            child = mutation(child, working_days, lectures_per_day)
            new_population.append(child)

        population = new_population

    job_status[job_id]["status"] = "completed"
    job_status[job_id]["result"] = [g.to_dict()
                                    for g in best_chromosome.genes]
    return best_chromosome