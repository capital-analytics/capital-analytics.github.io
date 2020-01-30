var labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];


const dados = d3.json("data/result.json", d => ({
    registros: d,
}));

dados.then(d => {
    //chats apenas do LS 
    var chats = d.chats.list.filter(f => {
        return f.id == 9931547947
    }).map(m => {
        return m.messages;
    });

    //filtra apenas as mensagens
    chats = chats[0];

    chats = chats.filter(f => {
        return f.type == "message"
    })

    //console.log(grid);  
    var lista = chats.map(x=>{
        return ({
            "nome": (x.from != undefined) ? x.from : 'n/a',
            "data": new Date(x.date),
            "texto": x.text
        });
    });

    var ndx = crossfilter(lista);
    var all = ndx.groupAll();

    //mes
    var mesDim = ndx.dimension(function(d) {
        return d.data.getMonth();
    });

    var mesGroup = mesDim.group();

    //hora
     var horaDim = ndx.dimension(function(d){
        return d.data.getHours() + d.data.getMinutes() / 60;
    });

    var horaGroup = horaDim.group(Math.floor);

    //top5
    var usuarioDim = ndx.dimension(function(d){
        //return d.nome;
        return d.nome.split(" ").filter(f => {
            return f.length > 2
       }).map(m => {
            return m[0];
       }).join('');
         
    });

    var usuarioGroup = getTops(usuarioDim.group());

    var  mesChart     = dc.barChart("#mesChart"),
         horaChart    = dc.barChart("#horaChart"),
         semanaChart  = dc.rowChart('#semanaChart'),
         usuarioChart = dc.rowChart('#top5Chart');


    //dia da semana
     var semanaDim = ndx.dimension(function (d) {
        var day = d.data.getDay();
        var name = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        return day + '.' + name[day];
    });

     var semanaGroup  = semanaDim.group();
         

    charts = [
        mesChart.dimension(mesDim)
            .width(500).group(mesGroup)
            .elasticY(true)
            .x(d3.scaleLinear().domain([0, 12]))
            .xAxis().tickFormat(function(e) {
               return labels[e];
             }),

        horaChart.dimension(horaDim)
            //.width(500)
            .group(horaGroup)
            .elasticY(true)
            .options ({
              'width' : 500,
              'height' : 200
            })  
          .x(d3.scaleLinear()
            .domain([0, 24])
            .rangeRound([0, 10 * 24])
          ),

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
            }).options ({
              'width' : 400,
              'height': 200
            }).title(function (d) {
                return d.value;
            }).elasticX(true)
            .xAxis().ticks(4),

        usuarioChart 
            .width(180)
            .height(180)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .group(usuarioGroup)
            .dimension(usuarioDim)
            // Assign colors to each value in the x scale domain
            .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
            .label(function (d) {
                return d.key;
            }).options ({
              'width' : 400,
              'height': 200
            }).title(function (d) {
                return d.value;
            }).elasticX(true)
            .xAxis().ticks(4)    

    ]

    mesChart.margins().left  = 50;
    horaChart.margins().left = 50; 

    var tableDim = ndx.dimension(function(d) {
        return d;
    });

    var dataTable = dc.dataTable('.dc-data-table')
    .dimension(tableDim).columns([ 
        {
          label: "nome",
          format: function(e){
              return e.nome.split(" ").filter(f => {
                    return f.length > 2
               }).map(m => {
                    return m[0];
               }).join('')
          }  
        },
        "texto",
        {
        label: "data",
        format: function(e) {
            return e.data.toLocaleDateString();
        },
    }])

    //count
    var count = dc.dataCount("#dataCount");
    count.dimension(ndx).group(all);

    dc.renderAll();
}
);

//You can then use .group(fakeGroup) to properly chart your data.
function getTops(source_group) {
    return {
        all: function () {
            return source_group.top(5);
        }
    };
}


