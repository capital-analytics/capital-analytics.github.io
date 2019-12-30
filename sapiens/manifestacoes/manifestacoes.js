var labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const dados = d3.json("data/manifestacoes4.json", d=>({
    registros: d,
}));

var grid = [];

dados.then(data => {
    data.forEach((e,i)=>{
        if (e[i] !== undefined) {
            e[i][0].result.records.forEach(r=>{
                grid.push(r);
            })
        }
    })

    //console.log(grid);  

    var lista = grid.map(x=>{
        return ({
            "nome": x.redator,
            "data": new Date(x.criadoEm.date),
            "resumo": (x.componentesDigitais) ? x.componentesDigitais[0].highlights : 'n/a',
            "criacao": x.criadoPor.email,
            "peca": x.tipoDocumento.nome,
            "arquivoId": x.componentesDigitais[0].id,
            "arquivo": x.componentesDigitais[0].fileName,
            "coordenacao": getCoordenacao(x.componentesDigitais[0].highlights),
            "juntadas": x.juntadas.length, 
            "setor": (x.juntadas[0].volume.pasta.setor) ? x.juntadas[0].volume.pasta.setor.unidade.sigla : 'outros',
        });
    }).filter(e => {
        return e.nome !== undefined;
    });

    /** filtra apenas o ministerio
    lista = lista.filter(e => {
        return e.setor.endsWith("-MC") 
    }); **/

    lista = lista.filter(e => {
        return e.coordenacao.endsWith("MC") ||  e.coordenacao.endsWith("MINC")
    });

    var ndx = crossfilter(lista);
    var all = ndx.groupAll();

    //mesDim
    var mesDim = ndx.dimension(function(d) {
        return d.data.getMonth();
    });

    var mesGroup  = mesDim.group();

    var  mesChart = dc.barChart("#mesChart")
            .dimension(mesDim)
            .width(500).group(mesGroup)
            .elasticY(true)
            .x(d3.scaleLinear().domain([0, 12]))
            .xAxis().tickFormat(function(e) {
               return labels[e];
     })


     //dia da semana
     var semanaDim = ndx.dimension(function (d) {
        var day = d.data.getDay();
        var name = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        return day + '.' + name[day];
    });

     var semanaGroup  = semanaDim.group(); 
    
     var semanaChart  = dc.rowChart('#semanaChart')
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
                             .xAxis().ticks(4)


    //pecas
    var pecasDim = ndx.dimension(function(d) {
        return d.peca;
    });

    var pecasGroup = pecasDim.group();

    //dimensao de mj
    var pecasChart = dc.rowChart("#pecasChart")
                       .height(320)
                       .dimension(pecasDim)
                       .group(pecasGroup)
                       .elasticX(true)

    //resp   
    var respDim = ndx.dimension(function(d) {
        return d.nome;
    });

    var respGroup = respDim.group();

    var respChart = dc.rowChart("#respChart")
                      .height(1200)
                      .dimension(respDim)
                      .group(respGroup)
                      .elasticX(true)

    //setor   
    var setorDim = ndx.dimension(function(d) {
        return d.coordenacao;
    });

    var setorGroup = setorDim.group();

    var setorChart = dc.rowChart("#setorChart")
                       .height(1350)
                       .dimension(setorDim)
                       .group(setorGroup)
                       .elasticX(true)

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

    var dataTable = dc.dataTable('.dc-data-table')
                      .dimension(tableDim)
                      .columns(["nome", "peca","juntadas", "coordenacao",{
                                label: "Arquivo",
                                format: function(e) {
                                    return '<a target="_blank" href="https://sapiens.agu.gov.br/documento/' + e.arquivoId + '">' + e.arquivo + '</a>';
                                }},{
                                label: "data",
                                format: function(e) {
                                    return e.data.toLocaleDateString();
                                }}
                       ]).sortBy(function(d) {
                            return d.data;
                       })

    //count
    var count = dc.dataCount("#dataCount");
    count.dimension(ndx).group(all);

    dc.renderAll();
});


function convert(str){

    if(!str) return ''; 

    str = str.replace("COORDENA&Ccedil;&Atilde;O", "COORDENAÇÃO");
    str = str.replace("LICITA&Ccedil;&Atilde;O", "LICITAÇÃO");
    str = str.replace("CONV&Ecirc;NIOS", "CONVÊNIOS");
    str = str.replace("POL&Iacute;TICAS", "POLÍTICAS");
    str = str.replace("JUR&Iacute;DICA", "JURÍDICA");

    return str;
}


function getCoordenacao(x){

    if(x == undefined) return ("n/a");
    
    let coordenacao = x.split("\n\n");

    for(let i=0; i<=coordenacao.length; i++){
         if(coordenacao[i] != undefined){
            if(coordenacao[i].endsWith("MC") || coordenacao[i].endsWith("MINC") || coordenacao[i].endsWith("PROTOCOLO")){
                return convert(coordenacao[i]);
            }
         }
     }

     return 'n/a';
}