const PropriedadeNaoEncontradaException = require('../exception/PropriedadeNaoEncontradaException');

module.exports = function validarConfiguracoesTreinamento(configuracoes) {
  if (!configuracoes.mensagens) {
    throw new PropriedadeNaoEncontradaException('mensagens');
  }
  if (!configuracoes.ia) {
    throw new PropriedadeNaoEncontradaException('ia');
  }
};
