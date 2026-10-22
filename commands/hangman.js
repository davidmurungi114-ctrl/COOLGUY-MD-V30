const words = ['javascript', 'bot', 'hangman', 'whatsapp', 'nodejs', 'coolguy', 'kenya', 'uganda', 'developer'];
let hangmanGames = {};

function startHangman(sock, chatId) {
    const word = words[Math.floor(Math.random() * words.length)];
    const maskedWord = '_ '.repeat(word.length).trim();

    hangmanGames[chatId] = {
        word,
        maskedWord: maskedWord.split(' '),
        guessedLetters: [],
        wrongGuesses: 0,
        maxWrongGuesses: 6,
    };

    sock.sendMessage(chatId, { text: `🎮 *HANGMAN - COOLGUY MD V10*\n\nGame started! The word is: ${maskedWord}\nGuess with: .guess <letter>` });
}

function guessLetter(sock, chatId, letter) {
    if (!hangmanGames[chatId]) {
        sock.sendMessage(chatId, { text: '❌ No game in progress. Start with .hangman' });
        return;
    }

    if (!letter || letter.length !== 1) {
        sock.sendMessage(chatId, { text: '❌ Send 1 letter only. Example: .guess a' });
        return;
    }

    letter = letter.toLowerCase();
    const game = hangmanGames[chatId];
    const { word, guessedLetters, maskedWord, maxWrongGuesses } = game;

    if (guessedLetters.includes(letter)) {
        sock.sendMessage(chatId, { text: `⚠️ You already guessed "${letter}". Try another.` });
        return;
    }

    guessedLetters.push(letter);

    if (word.includes(letter)) {
        for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) maskedWord[i] = letter;
        }
        sock.sendMessage(chatId, { text: `✅ Good guess! ${maskedWord.join(' ')}\nGuessed: ${guessedLetters.join(', ')}` });

        if (!maskedWord.includes('_')) {
            sock.sendMessage(chatId, { text: `🎉 Congratulations! You guessed: *${word}*\n\n© COOLGUY MD V10` });
            delete hangmanGames[chatId];
        }
    } else {
        game.wrongGuesses += 1;
        sock.sendMessage(chatId, { text: `❌ Wrong! "${letter}" not in word. You have ${maxWrongGuesses - game.wrongGuesses} tries left.\n${maskedWord.join(' ')}` });

        if (game.wrongGuesses >= maxWrongGuesses) {
            sock.sendMessage(chatId, { text: `💀 Game over! The word was: *${word}*` });
            delete hangmanGames[chatId];
        }
    }
}

module.exports = { startHangman, guessLetter };
