const axios = require('axios');
const TelBotException = require('./core/TelBotException');
const listenUpdates = require('./core/listenUpdates');
const listUpdates = require('./core/listUpdates');
const TelBotMsgEvent = require('./core/TelBotMsgEvent');

class TelBot {
  constructor(token) {
    this.token = token;
    this.receivedMsgListeners = [];
    this.sentMsgListeners = [];
    this.offset = null;
    this.listening = false;
    this.delayToListening = 3000;
    this.listUpdates = listUpdates;
  }

  async listen() {
    this.botInfo = await this.loadBotInfo();
    this.listening = true;
    await listenUpdates.call(this);
  }

  async loadBotInfo() {
    const url = this.buildUrl('getMe');
    const response = await axios.get(url);
    if (response.data.ok) {
      return response.data.result;
    } else {
      throw new TelBotException(this.botInfo);
    }
  }

  readUpdates(updates) {
    for (const update of updates) {
      this.readUpdate(update);
    }
  }

  readUpdate(update) {
    if (update.message) {
      this.readReceivedMessage(update.message);
    } else {
      console.warn('Unsupported update:', update);
    }
  }

  readReceivedMessage(message) {
    const evt = new TelBotMsgEvent(this, message);
    this.receivedMsgListeners.forEach(l => {
      const response = l(evt);
      if (response instanceof Promise) {
        response.then();
      }
    });
  }

  async sendMsg(msg) {
    const url = this.buildUrl('sendMessage');
    const response = await axios.post(url, msg);
    if (response.data.ok) {
      this.fireSentMessage(response.data.result);
      return response.data;
    } else {
      throw new TelBotException(response.data);
    }
  }

  fireSentMessage(message) {
    const evt = new TelBotMsgEvent(this, message);
    this.sentMsgListeners.forEach(l => {
      const response = l(evt);
      if (response instanceof Promise) {
        response.then();
      }
    });
  }

  getBaseUrl() {
    return new URL(`https://api.telegram.org/bot${this.token}/`).toString();
  }

  buildUrl(relativePath) {
    return new URL(relativePath, this.getBaseUrl()).toString();
  }
}

module.exports = TelBot;
