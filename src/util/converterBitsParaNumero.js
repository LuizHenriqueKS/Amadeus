function converterBitsParaNumero(bits) {
  return parseInt(bits.map(v => Math.round(v)).reduce((a, b) => `${a}${b}`), 2);
}

module.exports = converterBitsParaNumero;
