const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');

const WAIFU_API = 'https://api.waifu.pics/sfw';
const WAIFU_NSFW = 'https://api.waifu.pics/nsfw';

function normalizeType(input) {
    const lower = (input || '').toLowerCase().trim();
    if (lower === 'facepalm' || lower === 'face_palm') return 'facepalm';
    return lower;
}

async function convertMediaToSticker(mediaBuffer, isAnimated) {
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const inputExt = isAnimated ? 'gif' : 'jpg';
    const input = path.join(tmpDir, `anime_${Date.now()}.${inputExt}`);
    const output = path.join(tmpDir, `anime_${Date.now()}.webp`);
    fs.writeFileSync(input, mediaBuffer);

    const ffmpegCmd = isAnimated 
        ? `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=15" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 60 -compression_level 6 "${output}"`
        : `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${output}"`;

    await new Promise((resolve, reject) => {
        exec(ffmpegCmd, (err) => (err ? reject(err) : resolve()));
    });

    let webpBuffer = fs.readFileSync(output);
    const img = new webp.Image();
    await img.load(webpBuffer);

    const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': 'COOLGUY ANIME',
        'sticker-pack-publisher': 'COOLGUY MD V10',
        'emojis': ['🎌']
    };
    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    img.exif = exif;
    const finalBuffer = await img.save(null);
    try { fs.unlinkSync(input); } catch {}
    try { fs.unlinkSync(output); } catch {}
    return finalBuffer;
}

async function sendAnimu(sock, chatId, message, type) {
    try {
        // Try waifu.pics API
        let apiUrl = `${WAIFU_API}/${type}`;
        let res = await axios.get(apiUrl);
        let link = res.data.url || res.data.link;

        // If fails, try alternative endpoints
        if (!link) {
            const fallback = await axios.get(`https://api.waifu.im/search?included_tags=${type}&is_nsfw=false`);
            link = fallback.data.images?.[0]?.url;
        }

        if (!link) throw new Error('No link');

        const isGif = link.toLowerCase().endsWith('.gif');
        const resp = await axios.get(link, {
            responseType: 'arraybuffer',
            timeout: 20000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const mediaBuf = Buffer.from(resp.data);
        const stickerBuf = await convertMediaToSticker(mediaBuf, isGif);
        await sock.sendMessage(chatId, { sticker: stickerBuf }, { quoted: message });
        return;

    } catch (e) {
        console.log('Anime error:', e.message);
        // Fallback send as image
        try {
            const fallbackRes = await axios.get(`${WAIFU_API}/${type}`);
            if (fallbackRes.data.url) {
                await sock.sendMessage(chatId, { image: { url: fallbackRes.data.url }, caption: `*Anime: ${type}* \n© COOLGUY MD V10` }, { quoted: message });
                return;
            }
        } catch {}
        await sock.sendMessage(chatId, { text: `❌ Failed to fetch anime: ${type}\nTry: waifu, neko, shinobu, megumin, bully, cuddle, cry, hug, awoo, kiss, lick, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe` }, { quoted: message });
    }
}

async function animeCommand(sock, chatId, message, args) {
    const subArg = args && args[0] ? args[0] : '';
    const sub = normalizeType(subArg);

    const supported = [
        'waifu', 'neko', 'shinobu', 'megumin', 'awoo', 'bully', 'cuddle', 'cry', 'hug', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'happy', 'wink', 'poke', 'dance', 'cringe', 'kick', 'kill'
    ];

    try {
        if (!sub) {
            await sock.sendMessage(chatId, { text: `*🎌 COOLGUY ANIME MENU*\n\nUsage: .anime <type>\n\n*Types:*\n${supported.join(', ')}\n\nExample: .anime hug\n© COOLGUY MD V10` }, { quoted: message });
            return;
        }

        if (!supported.includes(sub)) {
            await sock.sendMessage(chatId, { text: `❌ Unsupported: ${sub}\n\nAvailable: ${supported.join(', ')}` }, { quoted: message });
            return;
        }

        await sendAnimu(sock, chatId, message, sub);
    } catch (err) {
        console.error('Error in anime command:', err);
        await sock.sendMessage(chatId, { text: '❌ Error fetching anime.' }, { quoted: message });
    }
}

module.exports = animeCommand;
module.exports.animeCommand = animeCommand;
module.exports.sendAnimu = sendAnimu;
