const IndiceInvalidoException = require('../exception/IndiceInvalidoException');

class ArquivoMensagens {
  constructor(grupoMensagens) {
    this.irParaPrimeiraMensagem();
    this.grupoMensagens = grupoMensagens;
  }

  irParaPrimeiraMensagem() {
    this.indiceGrupoMensagens = 0;
  }

  verificarSeTemProximoGrupoMensagens() {
    return this.grupoMensagens.length > this.indiceGrupoMensagens;
  }

  proximoGrupoMensagens() {
    return this.grupoMensagens[this.indiceGrupoMensagens++];
  }

  getSubArquivoMensagens(tamanhoMaximoCaracteresSaida) {
    const novoGrupoMensagens = [];
    for (const grupoMensagem of this.grupoMensagens) {
      if (grupoMensagem.mensagemSaida.texto.length <= tamanhoMaximoCaracteresSaida) {
        novoGrupoMensagens.push(grupoMensagem);
      }
    }
    return new ArquivoMensagens(novoGrupoMensagens);
  }

  getGrupoMensagem(indice) {
    indice--;
    if (indice < 0 || this.grupoMensagens.length <= indice) {
      throw new IndiceInvalidoException(indice);
    }
    return this.grupoMensagens[indice];
  }
}

module.exports = ArquivoMensagens;
