const randomInt = require('./randomInt');

function random(values) {
  if (values && values.length > 1) {
    const index = randomInt(0, values.length);
    return values[index];
  } else {
    return undefined;
  }
};

module.exports = random;
