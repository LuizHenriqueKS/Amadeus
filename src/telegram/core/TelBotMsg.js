const TelBotChat = require('./TelBotChat');
const TelBotCmd = require('./TelBotCmd');
const TelBotFrom = require('./TelBotFrom');

class TelBotMsg {
  constructor(message) {
    this.message = message;
    if (message.from) this.from = new TelBotFrom(message.from);
    if (message.chat) this.chat = new TelBotChat(message.chat);
    this.cmd = new TelBotCmd(this);
    if (!this.cmd.isCmd) this.cmd = undefined;
  }

  get id() {
    return this.message.message_id;
  }

  get text() {
    return this.message.text;
  }

  get argsText() {
    if (this.cmd) {
      return this.cmd.argsText;
    } else {
      return this.text;
    }
  }
}

module.exports = TelBotMsg;
