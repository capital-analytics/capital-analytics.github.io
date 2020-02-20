function execute(){
     d3.dsv(';', 'data/training.csv').then(data => {

        var details = data.map(m => {
            return slugify(m.indicacao);
        })

        var t = new TFIDF();
            t.termFreq(details.join(' '));

        t.finish(details.length);
       
        t.sortByCount();

         var tokens = t.getKeys();

        var dicionario = [];
        tokens.forEach((f, i) => {
            dicionario.push({
                texto: f,
                freq: t.getCount(f)
            })
        })


        var d = dicionario.filter(f => f.freq == 1).filter(f => f.texto.length > 3)
        console.log(d);
    })
}

function slugify (str) {
    var map = {
        '-' : ' ',
        //'-' : '_',
        'a' : 'á|à|ã|â|À|Á|Ã|Â',
        'e' : 'é|è|ê|É|È|Ê',
        'i' : 'í|ì|î|Í|Ì|Î',
        'o' : 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
        'u' : 'ú|ù|û|ü|Ú|Ù|Û|Ü',
        'c' : 'ç|Ç',
        'n' : 'ñ|Ñ'
    };
    
    str = str.toLowerCase();
    
    for (var pattern in map) {
        str = str.replace(new RegExp(map[pattern], 'g'), pattern);
    };

    return str;
};


execute();