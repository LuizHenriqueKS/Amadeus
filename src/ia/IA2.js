const path = require('path');
const fs = require('fs');
const tf = require('@tensorflow/tfjs');
const conversorMensagem2 = require('../mensagem/conversorMensagem2');
const ArquivoNaoEncontradoException = require('../exception/ArquivoNaoEncontradoException');
const converterBitsParaNumero = require('../util/converterBitsParaNumero');

module.exports = class IA1 {
  constructor(configuracoes) {
    this.configuracoes = configuracoes;
    this.modelo = {};
    this.exibirLog = true;
    this.taxaAprendizagem = 0.001;
    this.quantidadeMaximaMensagensLerPorIteracao = 1000;
    if (configuracoes.acelerador) {
      require('@tensorflow/tfjs-node');
    }
  }

  async tentarCarregarModelo() {
    if (fs.existsSync(this.caminhoDiretorioRNA)) {
      await this.carregarModelo();
      return true;
    }
    return false;
  }

  async criarNovoModelo(arquivoMensagens) {
    this.log(`Criando novo modelo: ${this.configuracoes.nomeModelo}...`);
    this.modelo.nroMaximoMensagensEntrada = 0;
    this.modelo.nroMaximoCaracteresMensagensEntrada = 0;
    this.modelo.nroMaximoCaracteresMensagensSaida = 0;
    this.extrairInformacoesParaMontarRNA(arquivoMensagens);
    this.criarRNA();
    await this.salvarModelo();
  }

  extrairInformacoesParaMontarRNA(arquivoMensagens) {
    this.log('Extraindo informações para montar a RNA...');
    arquivoMensagens.irParaPrimeiraMensagem();
    while (arquivoMensagens.verificarSeTemProximoGrupoMensagens()) {
      const grupoMensagens = arquivoMensagens.proximoGrupoMensagens();
      this.modelo.nroMaximoMensagensEntrada = Math.max(this.modelo.nroMaximoMensagensEntrada, grupoMensagens.mensagensEntrada.length);
      this.modelo.nroMaximoCaracteresMensagensSaida = Math.max(this.modelo.nroMaximoCaracteresMensagensSaida, grupoMensagens.mensagemSaida.texto.length);
      for (const mensagemEntrada of grupoMensagens.mensagensEntrada) {
        this.modelo.nroMaximoCaracteresMensagensEntrada = Math.max(this.modelo.nroMaximoCaracteresMensagensEntrada, mensagemEntrada.texto.length);
      }
    }
  }

  criarRNA() {
    this.rna = tf.sequential();

    const l1 = Math.min(Math.ceil(this.quantidadeDadosEntrada / 2), 100);
    const l2 = Math.min(Math.ceil(l1 / 2), 100);
    const l3 = l2; // Math.min(Math.ceil(l2 / 2), 100);

    this.rna.add(tf.layers.dense({ units: l1, inputShape: [this.quantidadeDadosEntrada], activation: 'sigmoid' }));
    this.rna.add(tf.layers.dense({ units: l2, inputShape: [l1], activation: 'sigmoid' }));
    // this.rna.add(tf.layers.dense({ units: l3, inputShape: [l2], activation: 'sigmoid' }));
    this.rna.add(tf.layers.dense({ units: this.quantidadeDadosSaida, inputShape: [l3], activation: 'sigmoid' }));
    this.compilarRNA();
  }

  async carregarModelo() {
    this.log(`Carregando modelo: ${this.configuracoes.nomeModelo}...`);
    this.requerArquivoExista(this.caminhoArquivoModelo);
    this.requerArquivoExista(this.caminhoDiretorioRNA);
    this.modelo = JSON.parse(fs.readFileSync(this.caminhoArquivoModelo).toString());
    this.rna = await tf.loadLayersModel(`file://${this.caminhoDiretorioRNA}/model.json`);
    this.compilarRNA();
    this.log('Modelo carregado.');
  }

  async salvarModelo() {
    this.log(`Salvando modelo: ${this.configuracoes.nomeModelo}...`);
    fs.writeFileSync(this.caminhoArquivoModelo, JSON.stringify(this.modelo));
    await this.rna.save(`file://${this.caminhoDiretorioRNA}`);
    this.log('Modelo salvo.');
  }

  compilarRNA() {
    this.rna.compile({ loss: 'binaryCrossentropy', optimizer: tf.train.rmsprop(this.taxaAprendizagem), metrics: 'accuracy' });
  }

  async treinarSemParar(arquivoMensagens) {
    while (true) {
      if (!arquivoMensagens.verificarSeTemProximoGrupoMensagens()) {
        arquivoMensagens.irParaPrimeiraMensagem();
      }
      const dadosBrutos = conversorMensagem2.converterArquivoParaDadosBrutos(arquivoMensagens, this);
      const entradas = tf.tensor2d(dadosBrutos.entradas);
      const saidas = tf.tensor2d(dadosBrutos.saidas);
      const resultado = await this.rna.fit(entradas, saidas, { epochs: this.epocas });
      if (!this.configuracoes.acelerador) {
        this.log(resultado);
      }
      if (this.salvarModeloAutomaticamente) {
        await this.salvarModelo();
      }
    }
  }

  async predizerMensagem(mensagensEntrada, arquivoMensagens) {
    const dadosBrutosEntrada = conversorMensagem2.converterMensagensEntradaParaDadosBrutos(mensagensEntrada, this);
    const entrada = tf.tensor2d([dadosBrutosEntrada]);
    const resultado = this.rna.predict(entrada).arraySync();
    const indice = converterBitsParaNumero(resultado[0]);
    return arquivoMensagens.getGrupoMensagem(indice).mensagemSaida.texto;
  }

  requerArquivoExista(arquivo) {
    if (!fs.existsSync(arquivo)) {
      throw new ArquivoNaoEncontradoException(arquivo);
    }
  }

  log() {
    if (this.exibirLog) {
      console.log.apply(console, arguments);
    }
  }

  get quantidadeDadosEntrada() {
    return this.modelo.nroMaximoMensagensEntrada * (this.modelo.nroMaximoCaracteresMensagensEntrada + this.quantidadeDadosTempo + this.quantidadeDadosUsuarioId);
  }

  get nroMaximoMensagensEntrada() {
    return this.modelo.nroMaximoMensagensEntrada;
  }

  get nroMaximoCaracteresMensagensEntrada() {
    return this.modelo.nroMaximoCaracteresMensagensEntrada;
  }

  get quantidadeDadosTempo() {
    return 8;
  }

  get quantidadeDadosUsuarioId() {
    return 8;
  }

  get quantidadeDadosSaida() {
    return 8 * 8;
  }

  get caminhoArquivoModelo() {
    return path.join(__dirname, '../../data/modelos2/', this.configuracoes.nomeModelo + '.json');
  }

  get caminhoDiretorioRNA() {
    return path.resolve(path.join('./data/modelos2/', this.configuracoes.nomeModelo));
  }

  get epocas() {
    return this.configuracoes.epocas;
  }
};
