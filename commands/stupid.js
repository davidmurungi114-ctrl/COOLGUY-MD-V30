const fetch = require('node-fetch');

async function stupidCommand(sock, chatId, quotedMsg, mentionedJid, sender, args) {
    try {
        let who = quotedMsg ? quotedMsg.sender : mentionedJid && mentionedJid[0] ? mentionedJid[0] : sender;
        let text = args && args.length > 0 ? args.join(' ') : 'im+stupid';
        
        let avatarUrl;
        try {
            avatarUrl = await sock.profilePictureUrl(who, 'image');
        } catch (error) {
            avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
        }

        const apiUrl = `https://some-random-api.com/canvas/misc/its-so-stupid?avatar=${encodeURIComponent(avatarUrl)}&dog=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API status: ${response.status}`);

        const imageBuffer = await response.buffer();

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `*@${who.split('@')[0]}* is so stupid 😂\n\n> © COOLGUY MD V10`,
            mentions: [who]
        });

    } catch (error) {
        console.error('Error in stupid command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to generate stupid card. Try again!\n> © COOLGUY MD V10' });
    }
}

module.exports = { stupidCommand };
