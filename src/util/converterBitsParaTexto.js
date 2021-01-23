function converterBitsParaTexto(bits) {
  return bits
    .map(b => Math.round(b))
    .reduce((a, b) => `${a}${b}`)
    .match(/.{1,16}/g)
    .map(b => converterBitsParaChar(b))
    .reduce((a, b) => `${a}${b}`);
}

function converterBitsParaChar(bits) {
  const char = String.fromCharCode(parseInt(bits, 2));
  return char;
}

module.exports = converterBitsParaTexto;
