const { default: axios } = require('axios');
const TelBotException = require('./TelBotException');

module.exports = async function listUpdates({ offset }) {
  const url = getUpdatesUrl.call(this, offset);
  const response = await axios.get(url);
  if (response.data.ok) {
    return response.data.result;
  } else {
    throw new TelBotException(response);
  }
};

function getUpdatesUrl(offset) {
  if (offset) {
    return this.buildUrl(`getUpdates?offset=${offset}`);
  } else {
    return this.buildUrl('getUpdates');
  }
}
