const preencherComZerosNoInicio = require('./preencherComZerosNoInicio');

function converterNumeroParaBits(numero, quantidadeDeBits) {
  const bits = numero
    .toString(2)
    .split('')
    .map(v => parseInt(v));
  preencherComZerosNoInicio(bits, quantidadeDeBits - bits.length);
  return bits;
}

module.exports = converterNumeroParaBits;
