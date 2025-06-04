const { Telegraf } = require('telegraf');
const { Markup } = require('telegraf');
const { drawCards } = require('./tarot');
const { interpretCard } = require('./messages');
const { initDB, saveUser, getUser } = require('./db');
const { scheduleDaily } = require('./scheduler');

const bot = new Telegraf('YOUR_BOT_TOKEN');


(async () => {
    await initDB();
    scheduleDaily(bot);

    bot.start(async (ctx) => {
        await ctx.reply("Привет 🌒 Чтобы начать, напиши свою дату рождения (в формате ДД.ММ.ГГГГ):");
        await saveUser(ctx.from.id, { step: 'awaiting_birthdate' });
    });

    bot.on('text', async (ctx) => {
        const user = getUser(ctx.from.id);
        const text = ctx.message.text;

        if (user?.step === 'awaiting_birthdate') {
            await saveUser(ctx.from.id, { birthdate: text, step: 'ready' });
            return ctx.reply("Отлично! Теперь задай вопрос и выбери количество карт (например: 3 карты, вопрос: Что меня ждёт?)",             Markup.keyboard([
                ['1 карта', '3 карты', '5 карт']
            ]).oneTime().resize());
        }

        const match = text.match(/(\d+).*(вопрос|question):?\s*(.+)/i);
        if (match) {
            const count = Math.min(parseInt(match[1]), 5);
            const question = match[3];
            const cards = drawCards(count);
            const interpretations = cards.map(c => interpretCard(c, question)).join("\n\n");
            await ctx.replyWithMarkdown(`✨ *Твой расклад:*\n\n${interpretations}`);
        } else {
            ctx.reply("Пожалуйста, задай вопрос в формате: `3 карты, вопрос: Что меня ждёт?`");
        }
    });

    bot.launch();
})();