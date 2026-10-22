async function shipCommand(sock, chatId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This command is for groups only!\n> © COOLGUY MD V10' }, { quoted: message });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const ps = groupMetadata.participants.map(v => v.id);
        
        if (ps.length < 2) {
            await sock.sendMessage(chatId, { text: '❌ Not enough members to ship!\n> © COOLGUY MD V10' }, { quoted: message });
            return;
        }

        let firstUser = ps[Math.floor(Math.random() * ps.length)];
        let secondUser;
        do {
            secondUser = ps[Math.floor(Math.random() * ps.length)];
        } while (secondUser === firstUser);

        const formatMention = id => '@' + id.split('@')[0];

        await sock.sendMessage(chatId, {
            text: `💘 *COOLGUY LOVE MATCH* 💘\n\n${formatMention(firstUser)} ❤️ ${formatMention(secondUser)}\n\nCongratulations 💖🍻\n\n> © COOLGUY MD V10`,
            mentions: [firstUser, secondUser]
        }, { quoted: message });

    } catch (error) {
        console.error('Error in ship command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to ship! Make sure this is a group.\n> © COOLGUY MD V10' }, { quoted: message });
    }
}

module.exports = shipCommand;
