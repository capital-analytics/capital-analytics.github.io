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
                  temp_max:          Number(d.temp_max),
                  temp_min:          Number(d.temp_min),
                  umid_max:          Number(d.umid_max),
                  umid_min:          Number(d.umid_min),
                  orv_max:           Number(d.pto_orvalho_max),
                  orv_min:           Number(d.pto_orvalho_min),
                  pres_max:          Number(d.pressao_max),
                  pres_min:          Number(d.pressao_min),
                  vento_vel:         Number(d.vento_vel),
                  vento_dir:         Number(d.vento_direcao),
                  precipitacao:      Number(d.precipitacao)
            })).filter(f => {
                return !isNaN(f.temp_max)
            })

            data = dados;
        })

        return data;
}


async function run() {
    // Load and plot the original input data that we are going to train on.
    await loadData().then(data => {

        

        /**  const model = tf.sequential();
        model.add(tf.layers.dense({units: 1, inputShape: [1]})); **/



        const model = loadModel();  
        tfvis.show.modelSummary({name: 'Model Summary'}, model);

        convertToTensor(data);

       /** model.compile({
            loss: 'meanSquaredError',
            optimizer: 'sgd'
        })

        const xs = tf.tensor2d([1,-1,3,5,8,9,7,10], [8,1]);
        const ys = tf.tensor2d([10,-11,30,50,80,90,70,100], [8,1]);


        model.fit(xs, ys, {epochs: 500});

        let predict = model.predict(tf.tensor2d([35], [1, 1])); **/

        //d3.select('#tensor').append('div').text(predict);
    });
}


async function trainModel(model, inputs, labels) {
  // Prepare the model for training.  
  model.compile({
    optimizer: 'sgd',
    loss: 'meanSquaredError',//tf.losses.meanSquaredError,
    metrics: ['mse'],
  });
  
  const batchSize = 32;
  const epochs = 250;
  
  return await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle: true,
    callbacks: tfvis.show.fitCallbacks(
      { name: 'Training Performance' },
      ['loss', 'mse'], 
      { height: 200, callbacks: ['onEpochEnd'] }
    )
  });
}


function convertToTensor(data) {
  // Wrapping these calculations in a tidy will dispose any 
  // intermediate tensors.
  return tf.tidy(() => {
    // Step 1. Shuffle the data    
    tf.util.shuffle(data);

    // Step 2. Convert data to Tensor
    const inputs = data.map(d => d.horsepower)
    const labels = data.map(d => d.mpg);

    const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();  
    const labelMax = labelTensor.max();
    const labelMin = labelTensor.min();

    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

    return {
      inputs: normalizedInputs,
      labels: normalizedLabels,
      // Return the min/max bounds so we can use them later.
      inputMax,
      inputMin,
      labelMax,
      labelMin,
    }
  });  
}


function loadModel(){
      const model = tf.sequential(); 
  
      // Add a single hidden layer
      model.add(tf.layers.dense({inputShape: [1], units:5, useBias: true}));

      // Add an output layer
      model.add(tf.layers.dense({units: 1, useBias: true}));

      return model;
}

document.addEventListener('DOMContentLoaded', run);
