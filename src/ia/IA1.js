const path = require('path');
const fs = require('fs');

module.exports = class IA1 {
  constructor(configuracoes) {
    this.configuracoes = configuracoes;
    this.modelo = {};
    this.exibirLog = true;
  }

  tentarCarregarModelo() {
    /* if (fs.existsSync(this.caminhoSalvarModelo)) {
      this.carregarModelo();
    } else {
      return false;
    } */
    return false;
  }

  criarNovoModelo(arquivoMensagens) {
    this.modelo.nroMaximoMensagensEntrada = 0;
    this.modelo.nroMaximoCaracteresMensagensEntrada = 0;
    this.modelo.nroMaximoCaracteresMensagensSaida = 0;
    this.extrairInformacoesParaMontarRNA(arquivoMensagens);
    this.salvarModelo();
  }

  extrairInformacoesParaMontarRNA(arquivoMensagens) {
    while (arquivoMensagens.verificarSeTemProximoGrupoMensagens()) {
      const grupoMensagens = arquivoMensagens.proximoGrupoMensagens();
      this.modelo.nroMaximoMensagensEntrada = Math.max(this.modelo.nroMaximoMensagensEntrada, grupoMensagens.mensagensEntrada.length);
      this.modelo.nroMaximoCaracteresMensagensSaida = Math.max(this.modelo.nroMaximoCaracteresMensagensSaida, grupoMensagens.mensagemSaida.texto.length);
      if (grupoMensagens.mensagemSaida.texto.length >= 1554) {
        console.log(grupoMensagens.mensagemSaida.texto);
      }
      for (const mensagemEntrada of grupoMensagens.mensagensEntrada) {
        this.modelo.nroMaximoCaracteresMensagensEntrada = Math.max(this.modelo.nroMaximoCaracteresMensagensEntrada, mensagemEntrada.texto.length);
      }
    }
  }

  salvarModelo() {
    fs.writeFileSync(this.caminhoArquivoModelo, JSON.stringify(this.modelo));
  }

  log() {
    if (this.exibirLog) {
      console.log.apply(console, arguments);
    }
  }

  get caminhoArquivoModelo() {
    return path.join(__dirname, '../../data/modelos/', this.configuracoes.nomeModelo + '.json');
  }
};
