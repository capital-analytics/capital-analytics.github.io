var rodadaChart    = dc.barChart("#rodadaChart");
var jogadorChart   = dc.rowChart('#jogadorChart');
var periodoChart   = dc.rowChart("#periodoChart");
var tipoChart      = dc.rowChart('#tipoChart');
var respChart      = dc.rowChart("#respChart");
var setorChart     = dc.rowChart("#setorChart");
var dataTable      = dc.dataTable('.dc-data-table');

//https://medium.com/@oieduardorabelo/javascript-armadilhas-do-asyn-await-em-loops-1cdad44db7f0
async function getData() {
    var url = 'https://api.gcn.globoesporte.globo.com/'
    var apis = new Map();
    var allUrls = [];
    var dataset = [];

    apis.set('gol marcado', 'api/estatisticas/1/tipo-scout/15/atletas');
    //apis.set('gol sofrido', 'api/estatisticas/1/tipo-scout/17/atletas');

    //urls.forEach((k, v) => {
    var apisList = Array.from(apis);

    //requisicao da quantidade de paginas
    for(const u of apisList){    
       var x = await fetch(url.concat(u[1]));
       var y = await x.json().then(data => {
            for (let i=1; i <= data.paginator.paginas; i++){
                allUrls.push([u[0], u[1].concat(`?page=${i}`)]);
            }
        });
    }

    for(const u of allUrls){    
       var x = await fetch(url.concat(u[1]));
       var y = await x.json().then(data => {
            for (let o of data.scouts){
                o.tipo = u[0];
                dataset.push(o)
            }
        });
    }    

    //console.table(dataset);
    return dataset
}




function execute(){
    getData().then(data=>{

        var dataset = [];
        //normalizacao
        data.forEach(f => {
               f.scouts.forEach(e => {
                    e.tipo   = f.tipo;   
                    e.atleta = f.atleta;
                    e.equipe = f.equipe;   
                    dataset.push(e);    
               })
        });

        var ndx = crossfilter(dataset);
        var all = ndx.groupAll();

        //rodada
        var rodadaDim = ndx.dimension(function(d) {
            return d.rodada;
        });

        var rodadaGroup = rodadaDim.group();

        rodadaChart.dimension(rodadaDim)
            .width(500).group(rodadaGroup)
            .elasticY(true)
            .x(d3.scaleLinear().domain([1, 38]))
            .xAxis().tickFormat(e => {
               return e;
            })

        /** rodadaChart.height(1000)
                   .dimension(rodadaDim)
                   .group(rodadaGroup)
                   .elasticX(true)**/

        //periodo
        var periodoDim = ndx.dimension(function(d) {
            return d.periodo;
        });

        var periodoGroup = periodoDim.group();

        periodoChart.height(400)
                    .dimension(periodoDim)
                    .group(periodoGroup)
                    .elasticX(true)

        //momento

        //tipo
        var tipoDim = ndx.dimension(function(d) {
            return d.tipo;
        });

        var tipoGroup = tipoDim.group();

        tipoChart.height(400)
                 .dimension(tipoDim)
                 .group(tipoGroup)
                 .elasticX(true)

        //equipe

        //jogador
         var jogadorDim = ndx.dimension(function(d) {
            return d.atleta.nome_popular;
        });

        var jogadorGroup = getTops(jogadorDim.group());

        jogadorChart.dimension(jogadorDim).height(400).group(jogadorGroup)// Assign colors to each value in the x scale domain
                    .label(function(d) {
                        return d.key;
                    }).title(function(d) {
                        return d.value;
                    }).elasticX(true).xAxis().ticks(4)

        //posicao


        /**
        var cidadeGroup = cidadeDim.group();

        dc.rowChart("#usuarioChart").height(400).dimension(cidadeDim).group(cidadeGroup).elasticX(true)

        var top5Dim = ndx.dimension(function(d) {
            //return d.nome;
            let n = d.title.split(" ").filter(f=>f.length > 2);
            return n[0] + " " + n[1];

        });

        var top5Group = getTops(top5Dim.group());

        dc.rowChart('#top5Chart').dimension(top5Dim).height(400).group(top5Group)// Assign colors to each value in the x scale domain
        .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb']).label(function(d) {
            return d.key;
        }).title(function(d) {
            return d.value;
        }).elasticX(true).xAxis().ticks(4)

        //vendas
        var vendasDim = ndx.dimension(function(d) {
            return d.sold_quantity;
        });

        var vendasGroup = getTops(vendasDim.group());

        dc.rowChart('#vendasChart').dimension(vendasDim).height(400).group(vendasGroup)// Assign colors to each value in the x scale domain
        .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb']).label(function(d) {
            return d.key;
        }).title(function(d) {
            return d.value;
        }).elasticX(true).xAxis().ticks(4)

        //grid                           
        var tableDim = ndx.dimension(function(d) {
            return d.title;
        });

        var tableGroup = tableDim.group();

        dc.textFilterWidget("#search").dimension(tableDim);

        var i = 0;
        dc.dataTable('.dc-data-table').showSections(true).dimension(tableDim).columns(["id", {
            label: "Produto",
            format: function(e) {
                return '<a target="_blank" href="' + e.permalink + '">' + e.title + '</a>';
            }
        }, "price", "sold_quantity", {
            label: "Lucro",
            format: function(e) {
                return 'R$ ' + Number(e.price * e.sold_quantity).toFixed(2);
            }
        }, {
            label: "Frete Grátis",
            format: function(e) {
                return e.shipping.free_shipping ? 'sim' : 'não'
            }
        }]).sortBy(function(d) {
            return -d.sold_quantity;
        }).on('renderlet', function(c) {
            i = 0;
        });

        //count(*)      
        dc.dataCount("#dataCount").dimension(ndx).group(all); **/

        dc.renderAll();
    })
}


execute();





//You can then use .group(fakeGroup) to properly chart your data.
function getTops(source_group) {
    return {
        all: function () {
            return source_group.top(10);
        }
    };
}
