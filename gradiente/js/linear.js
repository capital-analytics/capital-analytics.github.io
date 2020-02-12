//"Date","Price","Open","High","Low","Vol","Change"
const dados = d3.csv("data/BTC_BRL2010.csv",  d => ({
      data:        new Date(d.Date),
      fechamento:  Number(d.Price.replace(',', '')),
      abertura:    Number(d.Open),
      maior:       Number(d.High),
      menor:       Number(d.Low),
      volume:      Number(d.Vol.replace('K', '') * 1000),
      var:         Number(d.Change.replace('%', '')),
}));


var trades = [];

var getTaxa = function(tx){
  return 1 - tx / 100;
}


var depositoInicial = function(valor){
    var trade = {};
        trade.saldo = valor;
        trade.operacao = 'deposito';
        trade.data = new Date(1378939713 * 1000);
        trade.moedas = 0

        trades.push(trade);
}

depositoInicial(5000);


lastTrade = function(){
   return this.trades[trades.length -1]; 
}

totalSaldo = function(){
  return this.trades.map(m => {
      return m.saldo
  }).reduce((v, acc) => {
      return (v + acc);
  }, 0)
}  

totalMoedas = function(){
  return this.trades.map(m => {
     return m.moedas
  }).reduce((v, acc) => {
     return (v + acc);
  }, 0)
}


dados.then(data => {

    //varia 4 subidas consecutivas
    var t = 0;
    data.forEach((f, i) => {
        if(f.var > 0){
          t++;
        }else{
          t++;
        }

        //tendencia de alta
        if(t >= 10 && lastTrade().operacao != 'compra'){
          if(totalSaldo() > 0){
              var trade = {};
                  trade.preco    = f.fechamento;
                  trade.moedas   = (totalSaldo() / f.fechamento) * getTaxa(0.7);
                  trade.saldo    = (totalSaldo()) * (-1); //saida
                  trade.operacao = 'compra';
                  trade.data     = f.data;
                  trades.push(trade);
          }
        }

        //stop
        if(lastTrade().operacao == 'compra'){

          if(totalMoedas() > 0){
          //stopLoss de 1.5%
          if(f.fechamento / lastTrade().preco -1 < -0.015){
              var trade = {};
                  trade.preco = f.fechamento;
                  trade.saldo = (totalMoedas() * f.fechamento) * getTaxa(0.7); //entrada
                  trade.operacao = 'stop';
                  trade.data = f.data;
                  trade.moedas = totalMoedas() * (-1) ;

                  trades.push(trade);
          }

          //gain de 3%
          if(f.fechamento / lastTrade().preco -1 > 0.03){
              var trade = {};
                  trade.preco = f.fechamento;
                  trade.saldo = (totalMoedas() * f.fechamento) * getTaxa(0.7); //entrada
                  trade.operacao = 'venda';
                  trade.data = f.data;
                  trade.moedas = totalMoedas() * (-1) ;

                  trades.push(trade);
          }
      }
    }
})


  console.log(JSON.stringify(trades));


});
  