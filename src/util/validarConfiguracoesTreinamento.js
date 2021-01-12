const PropriedadeNaoEncontrada = require('../exception/PropriedadeNaoEncontrada');

module.exports = function validarConfiguracoesTreinamento(configuracoes) {
  if (!configuracoes.mensagens) {
    throw new PropriedadeNaoEncontrada('mensagens');
  }
  if (!configuracoes.ia) {
    throw new PropriedadeNaoEncontrada('ia');
  }
};
