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
   
     loadData().then(data => {

        const model = tf.sequential();
        //tfvis.show.modelSummary({name: 'Model Summary'}, model);

        const treino = data.splice(0, 1000); //apenas 1000 registros

        const tensorData = convertToTensors(treino, 0.3); //30% para testes
        const [xTrain, yTrain, xTest, yTest] = tensorData;

        // Train the model  
        trainModel(model, xTrain, yTrain, xTest, yTest);

        testModel(model)

       // testModel(model, data, tensorData);
        /**
        const test = data.splice(3000, 3100);
        test.forEach(f => {
            console.log(model.predict(tf.tensor2d(f, [8, 8])))
        }) **/
        
    });
}


function testModel(model){
     let input = tf.tensor2d([10.2, 19.7, 87, 76, 18, 17.5, 800.7, 888.1], [1, 8])
     const prediction = model.predict(input);

     console.log(prediction.toString());
}

/** 
function loadModel(){
      const model = tf.sequential(); 
      // Add a single hidden layer
      model.add(tf.layers.dense(
        {inputShape: [8], units:8, useBias: true}
      ));
      // Add an output layer
      model.add(tf.layers.dense({units: 1, useBias: true}));

      return model;
} **/

function convertToTensors(data, testSplit) {

  const numExamples = data.length;
  // Wrapping these calculations in a tidy will dispose any 
  // intermediate tensors.
  return tf.tidy(() => {
    // Step 1. Shuffle the data    
   // tf.util.shuffle(data);

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

    var xDims = inputs[0].length;

    const xs = tf.tensor2d(inputs, [inputs.length, xDims]);
    const ys = tf.tensor2d(labels, [labels.length, 1]);
    //const ys = tf.oneHot(tf.tensor1d(labels).toInt(), numExamples);

    const numTestExamples  = Math.round(numExamples * testSplit);
    const numTrainExamples = (numExamples - numTestExamples);

    const xTrain = xs.slice([0, 0], [numTrainExamples, xDims]);
    const xTest  = xs.slice([numTrainExamples, 0], [numTestExamples, xDims]);

    const yTrain  = xs.slice([0, 0], [numTrainExamples, 1]);
    const yTest   = xs.slice([0, 0], [numTestExamples, 1]);

    return[xTrain, yTrain, xTest, yTest]
    //const labelTensor = tf.tensor2d(labels, [labels.length, 1]);


    /**
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
    } **/
  });  
}


async function trainModel(model, xTrain, yTrain, xTest, yTest) {

      const learningRate   = .01;
      const numberOfEpochs = 10;
      const batchSize = 32;


      // Add a single hidden layer
      model.add(tf.layers.dense({
          inputShape: [xTrain.shape[1]],//[8], 
          units: 10,//8, 
          activation: 'sigmoid',
          useBias: true
      }));
      // Add an output layer
      model.add(tf.layers.dense({
          units: 1, 
          activation: 'softmax',
          useBias: true
      }));

      model.compile({
        optimizer: tf.train.adam(),//'sgd',
        loss:      'meanSquaredError',//tf.losses.meanSquaredError,
        metrics:  ['mse'],
      });

      return await model.fit(xTrain, yTrain, {
        batchSize,
        numberOfEpochs,
        shuffle: true,
        callbacks: tfvis.show.fitCallbacks(
          { name: 'Training Performance' },
          ['loss', 'mse'], 
          { height: 200, callbacks: ['onEpochEnd'] }
        )
      });


      //return model;
}

function testModel2(model, inputData, normalizationData) {
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
