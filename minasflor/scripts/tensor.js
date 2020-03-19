/**
 * Get the car data reduced to just the variables we are interested
 * and cleaned of missing data.
 */
async function getData() {
   /** const carsDataReq = await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json');
    const carsData = await carsDataReq.json();
    const cleaned = carsData.map(car=>({
        mpg: car.Miles_per_Gallon,
        horsepower: car.Horsepower,
    })).filter(car=>(car.mpg != null && car.horsepower != null));

    return cleaned; **/
    const dataset = tf.data.csv('data/training_2.csv', {
       delimiter: ';',
       columnNames:['indicacao', 'produto'],
    })

    var dados = [];
    await dataset.forEachAsync(e => dados.push(e));
    return dados;
}

var dictionary = [];

async function run() {
    // Load and plot the original input data that we are going to train on.
    const data = await getData();

    var indicacao = data.map(m => {
        return m.indicacao;
    })

     var produto = data.map(m => {
        return m.produto;
    })

    dictionary = buildDictionary(indicacao);

    const inputsN = indicacao.map(normalize);

    console.table(inputsN);


    const values = data.map(d=>({
        x: d.horsepower,
        y: d.mpg,
    }));

    tfvis.render.scatterplot({
        name: 'Horsepower v MPG'
    }, {
        values
    }, {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 300
    });

    return;


    // Create the model
    const model = createModel();  
    tfvis.show.modelSummary({name: 'Model Summary'}, model);

    // Convert the data to a form we can use for training.
    const tensorData = convertToTensor(data);
    const {inputs, labels} = tensorData;

    // Train the model  
    await trainModel(model, inputs, labels);
    console.log('Done Training');

    // original data
    testModel(model, data, tensorData);
}

function createModel() {
    // Create a sequential model
    const model = tf.sequential();

    // Add a single hidden layer
    model.add(tf.layers.dense({
        inputShape: [1],
        units: 1,
        useBias: true
    }));

    // Add an output layer
    model.add(tf.layers.dense({
        units: 1,
        useBias: true
    }));

    return model;
}

/**
 * Convert the input data to tensors that we can use for machine 
 * learning. We will also do the important best practices of _shuffling_
 * the data and _normalizing_ the data
 * MPG on the y-axis.
 */
function convertToTensor(data) {
    // Wrapping these calculations in a tidy will dispose any 
    // intermediate tensors.

    return tf.tidy(()=>{
        // Step 1. Shuffle the data    
        tf.util.shuffle(data);

        // Step 2. Convert data to Tensor
        const inputs = data.map(d=>d.horsepower)
        const labels = data.map(d=>d.mpg);

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
    }
    );
}

async function trainModel(model, inputs, labels) {
    // Prepare the model for training.  
    model.compile({
        optimizer: tf.train.adam(),
        loss: tf.losses.meanSquaredError,
        metrics: ['mse'],
    });

    const batchSize = 32;
    const epochs = 50;

    return await model.fit(inputs,labels,{batchSize,epochs,shuffle:true,callbacks:tfvis.show.fitCallbacks({name:'Training Performance'},['loss','mse'],{height:200,callbacks:['onEpochEnd']})});
}

function testModel(model, inputData, normalizationData) {
    const {inputMax, inputMin, labelMin, labelMax} = normalizationData;

    // Generate predictions for a uniform range of numbers between 0 and 1;
    // We un-normalize the data by doing the inverse of the min-max scaling 
    // that we did earlier.
    const [xs,preds] = tf.tidy(()=>{

        const xs = tf.linspace(0, 1, 100);
        const preds = model.predict(xs.reshape([100, 1]));

        const unNormXs = xs.mul(inputMax.sub(inputMin)).add(inputMin);

        const unNormPreds = preds.mul(labelMax.sub(labelMin)).add(labelMin);

        // Un-normalize the data
        return [unNormXs.dataSync(), unNormPreds.dataSync()];
    }
    );

    const predictedPoints = Array.from(xs).map((val,i)=>{
        return {
            x: val,
            y: preds[i]
        }
    }
    );

    const originalPoints = inputData.map(d=>({
        x: d.horsepower,
        y: d.mpg,
    }));

    tfvis.render.scatterplot({
        name: 'Model Predictions vs Original Data'
    }, {
        values: [originalPoints, predictedPoints],
        series: ['original', 'predicted']
    }, {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 300
    });
}

function buildDictionary(data){
    const tokenizeArray = data.map(m => {
        return m.split(' ');
    })

    const flattenedArray = [].concat.apply([], tokenizeArray).map(m => slugify(m));
    return Array.from(new Set(flattenedArray));
}

function slugify(str){
    var map = {
        '-' : ' ',
        '-' : '_',
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

function normalize(data){
    var norm = data.split(' ').filter(f => f.length > 1).map(m => dictionary.indexOf(slugify(m))); 
    while(norm.length < 4) { norm.push(99) }
    return norm.splice(0, 4);
    //return dictionary.indexOf(data) / dictionary.length;
}

document.addEventListener('DOMContentLoaded', run);
