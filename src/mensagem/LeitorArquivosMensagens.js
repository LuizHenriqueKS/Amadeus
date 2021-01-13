const lerArquivoJson = require('../util/lerArquivoJson');
const ArquivoMensagens = require('./ArquivoMensagens');

class LeitorArquivosMensagens {
  constructor() {
    this.exibirLog = true;
  }

  ler(arquivo) {
    this.log('Lendo o arquivo de mensagens:', arquivo);
    const date = new Date();
    const json = lerArquivoJson(arquivo);
    this.log('Arquivo de mensagens lido em:', new Date().getTime() - date.getTime(), 'ms');
    return new ArquivoMensagens(json);
  }

  log() {
    if (this.exibirLog) {
      console.log.apply(console, arguments);
    }
  }
}

module.exports = LeitorArquivosMensagens;
