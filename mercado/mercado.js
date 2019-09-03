//charts
var categoriaChart  = dc.rowChart("#categoriaChart"),
    mesChart        = dc.barChart("#mesChart"),
    semanaChart     = dc.rowChart('#semanaChart'),
    horaChart       = dc.barChart("#horaChart"),
    pagamentoChart  = dc.rowChart("#pagamentoChart"),
    count           = dc.dataCount("#dataCount"),
    dataTable       = dc.dataTable('.dc-data-table'),
    vendasBox       = dc.numberDisplay("#vendasBox");




var charts = undefined;

//produto;codigo_barra;label;valor_compra;valor_venda;qtd;pagamento;data_compra
const vendas = d3.csv("../data/mercado/vendasmercado5.csv",  d => ({
      produto:           d.produto,
      categoria:         d.categoria,
      label:             d.label,
      compra:            d.valor_compra,
      venda:             d.valor_venda,
      //vencimento:        d.data_vencimento,
      qtd:               d.qtd,
      pagamento:         d.pagamento,
      data:              parseDate(d.data_compra)
}));


var locale = d3.formatLocale({
    "decimal": ",",
    "thousands": ".",
    "currency": ["R$ ", ""],
    "date": "%m/%d/%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
})


vendas.then(data => {

    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    var categoriaDim = ndx.dimension(function(d){
        return d.categoria;
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


    var semanaDim = ndx.dimension(function (d) {
        var day = d.data.getDay();
        var name = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        return day + '.' + name[day];
    });

    var tableDim = ndx.dimension(function(d){
        return d.data;
    });

    var vendasDim = ndx.dimension(function(d){
        return d.qtd;
    });

    var pagamentoDim = ndx.dimension(function(d){
        return d.pagamento;
    })

    var categoriaGroup      = categoriaDim.group();
    var horaGroup           = horaDim.group(Math.floor);
    var mesGroup            = mesDim.group();
    var tableGroup          = tableDim.group();
    var semanaGroup         = semanaDim.group();
    var pagamentoGroup      = pagamentoDim.group();

    var vendasGroup         = vendasDim.group().reduceSum(function(d){
                                return d.qtd * d.venda;
                            });

    charts = [

         mesChart
            .dimension(mesDim)
            .width(500)
            .group(mesGroup)
            .elasticY(true)
          .x(d3.scaleLinear()
            .domain([1, 12])),


         horaChart
            .dimension(horaDim)
            //.width(500)
            .group(horaGroup)
            .elasticY(true)
            .options ({
              'width' : 500,
              'height' : 200
            })  
          .x(d3.scaleLinear()
            .domain([0, 24])
            .rangeRound([0, 10 * 24])),

          semanaChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
            .width(180)
            .height(180)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .group(semanaGroup)
            .dimension(semanaDim)
            // Assign colors to each value in the x scale domain
           // .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef'])
            .label(function (d) {
                return d.key.split('.')[1];
            })
            .options ({
              'width' : 400,
              'height': 200
            })  
            // Title sets the row text
            .title(function (d) {
                return d.value;
            })
            .elasticX(true)
            .xAxis().ticks(4),      

          
         categoriaChart
            .height(1100)
            .dimension(categoriaDim)
            .group(categoriaGroup)
            .elasticX(true),  


        pagamentoChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
            .width(320)
            .height(180)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .group(pagamentoGroup)
            .dimension(pagamentoDim)
            // Assign colors to each value in the x scale domain
            //.ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef'])
            .label(function (d) {
                //console.log(d);
                return d.pagamento;
            })
            .elasticX(true)
            .xAxis().ticks(4)
        ]  


      
       vendasBox
            .formatNumber(locale.format("$,.2f"))
            .dimension(vendasDim)
            //.valueAccessor(avg)
            .group(vendasGroup),    


      count
        .crossfilter(ndx)
        .groupAll(all); 


       dataTable
            .dimension(tableDim)
            .section(function(d){
                 var label = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
                 return label[d.data.getMonth()] + "/" + d.data.getFullYear();
            })
            .columns([
                "produto",
                "categoria",
                {
                    label: "Venda",
                    format: function(e){
                        return locale.format("$,.2f")(e.venda);
                    }
                },
                "qtd"
             ]);


    function filter(filters) {
        filters.forEach(function(d, i) { 
            charts[i].filter(d); 
        });
        renderAll();
    }; 

    var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function() { 
        d3.brush()
             .on("brush", renderAll)
             .on("end", renderAll); 
       });

    // Whenever the brush moves, re-rendering everything.
    function renderAll() {
        chart.each(render);
        //list.each(render);
        //d3.select("#active").text(formatNumber(all.value()));
    }



    function render(method) {
        d3.select(this).call(method);
    } 




    horaChart.margins().left = 50;    
    mesChart.margins().left = 50;   
    semanaChart.margins().left = 50; 
    pagamentoChart.margins().left = 50;


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