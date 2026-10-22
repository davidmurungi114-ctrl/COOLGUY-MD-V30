const TicTacToe = require('../lib/tictactoe');
const games = {};

async function tictactoeCommand(sock, chatId, senderId, text) {
    try {
        if (Object.values(games).find(room => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(senderId))) {
            await sock.sendMessage(chatId, { text: '❌ You are in a game! Type *surrender* to quit.\n> © COOLGUY MD V10' });
            return;
        }

        let room = Object.values(games).find(room => room.state === 'WAITING' && (text ? room.name === text : true));

        if (room) {
            room.o = chatId;
            room.game.playerO = senderId;
            room.state = 'PLAYING';
            const arr = room.game.render().map(v => ({ 'X': '❎', 'O': '⭕', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣', '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣' }[v]));
            const str = `🎮 *TicTacToe Started - COOLGUY MD V10*\n\nWaiting for @${room.game.currentTurn.split('@')[0]}...\n\n${arr.slice(0, 3).join('')}\n${arr.slice(3, 6).join('')}\n${arr.slice(6).join('')}\n\n▢ Room ID: ${room.id}\n▢ Rules: Make 3 in a row to win\n> © COOLGUY MD V10`;
            await sock.sendMessage(chatId, { text: str, mentions: [room.game.currentTurn, room.game.playerX, room.game.playerO] });
        } else {
            room = { id: 'tictactoe-' + (+new Date), x: chatId, o: '', game: new TicTacToe(senderId, 'o'), state: 'WAITING' };
            if (text) room.name = text;
            await sock.sendMessage(chatId, { text: `⏳ *Waiting for opponent*\nType *.ttt ${text || ''}* to join!\n\n> © COOLGUY MD V10` });
            games[room.id] = room;
        }
    } catch (error) {
        await sock.sendMessage(chatId, { text: '❌ Error starting game.\n> © COOLGUY MD V10' });
    }
}

async function handleTicTacToeMove(sock, chatId, senderId, text) {
    try {
        const room = Object.values(games).find(room => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(senderId) && room.state === 'PLAYING');
        if (!room) return;
        const isSurrender = /^(surrender|give up)$/i.test(text);
        if (!isSurrender && !/^[1-9]$/.test(text)) return;
        if (senderId !== room.game.currentTurn && !isSurrender) {
            await sock.sendMessage(chatId, { text: '❌ Not your turn!\n> © COOLGUY MD V10' });
            return;
        }
        let ok = isSurrender ? true : room.game.turn(senderId === room.game.playerO, parseInt(text) - 1);
        if (!ok) { await sock.sendMessage(chatId, { text: '❌ Invalid move!\n> © COOLGUY MD V10' }); return; }

        let winner = room.game.winner;
        let isTie = room.game.turns === 9;
        const arr = room.game.render().map(v => ({ 'X': '❎', 'O': '⭕', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣', '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣' }[v]));

        if (isSurrender) {
            winner = senderId === room.game.playerX ? room.game.playerO : room.game.playerX;
            await sock.sendMessage(chatId, { text: `🏳️ @${senderId.split('@')[0]} surrendered! @${winner.split('@')[0]} wins!\n\n> © COOLGUY MD V10`, mentions: [senderId, winner] });
            delete games[room.id]; return;
        }

        let gameStatus = winner ? `🎉 @${winner.split('@')[0]} wins!` : isTie ? `🤝 Draw!` : `🎲 Turn: @${room.game.currentTurn.split('@')[0]}`;
        const str = `🎮 *TicTacToe - COOLGUY MD V10*\n\n${gameStatus}\n\n${arr.slice(0, 3).join('')}\n${arr.slice(3, 6).join('')}\n${arr.slice(6).join('')}\n\n▢ ❎: @${room.game.playerX.split('@')[0]}\n▢ ⭕: @${room.game.playerO.split('@')[0]}\n\n> © COOLGUY MD V10`;
        const mentions = [room.game.playerX, room.game.playerO, ...(winner ? [winner] : [room.game.currentTurn])];
        await sock.sendMessage(room.x, { text: str, mentions });
        if (room.x !== room.o) await sock.sendMessage(room.o, { text: str, mentions });
        if (winner || isTie) delete games[room.id];
    } catch (error) { console.error('Error in tictactoe move:', error); }
}

module.exports = { tictactoeCommand, handleTicTacToeMove };
