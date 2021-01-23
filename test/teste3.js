const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

async function main() {
  // Define a model for linear regression.
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 100, inputShape: [1] }));
  model.add(tf.layers.dense({ units: 100, inputShape: [100] }));
  model.add(tf.layers.dense({ units: 100, inputShape: [100] }));
  model.add(tf.layers.dense({ units: 100, inputShape: [100] }));
  model.add(tf.layers.dense({ units: 1, inputShape: [100] }));

  // Prepare the model for training: Specify the loss and the optimizer.
  //  model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
  model.compile({ loss: 'meanSquaredError', optimizer: tf.train.rmsprop(0.001) });

  // Generate some synthetic data for training.
  const xs = tf.tensor1d([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const ys = tf.tensor1d([1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);

  // Train the model using the data.
  const epochs = 100000;
  // let lastLoss = 0;

  for (let i = 0; i < epochs; i++) {
    const train = await model.fit(xs, ys);
    const loss = train.history.loss[0];
    console.log('Loss:', loss);
    if (loss === 0) break;
    // if (lastLoss === loss) break;
    // lastLoss = loss;
  }

  // Test the model
  const result = model.predict(tf.tensor1d([5, 6, 7, 8, 9, 10])).arraySync();
  console.log('Results:', result.map(v => Math.round(v)));
}

main().then();
