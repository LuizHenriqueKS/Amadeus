class TelBotChat {
  constructor(chat) {
    this.rawChat = chat;
  }

  get id() {
    return this.rawChat.id;
  }

  get title() {
    return this.rawChat.title;
  }
}

module.exports = TelBotChat;
