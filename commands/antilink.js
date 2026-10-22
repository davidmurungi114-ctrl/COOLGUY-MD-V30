const { getAntilink, setAntilink, removeAntilink } = require('../lib/index');

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '```For Group Admins Only!```' }, { quoted: message });
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const usage = `\`\`\`ANTILINK SETUP\n\n${prefix}antilink on\n${prefix}antilink set delete | kick | warn\n${prefix}antilink off\n\n© COOLGUY MD V10\`\`\``;
            await sock.sendMessage(chatId, { text: usage }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntilink(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { text: '*_Antilink is already ON_*' }, { quoted: message });
                    return;
                }
                const result = await setAntilink(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? '*_Antilink has been turned ON ✅_*' : '*_Failed to turn on Antilink_*' 
                },{ quoted: message });
                break;

            case 'off':
                await removeAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { text: '*_Antilink has been turned OFF ❌_*' }, { quoted: message });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `*_Please specify: ${prefix}antilink set delete | kick | warn_*` 
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, { text: '*_Invalid action. Choose delete, kick, or warn._*' }, { quoted: message });
                    return;
                }
                const setResult = await setAntilink(chatId, 'on', setAction);
                await sock.sendMessage(chatId, { 
                    text: setResult ? `*_Antilink action set to ${setAction} ✅_*` : '*_Failed to set_*' 
                }, { quoted: message });
                break;

            case 'get':
                const status = await getAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { 
                    text: `*_Antilink Configuration:_*\nStatus: ${status?.enabled ? 'ON ✅' : 'OFF ❌'}\nAction: ${status?.action || 'delete'}` 
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, { text: `*_Use ${prefix}antilink for usage._*` }, { quoted: message });
        }
    } catch (error) {
        console.error('Error in antilink command:', error);
        await sock.sendMessage(chatId, { text: '*_Error processing antilink command_*' }, { quoted: message });
    }
}

async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    try {
        const config = await getAntilink(chatId, 'on');
        if (!config?.enabled) return false;

        const linkRegex = /(https?:\/\/\S+|www\.\S+|chat\.whatsapp\.com\/\S+|t\.me\/\S+)/i;
        if (!linkRegex.test(userMessage)) return false;

        // Delete message
        try {
            await sock.sendMessage(chatId, { delete: message.key });
        } catch {}

        const action = config.action || 'delete';

        if (action === 'kick') {
            await sock.sendMessage(chatId, { text: `*🚨 @${senderId.split('@')[0]} KICKED!* Link not allowed!`, mentions: [senderId] });
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
        } else if (action === 'warn') {
            await sock.sendMessage(chatId, { text: `*⚠️ WARNING @${senderId.split('@')[0]}* Links not allowed!`, mentions: [senderId] });
        } else {
            await sock.sendMessage(chatId, { text: `*🗑️ DELETED!* @${senderId.split('@')[0]} Links not allowed!`, mentions: [senderId] });
        }
        return true;
    } catch (e) {
        console.log('Antilink detection error:', e.message);
        return false;
    }
}

module.exports = { handleAntilinkCommand, handleLinkDetection };
