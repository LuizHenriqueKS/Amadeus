function converterNumeroParaBytes(numero, quantidadeBytes) {
  const bytes = [];
  for (let i = 0; i < quantidadeBytes; i++) {
    const byte = numero & 0xff;
    bytes.push(byte);
    numero = (numero - byte) / 256;
  }
  return bytes;
};

module.exports = converterNumeroParaBytes;
