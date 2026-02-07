const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
});

const SYSTEM_PROMPT_FREE = `Ты — таролог.
Дай краткое, связное, поддерживающее предсказание.
Не перечисляй карты. Не используй спецсимволы и Markdown.
Даже если прогноз напряженный — закончи ободряюще.`;

const SYSTEM_PROMPT_PAID = `Ты — опытный таролог и интуитивный аналитик.
Говори прямо, глубоко и вдохновляюще.
Не перечисляй карты и не повторяй вопрос.
Даже при негативном прогнозе обязательно покажи выход.`;

async function generate({ cards, question, birthdate }) {
    if (!process.env.DEEPSEEK_API_KEY) {
        throw new Error('DEEPSEEK_API_KEY is not set');
    }

    const cardsText = cards.map(c => c.meaning).join(', ');

    const userPrompt = `
Вопрос: ${question}
Дата рождения: ${birthdate}
Смыслы карт: ${cardsText}
`;

    const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
            {
                role: 'system',
                content: SYSTEM_PROMPT_PAID,
            },
            {
                role: 'user',
                content: userPrompt,
            },
        ],
        temperature: 0.8,
        max_tokens: 300,
    });

    const text = response.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty DeepSeek response');

    return text.trim();
}

module.exports = { generate };
