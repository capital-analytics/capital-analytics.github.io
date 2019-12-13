// Genetic Algorithm, Evolving Shakespeare

// A class to describe a pseudo-DNA, i.e. genotype
//   Here, a virtual organism's DNA is an array of character.
//   Functionality:
//      -- convert DNA into a string
//      -- calculate DNA's "fitness"
//      -- mate DNA with another set of DNA
//      -- mutate DNA

function newChar() {
  let op = [1, 0, -1]; //compra, hold, venda
  return random(op);
}

// Constructor (makes a random DNA)
class DNA {
  constructor(cotacoes) {
    // The genetic sequence
    this.trades = [];
    this.genes = [];
    this.fitness = 0;
    this.cotacoes = cotacoes;
    for (let i = 0; i < cotacoes.length; i++) {
      this.genes[i] = newChar(); // Pick from range of chars
    }

    //deposito de saldo inicial
    let x = {};
        x.saldo = 1000;
    this.trades[0] = x;
  }

  // Converts character array to a String
  getPhrase() {
    return this.genes.join("");
  }

  // Fitness function (returns floating point % of "correct" trades)
  calcFitness(target) {
    let score = 0;

    //calcula o score do gain maior que o investimento
    if(this.executeTrades() / this.trades[0].saldo > 1){
      score = (this.getSaldo()/this.trades[0].saldo) / 100;
    } 


    this.fitness = score / target;
  }

  //testa o gene na serie historica
  executeTrades(){
    this.cotacoes.forEach((c, i) =>{
        //compra
        if(this.genes[i] == 1){
         if(this.getSaldo() > 0) {
           let x = {};
               x.saldo = this.getSaldo() * (-1);
               x.moeda = this.getSaldo() / c;

           this.trades.push(x)
         } 
        }

        //venda
        if(this.genes[i] == -1){
          if(this.getMoedas() > 0) {
            let x = {};
                x.saldo = this.getMoedas() * c;
                x.moeda = this.getMoedas() * (-1);
            this.trades.push(x)
          }  
        }
    })

   return this.getSaldo();

  }


  getSaldo(){
    return this.trades.map(m => {
        return m.saldo;
    }).reduce((acc, e)=> {
        return (acc + e);
    })
  }

  getMoedas(){
     return this.trades.map(m => {
        return (m.moeda != undefined) ? m.moeda : 0;
     }).reduce((acc, e)=> {
        return (acc + e);
    })
  }

  // Crossover
  crossover(partner) {
    // A new child
    let child = new DNA(this.genes.length);

    let midpoint = floor(random(this.genes.length)); // Pick a midpoint

    // Half from one, half from the other
    for (let i = 0; i < this.genes.length; i++) {
      if (i > midpoint) child.genes[i] = this.genes[i];
      else child.genes[i] = partner.genes[i];
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