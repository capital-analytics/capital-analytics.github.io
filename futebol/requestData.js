var rodadaChart    = dc.barChart("#rodadaChart");
var jogadorChart   = dc.rowChart('#jogadorChart');
var periodoChart   = dc.rowChart("#periodoChart");
var tipoChart      = dc.rowChart('#tipoChart');
var equipeChart    = dc.rowChart("#equipeChart");
var dataTable      = dc.dataTable('#grid');

//https://medium.com/@oieduardorabelo/javascript-armadilhas-do-asyn-await-em-loops-1cdad44db7f0
async function getData() {
    var url = 'https://api.gcn.globoesporte.globo.com/'
    var apis = new Map();
    var allUrls = [];
    var dataset = [];

    apis.set('gol marcado',             'api/estatisticas/1/tipo-scout/15/atletas');
    apis.set('gol sofrido',             'api/estatisticas/1/tipo-scout/17/atletas');

    apis.set('gol contra',              'api/estatisticas/1/tipo-scout/16/atletas');
    apis.set('gol de cabeca',           'api/estatisticas/1/tipo-scout/1-editorial/atletas');
    apis.set('gol de falta',            'api/estatisticas/1/tipo-scout/8/atletas');
    apis.set('gol de penalti',          'api/estatisticas/1/tipo-scout/9/atletas');
    apis.set('gol dentro da área',      'api/estatisticas/1/tipo-scout/24/atletas');
    apis.set('gol fora da área',        'api/estatisticas/1/tipo-scout/12/atletas');

    apis.set('finalização',             'api/estatisticas/1/tipo-scout/6-editorial/atletas');
    apis.set('finalização certa',       'api/estatisticas/1/tipo-scout/3-editorial/atletas');
    apis.set('finalização errada',      'api/estatisticas/1/tipo-scout/4-editorial/atletas');
    apis.set('finalização na trave',    'api/estatisticas/1/tipo-scout/13/atletas');
    apis.set('finalização para fora',   'api/estatisticas/1/tipo-scout/14/atletas');
    apis.set('penalti perdido',         'api/estatisticas/1/tipo-scout/5-editorial/atletas');

    apis.set('falta recebida',   'api/estatisticas/1/tipo-scout/7/atletas');
    apis.set('falta cometida',   'api/estatisticas/1/tipo-scout/6/atletas');
    apis.set('impedimento',      'api/estatisticas/1/tipo-scout/18/atletas');

    apis.set('cartão vermelho',  'api/estatisticas/1/tipo-scout/2/atletas');

    apis.set('defesa dificil',   'api/estatisticas/1/tipo-scout/4/atletas');
    apis.set('defesa de penalti','api/estatisticas/1/tipo-scout/3/atletas');
   
    apis.set('assistencia',      'api/estatisticas/1/tipo-scout/2-editorial/atletas');
    apis.set('passe errado',     'api/estatisticas/1/tipo-scout/19/atletas');
    apis.set('roubada de bola',  'api/estatisticas/1/tipo-scout/22/atletas');


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

    //exportFile(dataset, 'test.json');
    download(JSON.stringify(dataset), 'dataset.json', 'text/plain');
    //console.table(dataset);

    return dataset
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}


function execute(){
    d3.json('data/dataset.json').then(data=>{
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

        dataset = dataset.filter(f => {
            return f.equipe != null;
        })

        var ndx = crossfilter(dataset);
        var all = ndx.groupAll();

        //rodada
        var rodadaDim = ndx.dimension(d => {
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

        //periodo
        var periodoDim = ndx.dimension(d => {
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

        tipoChart.height(600)
                 .dimension(tipoDim)
                 .group(tipoGroup)
                 .elasticX(true)

        //equipe
        var equipeDim = ndx.dimension(d => {
            return d.equipe.nome_popular;
        });

        var equipeGroup = equipeDim.group();

        equipeChart.height(600)
                   .dimension(equipeDim)
                   .group(equipeGroup)
                   .elasticX(true)

        //jogador
        var jogadorDim = ndx.dimension(function(d) {
            return d.atleta.nome_popular;
        });

        var jogadorGroup = getTops(jogadorDim.group());

        jogadorChart.dimension(jogadorDim).height(600).group(jogadorGroup)// Assign colors to each value in the x scale domain
                    .label(function(d) {
                        return d.key;
                    }).title(function(d) {
                        return d.value;
                    }).elasticX(true).xAxis().ticks(4)

        //posicao
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

        //grid                           
        var tableDim = ndx.dimension(d => {
            return  d.atleta.nome_popular;
        });

        var tableGroup = tableDim.group(); 

        dc.textFilterWidget("#search").dimension(tableDim);

        var i = 0;
        dataTable.showSections(true)
          .dimension(tableDim).columns([{
                    label: "Atleta",
                    format: function(e){
                        return e.atleta.nome_popular;
                    }
                },
                {
                    label: "Posição",
                    format: function(e){
                        return e.atleta.posicao.macro_descricao;
                    }
                },
                {
                    label: "Time",
                    format: function(e){
                        return e.equipe.nome_popular;
                    }
                }
          ]).on('renderlet', function(c) {
            i = 0;
        });

        //count(*)      
        dc.dataCount("#dataCount").dimension(ndx).group(all); 

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
