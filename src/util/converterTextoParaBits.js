function converterTextoParaBits(texto) {
  return texto
    .split('')
    .map(c => c.charCodeAt(0).toString(2))
    .map(bits => completarComZeros(bits))
    .flatMap(b => b.split(''))
    .map(b => parseInt(b));
}

function completarComZeros(bits) {
  while (bits.length < 16) {
    bits = '0' + bits;
  }
  return bits;
}

module.exports = converterTextoParaBits;
