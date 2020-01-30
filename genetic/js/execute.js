async function execute() {

    var dados = [];

    // "Date","Price","Open","High","Low","Vol","Change"
    await d3.csv("./data/btc.csv", d=>({
        date: new Date(d.Date),
        close: Number(d.Price.replace(",", "")),
        open: d.Open.replace(",", ""),
        volume: d.Vol
    })).then(function(data) {
        dados = data.reverse();
    });

    return dados;
}
