const path = require('path');
const lerArquivoJson = require('../src/util/lerArquivoJson');
const validarConfiguracoesTreinamento = require('../src/util/validarConfiguracoesTreinamento');
const exibirMensagemErroException = require('../src/util/exibirMensagemErroException');
const LeitorArquivosMensagens = require('../src/mensagem/LeitorArquivosMensagens');
const IA1 = require('../src/ia/IA1');

try {
  const caminhoArquivoTreinamento = path.join(__dirname, 'treinar.json');
  const configuracoes = lerArquivoJson(caminhoArquivoTreinamento);
  validarConfiguracoesTreinamento(configuracoes);

  const caminhoArquivoMensagens = path.join(__dirname, configuracoes.mensagens);
  const arquivoMensagens = new LeitorArquivosMensagens().ler(caminhoArquivoMensagens);
  const ia = new IA1(configuracoes.ia);

  ia.tentarCarregarModelo();
  ia.salvarModeloAutomaticamente = true;
  ia.treinarSemParar(arquivoMensagens);
} catch (ex) {
  exibirMensagemErroException(ex);
}
