async function loadData(){
     const bsb = tf.data.csv('data/brasilia.csv');
     const am  = tf.data.csv('data/aguasEmendadas.csv');

     const data = tf.data.zip([bsb, am]);

	 const a = data.map(m => m[0]);
	 const b = data.map(m => m[1]);
	
	 const dados = a.concatenate(b);
      
     var dataSet = []; 

     await dados.forEachAsync(e =>
        //console.log(e.precipitacao)
       dataSet.push(e)
     );

     return dataSet.splice(0, 1000).filter(f => !isNaN(f.temp_max));
}


function createModel() {
  // Create a sequential model
  const model = tf.sequential(); 
  
  // Add a single input layer
  model.add(tf.layers.dense({inputShape:[8], units: 10, useBias: true}));
  
  // Add an output layer
  model.add(tf.layers.dense({units: 20, useBias: true}));

  return model;
}


async function run(){
    const data = await loadData();

    // Create the model
    const model = createModel();  
    tfvis.show.modelSummary({name: 'Model Summary'}, model);

    // Convert the data to a form we can use for training.
    const tensorData = convertToTensor(data);
    const {inputs, labels} = tensorData;

    // Train the model  
    await trainModel(model, inputs, labels);
    console.log('Done Training');
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

run();