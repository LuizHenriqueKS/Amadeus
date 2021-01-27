const path = require('path');
const fs = require('fs');
const tf = require('@tensorflow/tfjs-node-gpu');
const conversorMensagem3 = require('../mensagem/conversorMensagem3');
const ArquivoNaoEncontradoException = require('../exception/ArquivoNaoEncontradoException');
const converterBitsParaTexto = require('../util/converterBitsParaTexto');

module.exports = class IA1 {
  constructor(configuracoes) {
    this.configuracoes = configuracoes;
    this.modelo = {};
    this.exibirLog = true;
    this.taxaAprendizagem = 0.001;
    this.quantidadeMaximaMensagensLerPorIteracao = 1000;
    this.precisaoAceita = this.configuracoes.precisaoAceita || 0.997;
    if (configuracoes.acelerador) {
      if (configuracoes.acelerador === 'cpu') {
        require('@tensorflow/tfjs-node');
      }
      if (configuracoes.acelerador === 'gpu') {
        require('@tensorflow/tfjs-node-gpu');
      }
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

    const l1 = Math.max(Math.ceil(this.quantidadeDadosEntrada / 10), 100);
    const l2 = Math.max(Math.ceil(l1 / 10), 100);
    const l3 = l2;// Math.min(Math.ceil(l2 / 2), 100);

    this.rna.add(tf.layers.dense({ units: l1, inputShape: [this.quantidadeDadosEntrada], activation: 'sigmoid' }));
    this.rna.add(tf.layers.dense({ units: l2, inputShape: [l1], activation: 'sigmoid' }));
    this.rna.add(tf.layers.dense({ units: l3, inputShape: [l2], activation: 'sigmoid' }));
    this.rna.add(tf.layers.dense({ units: 2 * this.quantidadeBitsPorBytes, inputShape: [l3], activation: 'sigmoid' }));
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
    for (let i = 1; i < this.configuracoes.tamanhoMaxCaracteresMensagens; i++) {
      const subArquivoMensagens = arquivoMensagens.getSubArquivoMensagens(i);
      let precisao;
      this.quantidadeDadosSaida = (i + 1) * 16;
      this.aumentarTamanhoSaida(this.quantidadeDadosSaida);
      this.log('Quantidade de caracteres de saída:', i);
      this.log('Quantidade de mensagens a processar:', subArquivoMensagens.grupoMensagens.length);
      do {
        if (!subArquivoMensagens.verificarSeTemProximoGrupoMensagens()) {
          subArquivoMensagens.irParaPrimeiraMensagem();
        }
        const dadosBrutos = conversorMensagem3.converterArquivoParaDadosBrutos(subArquivoMensagens, this);
        const entradas = tf.tensor2d(dadosBrutos.entradas);
        const saidas = tf.tensor2d(dadosBrutos.saidas);
        const resultado = await this.rna.fit(entradas, saidas, { epochs: this.epocas });
        precisao = resultado.history.acc[resultado.history.acc.length - 1];
        if (this.salvarModeloAutomaticamente) {
          await this.salvarModelo();
        }
      } while (precisao < this.precisaoAceita);
    }
  }

  async predizerMensagem(mensagensEntrada, arquivoMensagens) {
    const dadosBrutosEntrada = conversorMensagem3.converterMensagensEntradaParaDadosBrutos(mensagensEntrada, this);
    const entrada = tf.tensor2d([dadosBrutosEntrada]);
    const resultado = this.rna.predict(entrada).arraySync();
    return converterBitsParaTexto(resultado[0]).trim();
  }

  aumentarTamanhoSaida(quantidadeDadosSaida) {
    const camadaSaida = this.rna.layers[this.rna.layers.length - 1];
    const quantidadeDadosEntrada = camadaSaida.weights[0].shape[0];
    const quantidadeDadosSaidaOriginal = camadaSaida.weights[0].shape[1];
    if (quantidadeDadosSaidaOriginal < quantidadeDadosSaida) {
      this.log(`Aumentando o tamanho de sáida de ${quantidadeDadosSaidaOriginal} para ${quantidadeDadosSaida}`);
      this.rna.pop();
      this.rna.add(tf.layers.dense({ units: quantidadeDadosSaida, inputShape: [quantidadeDadosEntrada], activation: 'sigmoid', name: `dense_${Math.random()}` }));
      this.compilarRNA();
      const novaCamadaSaida = this.rna.layers[this.rna.layers.length - 1];
      this.copiarPesos(camadaSaida, novaCamadaSaida);
    }
  }

  copiarPesos(camadaOrigem, camadaAlvo) {
    const pesosOrigem = camadaOrigem.weights[0].val.arraySync();
    const pesosAlvo = camadaAlvo.weights[0].val.arraySync();
    for (let x = 0; x < pesosOrigem.length; x++) {
      for (let y = 0; y < pesosOrigem[x].length; y++) {
        pesosAlvo[x][y] = pesosOrigem[x][y];
      }
    }
    const val = tf.variable(tf.tensor2d(pesosAlvo));
    camadaAlvo.weights[0].val.assign(val);
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

  get quantidadeBitsPorBytes() {
    return 16;
  }

  get caminhoArquivoModelo() {
    return path.join(__dirname, '../../data/modelos3/', this.configuracoes.nomeModelo + '.json');
  }

  get caminhoDiretorioRNA() {
    return path.resolve(path.join('./data/modelos3/', this.configuracoes.nomeModelo));
  }

  get epocas() {
    return this.configuracoes.epocas;
  }
};
