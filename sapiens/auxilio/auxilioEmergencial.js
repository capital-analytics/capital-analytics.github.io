//charts
var tipoChart       = dc.pieChart("#tipoChart"),
    mesChart        = dc.barChart("#mesChart"),
    semanaChart     = dc.rowChart('#semanaChart'),
    horaChart       = dc.barChart("#horaChart"),
    setorChart      = dc.rowChart("#setorChart"),
    count           = dc.dataCount("#dataCount"),
    vencidosChart   = dc.barChart("#vencidoChart"),
    dataTable       = dc.dataTable('.dc-data-table');


 //Id;NUP;Tarefa_id;Setor;Usuario;Especie;Dia_hora
const allData = d3.csv("dados/24-06.csv")

var charts = undefined;


//Nup	TipoAcao	TipoDaAcao	AcaoColetiva	Autor	Origem	UF	Entrada	Mes	Prazo	DataConclusao	Concluido	Decisao	Data													
const dataset = d3.csv("dados/24-06.csv",  d => ({
      nup:            d.Nup,
      tipo:           d.TipoDaAcao,
      acaoColetiva:   d.AcaoColetiva,
      autor:          d.Autor,
      origem:         d.Origem,
      uf:             d.UF,
      entrada:        parseDate(d.Entrada),
      conclusao:      parseDate(d.DataConclusao)
}));

dataset.then(data => {

    data = data.filter(f => f.entrada > 1);

    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    var tipoDim = ndx.dimension(function(d){
        return d.tipo;
    });

    var tipoGroup = tipoDim.group();

    var mesDim = ndx.dimension(function(d){
        var mes = d.entrada.getMonth();
        var labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

         //return labels[mes];
         return mes;
    });

    var mesGroup = mesDim.group();

    var semanaDim = ndx.dimension(function (d) {
        var day = d.entrada.getDay();
        var name = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        return day + '.' + name[day];
    });

    var semanaGroup = semanaDim.group();

    var horaDim = ndx.dimension(function(d){
        return d.entrada.getHours() + d.entrada.getMinutes() / 60;
    });

    var horaGroup = horaDim.group(Math.floor);

    var coordenacaoDim = ndx.dimension(function(d){
        return d.origem;
    });

    var coordenacaoGroup = coordenacaoDim.group();

    var tableDim = ndx.dimension(function(d){
        return d.autor;
    });

    var atrasoDim = ndx.dimension(function(e){
        return e.uf;
    });

    var atrasoGroup = atrasoDim.group();

    charts = [
       tipoChart.width(250)
                .height(250)
                .slicesCap(7)
                .innerRadius(80)
                .dimension(tipoDim)
                .group(tipoGroup),

        mesChart.dimension(mesDim)
                .width(500)
                .group(mesGroup)
                .elasticY(true)
            .x(d3.scaleLinear()
                 .domain([0, 12])),

        semanaChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
            .width(180)
            .height(180)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .group(semanaGroup)
            .dimension(semanaDim)
            // Assign colors to each value in the x scale domain
            .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
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

          setorChart.height(1000)
                    .dimension(coordenacaoDim)
                    .group(coordenacaoGroup)
                    .elasticX(true),

          vencidosChart.x(d3.scaleBand())
                       .elasticY(true)
                       .xUnits(dc.units.ordinal)
                       .dimension(atrasoDim)
                       .group(atrasoGroup)
    ]  



    function load_button(file) {
        return function load_it() {
            d3.csv(file).then(function(experiments) {
                ndx.remove(() => true);
                ndx.add(experiments);
                dc.redrawAll();
            });
        };
    }

    var button1 = load_button("morley.csv"),
        button2 = load_button("morley2.csv"),
        button3 = load_button("morley3.csv");

     dc.textFilterWidget("#search").dimension(tableDim);

     dataTable.dimension(tableDim)
            .group(function(d){
                 var label = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
                 return label[d.entrada.getMonth()] + "/" + d.entrada.getFullYear();
            })
            .columns([
                "nup",
                "tipo",
                "autor",
                {
                    label: "entrada",
                    format: function(e){
                        return e.entrada.toLocaleString()
                    }
                },

             ])  

    count.dimension(ndx)
         .group(all); 

    dc.renderAll();    
}) 


window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    dc.renderAll();
};

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

function parseDate(data){
    return new Date(data);
}   
