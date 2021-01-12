const fs = require('fs');

module.exports = function lerArquivoJson(arquivo) {
  const conteudoArquivo = fs.readFileSync(arquivo);
  return JSON.parse(conteudoArquivo.toString());
};
