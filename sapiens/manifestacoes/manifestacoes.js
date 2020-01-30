var labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const dados = d3.json("data/response.json", d=>({
    registros: d,
}));

var grid = [];


/**
var coordenacoes = [
    {nome: 'GUSTAVO NABUCO MACHADO',            setor: 'GABINETE - MC'},
    {nome: 'GERALDINE LEMOS TORRES',            setor: 'GABINETE - MC'},
    {nome: 'KARINE BERBIGIER RIBAS',            setor: 'GABINETE - MC'},
    {nome: 'IVAN SANTOS NUNES',                 setor: 'GABINETE - MC'},
    {nome: 'ANDRÉ FRAGA FERREIRA',              setor: 'GABINETE - MC'},
    {nome: 'MARCELA ALMEIDA MARTINS ARRUDA',    setor: 'GABINETE - MC'},
    {nome: 'VANESSA MAZALI',                    setor: 'GABINETE - MC'},
    {nome: 'SIBELE REGINA LUZ GRECCO',          setor: 'GABINETE - MC'},
    {nome: 'LARISSA FERNANDES NOGUEIRA DA GAMA',setor: 'GABINETE - MC'},
    {nome: 'VANESSA MAZALI',                    setor: 'GABINETE - MC'},
    {nome: 'SIBELE REGINA LUZ GRECCO',          setor: 'GABINETE - MC'},
    {nome: 'LARISSA FERNANDES NOGUEIRA DA GAMA',setor: 'GABINETE - MC'},
    {nome: 'LESLEI LESTER DOS ANJOS MAGALHÃES', setor: 'GABINETE - MC'},

    {nome: 'WILLIAM ANDERSON ALVES OLIVINDO',   setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS SOCIAIS - MC'},
    {nome: 'IVANA PINHEIRO COELHO NOGUEIRA',    setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS SOCIAIS - MC'},
    {nome: 'HELANE MEDEIROS ALMEIDA BARROS',    setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS SOCIAIS - MC'},
    {nome: 'RICARDO CASSIANO DE SOUZA ROSA',    setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS SOCIAIS - MC'},
    {nome: 'DANIEL DEMONTE MOREIRA',            setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS SOCIAIS - MC'},

    {nome: 'GUSTAVO ALMEIDA DIAS',                  setor: 'COORDENAÇÃO-GERAL DE CONVÊNIOS E PARCERIAS - MC'},
    {nome: 'DANIELA GUIMARÃES GOULART',             setor: 'COORDENAÇÃO-GERAL DE CONVÊNIOS E PARCERIAS - MC'},
    {nome: 'JOSÉ SOLINO NETO',                      setor: 'COORDENAÇÃO-GERAL DE CONVÊNIOS E PARCERIAS - MC'},
    {nome: 'ALESSANDRO RODRIGUES GOMES DA SILVA',   setor: 'COORDENAÇÃO-GERAL DE CONVÊNIOS E PARCERIAS - MC'},
    {nome: 'JOÃO JOSÉ BERREDO DA SILVA FILHO',      setor: 'COORDENAÇÃO-GERAL DE CONVÊNIOS E PARCERIAS - MC'},
    {nome: 'MARCELA ALMEIDA MARTINS ARRUDA',        setor: 'COORDENAÇÃO-GERAL DE CONVÊNIOS E PARCERIAS - MC'},
    {nome: 'LESLEI LESTER DOS ANJOS MAGALHÃES',     setor: 'COORDENAÇÃO-GERAL DE CONVÊNIOS E PARCERIAS - MC'},

    {nome: 'LIANA ANTERO DE MELO',                     setor: 'COORDENAÇÃO-GERAL DE CONTRATOS, LICITAÇÃO E PESSOAL - MC'},
    {nome: 'CAROLINE MARINHO BOAVENTURA SANTOS',       setor: 'COORDENAÇÃO-GERAL DE CONTRATOS, LICITAÇÃO E PESSOAL - MC'},
    {nome: 'JOSÉ NILSON CARNEIRO ALBUQUERQUE FILHO',   setor: 'COORDENAÇÃO-GERAL DE CONTRATOS, LICITAÇÃO E PESSOAL - MC'},
    {nome: 'JULIO CÉSAR OBA',                          setor: 'COORDENAÇÃO-GERAL DE CONTRATOS, LICITAÇÃO E PESSOAL - MC'},
    {nome: 'LESLEI LESTER DOS ANJOS MAGALHÃES',        setor: 'COORDENAÇÃO-GERAL DE CONTRATOS, LICITAÇÃO E PESSOAL - MC'},
    {nome: 'MARCELA ALMEIDA MARTINS ARRUDA',           setor: 'COORDENAÇÃO-GERAL DE CONTRATOS, LICITAÇÃO E PESSOAL - MC'},

    {nome: 'EDUARDO MAGALHÃES TEIXEIRA',               setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS CULTURAIS - MC'},
    {nome: 'MARIA IZABEL DE CASTRO GAROTTI',           setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS CULTURAIS - MC'},
    {nome: 'DANIELLE JANDIROBA TELLEZ',                setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS CULTURAIS - MC'},
    {nome: 'RODRIGO PICANCO FACCI',                    setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS CULTURAIS - MC'},
    {nome: 'IVAN SANTOS NUNES',                        setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS CULTURAIS - MC'},

    {nome: 'SIBELE REGINA LUZ GRECCO',                 setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS ESPORTIVOS - MC'},
    {nome: 'RENATA RAPOLD MELLO MATOS',                setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS ESPORTIVOS - MC'},
    {nome: 'KELLY REINA DE CARVALHO',                  setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS ESPORTIVOS - MC'},
    {nome: 'MICHELE GOEBEL PILLON',                    setor: 'COORDENAÇÃO-GERAL DE ASSUNTOS ESPORTIVOS - MC'}
]; **/

