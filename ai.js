const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateMysticPrediction({ cards, question, birthdate }) {
    const prompt = `
Ты — мистический советник, создающий уникальные позитивные предсказания по раскладам Таро. Твой стиль: туманный, поэтичный, эзотерический. Пользователь родился ${birthdate}. Его вопрос: "${question}". Ему выпали карты: ${cards.map(c => c.name).join(', ')}.

Составь развернутое и вдохновляющее послание, в котором упоминается символика этих карт, мягко направляя человека к самопознанию, принятию и внутреннему покою.
  `;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Или gpt-4o
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 400,
    });

    return response.choices[0].message.content;
}

module.exports = { generateMysticPrediction };