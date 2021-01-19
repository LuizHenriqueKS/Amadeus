const lerArquivoJson = require('../util/lerArquivoJson');
const ArquivoMensagens = require('./ArquivoMensagens');

class LeitorArquivosMensagens {
  constructor(configuracoes) {
    this.configuracoes = configuracoes;
    this.exibirLog = true;
  }

  ler(caminhoArquivo) {
    const conteudoArquivoJson = this.lerJson(caminhoArquivo);
    const grupoMensagens = this.converterParaGrupoMensagens(conteudoArquivoJson);
    return new ArquivoMensagens(grupoMensagens);
  }

  lerJson(caminhoArquivo) {
    this.log('Lendo o arquivo de mensagens:', caminhoArquivo);
    const msInicio = new Date().getTime();
    const json = lerArquivoJson(caminhoArquivo);
    this.log('Arquivo de mensagens lido em:', new Date().getTime() - msInicio, 'ms');
    return json;
  }

  converterParaGrupoMensagens(json) {
    this.log('Extraindo grupo de mensagens...');
    const msInicio = new Date().getTime();
    const mapMensagensPorId = {};
    const grupoMensagens = [];
    let mensagensEntrada = [];
    for (const mensagemCrua of json.messages) {
      const mensagem = this.tratarMensagemCrua(mensagemCrua);
      if (this.verificarSeMensagemValida(mensagem)) {
        if (this.verificarSeMensagemDoUsuarioAlvo(mensagem)) {
          mensagensEntrada = this.adicionarMensagemAlvoNoArrayMensagensEntrada(mensagensEntrada, mapMensagensPorId, mensagem);
          grupoMensagens.push({ mensagensEntrada: mensagensEntrada, mensagemSaida: mensagem });
        }
        mapMensagensPorId[mensagem.id] = mensagem;
        mensagensEntrada = this.atualizarArrayMensagensEntrada(mensagensEntrada, mensagem);
      }
    }
    this.log('Grupo de mensagens extraido em:', new Date().getTime() - msInicio, 'ms');
    return grupoMensagens;
  }

  verificarSeMensagemValida(mensagem) {
    return mensagem.texto;
  }

  verificarSeMensagemDoUsuarioAlvo(mensagem) {
    return mensagem.idUsuario === this.configuracoes.idUsuario;
  }

  atualizarArrayMensagensEntrada(mensagensEntrada, mensagem) {
    const mensagensEntradaTratada = [...mensagensEntrada];
    mensagensEntradaTratada.push(mensagem);
    if (mensagensEntradaTratada.length > this.configuracoes.qtdeMaxMensagensEntrada) {
      mensagensEntradaTratada.splice(0, mensagensEntradaTratada.length - this.configuracoes.qtdeMaxMensagensEntrada);
    }
    return mensagensEntradaTratada;
  }

  adicionarMensagemAlvoNoArrayMensagensEntrada(mensagensEntrada, mapMensagensPorId, mensagem) {
    if (mensagem.idMensagemAlvo) {
      const mensagemAlvo = mapMensagensPorId[mensagem.idMensagemAlvo];
      if (mensagemAlvo) {
        return this.atualizarArrayMensagensEntrada(mensagensEntrada, mensagemAlvo);
      }
    }
    return mensagensEntrada;
  }

  tratarMensagemCrua(mensagemCrua) {
    return {
      id: mensagemCrua.id,
      texto: mensagemCrua.text,
      nomeUsuario: mensagemCrua.from,
      idUsuario: mensagemCrua.from_id,
      dataHora: mensagemCrua.date,
      idMensagemAlvo: mensagemCrua.reply_to_message_id
    };
  }

  log() {
    if (this.exibirLog) {
      console.log.apply(console, arguments);
    }
  }
}

module.exports = LeitorArquivosMensagens;
