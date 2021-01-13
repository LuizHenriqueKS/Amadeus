const fs = require('fs');
const ArquivoNaoEncontradoException = require('../exception/ArquivoNaoEncontradoException');

module.exports = function lerArquivoJson(caminhoArquivo) {
  if (!fs.existsSync(caminhoArquivo)) {
    throw new ArquivoNaoEncontradoException(caminhoArquivo);
  }
  const conteudoArquivo = fs.readFileSync(caminhoArquivo);
  return JSON.parse(conteudoArquivo.toString());
};
