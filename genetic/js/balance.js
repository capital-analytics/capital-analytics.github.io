class Balance {

    constructor(cotacoes, genes, valor) {
        this.cotacoes = cotacoes;
        this.genes = genes;

        this.depositoInicial(valor);
        //this.execute();
    }

    depositoInicial(valor) {
        let x = {};
        x.saldo = valor;
        this.trades = [x];
    }

    //testa o gene na serie historica
    executarTrades(tx) {
        this.cotacoes.forEach((c,i)=>{
            //compra
            if (this.genes[i] == 1) {
                this.executarCompra(c, tx)
            }

            //venda
            if (this.genes[i] == -1) {
                this.executarVenda(c, tx);
            }
        })

        // return this.getSaldo();
    }

    executarCompra(cotacao, taxa) {
        if (this.getSaldo() > 0) {
            let x = {};
            x.saldo = (this.getSaldo() * (1 - taxa/100)) * (-1);
            x.moeda = x.saldo * (-1) / cotacao.close;

            this.trades.push(x)
        }
    }

    executarVenda(cotacao, taxa){
        if (this.getMoedas() > 0) {
            let x = {};
            x.saldo = (this.getMoedas() * (1 - taxa/100)) * cotacao.close;
            x.moeda = this.getMoedas() * (-1);
            this.trades.push(x)
        }
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

    getSaldoInicial() {
        return this.trades[0].saldo;
    }

    getTradesExecutados(){
        return this.trades.length;
    }
}
