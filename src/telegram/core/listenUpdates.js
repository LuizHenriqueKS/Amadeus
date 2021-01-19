module.exports = async function listenUpdates() {
  const firstUpdates = await this.listUpdates({ offset: this.offset });
  updateOffset.call(this, firstUpdates);
  executeSetTimeout.call(this);
};

function executeSetTimeout() {
  if (this.listening) {
    setTimeout(async () => await executeListUpdates.call(this), this.delayToListening);
  }
}

async function executeListUpdates() {
  try {
    const updates = await this.listUpdates({ offset: this.offset });
    updateOffset.call(this, updates);
    this.readUpdates(updates);
    executeSetTimeout.call(this);
  } catch (e) {
    console.error(e);
  }
}

function getLastUpdateId(updates, elseValue) {
  if (updates.length === 0) return elseValue;
  return updates.map(u => u.update_id).reduce((a, b) => Math.max(a, b));
}

function updateOffset(updates) {
  this.offset = getLastUpdateId(updates, this.offset);
  if (updates.length > 0) {
    this.offset++;
  }
}
