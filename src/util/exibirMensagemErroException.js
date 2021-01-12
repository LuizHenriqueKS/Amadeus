const PropriedadeNaoEncontrada = require('../exception/PropriedadeNaoEncontrada');

module.exports = function exibirMensagemErroException(ex) {
  if (ex instanceof PropriedadeNaoEncontrada) {
    console.error('Propriedade não encontrada:', ex.nomePropriedade);
  } else {
    console.error(ex);
  }
};
