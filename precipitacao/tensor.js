async function loadData() {
    //Estacao;Data;Hora;Precipitacao;TempMaxima;TempMinima;Insolacao;EvaporacaoPiche;TempCompMedia;UmidadeRelativaMedia;VelocidadeVentoMedia
    let cfg = {
        hasHeader: true,
        delimiter: ";"
    }
    
    const csvDataset = tf.data.csv('data/dados.csv', cfg);

  

    csvDataset.forEachAsync(e => {
       var filtro = csvDataset.filter(f => {
            return e.Data === f
        })

        e.precipitacao = filtro[1].Precipitacao;
       // e.tempMinima   = (filtro[1]) ? filtro[1].TempMinima : 0;
    })


    csvDataset.forEachAsync(d => {
        console.log(d)
    }) 

    const cleaned = csvDataset.map(m =>({
            insolacao:    m.Insolacao,
            temp:         m.TempCompMedia,
            precipitacao: m.Precipitacao
    })).filter(f => f.precipitacao == undefined);


    return cleaned;
}

async function run() {
    // Load and plot the original input data that we are going to train on.
    const data = await loadData();



    /**
    const values = data.map(d=>({
        x: d.insolacao,
        y: d.temp,
    }));

    tfvis.render.scatterplot({
        name: 'Horsepower v MPG'
    }, {
        values
    }, {
        xLabel: 'Horsepower',
        yLabel: 'MPG',

        height: 300
    });**/

    // More code will be added below **/
}

document.addEventListener('DOMContentLoaded', run);
