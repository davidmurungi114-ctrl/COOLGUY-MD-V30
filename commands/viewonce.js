const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function viewonceCommand(sock, chatId, message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedImage = quoted?.imageMessage;
    const quotedVideo = quoted?.videoMessage;
    const quotedAudio = quoted?.audioMessage;

    if (quotedImage && quotedImage.viewOnce) {
        const stream = await downloadContentFromMessage(quotedImage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(chatId, { image: buffer, fileName: 'viewonce.jpg', caption: `👁️ *ViewOnce Revealed - COOLGUY MD V10*\n${quotedImage.caption || ''}\n\n> © COOLGUY MD V10` }, { quoted: message });
    } else if (quotedVideo && quotedVideo.viewOnce) {
        const stream = await downloadContentFromMessage(quotedVideo, 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(chatId, { video: buffer, fileName: 'viewonce.mp4', caption: `👁️ *ViewOnce Revealed - COOLGUY MD V10*\n${quotedVideo.caption || ''}\n\n> © COOLGUY MD V10` }, { quoted: message });
    } else if (quotedAudio && quotedAudio.viewOnce) {
        const stream = await downloadContentFromMessage(quotedAudio, 'audio');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(chatId, { audio: buffer, mimetype: 'audio/mp4', ptt: true }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, { text: '❌ Reply to a view-once image/video/audio!\n> © COOLGUY MD V10' }, { quoted: message });
    }
}

module.exports = viewonceCommand;
