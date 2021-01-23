const converterTextoParaBits = require('../util/converterTextoParaBits');
const converterTextoParaAscii = require('../util/converterTextoParaAscii');
const converterNumeroParaBytes = require('../util/converterNumeroParaBytes');

class ConversorMensagem {
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
    this.preencherComZerosNoFinal(dadosBrutos, opcoes.nroMaximoCaracteresMensagensEntrada - texto.length);
    return dadosBrutos;
  }

  preencherDadosBrutosRestantesMensagensEntrada(resultado, mensagensEntrada, opcoes) {
    for (let i = mensagensEntrada.length; i < opcoes.nroMaximoMensagensEntrada; i++) {
      this.preencherComZerosNoInicio(resultado, opcoes.quantidadeDadosTempo);
      this.preencherComZerosNoInicio(resultado, opcoes.quantidadeDadosUsuarioId);
      this.preencherComZerosNoInicio(resultado, opcoes.nroMaximoCaracteresMensagensEntrada);
    }
  }

  preencherComZerosNoInicio(array, quantidadesZeroPreencher) {
    for (let i = 0; i < quantidadesZeroPreencher; i++) {
      array.unshift(0);
    }
  }

  preencherComZerosNoFinal(array, quantidadesZeroPreencher) {
    for (let i = 0; i < quantidadesZeroPreencher; i++) {
      array.push(0);
    }
  }

  converterMensagemSaidaParaDadosBrutos(mensagemSaida, opcoes) {
    const dadosBrutos = converterTextoParaBits(mensagemSaida.texto);
    this.preencherComZerosNoFinal(dadosBrutos, opcoes.quantidadeDadosSaida - dadosBrutos.length);
    return dadosBrutos;
  }
}

module.exports = new ConversorMensagem();
