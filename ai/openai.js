const { OpenAI } = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generate({ cards, question, birthdate }) {
    const cardsText = cards
        .map((c, i) => `Карта ${i + 1}: ${c.name} — ${c.meaning}`)
        .join('\n');

    const prompt = `
Ты — мистический таролог.
Дай позитивное, поддерживающее предсказание.

Дата рождения: ${birthdate}
Вопрос: ${question}

Карты:
${cardsText}
`;

    const res = await client.responses.create({
        model: "gpt-4o-mini",
        input: prompt,
    });

    return res.output_text.trim();
}

module.exports = { generate };
