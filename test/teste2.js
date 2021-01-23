const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

async function main() {
  // Define a model for linear regression.
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [2] }));

  // Prepare the model for training: Specify the loss and the optimizer.
  model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

  // Generate some synthetic data for training.
  const xs = tf.tensor2d([[1, 1], [1, 2], [2, 1], [2, 2], [2, 3], [3, 2]]);
  const ys = tf.tensor1d([2, 3, 3, 4, 5, 5]);

  xs.print();

  // Train the model using the data.
  const epochs = 10000;
  let lastLoss = 0;

  for (let i = 0; i < epochs; i++) {
    const train = await model.fit(xs, ys);
    const loss = train.history.loss[0];
    console.log('Loss:', loss);
    if (loss === 0) break;
    if (lastLoss === loss) break;
    lastLoss = loss;
  }

  // Test the model
  const result = model.predict(tf.tensor2d([[3, 4], [5, 5], [3, 1]])).arraySync();
  console.log('Results:', result.map(v => Math.round(v)));
}

main().then();
