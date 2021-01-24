const path = require('path');
const lerArquivoJson = require('../src/util/lerArquivoJson');
const validarConfiguracoesTreinamento = require('../src/util/validarConfiguracoesTreinamento');
const exibirMensagemErroException = require('../src/util/exibirMensagemErroException');
const LeitorArquivosMensagens = require('../src/mensagem/LeitorArquivosMensagens');
const IA3 = require('../src/ia/IA3');

async function main() {
  try {
    const caminhoArquivoTreinamento = path.resolve(process.argv[2]);
    console.log('Arquivo de treinamento: ', caminhoArquivoTreinamento);

    const configuracoes = lerArquivoJson(caminhoArquivoTreinamento);
    validarConfiguracoesTreinamento(configuracoes);

    const caminhoArquivoMensagens = path.resolve(configuracoes.mensagens);
    const arquivoMensagens = new LeitorArquivosMensagens(configuracoes).ler(caminhoArquivoMensagens);

    console.log('Quantidade de grupo de mensagens carregados:', arquivoMensagens.grupoMensagens.length);

    const ia = new IA3(configuracoes.ia);

    if (!await ia.tentarCarregarModelo()) {
      await ia.criarNovoModelo(arquivoMensagens);
    }

    ia.salvarModeloAutomaticamente = true;
    await ia.treinarSemParar(arquivoMensagens);
  } catch (ex) {
    exibirMensagemErroException(ex);
  }
}

main().then();
