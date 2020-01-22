// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Genetic Algorithm, Evolving Shakespeare

// Demonstration of using a genetic algorithm to perform a search

// setup()
//  # Step 1: The Population
//    # Create an empty population (an array or ArrayList)
//    # Fill it with DNA encoded objects (pick random values to start)

// draw()
//  # Step 1: Selection
//    # Create an empty mating pool (an empty ArrayList)
//    # For every member of the population, evaluate its fitness based on some criteria / function,
//      and add it to the mating pool in a manner consistant with its fitness, i.e. the more fit it
//      is the more times it appears in the mating pool, in order to be more likely picked for reproduction.

//  # Step 2: Reproduction Create a new empty population
//    # Fill the new population by executing the following steps:
//       1. Pick two "parent" objects from the mating pool.
//       2. Crossover -- create a "child" object by mating these two parents.
//       3. Mutation -- mutate the child's DNA based on a given probability.
//       4. Add the child object to the new population.
//    # Replace the old population with the new population
//
//   # Rinse and repeat

let target;
let popmax;
let mutationRate;
let population;

let bestPhrase;
let allPhrases;
let stats;
var cotacoes = [];
var started = false;

async function setup() {
    bestPhrase = createP("Best phrase:");
    //bestPhrase.position(10,10);
    bestPhrase.class("best");

    allPhrases = createP("Trades: ");
    allPhrases.position(500, 10);
    allPhrases.class("all");

    stats = createP("Stats");
    //stats.position(10,200);
    stats.class("stats");

    //createCanvas(640, 360);
    target = 0.3;
    //50% de gain
    popmax = 50;
    mutationRate = 0.01;

    //requisicao assincrona
    await execute().then(data=>{
        data.forEach(d => {
            cotacoes.push(d);
        })
    });

    cotacoes = cotacoes.slice(cotacoes.length - 365, cotacoes.length - 1);

    //console.log(cotacoes.length);
	started = true;

    // Create a population with a target phrase, mutation rate, and population max
    population = new Population(target,mutationRate,popmax,cotacoes);
}


function draw() {
    if (started) {
        // Generate mating pool
        population.naturalSelection();
        //Create next generation
        population.generate();
        // Calculate fitness
        population.calcFitness();

        population.evaluate();

        // If we found the target phrase, stop
        if (population.isFinished()) {
            //println(millis()/1000.0);
            noLoop();
        }

        displayInfo();

    }
}

function displayInfo() {
    // Display current status of population
    let answer = population.getBest();

    bestPhrase.html("Melhor gene:<br>" + answer);

    let statstext = "total generations:  " + population.getGenerations() + "<br>";
    statstext += "average fitness:       " + nf(population.getAverageFitness()) + "<br>";
    statstext += "total population:      " + popmax + "<br>";
    statstext += "mutation rate:         " + floor(mutationRate * 100) + "% <p/>";

    statstext += "Saldo final:         " + floor(mutationRate * 100) + "% <br/>";
    statstext += "Trades executados:   " + population.tradesExecutados() + "<br/>";

    stats.html(statstext);

    allPhrases.html("População:<br>" + population.allPhrases())
}
