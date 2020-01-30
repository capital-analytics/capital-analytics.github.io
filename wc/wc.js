

//produto;codigo_barra;label;valor_compra;valor_venda;qtd;pagamento;data_compra
const telegram = d3.json("data/result.json",  d => ({
      ls:   d.chats[0]
}));

telegram.then(data => {


    var ls = data.chats.list[0];
    var counts = {};
    var keys = [];

    console.log(typeof(ls.messages));

    var mensagens = ls.messages.map(e =>{
        return e.text;
    }).filter(f => {
        return f.length = 1000;
    })
    //var ndx = crossfilter(data);
    //var all = ndx.groupAll();

    var all = mensagens.join("\n");

    var tokens = all.split(/\W+/);
    //console.log(tokens);

    tokens.forEach(w=>{
        var word = w.toLowerCase();
        if(counts[word] === undefined){
            counts[word] = 1;
            keys.push(word);
        }else{
            counts[word] = counts[word] + 1
        }
    })


    keys.sort(compare);

    keys.forEach(e => {
        console.log(e, counts[e]);
    })

    function compare(a, b){
        var countA = counts[a];
        var countB = counts[b];

        return countB - countA;
    }

    //dc.renderAll();    

}) 









function nomeDeLogin(nome){
   // return nome;
    let array = nome.trim().split(" ");
    return array[0] + " " + array[array.length-1];

}

function daysBetween(one, another) {
    return Math.round((one - another)/8.64e7);
}

function reduzir(mov){
    if(mov.length > 80){
        return mov.substring(0, 80).concat("...");
    }
}


 // new Date(ano, mês, dia, hora, minuto, segundo, milissegundo);
 /**
 data no formato 2019-02-08 04:10:43
 **/
function parseDate(data){

   // if(data == undefined) return;

    let Y = data.substring(0,4); 
    let m = data.substring(5,7)-1; //mes comeca com zero
    let d = data.substring(8,10);

    let h  = data.substring(11,13);
    let mn = data.substring(14,16);
    let s  = data.substring(17,19);

    return new Date(Y, m, d, h, mn, s);
}   

function join(lookupTable, mainTable, lookupKey, mainKey, select) {
    var l = lookupTable.length,
        m = mainTable.length,
        lookupIndex = [],
        output = [];
    for (var i = 0; i < l; i++) { // loop through l items
        var row = lookupTable[i];
        lookupIndex[row[lookupKey]] = row; // create an index for lookup table
    }
    for (var j = 0; j < m; j++) { // loop through m items
        var y = mainTable[j];
        var x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
        output.push(select(y, x)); // select only the columns you need
    }
    return output;
};