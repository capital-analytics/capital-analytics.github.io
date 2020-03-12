var dictionary = [];

async function loadData(){
   const dataset = tf.data.csv('data/training_2.csv', {
       //hasHeader: true,
       delimiter: ';',
       columnNames:['indicacao', 'produto'],
       /** columnConfigs: {
         produto: {
           isLabel: true
         }
       }**/
    })

    var produtos = [];
    await dataset.forEachAsync(e => produtos.push(e));
    return produtos;

}

async function run(){
   
         const data = await loadData();
         const dados  = data.map(m => m.indicacao);

         dictionary = buildDictionary(dados);

         const model = createModel();  
         tfvis.show.modelSummary({name: 'Model Summary'}, model);  

        // Convert the data to a form we can use for training.
        const tensorData = convertToTensor(data);
        const {inputs, labels} = tensorData;

        // Train the model  
        await trainModel(model, inputs, labels);
        console.log('Done Training');
  
 
}


function convertToTensor(data) {
  // Wrapping these calculations in a tidy will dispose any 
  // intermediate tensors.
  
  return tf.tidy(() => {
    // Step 1. Shuffle the data    
    tf.util.shuffle(data);

    // Step 2. Convert data to Tensor
    const inputs = data.map(m => m.indicacao)
    const labels = data.map(m => m.produto);

    const outputs = Object.keys(labels).map(m => {
        return Number(m)/labels.length-1;
    })

    const inputTensor = tf.tensor2d(inputs.map(normalize), [inputs.length, 4]);
    const labelTensor = tf.tensor2d(outputs, [outputs.length, 1]);

    //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();  
    const labelMax = labelTensor.max();
    const labelMin = labelTensor.min();

    return {
      inputs: inputTensor,
      labels: labelTensor
      /** Return the min/max bounds so we can use them later.
      inputMax,
      inputMin,
      labelMax,
      labelMin, **/
    }
  });  
}


function createModel() {
      // Create a sequential model
      const model = tf.sequential(); 

      // Add a single hidden layer
      model.add(tf.layers.dense({inputShape: [4], activation:'sigmoid', units: 4, useBias: true}));

      // Add an output layer
      model.add(tf.layers.dense({units: 1, activation:'softmax', useBias: true}));

      return model;
}

document.addEventListener('DOMContentLoaded', run);

async function trainModel(model, inputs, labels) {
  // Prepare the model for training.  
  model.compile({
    optimizer: tf.train.adam(),//'sgd',
    loss:      'meanSquaredError',//tf.losses.meanSquaredError,
    metrics:  ['mse'],
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

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function normalize(data){
    var norm = data.split(' ').map(m => round(dictionary.indexOf(slugify(m)) / dictionary.length, 3)) 
    while(norm.length < 4) { norm.push(0.01) }
    return norm.splice(0, 4);
    //return dictionary.indexOf(data) / dictionary.length;
}

function buildDictionary(data){
    const tokenizeArray = data.map(m => {
        return m.split(' ');
    })

    const flattenedArray = [].concat.apply([], tokenizeArray).map(m => slugify(m));
    return Array.from(new Set(flattenedArray));
}


function round(n, c){
   return Number(Number(n).toFixed(c));
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




