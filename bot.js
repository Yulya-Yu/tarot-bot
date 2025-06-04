const { Telegraf, Markup } = require('telegraf');
const { scheduleDaily } = require('./scheduler');
const { getUser, saveUser } = require('./db');
const { drawCards } = require('./tarot');
const { Configuration, OpenAIApi } = require('openai');

const BOT_TOKEN = process.env.BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!BOT_TOKEN) throw new Error('BOT_TOKEN is required');
if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required');

const bot = new Telegraf(BOT_TOKEN);

const openai = new OpenAIApi(new Configuration({
    apiKey: OPENAI_API_KEY,
}));

const sessions = {};

bot.start(async (ctx) => {
    await ctx.reply(
        `Привет! Для начала, пожалуйста, введи свою дату рождения в формате ДД.ММ.ГГГГ.`,
    );
    sessions[ctx.from.id] = { step: 'awaiting_birthdate' };
});

bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text.trim();
    const user = getUser(userId) || {};

    if (!sessions[userId]) sessions[userId] = {};

    const session = sessions[userId];

    if (session.step === 'awaiting_birthdate') {
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(text)) {
            return ctx.reply('Пожалуйста, введи дату рождения в формате ДД.ММ.ГГГГ');
        }
        session.birthdate = text;
        await saveUser(userId, { birthdate: text });
        session.step = 'awaiting_cards_count';

        return ctx.reply(
            'Отлично! Теперь выбери количество карт для расклада.',
            Markup.keyboard([['1', '3', '5']])
                .oneTime()
                .resize(),
        );
    }

    if (session.step === 'awaiting_cards_count') {
        const count = parseInt(text, 10);
        if (![1, 3, 5].includes(count)) {
            return ctx.reply('Пожалуйста, выбери количество карт из клавиатуры (1, 3 или 5).');
        }
        session.cardsCount = count;
        session.step = 'awaiting_question';

        return ctx.reply('Хорошо! Теперь введи свой вопрос для расклада.');
    }

    if (session.step === 'awaiting_question') {
        const today = new Date().toISOString().split('T')[0];

        if (user.lastQuestionDate === today) {
            return ctx.reply('🕯️ Ты уже получил ответ на свой вопрос сегодня. Попробуй завтра.');
        }

        const question = text;
        const cards = drawCards(session.cardsCount || 3);

        await saveUser(userId, { lastQuestionDate: today });

        const prediction = await generateOpenAIPrediction({
            cards,
            question,
            birthdate: user.birthdate || session.birthdate,
        });

        await ctx.reply(`🔮 Твой расклад:\n\n${prediction}`);

        delete sessions[userId];
        return;
    }

    return ctx.reply('Напиши /start, чтобы начать расклад.');
});

async function generateOpenAIPrediction({ cards, question, birthdate }) {
    const cardsDescription = cards.map((card, i) =>
        `Карта ${i + 1}: ${card.name} — ${card.meaning}`
    ).join('\n');

    const systemPrompt = `
Ты — мистический советчик. Дай позитивное, вдохновляющее, мистическое толкование расклада на Таро с акцентом на аффирмации и заботу о себе.
Дата рождения пользователя: ${birthdate}
Вопрос пользователя: ${question}
Карты:
${cardsDescription}
`;

    try {
        const completion = await openai.createChatCompletion({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Сформируй утонченное и позитивное предсказание.' },
            ],
            max_tokens: 500,
            temperature: 0.8,
        });
        return completion.data.choices[0].message.content.trim();
    } catch (err) {
        console.error('OpenAI error:', err);
        return generateFallbackPrediction({ cards, question, birthdate });
    }
}

function generateFallbackPrediction({ cards, question, birthdate }) {
    const affirmations = [
        "Ты заслуживаешь покоя и ясности.",
        "Сегодня твоя душа раскроется навстречу свету.",
        "Будущее открыто перед тобой — просто сделай шаг.",
        "Ты сильнее, чем кажешься, и мудрее, чем думаешь.",
    ];

    const intro = `✨ Твоя душа задала вопрос: *${question}*.\nКарты выбраны с учётом твоего пути.\n`;
    const cardLines = cards.map(card => `🃏 *${card.name}*: ${card.meaning}`).join('\n');
    const affirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

    return `${intro}\n${cardLines}\n\n🔮 _${affirmation}_`;
}

bot.launch();
scheduleDaily(bot);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Экспортируем функции для scheduler.js
module.exports = {
    generateOpenAIPrediction,
    generateFallbackPrediction,
};
