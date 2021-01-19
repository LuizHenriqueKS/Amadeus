const TelBotMsg = require('./TelBotMsg');

class TelBotMsgEvent {
  constructor(bot, message) {
    this.bot = bot;
    this.message = message;
    this.msg = new TelBotMsg(message);
  }

  async replyMsg(text) {
    await this.bot.sendMsg({ chat_id: this.msg.chat.id, text, reply_to_message_id: this.msg.id });
  }

  get cmd() {
    return this.msg.cmd;
  }
}

module.exports = TelBotMsgEvent;
