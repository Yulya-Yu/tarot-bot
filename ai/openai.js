const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generate({ cards, question, birthdate }) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set');

    const cardsText = cards.map(c => `${c.name}: ${c.meaning}`).join('; ');
    const prompt = `Ты таролог. Пользователь задает вопрос: "${question}". Дата рождения: ${birthdate}. Карты: ${cardsText}. Дай краткое, позитивное, поддеривающее предсказание на основе этих карт.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'Ты таролог. Отвечай позитивно и ясно.' },
            { role: 'user', content: prompt }
        ],
        max_tokens: 200,
    });

    const text = response.choices?.[0]?.message?.content;
    if (!text) throw new Error('Invalid response from OpenAI');

    return text.trim();
}

module.exports = { generate };
