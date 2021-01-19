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
}

module.exports = ArquivoMensagens;
