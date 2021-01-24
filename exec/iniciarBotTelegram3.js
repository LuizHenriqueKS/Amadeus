const TelBot = require('../src/telegram/TelBot');
const path = require('path');

const lerArquivoJson = require('../src/util/lerArquivoJson');
const validarConfiguracoesTreinamento = require('../src/util/validarConfiguracoesTreinamento');
const exibirMensagemErroException = require('../src/util/exibirMensagemErroException');
const IA3 = require('../src/ia/IA3');

require('dotenv').config();

const contexto = [];

async function main() {
  const bot = new TelBot(process.env.TELBOT_TOKEN);

  bot.listen().then(() => {
    console.log('Bot iniciado com sucesso: ', bot.botInfo.first_name);
  });

  bot.receivedMsgListeners.push(evt => {
    console.log(`R[${evt.msg.chat.title}](ID: ${evt.msg.from.id})${evt.msg.from.name}: ${evt.msg.text}`);
    if (evt.cmd && evt.cmd.name === 'a') {
      evt.replyMsg('Responda esta mensagem').then();
    } else if (evt.msg.text && evt.msg.text !== '') {
      pedirParaIAResponder(evt).then();
    }
  });

  bot.sentMsgListeners.push(evt => {
    console.log(`S[${evt.msg.chat.title}]${evt.bot.botInfo.first_name}: ${evt.msg.text}`);
  });
}

async function pedirParaIAResponder(evt) {
  try {
    const caminhoArquivoTreinamento = path.resolve(process.argv[2]);
    const configuracoes = lerArquivoJson(caminhoArquivoTreinamento);
    validarConfiguracoesTreinamento(configuracoes);

    const ia = new IA3(configuracoes.ia);
    await ia.carregarModelo();

    const mensagem = { dataHora: new Date(), idUsuario: evt.msg.from.id, texto: evt.msg.text };
    contexto.push(mensagem);

    while (contexto.length > configuracoes.qtdeMaxMensagensEntrada) {
      contexto.splice(0, 1);
    }

    const resposta = await ia.predizerMensagem(contexto);
    await evt.replyMsg(resposta);
  } catch (e) {
    exibirMensagemErroException(e);
  }
}

main().then();
