var charts = undefined;
var labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

var  mesChart    = dc.barChart("#mesChart"),
     pecasChart  = dc.rowChart("#pecasChart"),
     setorChart  = dc.rowChart("#setorChart"),
     respChart   = dc.rowChart("#respChart"),
     semanaChart = dc.rowChart('#semanaChart');

d3.json("data/assuntos_sociais_ivt.json").then(function(data) {

   // var grid = data[0];

    var lista = data.map(x=>{
        return ({
            "responsavel": x.advogado,
            "data":        new Date(x.data),
            "nup":         x.nup,
            "peca":        x.assunto,
            "especie":     x.especie,
            "coordenacao": x.ivt_geral,
            "link":        x.link
        });
    });

    var ndx = crossfilter(lista);
    var all = ndx.groupAll();
    

    function renderAll() {
	   chart.each(render);
	   list.each(render);
	   d3.select("#active").text(formatNumber(all.value()));
	}

	  // Renders the specified chart or list.
	function render(method) {
	    d3.select(this).call(method);
	}

     //dia da semana
     var semanaDim = ndx.dimension(function (d) {
        var day = d.data.getDay();
        var name = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        return day + '.' + name[day];
    });

     var semanaGroup  = semanaDim.group(); 

    //pecas
    var pecasDim = ndx.dimension(function(d) {
        return d.peca;
    });

    var pecasGroup = pecasDim.group();

    //resp   
    var respDim = ndx.dimension(function(d) {
        return d.responsavel;
    });

    var respGroup = respDim.group();

    //setor   
    var setorDim = ndx.dimension(function(d) {
        return d.coordenacao;
    });

    var setorGroup = setorDim.group();

    //mes
    var mesDim = ndx.dimension(function(d) {
        return d.data.getMonth();
    });

    var mesGroup = mesDim.group();


    //grid                           
    var tableDim = ndx.dimension(function(d) {
        return d;
    });

    var tableGroup = tableDim.group();

    charts = [
        mesChart
            .dimension(mesDim)
            .group(mesGroup)
            .width(500)
            .elasticY(true)
            .x(d3.scaleLinear().domain([0, 12]))
            .xAxis().tickFormat(function(e) {
               return labels[e];
		    }),

		semanaChart
		  .width(180)
		  .height(180)
		  .margins({top: 20, left: 10, right: 10, bottom: 20})
		  .group(semanaGroup)
		  .dimension(semanaDim)
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
		
		pecasChart
		   .height(300)
		   .dimension(pecasDim)
		   .group(pecasGroup)
		   .elasticX(true),
		
		respChart
		  .height(200)
		  .dimension(respDim)
		  .group(respGroup)
		  .elasticX(true),
		  
		setorChart
		  .height(800)
		  .dimension(setorDim)
		  .group(setorGroup)
		  .elasticX(true)
    ]

    window.filter = function(filters) {
	   filters.forEach((d, i) => { 
		   charts[i].filter(d); 
	   });
	   dc.renderAll();
	};

    var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function(chart) { 
          d3.brush(renderAll)//.end(renderAll); 
      });

    var dataTable = dc.dataTable('.dc-data-table')
                      .dimension(tableDim)
                      .columns([ 
                                {
                                label: "Nup",
                                format: function(e) {
                                    return '<a target="_blank" href="' + e.link + '">' + e.nup + '</a>';
                                }},
                                "peca", "coordenacao",{
                                label: "data",
                                format: function(e) {
                                    return e.data.toLocaleDateString();
                                }},
                       ]).sortBy(function(d) {
                            return d.data;
                       })

    //count
    var count = dc.dataCount("#dataCount");
    count.dimension(ndx).group(all);

    dc.renderAll();
});


function convert(str){

    //console.log("setor: ", str)

    if(!str) return ''; 

    str = str.replace("COORDENA&Ccedil;&Atilde;O", "COORDENAÇÃO");
    str = str.replace("LICITA&Ccedil;&Atilde;O", "LICITAÇÃO");
    str = str.replace("CONV&Ecirc;NIOS", "CONVÊNIOS");
    str = str.replace("POL&Iacute;TICAS", "POLÍTICAS");
    str = str.replace("JUR&Iacute;DICA", "JURÍDICA");

    return str;
}


function getCoordenacao(resumo){
    if(!resumo.highlights) return '';
    var res = resumo.highlights.split("\n\n");
    for(let i=0; i < res.length; i++){
        if(res[i].endsWith("MC")){
            return convert(res[i]);
        }
    }

    return 'PROTOCOLO';
}


