const settings = require("../settings");
async function aliveCommand(sock, chatId, message) {
    try {
        const message1 = `*🤖 COOLGUY-MD.V10 IS ACTIVE!*\n\n` +
                       `*Version:* ${settings.version}\n` +
                       `*Status:* Online ✅\n` +
                       `*Mode:* ${settings.mode || 'Public'}\n` +
                       `*Owner:* ${settings.botOwner || 'COOLGUY'}\n\n` +
                       `*🌟 Features:*\n` +
                       `• Group Management\n` +
                       `• Antilink / Antibadword Protection\n` +
                       `• Antime\n` +
                       `• Fun Commands\n` +
                       `• AI Chat (GPT & Gemini)\n` +
                       `• And more!\n\n` +
                       `Type *.menu* for full command list`;

        await sock.sendMessage(chatId, {
            text: message1,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'COOLGUY-MD.V10',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { text: 'COOLGUY-MD.V10 is alive and running! 🔥' }, { quoted: message });
    }
}

module.exports = aliveCommand;
