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
    let ultimoMensagemAdicionado = null;
    for (const mensagemCrua of json.messages) {
      const mensagem = this.tratarMensagemCrua(mensagemCrua);
      if (this.verificarSeMensagemValida(mensagem)) {
        if (this.verificarSeMensagemDoUsuarioAlvo(mensagem)) {
          if (ultimoMensagemAdicionado == null) {
            mensagensEntrada = this.adicionarMensagemAlvoNoArrayMensagensEntrada(mensagensEntrada, mapMensagensPorId, mensagem);
            grupoMensagens.push({ mensagensEntrada: mensagensEntrada, mensagemSaida: mensagem });
            ultimoMensagemAdicionado = mensagem;
          } else {
            ultimoMensagemAdicionado.texto += `\r\n${mensagem.texto}`;
          }
        } else {
          ultimoMensagemAdicionado = null;
        }
        mapMensagensPorId[mensagem.id] = mensagem;
        mensagensEntrada = this.atualizarArrayMensagensEntrada(mensagensEntrada, mensagem);
      }
    }
    this.removerMensagensEntradaMuitoGrande(mensagensEntrada);
    this.log('Grupo de mensagens extraido em:', new Date().getTime() - msInicio, 'ms');
    return grupoMensagens;
  }

  removerMensagensEntradaMuitoGrande(mensagensEntrada) {
    if (this.configuracoes.tamanhoMaxCaracteresMensagens) {
      for (let i = mensagensEntrada.length - 1; i >= 0; i--) {
        const mensagemEntrada = mensagensEntrada[i];
        if (mensagemEntrada.texto.length > this.configuracoes.tamanhoMaxCaracteresMensagens) {
          mensagensEntrada.splice(i, 1);
        }
      }
    }
  }

  verificarSeMensagemValida(mensagem) {
    if (mensagem.texto) {
      return (typeof mensagem.texto) === 'string';
    }
    return false;
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
