const { Telegraf, Markup } = require('telegraf');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const { drawCards } = require('./tarot');
const {
    getUser,
    saveUser,
    alreadyAskedToday,
    saveUserQuestionDate,
} = require('./db');

const { scheduleDaily } = require('./scheduler');
const { generatePrediction, setBot } = require('./ai/index');

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('BOT_TOKEN is required');

const bot = new Telegraf(BOT_TOKEN);
setBot(bot);

const sessions = {};

// =====================
// ВСПОМОГАТЕЛЬНОЕ
// =====================
async function sendCards(ctx, cards) {
    for (const card of cards) {
        await ctx.telegram.sendPhoto(
            ctx.chat.id,
            { source: card.image },
            { caption: `🃏 ${card.name}\n${card.meaning}` }
        );
    }
}

// =====================
// START
// =====================
bot.start(async (ctx) => {
    sessions[ctx.from.id] = { step: 'birthdate' };

    await ctx.reply(
        'Привет ✨\nВведи свою дату рождения в формате ДД.ММ.ГГГГ'
    );
});

// =====================
// TEXT HANDLER
// =====================
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text.trim();
    const user = getUser(userId) || {};
    const session = sessions[userId] || {};

    // -------- дата рождения
    if (session.step === 'birthdate') {
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(text)) {
            return ctx.reply('Формат неверный. Пример: 21.03.1994');
        }

        await saveUser(userId, { birthdate: text });
        sessions[userId] = { step: 'cards' };

        return ctx.reply(
            'Выбери количество карт 🃏',
            Markup.keyboard([['1', '3', '5']]).resize().oneTime()
        );
    }

    // -------- выбор карт
    if (session.step === 'cards') {
        const count = Number(text);
        if (![1, 3, 5].includes(count)) {
            return ctx.reply('Выбери количество карт с клавиатуры.');
        }

        sessions[userId] = { step: 'question', cardsCount: count };

        return ctx.reply('Задай свой вопрос ✨');
    }

    // -------- вопрос
    if (session.step === 'question') {
        if (await alreadyAskedToday(userId)) {
            return ctx.reply('🕯️ Сегодня ты уже задавал вопрос. Попробуй завтра.');
        }

        const question = text.slice(0, 200);
        const cards = drawCards(session.cardsCount || 3);
        const birthdate = user.birthdate;

        await saveUserQuestionDate(userId);

        await ctx.reply('🔮 Перемешиваю колоду...');
        await sendCards(ctx, cards);

        const prediction = await generatePrediction(
            { cards, question, birthdate },
            { type: 'question', userId }
        );

        await ctx.reply(`✨ Твой расклад:\n\n${prediction}`);

        delete sessions[userId];
        return;
    }

    return ctx.reply('Напиши /start, чтобы начать заново.');
});

// =====================
// START BOT
// =====================
bot.launch();
scheduleDaily(bot);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
