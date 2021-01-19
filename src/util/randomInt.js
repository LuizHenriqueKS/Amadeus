function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  const rand = Math.round(Math.random() * max * 1000);
  const diff = max - min;
  return (rand % diff) + min;
}

module.exports = randomInt;
