//https://medium.com/@oieduardorabelo/javascript-armadilhas-do-asyn-await-em-loops-1cdad44db7f0
async function getDataML(len) {
    var ofsset = 0;
    var urls = [];

    while (ofsset <= len) {
        if (ofsset % 50 == 0) {
            urls.push('https://api.mercadolibre.com/sites/MLB/search?category=MLB194799&offset=' + ofsset);
        }
        ofsset++;
    }

    var data = [];
    for (const url of urls) {
        //await fetch(url).then(t=>{console.log(t)});
        await fetch(url).then(t=>{t.json().then(j=>{for (const o of j.results){data.push(o);}})});
    }

    return data

}
