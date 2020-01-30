// Genetic Algorithm, Evolving Shakespeare

// A class to describe a pseudo-DNA, i.e. genotype
//   Here, a virtual organism's DNA is an array of character.
//   Functionality:
//      -- convert DNA into a string
//      -- calculate DNA's "fitness"
//      -- mate DNA with another set of DNA
//      -- mutate DNA

function newChar() {
    let op = [1, 0, -1];
    //compra, hold, venda
    return random(op);
}

function random(myArray) {
    return myArray[Math.floor(Math.random()*myArray.length)];
}

// Constructor (makes a random DNA)
class DNA {
    constructor(cotacoes) {
        // The genetic sequence
        //this.trades = [];
        this.genes = [];
        this.fitness = 0;
        this.balance;

        for (let i = 0; i < cotacoes; i++) {
            this.genes[i] = newChar();
        }

    }

    // Converts character array to a String
    getPhrase() {
        return this.genes.join("");
    }

    getTrades() {
        var message = "";
        message += "compras: ";
        message += this.genes.filter(f=>{
            return f == 1
        }
        ).length;

        message += "; vendas: ";
        message += this.genes.filter(f=>{
            return f == -1
        }
        ).length;

        message += "<br/>";                  

        return message;

    }

    // Fitness function (returns floating point % of "correct" trades)
    calcFitness(serie) {
        //console.log("Fit DNA...");
        let score = 0;

        this.balance = new Balance(serie,this.genes,5000);
        this.balance.executarTrades(0.7);

        if (this.balance.getSaldo() / this.balance.getSaldoInicial() > 1) {
            score = (this.balance.getSaldo() / this.balance.getSaldoInicial()) / 100;
        }

        this.fitness = score / target;
    }

    getTotalTrades(){
        this.balance.getTradesExecutados();
    }

    // Crossover
    crossover(partner) {
        // A new child
        let child = new DNA(this.genes.length);

        let midpoint = floor(random(this.genes.length));
        // Pick a midpoint

        // Half from one, half from the other
        for (let i = 0; i < this.genes.length; i++) {
            if (i > midpoint)
                child.genes[i] = this.genes[i];
            else
                child.genes[i] = partner.genes[i];
        }
        return child;
    }

    // Based on a mutation probability, picks a new random character
    mutate(mutationRate) {
        for (let i = 0; i < this.genes.length; i++) {
            if (random(1) < mutationRate) {
                this.genes[i] = newChar();
            }
        }
    }
}
