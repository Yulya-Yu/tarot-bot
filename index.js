const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const { Low, JSONFile } = require('lowdb');
const { v4: uuid } = require('uuid');
const fs = require('fs');

// Токен бота
const token = '7835002316:AAEFLbkmIZxOsbwjYiN95CoxojIWcVgRzec';
const bot = new TelegramBot(token, { polling: true });

// База данных
const adapter = new JSONFile('db.json');
const db = new Low(adapter);
await db.read();
db.data ||= { users: [] };
await db.write();

// Простая колода карт
const deck = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
    "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
    "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
];

// Интерпретации карт
function generateInterpretation(card, question) {
    return `🌌 *${card}*  
  _Ответ на твой вопрос "${question}"_  
  ${card === 'The Tower' ?
        "В разрушении рождается новое. Сегодняшние трудности — это портал." :
        `Энергия этой карты ведёт тебя к внутреннему спокойствию. Повторяй:  
    *"Я открыта миру, и мир открыт для меня."*`}
  `;
}

// Команды
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = db.data.users.find(u => u.chatId === chatId);
    if (!user) {
        db.data.users.push({ chatId, questionCount: 0, birthdate: null });
        await db.write();
    }
    bot.sendMessage(chatId, 'Добро пожаловать в Таро-бота. Напиши свою дату рождения (в формате ДД.ММ.ГГГГ)');
});

// Получение даты рождения
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;

    if (dateRegex.test(text)) {
        const user = db.data.users.find(u => u.chatId === chatId);
        if (user) {
            user.birthdate = text;
            await db.write();
            bot.sendMessage(chatId, 'Дата рождения сохранена. Чтобы задать вопрос, используй команду /question');
        }
    }
});

// Вопрос пользователя
bot.onText(/\/question/, (msg) => {
    const chatId = msg.chat.id;
    const user = db.data.users.find(u => u.chatId === chatId);
    if (!user || user.questionCount >= 1) {
        return bot.sendMessage(chatId, 'Ты уже задавала вопрос сегодня. Новая возможность — завтра 🌒');
    }

    bot.sendMessage(chatId, 'Сколько карт вытянуть? (1-5)', {
        reply_markup: {
            keyboard: [['1', '3', '5']],
            one_time_keyboard: true
        }
    });

    bot.once('message', async (msg) => {
        const count = parseInt(msg.text);
        if (![1, 3, 5].includes(count)) return;

        bot.sendMessage(chatId, 'Введи свой вопрос:');
        bot.once('message', async (msg) => {
            const question = msg.text;
            const shuffled = deck.sort(() => 0.5 - Math.random()).slice(0, count);
            const responses = shuffled.map(card => generateInterpretation(card, question));
            bot.sendMessage(chatId, responses.join('\n\n'), { parse_mode: 'Markdown' });

            user.questionCount += 1;
            await db.write();
        });
    });
});

/// Ежедневный расклад в 9:00
schedule.scheduleJob('0 9 * * *', async () => {
    for (const user of db.data.users) {
        const dailyCard = deck[Math.floor(Math.random() * deck.length)];
        const message = `☀️ *Твой расклад на сегодня*  
    Карта дня: *${dailyCard}*  
    ${generateInterpretation(dailyCard, 'Какой настрой вести через этот день?')}`;

        bot.sendMessage(user.chatId, message, { parse_mode: 'Markdown' });
        user.questionCount = 0; // сброс лимита
    }
    await db.write();
});