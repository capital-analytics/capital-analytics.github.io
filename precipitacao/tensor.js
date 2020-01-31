async function loadData() {
    
        data = [];
        //codigo_estacao,data,hora,temp_inst,temp_max,temp_min,umid_inst,umid_max,
        //umid_min,pto_orvalho_inst,
        //pto_orvalho_max,pto_orvalho_min,pressao,pressao_max,pressao_min,vento_vel,vento_direcao, 
        //vento_rajada,radiacao,precipitacao
        await Promise.all([
            d3.csv("data/brasilia.csv"),
            d3.csv("data/aguasEmendadas.csv")
        ]).then(function(allData) {
           
            allData = d3.merge(allData);

            const dados = allData.map(d => ({
                  //date:              new Date(d.Date).getTime(),
                  estacao:           d.codigo_estacao,
                  temp_max:          d.temp_max,
                  temp_min:          d.temp_min,
                  umid_max:          d.umid_max,
                  umid_min:          d.umid_min,
                  orv_max:           d.pto_orvalho_max,
                  orv_min:           d.pto_orvalho_min,
                  pres_max:          d.pressao_max,
                  pres_min:          d.pressao_min,
                  vento_vel:         d.vento_vel,
                  vento_dir:         d.vento_direcao,
                  precipitacao:      d.precipitacao
            })).filter(f => {
                return f.temp_max !== "////"
            })

            dados.forEach(f => {
                data.push(f);
            })
        })

        return data;
}

async function run() {
    // Load and plot the original input data that we are going to train on.
    await loadData().then(data => {
        console.log(data.length);


        const model = tf.sequential();
        model.add(tf.layers.dense({units: 1, inputShape: [1]}));

        model.compile({
            loss: 'meanSquaredError',
            optimizer: 'sgd'
        })

        const xs = tf.tensor2d([1,-1,3,5,8,9,7,10], [8,1]);
        const ys = tf.tensor2d([10,-11,30,50,80,90,70,100], [8,1]);


        model.fit(xs, ys, {epochs: 500});

        let predict = model.predict(tf.tensor2d([35], [1, 1]));

        d3.select('#tensor').append('div').text(predict);
    });






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
