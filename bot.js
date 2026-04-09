const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const TOKEN = process.env.BOT_TOKEN || '8710809171:AAHKsCFyRcls2pt6F2pmEQMIcQU8H7oz0CM';
const bot = new TelegramBot(TOKEN, {polling: true});
const FILE = 'data.json';
let data = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE)) : {};
function save() { fs.writeFileSync(FILE, JSON.stringify(data)); }
function getMonthKey() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1); }
function getYearKey() { return String(new Date().getFullYear()); }
bot.on('message', msg => {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  if (text.startsWith('/add')) {
    const parts = text.split(' ');
    const sell = parseFloat(parts[1]);
    const buy = parseFloat(parts[2]);
    if (isNaN(sell) || isNaN(buy)) { bot.sendMessage(chatId, 'שגיאה! שלח: /add 150 80'); return; }
    const profit = sell - buy;
    const month = getMonthKey();
    const year = getYearKey();
    if (!data[month]) data[month] = { revenue: 0, cost: 0, count: 0 };
    if (!data[year]) data[year] = { revenue: 0, cost: 0, count: 0 };
    data[month].revenue += sell; data[month].cost += buy; data[month].count++;
    data[year].revenue += sell; data[year].cost += buy; data[year].count++;
    save();
    bot.sendMessage(chatId, 'נשמר! רווח: ' + profit.toFixed(2) + ' ש"ח');
  } else if (text === '/month') {
    const d = data[getMonthKey()];
    if (!d) { bot.sendMessage(chatId, 'אין נתונים החודש'); return; }
    bot.sendMessage(chatId, 'דוח חודשי:\nהכנסות: ' + d.revenue.toFixed(2) + '\nעלויות: ' + d.cost.toFixed(2) + '\nרווח: ' + (d.revenue - d.cost).toFixed(2) + '\nעסקאות: ' + d.count);
  } else if (text === '/year') {
    const d = data[getYearKey()];
    if (!d) { bot.sendMessage(chatId, 'אין נתונים השנה'); return; }
    bot.sendMessage(chatId, 'דוח שנתי:\nהכנסות: ' + d.revenue.toFixed(2) + '\nעלויות: ' + d.cost.toFixed(2) + '\nרווח: ' + (d.revenue - d.cost).toFixed(2) + '\nעסקאות: ' + d.count);
  } else if (text === '/help') {
    bot.sendMessage(chatId, '/add [מכירה] [קנייה]\n/month - דוח חודשי\n/year - דוח שנתי');
  }
});
