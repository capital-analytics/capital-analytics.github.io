const IRIS_NUM_CLASSES = 27;

async function loadData() {
    
        data = [];
        //codigo_estacao,data,hora,temp_inst,temp_max,temp_min,umid_inst,umid_max,
        //umid_min,pto_orvalho_inst,
        //pto_orvalho_max,pto_orvalho_min,pressao,pressao_max,pressao_min,vento_vel,vento_direcao, 
        //vento_rajada,radiacao,precipitacao
        await Promise.all([
            d3.csv("data/brasilia.csv"),
            //d3.csv("data/aguasEmendadas.csv")
        ]).then(function(allData) {
           
            allData = d3.merge(allData);

            const dados = allData.filter(f => {
                return !isNaN(f.temp_max)
            })

            data = dados;
        })

       data = data.map(d => [
            Number(d.temp_max),
            Number(d.temp_min),
            Number(d.umid_max),
            Number(d.umid_min),
            Number(d.pto_orvalho_max),
            Number(d.pto_orvalho_min),
            Number(d.pressao_max),
            Number(d.pressao_min), 
            Number(d.precipitacao),
       ]);

       return data.slice(1000, 1150);
}


async function run() {

        const model = loadModel();  
        tfvis.show.modelSummary({name: 'Modelo'}, model);
   
        const data = await loadData();

        const [xTrain,yTrain,xTest,yTest] = getIrisData(data, .8);

        await trainModel(model, xTrain, yTrain, xTest, yTest);

 
        //alert(predict);
        //const predictWithArgMax = model.predict(input).argMax(-1).dataSync();
        //console.log(getProductType(data, predictWithArgMax));

        const xData = xTest.dataSync();
        const yTrue = yTest.argMax(-1).dataSync();

        const predictions = await model.predict(xTest);
        const yPred = predictions.argMax(-1).dataSync();

        var correct, wrong = 0;

        for (let i = 0; i < yTrue.length; i++) {
            if (yTrue[i] == yPred[i]) {
                correct++;
            } else {
                wrong++;
            }
        }

        console.log('Taxa de erro de previsão: ', wrong / yTrue.length);    
}

async function trainModel(model, xTrain, yTrain, xTest, yTest) {
    // Prepare the model for training.  
     model.compile({
        optimizer: tf.train.adam(.05),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    })

    const batchSize = 32;
    const epochs = 50;

    return await model.fit(xTrain, yTrain,
        {
            validationData:[xTest, yTest], 
            batchSize,
            epochs,
            shuffle:true,
            callbacks:tfvis.show.fitCallbacks({
                name:'Training Performance'},
                ['loss','mse'],
                {
                    height:200,
                    callbacks:['onEpochEnd']
                })
        });
}

function getIrisData(data, testSplit) {
  return tf.tidy(() => {

    const dataByClass = [];
    const targetsByClass = [];

    const categoria = data.map(m => m[data[0].length-1]);
    const cat = new Set(categoria.map(Math.round));

    const ys = Array.from(cat);
    
    for (let i = 0; i < ys.length; ++i) {
      dataByClass.push([]);
      targetsByClass.push([]);
    }

    for (const example of data) {
      const target = ys.indexOf(Math.round(example[example.length - 1]));
      const data   = example.slice(0, example.length - 1);

      dataByClass[target].push(data);
      targetsByClass[target].push(target);
    }

    const xTrains = [];
    const yTrains = [];
    const xTests  = [];
    const yTests  = [];

    for (let i = 0; i < ys.length; ++i) {
      const [xTrain, yTrain, xTest, yTest] = convertToTensors(dataByClass[i], targetsByClass[i], testSplit);

          xTrains.push(xTrain);
          yTrains.push(yTrain);
          xTests.push(xTest);
          yTests.push(yTest);
    }

    const concatAxis = 0;

    return [
      tf.concat(xTrains, concatAxis), tf.concat(yTrains, concatAxis),
      tf.concat(xTests, concatAxis), tf.concat(yTests, concatAxis)
    ];
  });
}


function convertToTensors(data, targets, testSplit) {

  const numExamples = data.length;

  if (numExamples !== targets.length) {
    throw new Error('data and split have different numbers of examples');
  }

  // Randomly shuffle `data` and `targets`.
  const indices = [];

  for (let i = 0; i < numExamples; ++i) {
    indices.push(i);
  }

  tf.util.shuffle(indices);

  const shuffledData = [];
  const shuffledTargets = [];

  for (let i = 0; i < numExamples; ++i) {
    shuffledData.push(data[indices[i]]);
    shuffledTargets.push(targets[indices[i]]);
  }

  // Split the data into a training set and a tet set, based on `testSplit`.
  const numTestExamples = Math.round(numExamples * testSplit);
  const numTrainExamples = numExamples - numTestExamples;

  const xDims = shuffledData[0].length;

  // Create a 2D `tf.Tensor` to hold the feature data.
  const xs = tf.tensor2d(shuffledData, [numExamples, xDims]);

  // Create a 1D `tf.Tensor` to hold the labels, and convert the number label
  // from the set {0, 1, 2} into one-hot encoding (.e.g., 0 --> [1, 0, 0]).
  const ys = tf.oneHot(tf.tensor1d(shuffledTargets).toInt(), IRIS_NUM_CLASSES);

  // Split the data into training and test sets, using `slice`.
  const xTrain = xs.slice([0, 0], [numTrainExamples, xDims]);
  const xTest  = xs.slice([numTrainExamples, 0], [numTestExamples, xDims]);
  
  const yTrain = ys.slice([0, 0], [numTrainExamples, IRIS_NUM_CLASSES]);
  const yTest  = ys.slice([0, 0], [numTestExamples, IRIS_NUM_CLASSES]);
  return [xTrain, yTrain, xTest, yTest];
}


function loadModel(){
      const model = tf.sequential(); 

      model.add(tf.layers.dense({
          units: 16,
          activation: 'sigmoid',
          inputShape: [8]
      }));

      model.add(tf.layers.dense({
          units: 27,
          activation: 'softmax'
      }));

      return model;
}








document.addEventListener('DOMContentLoaded', run);
