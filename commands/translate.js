const fetch = require('node-fetch');

async function handleTranslateCommand(sock, chatId, message, match) {
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);

        let textToTranslate = '';
        let lang = '';

        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quotedMessage) {
            textToTranslate = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text || quotedMessage.imageMessage?.caption || quotedMessage.videoMessage?.caption || '';
            lang = match.trim();
        } else {
            const args = match.trim().split(' ');
            if (args.length < 2) {
                return sock.sendMessage(chatId, {
                    text: `*TRANSLATOR - COOLGUY MD V10*\n\nUsage:\n1. Reply with: .trt <lang>\n2. Or: .trt <text> <lang>\n\nEx: .trt hello fr\n\n> © COOLGUY MD V10`,
                    quoted: message
                });
            }
            lang = args.pop();
            textToTranslate = args.join(' ');
        }

        if (!textToTranslate) return sock.sendMessage(chatId, { text: '❌ No text to translate!\n> © COOLGUY MD V10', quoted: message });

        let translatedText = null;
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(textToTranslate)}`);
            if (res.ok) {
                const data = await res.json();
                if (data?.[0]?.[0]?.[0]) translatedText = data[0][0][0];
            }
        } catch {}
        if (!translatedText) {
            try {
                const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${lang}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data?.responseData?.translatedText) translatedText = data.responseData.translatedText;
                }
            } catch {}
        }

        if (!translatedText) throw new Error('All APIs failed');

        await sock.sendMessage(chatId, { text: `🌐 *COOLGUY MD V10 TRANSLATION*\n\n${translatedText}\n\n> © COOLGUY MD V10` }, { quoted: message });

    } catch (error) {
        await sock.sendMessage(chatId, { text: '❌ Translation failed!\n> © COOLGUY MD V10', quoted: message });
    }
}

module.exports = { handleTranslateCommand };
