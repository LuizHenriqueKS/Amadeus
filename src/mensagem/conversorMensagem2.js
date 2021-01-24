const converterTextoParaAscii = require('../util/converterTextoParaAscii');
const converterNumeroParaBytes = require('../util/converterNumeroParaBytes');
const converterNumeroParaBits = require('../util/converterNumeroParaBits');
const preencherComZerosNoInicio = require('../util/preencherComZerosNoInicio');
const preencherComZerosNoFinal = require('../util/preencherComZerosNoFinal');

class ConversorMensagem2 {
  converterArquivoParaDadosBrutos(arquivoMensagens, opcoes) {
    const entradas = [];
    const saidas = [];
    arquivoMensagens.irParaPrimeiraMensagem();
    for (let i = 0; i < opcoes.quantidadeMaximaMensagensLerPorIteracao; i++) {
      if (!arquivoMensagens.verificarSeTemProximoGrupoMensagens()) break;
      const grupoMensagens = arquivoMensagens.proximoGrupoMensagens();
      const entrada = this.converterMensagensEntradaParaDadosBrutos(grupoMensagens.mensagensEntrada, opcoes);
      const saida = this.converterMensagemSaidaParaDadosBrutos(grupoMensagens.mensagemSaida, opcoes);
      entradas.push(entrada);
      saidas.push(saida);
    }
    return { entradas, saidas };
  }

  converterMensagensEntradaParaDadosBrutos(mensagensEntrada, opcoes) {
    const resultado = [];
    for (const mensagemEntrada of mensagensEntrada) {
      const dadosBrutos = this.converterMensagemEntradaParaDadosBrutos(mensagemEntrada, opcoes);
      resultado.push(...dadosBrutos);
    }
    this.preencherDadosBrutosRestantesMensagensEntrada(resultado, mensagensEntrada, opcoes);
    return resultado;
  }

  converterMensagemEntradaParaDadosBrutos(mensagemEntrada, opcoes) {
    const dadosBrutos = [];
    const dataHora = 0;// new Date(mensagemEntrada.dataHora).getTime();
    const texto = converterTextoParaAscii(mensagemEntrada.texto);
    dadosBrutos.push(...converterNumeroParaBytes(mensagemEntrada.idUsuario, opcoes.quantidadeDadosUsuarioId));
    dadosBrutos.push(...converterNumeroParaBytes(dataHora, opcoes.quantidadeDadosTempo));
    dadosBrutos.push(...texto);
    preencherComZerosNoFinal(dadosBrutos, opcoes.nroMaximoCaracteresMensagensEntrada - texto.length);
    return dadosBrutos;
  }

  preencherDadosBrutosRestantesMensagensEntrada(resultado, mensagensEntrada, opcoes) {
    for (let i = mensagensEntrada.length; i < opcoes.nroMaximoMensagensEntrada; i++) {
      preencherComZerosNoInicio(resultado, opcoes.quantidadeDadosTempo);
      preencherComZerosNoInicio(resultado, opcoes.quantidadeDadosUsuarioId);
      preencherComZerosNoInicio(resultado, opcoes.nroMaximoCaracteresMensagensEntrada);
    }
  }

  converterMensagemSaidaParaDadosBrutos(mensagemSaida, opcoes) {
    return converterNumeroParaBits(mensagemSaida.id, opcoes.quantidadeDadosSaida);
  }
}

module.exports = new ConversorMensagem2();
