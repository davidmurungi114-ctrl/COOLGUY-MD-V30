const axios = require('axios');
let triviaGames = {};

async function startTrivia(sock, chatId) {
    if (triviaGames[chatId]) {
        sock.sendMessage(chatId, { text: '🎮 Trivia already running!\n> © COOLGUY MD V10' });
        return;
    }
    try {
        const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
        const q = response.data.results[0];
        triviaGames[chatId] = {
            question: q.question,
            correctAnswer: q.correct_answer,
            options: [...q.incorrect_answers, q.correct_answer].sort(),
        };
        sock.sendMessage(chatId, {
            text: `🧠 *TRIVIA - COOLGUY MD V10*\n\n❓ ${triviaGames[chatId].question}\n\n*Options:*\n${triviaGames[chatId].options.map((o,i)=>`${i+1}. ${o}`).join('\n')}\n\nReply with answer!\n> © COOLGUY MD V10`
        });
    } catch {
        sock.sendMessage(chatId, { text: '❌ Error fetching trivia!\n> © COOLGUY MD V10' });
    }
}

function answerTrivia(sock, chatId, answer) {
    if (!triviaGames[chatId]) {
        sock.sendMessage(chatId, { text: '❌ No trivia running!\n> © COOLGUY MD V10' });
        return;
    }
    const game = triviaGames[chatId];
    if (answer.toLowerCase() === game.correctAnswer.toLowerCase()) {
        sock.sendMessage(chatId, { text: `✅ Correct! Answer: ${game.correctAnswer}\n\n> © COOLGUY MD V10` });
    } else {
        sock.sendMessage(chatId, { text: `❌ Wrong! Correct was: ${game.correctAnswer}\n\n> © COOLGUY MD V10` });
    }
    delete triviaGames[chatId];
}

module.exports = { startTrivia, answerTrivia };
