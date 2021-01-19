class TelBotFrom {
  constructor(from) {
    this.rawFrom = from;
  }

  get id() {
    return this.rawFrom.id;
  }

  get name() {
    if (this.rawFrom.first_name) {
      return this.rawFrom.first_name;
    } else if (this.rawFrom.last_name) {
      return this.rawFrom.last_name;
    } else {
      return this.rawFrom.username;
    }
  }

  get isBot() {
    return this.rawFrom.is_bot;
  }
}

module.exports = TelBotFrom;
