async function run() {
   // We want to predict the column "medv", which represents a median value of
   // a home (in $1000s), so we mark it as a label.
     const bsb = tf.data.csv('data/brasilia.csv');
     const am  = tf.data.csv('data/aguasEmendadas.csv');

     const data = tf.data.zip([bsb, am]);

	 const a = data.map(m => m[0]);
	 const b = data.map(m => m[1]);
	
	 const c = a.concatenate(b);

	 await c.forEach(e => console.log(e)); 
	 
	 /** 
     await dados.forEach(e => 
        console.log(JSON.stringify(e))
     ); **/
     


    /**

   // Number of features is the number of column names minus one for the label
   // column.
   const numOfFeatures = (await csvDataset.columnNames()).length - 1;

   // Prepare the Dataset for training.
   const flattenedDataset = csvDataset.map((
        [temp_inst, temp_max]) =>
       // Convert rows from object form (keyed by column name) to array form.
       [Object.values(temp_inst), Object.values(temp_max)]).batch(10);

   // Define the model.
   const model = tf.sequential();
   model.add(tf.layers.dense({
     inputShape: [numOfFeatures],
     units: 1
   }));
   model.compile({
     optimizer: tf.train.sgd(0.000001),
     loss: 'meanSquaredError'
   });

   // Fit the model using the prepared Dataset
   return model.fitDataset(flattenedDataset, {
     epochs: 10,
     callbacks: {
       onEpochEnd: async (epoch, logs) => {
         console.log(epoch + ':' + logs.loss);
       }
     }
   }); **/
}


