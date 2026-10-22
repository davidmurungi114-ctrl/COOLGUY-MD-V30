const fetch = require('node-fetch');

async function simpCommand(sock, chatId, message) {
    try {
        const contextInfo = message.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;
        const mentionedJid = contextInfo?.mentionedJid;
        const sender = message.key.participant || message.key.remoteJid;

        let who = quotedMsg 
            ? (contextInfo.participant || sender)
            : mentionedJid && mentionedJid[0] 
                ? mentionedJid[0] 
                : sender;

        let avatarUrl;
        try {
            avatarUrl = await sock.profilePictureUrl(who, 'image');
        } catch (error) {
            avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
        }

        const apiUrl = `https://some-random-api.com/canvas/misc/simpcard?avatar=${encodeURIComponent(avatarUrl)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error(`API status: ${response.status}`);

        const imageBuffer = await response.buffer();

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: '*😍 Your religion is simping*\n\n> © COOLGUY MD V10'
        }, { quoted: message });

    } catch (error) {
        console.error('Error in simp command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to generate simp card. Try again!\n> © COOLGUY MD V10'
        }, { quoted: message });
    }
}

module.exports = { simpCommand };
