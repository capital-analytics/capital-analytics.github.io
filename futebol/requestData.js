//https://medium.com/@oieduardorabelo/javascript-armadilhas-do-asyn-await-em-loops-1cdad44db7f0
async function getDataML(category, len) {
    var url = 'https://api.gcn.globoesporte.globo.com/'
    var urls = new Map();
    var dados = [];

    urls.set('gol marcado', 'api/estatisticas/1/tipo-scout/15/atletas?page=1');

    //urls.forEach((k, v) => {
    var urlsList = Array.from(urls);

    for(const u of urls){    
       var x = await fetch(url.concat(u[1]));
       var y = await x.json().then(data => {
            for (let o of data.scouts){
                o.tipo = u[0];
                dados.push(o)
            }
        });
    }    
    //})

    console.log(dados);
    
    return dados
}



//You can then use .group(fakeGroup) to properly chart your data.
function getTops(source_group) {
    return {
        all: function () {
            return source_group.top(10);
        }
    };
}
