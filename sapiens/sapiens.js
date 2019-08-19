//charts
var usuarioChart    = dc.rowChart("#usuarioChart"),
    setorChart      = dc.rowChart("#setorChart"),
    movimentoChart  = dc.rowChart("#movimentoChart"),
    mesChart        = dc.barChart("#mesChart"),
    //semanaChart     = dc.rowChart('#semanaChart'),
    horaChart       = dc.barChart("#horaChart"),
    vencidosChart   = dc.barChart("#vencidoChart"),
    count           = dc.dataCount("#dataCount"),
    dataTable       = dc.dataTable('.dc-data-table');


 //Id;NUP;Tarefa_id;Setor;Usuario;Especie;Dia_hora
const allData = Promise.all([
     //tarefas
    d3.csv("../data/sapiens/tarefas.csv"),
    //atividades
    d3.csv("../data/sapiens/atividades.csv")
]);



allData.then(data => {

    var tarefas     = data[0],
        atividades  = data[1];

    //efetuar melhoria no join de tabelas
    var dados = join(tarefas, atividades, "tarefa_id", "tarefa_id", function(d, t) {
        return {
          id:               d.Id,
          nup:              d.NUP,
          t_id:             d.tarefa_id,
          setor:            d.Setor,
          usuario:          nomeDeLogin(d.Usuario),
          movimento:        d.Especie,
          prazo_i:          (t !== undefined) ? parseDate(t.Inicio_prazo) : null,
          prazo_f:          (t !== undefined) ? parseDate(t.Final_prazo) : null,
          data:             parseDate(d.Dia_hora),
          //tempo_analise:    daysBetween(data, (t.Inicio_prazo == undefined) ? new Date() : t.Inicio_prazo)
        }
    });


    var ndx = crossfilter(dados);
    var all = ndx.groupAll();

    var movimentoDim = ndx.dimension(function(d){
        return d.movimento;
    });

    var usuarioDim = ndx.dimension(function(d){
        return d.usuario;
    });

    //atividades encerradas apos o prazo final
    var atrasoDim = ndx.dimension(function(e){
        return daysBetween(e.data, e.prazo_f)
    });

    var horaDim = ndx.dimension(function(d){
        return d.data.getHours() + d.data.getMinutes() / 60;
    });

    var mesDim = ndx.dimension(function(d){
        var mes = d.data.getMonth();
        var labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

         //return mes + '.' + labels[mes];
         return mes;
    });

    var coordenacaoDim = ndx.dimension(function(d){
        return d.setor;
    });

    var tableDim = ndx.dimension(function(d){
        return d.data;
    });

    var movimentoGroup      = movimentoDim.group();
    var usuarioGroup        = usuarioDim.group();
    var atrasoGroup         = atrasoDim.group();
    var horaGroup           = horaDim.group(Math.floor);
    var mesGroup            = mesDim.group();
    var coordenacaoGroup    = coordenacaoDim.group();
    var tableGroup          = tableDim.group();


     mesChart
        .dimension(mesDim)
        .width(300)
        .group(mesGroup)
        .elasticY(true)
      .x(d3.scaleLinear()
        .domain([1, 12]));

    usuarioChart
        .height(1800)
        .dimension(usuarioDim)
        .group(usuarioGroup)
        .elasticX(true);

    setorChart
        .height(700)
        .dimension(coordenacaoDim)
        .group(coordenacaoGroup)
        .elasticX(true);

     movimentoChart
        .height(2800)
        .dimension(movimentoDim)
        .group(movimentoGroup)
        .elasticX(true);

     horaChart
        .dimension(horaDim)
        //.width(500)
        .group(horaGroup)
        .elasticY(true)
        .options ({
          'width' : 300,
          'height' : 200
        })  
      .x(d3.scaleLinear()
        .domain([0, 24])
        .rangeRound([0, 10 * 24]));

      vencidosChart
           .dimension(atrasoDim)
            //.width(500)
            .group(atrasoGroup)
            .elasticY(true)
            .options ({
              'width' : 500,
              'height' : 200
            })  
          .x(d3.scaleLinear()
            .domain([-10, 20])); //ate 20 dias
            //.rangeRound([0, 10 * 24])); 

      count
        .dimension(ndx)
        .group(all); 


       dataTable
            .dimension(tableDim)
            .group(function(d){
                 var label = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul'];
                 return label[d.data.getMonth()];
            })
            .columns([
                "id",
                "nup",
                "setor",
                "usuario"
             ])


    horaChart.margins().left = 50;    
    mesChart.margins().left = 50;   
    vencidosChart.margins().left = 50; 



    dc.renderAll();    

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
function parseDate(data){

   // if(data == undefined) return;

    let Y = data.substring(6,10); 
    let m = data.substring(3,5)-1; //mes comeca com zero
    let d = data.substring(0,2);

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