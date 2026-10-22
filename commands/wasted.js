const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

async function wastedCommand(sock, chatId, message) {
    let userToWaste;
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToWaste = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToWaste = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToWaste) {
        await sock.sendMessage(chatId, { text: '⚠️ Mention or reply to waste someone!\n> © COOLGUY MD V10', ...channelInfo }, { quoted: message });
        return;
    }

    try {
        let profilePic;
        try { profilePic = await sock.profilePictureUrl(userToWaste, 'image'); } catch { profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; }

        const wastedResponse = await axios.get(
            `https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`,
            { responseType: 'arraybuffer' }
        );

        await sock.sendMessage(chatId, {
            image: Buffer.from(wastedResponse.data),
            caption: `⚰️ *WASTED - COOLGUY MD V10*\n\n@${userToWaste.split('@')[0]} Got Wasted! 💀\n\n> © COOLGUY MD V10`,
            mentions: [userToWaste],
            ...channelInfo
        });
    } catch (error) {
        await sock.sendMessage(chatId, { text: '❌ Failed to create wasted image!\n> © COOLGUY MD V10', ...channelInfo }, { quoted: message });
    }
}

module.exports = wastedCommand;
