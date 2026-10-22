const settings = require('../settings');

async function ownerCommand(sock, chatId, message) {
    const PIC = 'https://raw.githubusercontent.com/davidmurungi114-ctrl/COOLGUY-MD.V10/refs/heads/main/assets/IMG-20261019-WA8138.jpg';
    
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${settings.botOwner || 'PROFESSOR COOLGUY'}
ORG:COOLGUY MD V10;
TEL;waid=${settings.ownerNumber || '256781539746'}:${settings.ownerNumber || '256781539746'}
END:VCARD`;

    try {
        await sock.sendMessage(chatId, {
            image: { url: PIC },
            caption: `*╭━〘 COOLGUY OWNER 〙━⊷*\n*┃* 👑 *Name:* ${settings.botOwner || 'PROFESSOR COOLGUY'}\n*┃* 📞 *Number:* ${settings.ownerNumber || '256781539746'}\n*┃* 🔥 *Bot:* COOLGUY MD V10\n*┃* 🌐 *Pair Site:* https://coolguy-md-v10-pair.onrender.com\n*╰━━━━━━━━━━━━━━━⊷*\n\n*Tap contact below to save! 👇*\n> © COOLGUY TECH`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'COOLGUY MD V10',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

        await sock.sendMessage(chatId, {
            contacts: { 
                displayName: settings.botOwner || 'PROFESSOR COOLGUY', 
                contacts: [{ vcard }] 
            },
        }, { quoted: message });

    } catch (e) {
        console.log('Owner Error:', e);
        await sock.sendMessage(chatId, {
            contacts: { displayName: settings.botOwner, contacts: [{ vcard }] },
        }, { quoted: message });
    }
}

module.exports = ownerCommand;
