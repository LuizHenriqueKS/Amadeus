function converterTextoParaAscii(texto) {
  return texto
    .split('')
    .map(v => v.charCodeAt(0));
}

module.exports = converterTextoParaAscii;
