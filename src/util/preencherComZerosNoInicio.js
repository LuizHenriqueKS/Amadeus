function preencherComZerosNoInicio(array, quantidadesZeroPreencher) {
  for (let i = 0; i < quantidadesZeroPreencher; i++) {
    array.unshift(0);
  }
}

module.exports = preencherComZerosNoInicio;
