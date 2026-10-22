const { setAntitag, getAntitag, removeAntitag } = require('../lib/index');

async function handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '```For Group Admins Only!```' }, { quoted: message });
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const usage = `\`\`\`ANTITAG SETUP\n\n${prefix}antitag on\n${prefix}antitag set delete | kick\n${prefix}antitag off\n\n© COOLGUY MD V10\`\`\``;
            await sock.sendMessage(chatId, { text: usage }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntitag(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { text: '*_Antitag is already ON_*' }, { quoted: message });
                    return;
                }
                const result = await setAntitag(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? '*_Antitag has been turned ON ✅_*' : '*_Failed to turn on Antitag_*' 
                }, { quoted: message });
                break;

            case 'off':
                await removeAntitag(chatId, 'on');
                await sock.sendMessage(chatId, { text: '*_Antitag has been turned OFF ❌_*' }, { quoted: message });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { text: `*_Please specify: ${prefix}antitag set delete | kick_*` }, { quoted: message });
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick'].includes(setAction)) {
                    await sock.sendMessage(chatId, { text: '*_Invalid action. Choose delete or kick._*' }, { quoted: message });
                    return;
                }
                const setResult = await setAntitag(chatId, 'on', setAction);
                await sock.sendMessage(chatId, { 
                    text: setResult ? `*_Antitag action set to ${setAction} ✅_*` : '*_Failed to set_*' 
                }, { quoted: message });
                break;

            case 'get':
                const status = await getAntitag(chatId, 'on');
                await sock.sendMessage(chatId, { 
                    text: `*_Antitag Configuration:_*\nStatus: ${status?.enabled ? 'ON ✅' : 'OFF ❌'}\nAction: ${status?.action || 'delete'}` 
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, { text: `*_Use ${prefix}antitag for usage._*` }, { quoted: message });
        }
    } catch (error) {
        console.error('Error in antitag command:', error);
        await sock.sendMessage(chatId, { text: '*_Error processing antitag command_*' }, { quoted: message });
    }
}

async function handleTagDetection(sock, chatId, message, senderId) {
    try {
        const antitagSetting = await getAntitag(chatId, 'on');
        if (!antitagSetting || !antitagSetting.enabled) return false;

        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const messageText = (
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            ''
        );

        const textMentions = messageText.match(/@\d{5,}/g) || [];
        const totalMentions = Math.max(mentionedJids.length, textMentions.length);

        if (totalMentions >= 3) {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];
            const mentionThreshold = Math.ceil(participants.length * 0.5);

            if (totalMentions >= mentionThreshold || totalMentions >= 10) {
                const action = antitagSetting.action || 'delete';
                
                try {
                    await sock.sendMessage(chatId, { delete: message.key });
                } catch {}

                if (action === 'kick') {
                    await sock.groupParticipantsUpdate(chatId, [senderId], "remove");
                    await sock.sendMessage(chatId, {
                        text: `🚫 *Antitag!* @${senderId.split('@')[0]} kicked for tagging all members.`,
                        mentions: [senderId]
                    });
                } else {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *Tagall Detected!* @${senderId.split('@')[0]} Don't tag all!`,
                        mentions: [senderId]
                    });
                }
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error in tag detection:', error);
        return false;
    }
}

module.exports = { handleAntitagCommand, handleTagDetection };
