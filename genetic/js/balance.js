class Balance {

    constructor(cotacoes, genes) {
        this.cotacoes = cotacoes;
        this.genes = genes;
        
        let x = {};
            x.saldo = 1000;
        this.trades = [x];
    }

    //testa o gene na serie historica
    execute() {
        this.cotacoes.forEach((c,i)=>{
            //compra
            if (this.genes[i] == 1) {
                if (this.getSaldo() > 0) {
                    let x = {};
                        x.saldo = this.getSaldo() * (-1);
                        x.moeda = this.getSaldo() / c;

                    this.trades.push(x)
                }
            }

            //venda
            if (this.genes[i] == -1) {
                if (this.getMoedas() > 0) {
                    let x = {};
                        x.saldo = this.getMoedas() * c;
                        x.moeda = this.getMoedas() * (-1);
                    this.trades.push(x)
                }
            }
        })

       // return this.getSaldo();
    }

    getSaldo() {
        return this.trades.map(m=>{
            return (m.saldo != undefined) ? m.saldo : 0
        }).reduce((acc,e)=>{
            return (acc + e);
        })
    }

    getMoedas() {
        return this.trades.map(m=>{
            return (m.moeda != undefined) ? m.moeda : 0;
        }).reduce((acc,e)=>{
            return (acc + e);
        })
    }


    getSaldoInicial(){
        return this.trades[0].saldo;
    }
}
