class TelBotCmd {
  constructor(msg) {
    this.text = msg.text;
  }

  get isCmd() {
    return this.text && this.text.startsWith('/');
  }

  get name() {
    if (this.isCmd) {
      return this.text.substr(1, getEndNameIndex(this.text));
    } else {
      return undefined;
    }
  }

  get argsText() {
    if (this.isCmd) {
      return this.text.substr(0, getEndCmdIndex(this.text));
    } else {
      return undefined;
    }
  }
}

function getEndNameIndex(text) {
  const indexes = [];
  indexes[0] = text.indexOf('@');
  indexes[1] = text.indexOf(' ');
  const validIndexes = indexes.filter(i => i !== -1);
  if (validIndexes.length === 0) {
    return text.length;
  } else {
    const minIndex = validIndexes.reduce((a, b) => Math.min(a, b));
    return minIndex;
  }
}

function getEndCmdIndex(text) {
  const spaceIndex = text.indexOf(' ');
  if (spaceIndex === -1) {
    return text.length;
  } else {
    return spaceIndex;
  }
}

module.exports = TelBotCmd;
