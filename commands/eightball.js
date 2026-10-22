const eightBallResponses = [
    "Yes, definitely! ✅",
    "No way! ❌",
    "Ask again later. 🤔",
    "It is certain. 💯",
    "Very doubtful. 😒",
    "Without a doubt. 🔥",
    "My reply is no. 🙅‍♂️",
    "Signs point to yes. ✨"
];

async function eightBallCommand(sock, chatId, question) {
    if (!question) {
        await sock.sendMessage(chatId, { text: '❌ Please ask a question!\nExample: .8ball Will I be rich?' });
        return;
    }
    const randomResponse = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
    await sock.sendMessage(chatId, { text: `🎱 *8BALL*\n\nQ: ${question}\nA: ${randomResponse}\n\n© COOLGUY MD V10` });
}

module.exports = { eightBallCommand };
