const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const channelInfo = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'COOLGUY-MD.V10',
            serverMessageId: -1
        }
    }
};

async function clearSessionCommand(sock, chatId, msg) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { text: '❌ This command can only be used by the owner!', ...channelInfo }, { quoted: msg });
            return;
        }

        const sessionDir = path.join(__dirname, '..', 'session');

        if (!fs.existsSync(sessionDir)) {
            await sock.sendMessage(chatId, { text: '❌ Session directory not found!', ...channelInfo }, { quoted: msg });
            return;
        }

        let filesCleared = 0;
        let errors = 0;
        let errorDetails = [];

        await sock.sendMessage(chatId, { text: `🔍 Optimizing session files for better performance...`, ...channelInfo }, { quoted: msg });

        const files = fs.readdirSync(sessionDir);
        let appStateSyncCount = 0;
        let preKeyCount = 0;

        for (const file of files) {
            if (file.startsWith('app-state-sync-')) appStateSyncCount++;
            if (file.startsWith('pre-key-')) preKeyCount++;
        }

        for (const file of files) {
            if (file === 'creds.json') continue;
            try {
                const filePath = path.join(sessionDir, file);
                fs.unlinkSync(filePath);
                filesCleared++;
            } catch (error) {
                errors++;
                errorDetails.push(`Failed to delete ${file}: ${error.message}`);
            }
        }

        const message = `✅ Session files cleared successfully!\n\n📊 Statistics:\n• Total files cleared: ${filesCleared}\n• App state sync: ${appStateSyncCount}\n• Pre-key: ${preKeyCount}\n${errors > 0 ? `\n⚠️ Errors: ${errors}` : ''}\n\n© COOLGUY MD V10`;

        await sock.sendMessage(chatId, { text: message, ...channelInfo }, { quoted: msg });

    } catch (error) {
        console.error('Error in clearsession command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to clear session files!', ...channelInfo }, { quoted: msg });
    }
}

module.exports = clearSessionCommand;
