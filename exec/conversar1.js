const path = require('path');
const lerArquivoJson = require('../src/util/lerArquivoJson');
const validarConfiguracoesTreinamento = require('../src/util/validarConfiguracoesTreinamento');
const exibirMensagemErroException = require('../src/util/exibirMensagemErroException');
const IA1 = require('../src/ia/IA1');
const rl = require('readline-sync');

async function main() {
  try {
    const caminhoArquivoTreinamento = path.resolve(process.argv[2]);
    console.log('Arquivo de treinamento: ', caminhoArquivoTreinamento);

    const configuracoes = lerArquivoJson(caminhoArquivoTreinamento);
    validarConfiguracoesTreinamento(configuracoes);

    const ia = new IA1(configuracoes.ia);
    await ia.carregarModelo();

    const respostaTeste = await ia.predizerMensagem([{ dataHora: new Date(), idUsuario: 0, texto: 'Oi' }]);
    console.log('Resposta do teste:', respostaTeste);

    while (true) {
      const texto = rl.question('Entre com uma mensagem: ');
      const mensagemEntrada = {
        dataHora: new Date(),
        idUsuario: 0,
        texto
      };
      const mensagemSaida = await ia.predizerMensagem([mensagemEntrada]);
      console.log('Saída:', mensagemSaida);
    }
  } catch (ex) {
    exibirMensagemErroException(ex);
  }
}

main().then();
