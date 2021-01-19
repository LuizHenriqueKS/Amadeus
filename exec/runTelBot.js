const TelBot = require('../src/telegram/TelBot');
const random = require('../src/util/random');
require('dotenv').config();

const bot = new TelBot(process.env.TELBOT_TOKEN);
bot.listen().then(() => {
  console.log('Bot iniciado com sucesso: ', bot.botInfo.first_name);
});

bot.receivedMsgListeners.push(evt => {
  console.log(`R[${evt.msg.chat.title}](ID: ${evt.msg.from.id})${evt.msg.from.name}: ${evt.msg.text}`);
  if (evt.msg.from.id === 30734373) {
    evt.replyMsg(random(['Oi', 'Eae', 'Olá', 'Diga', 'Fale'])).then();
  } else {
    evt.replyMsg(random(['Queima desgraça', 'Falei contigo? acho que não', 'Bla bla bla', 'Vai ver se eu tou na esquina', 'Pula na fogueira cara', 'Pq vc não pegou fogo ainda'])).then();
  }
});

bot.sentMsgListeners.push(evt => {
  console.log(`S[${evt.msg.chat.title}]${evt.bot.botInfo.first_name}: ${evt.msg.text}`);
});
