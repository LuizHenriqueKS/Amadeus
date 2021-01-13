const fs = require('fs');
const ArquivoNaoEncontrado = require('../exception/ArquivoNaoEncontradoException');

module.exports = function lerArquivoJson(caminhoArquivo) {
  if (!fs.existsSync(caminhoArquivo)) {
    throw new ArquivoNaoEncontrado(caminhoArquivo);
  }
  const conteudoArquivo = fs.readFileSync(caminhoArquivo);
  return JSON.parse(conteudoArquivo.toString());
};
