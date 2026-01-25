const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generate({ cards, question, birthdate }) {
    const cardsText = cards
        .map((c, i) => `Карта ${i + 1}: ${c.name} — ${c.meaning}`)
        .join('\n');

    const prompt = `
Ты — мистический таролог.
Пиши мягко, позитивно, образно.
Без негатива и фатализма.

Дата рождения: ${birthdate}
Вопрос: ${question}

Карты:
${cardsText}
`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}

module.exports = { generate };
