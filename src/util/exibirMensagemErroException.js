const PropriedadeNaoEncontrada = require('../exception/PropriedadeNaoEncontradaException');
const ArquivoNaoEncontradoException = require('../exception/ArquivoNaoEncontradoException');

module.exports = function exibirMensagemErroException(ex) {
  if (ex instanceof PropriedadeNaoEncontrada) {
    console.error('Propriedade não encontrada:', ex.nomePropriedade);
  } else if (ex instanceof ArquivoNaoEncontradoException) {
    console.error('Arquivo não encontrado:', ex.caminhoArquivo);
  } else {
    console.error(ex);
  }
};
