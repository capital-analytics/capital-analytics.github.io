class Cotacoes {

    constructor() {
        this.execute();
    }

    execute() {
        const cotacoes = d3.csv("../data/BTC_BRLHistorical.csv", d=>({
            date: new Date(d.Date).getTime(),
            volume: Number(d.Vol.replace("K", "") * 1000),
            high: Number(d.High.replace(",", "")),
            low: Number(d.Low.replace(",", "")),
            open: Number(d.Open.replace(",", "")),
            close: Number(d.Price.replace(",", "")),
            var: Number(d.Change.replace("%", ""))
        }));

        return cotacoes;
    }

}
