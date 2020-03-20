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

            const dados = allData.filter(f => {
                return !isNaN(f.temp_max)
            })

            data = dados;
        })

        return data;
}


async function run() {
   
        const data = await loadData();

        const model = loadModel();  
        tfvis.show.modelSummary({name: 'Model Summary'}, model);

        const treino = data.splice(0, 500); //apenas 200 registros
        
        const {inputs, labels} = convertToTensors(treino, 0.3);

        // Train the model  
        trainModel(model, inputs, labels);

       // testModel(model, data, tensorData);
        /**
        const test = data.splice(3000, 3100);
        test.forEach(f => {
            console.log(model.predict(tf.tensor2d(f, [8, 8])))
        }) **/
}

function loadModel(){
      const model = tf.sequential(); 
      // Add a single hidden layer
      model.add(tf.layers.dense({inputShape: [8], units:8, useBias: true}));
      // Add an output layer
      model.add(tf.layers.dense({units: 1, useBias: true}));

      return model;
}

function convertToTensors(data, testSplit) {

  const numExamples = data.length;
  // Wrapping these calculations in a tidy will dispose any 
  // intermediate tensors.
  return tf.tidy(() => {
    // Step 1. Shuffle the data    
    tf.util.shuffle(data);

    // Step 2. Convert data to Tensor
    const inputs = data.map(d => {
        return [
            Number(d.temp_max),
            Number(d.temp_min),
            Number(d.umid_max),
            Number(d.umid_min),
            Number(d.pto_orvalho_max),
            Number(d.pto_orvalho_min),
            Number(d.pressao_max),
            Number(d.pressao_min)
        ]
    })

    const labels = data.map(d => {
         return[ 
            Number(d.precipitacao)
         ]  
    });

    var classes = new Set(labels.map(m => m[0]));

    const dataByClass = [];
    const targetsByClass = [];

    for (let i = 0; i < classes.size; i++) {
        dataByClass.push([]);
        targetsByClass.push([]);
    }

    var pos = Array.from(classes);

    for (let i = 0; i < data.length; i++){
         let indice = pos.indexOf(labels[i][0]);

           dataByClass[indice].push(inputs[i]);
        targetsByClass[indice].push(labels[i]);
    }

    // Split the data into a training set and a tet set, based on `testSplit`.
    const numTestExamples = Math.round(numExamples * testSplit);
    const numTrainExamples = numExamples - numTestExamples;

    const xDims = dataByClass[0].length;

    // Create a 2D `tf.Tensor` to hold the feature data.
    const xs = tf.tensor2d(dataByClass);

    // Create a 1D `tf.Tensor` to hold the labels, and convert the number label
    // from the set {0, 1, 2} into one-hot encoding (.e.g., 0 --> [1, 0, 0]).
    const ys = tf.oneHot(tf.tensor1d(targetsByClass).toInt(), pos.length);

    // Split the data into training and test sets, using `slice`.
    const xTrain = xs.slice([0, 0], [numTrainExamples, xDims]);
    const xTest  = xs.slice([numTrainExamples, 0], [numTestExamples, xDims]);
    const yTrain = ys.slice([0, 0], [numTrainExamples, IRIS_NUM_CLASSES]);
    const yTest  = ys.slice([0, 0], [numTestExamples, IRIS_NUM_CLASSES]);

    return [xTrain, yTrain, xTest, yTest];
  });  
}


async function trainModel(model, inputs, labels) {
  // Prepare the model for training.  
  model.compile({
    optimizer: tf.train.adam(),//'sgd',
    loss:      'meanSquaredError',//tf.losses.meanSquaredError,
    metrics:  ['mse'],
  });
  
  const batchSize = 32;
  const epochs = 30;
  
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

function testModel(model, inputData, normalizationData) {
  const {inputMax, inputMin, labelMin, labelMax} = normalizationData;  
  
  // Generate predictions for a uniform range of numbers between 0 and 1;
  // We un-normalize the data by doing the inverse of the min-max scaling 
  // that we did earlier.
  const [xs, preds] = tf.tidy(() => {
    
    const xs = tf.linspace(0, 1, 100);      
    const preds = model.predict(xs.reshape([100, 1]));      
    
    const unNormXs = xs
      .mul(inputMax.sub(inputMin))
      .add(inputMin);
    
    const unNormPreds = preds
      .mul(labelMax.sub(labelMin))
      .add(labelMin);
    
    // Un-normalize the data
    return [unNormXs.dataSync(), unNormPreds.dataSync()];
  });
  
 
  const predictedPoints = Array.from(xs).map((val, i) => {
    return {x: val, y: preds[i]}
  });
  
  const originalPoints = inputData.map(d => ({
    x: d.horsepower, y: d.mpg,
  }));
  
  
  tfvis.render.scatterplot(
    {name: 'Model Predictions vs Original Data'}, 
    {values: [originalPoints, predictedPoints], series: ['original', 'predicted']}, 
    {
      xLabel: 'Horsepower',
      yLabel: 'MPG',
      height: 300
    }
  );
}



document.addEventListener('DOMContentLoaded', run);
