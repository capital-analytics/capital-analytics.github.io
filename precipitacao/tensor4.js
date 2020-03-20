const model = tf.sequential({
  layers: [tf.layers.dense({units: 1, inputShape: [10]})]
});
model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
const result = model.evaluate(
    tf.ones([8, 10]), tf.ones([8, 1]), {batchSize: 4});
result.print();