dados.then(data => {
    data.forEach((d,i)=>{
        d.forEach(f => {
            f.result.records.forEach(r=>{
                grid.push(r);
            })
        })
    })

    var lista = grid.map(x=>{
        return ({
            "nome": x.redator,
            "data": new Date(x.criadoEm.date),
            "resumo": (x.componentesDigitais) ? x.componentesDigitais[0].highlights : 'n/a',
            "criacao": x.criadoPor.email,
            "peca": x.tipoDocumento.nome,
            "arquivoId": x.componentesDigitais[0].id,
            "arquivo": x.componentesDigitais[0].fileName,
            "coordenacao": getCoordenacao(x.componentesDigitais[0]),
            "juntadas": x.juntadas.length, 
            //"setor": (x.juntadas[0].volume.pasta.setor) ? x.juntadas[0].volume.pasta.setor.unidade.sigla : 'outros',
        });
    }).filter(e => {
        return e.nome !== undefined;
    });

    lista = lista.filter(e => {
        return  e.coordenacao.toString().endsWith("-MC") || e.coordenacao.toString().endsWith("- MC")
    });

    var ndx = crossfilter(lista);
    var all = ndx.groupAll();

    //mesDim
    var mesDim = ndx.dimension(function(d) {
        return d.data.getMonth();
    });

    var mesGroup = mesDim.group();

    var mesChart = dc.barChart("#mesChart")
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
                       .height(420)
                       .dimension(pecasDim)
                       .group(pecasGroup)
                       .elasticX(true)

    //resp   
    var respDim = ndx.dimension(function(d) {
        return d.nome;
    });

    var respGroup = respDim.group();

    var respChart = dc.rowChart("#respChart")
                      .height(2200)
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
                      .columns(["nome", "peca", "coordenacao",{
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


function getCoordenacao(resumo){
    if(!resumo.highlights) return '';
    var res = resumo.highlights.split("\n\n");
    for(let i=0; i<res.length; i++){
        if(res[i].endsWith("MC") ){
            return convert(res[i]);
        }
    }

    return "n/a";
}

/**
function getCoordenacao(nome){
    return coordenacoes.filter(f => {
        return f.nome == nome
    }).map(m => {
        return m.setor;
    })
}**/


