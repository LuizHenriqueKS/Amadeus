const path = require('path');
const lerArquivoJson = require('../src/util/lerArquivoJson');
const validarConfiguracoesTreinamento = require('../src/util/validarConfiguracoesTreinamento');
const exibirMensagemErroException = require('../src/util/exibirMensagemErroException');
const IA2 = require('../src/ia/IA2');
const rl = require('readline-sync');
const LeitorArquivosMensagens = require('../src/mensagem/LeitorArquivosMensagens');

async function main() {
  try {
    const caminhoArquivoTreinamento = path.resolve(process.argv[2]);
    console.log('Arquivo de treinamento: ', caminhoArquivoTreinamento);

    const configuracoes = lerArquivoJson(caminhoArquivoTreinamento);
    validarConfiguracoesTreinamento(configuracoes);

    const caminhoArquivoMensagens = path.resolve(configuracoes.mensagens);
    const arquivoMensagens = new LeitorArquivosMensagens(configuracoes).ler(caminhoArquivoMensagens);

    const ia = new IA2(configuracoes.ia);
    await ia.carregarModelo();

    const respostaTeste = await ia.predizerMensagem([{ dataHora: new Date(), idUsuario: 0, texto: 'Oi' }], arquivoMensagens);
    console.log('Resposta do teste:', respostaTeste);

    while (true) {
      const texto = rl.question('Entre com uma mensagem: ');
      const mensagemEntrada = {
        dataHora: new Date(),
        idUsuario: 0,
        texto
      };
      const mensagemSaida = await ia.predizerMensagem([mensagemEntrada], arquivoMensagens);
      console.log('Saída:', mensagemSaida);
    }
  } catch (ex) {
    exibirMensagemErroException(ex);
  }
}

main().then();
