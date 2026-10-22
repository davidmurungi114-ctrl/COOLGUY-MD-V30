const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const messageStore = new Map();
const CONFIG_PATH = path.join(__dirname, '../data/antidelete.json');
const TEMP_MEDIA_DIR = path.join(__dirname, '../tmp');

if (!fs.existsSync(TEMP_MEDIA_DIR)) {
    fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

function getFolderSizeInMB(folderPath) {
    try {
        const files = fs.readdirSync(folderPath);
        let totalSize = 0;
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            if (fs.statSync(filePath).isFile()) {
                totalSize += fs.statSync(filePath).size;
            }
        }
        return totalSize / (1024 * 1024);
    } catch {
        return 0;
    }
}

const cleanTempFolderIfLarge = () => {
    try {
        const sizeMB = getFolderSizeInMB(TEMP_MEDIA_DIR);
        if (sizeMB > 200) {
            const files = fs.readdirSync(TEMP_MEDIA_DIR);
            for (const file of files) {
                fs.unlinkSync(path.join(TEMP_MEDIA_DIR, file));
            }
        }
    } catch {}
};

setInterval(cleanTempFolderIfLarge, 60 * 1000);

function loadAntideleteConfig() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) return { enabled: false };
        return JSON.parse(fs.readFileSync(CONFIG_PATH));
    } catch {
        return { enabled: false };
    }
}

function saveAntideleteConfig(config) {
    try {
        const dir = path.dirname(CONFIG_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch {}
}

const isOwnerOrSudo = require('../lib/isOwner');

async function handleAntideleteCommand(sock, chatId, message, match) {
    const senderId = message.key.participant || message.key.remoteJid;
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
    
    if (!message.key.fromMe && !isOwner) {
        return sock.sendMessage(chatId, { text: '*Only the bot owner can use this command.*' }, { quoted: message });
    }

    const config = loadAntideleteConfig();

    if (!match) {
        return sock.sendMessage(chatId, {
            text: `*ANTIDELETE SETUP*\n\nCurrent Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n\n*.antidelete on* - Enable\n*.antidelete off* - Disable`
        }, {quoted: message});
    }

    if (match === 'on') config.enabled = true;
    else if (match === 'off') config.enabled = false;
    else return sock.sendMessage(chatId, { text: '*Invalid command. Use .antidelete to see usage.*' }, {quoted:message});

    saveAntideleteConfig(config);
    return sock.sendMessage(chatId, { text: `*Antidelete ${match === 'on' ? 'enabled' : 'disabled'}*` }, {quoted:message});
}

async function downloadMediaBuffer(messageContent, type) {
    try {
        const stream = await downloadContentFromMessage(messageContent, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch {
        return null;
    }
}

async function storeMessage(sock, message) {
    try {
        const config = loadAntideleteConfig();
        if (!config.enabled) return;
        if (!message.key?.id) return;

        const messageId = message.key.id;
        let content = '';
        let mediaType = '';
        let mediaPath = '';
        let isViewOnce = false;
        const sender = message.key.participant || message.key.remoteJid;

        const viewOnceContainer = message.message?.viewOnceMessageV2?.message || message.message?.viewOnceMessage?.message;
        if (viewOnceContainer) {
            if (viewOnceContainer.imageMessage) {
                mediaType = 'image';
                content = viewOnceContainer.imageMessage.caption || '';
                const buffer = await downloadMediaBuffer(viewOnceContainer.imageMessage, 'image');
                if (buffer) {
                    mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
                    fs.writeFileSync(mediaPath, buffer);
                    isViewOnce = true;
                }
            } else if (viewOnceContainer.videoMessage) {
                mediaType = 'video';
                content = viewOnceContainer.videoMessage.caption || '';
                const buffer = await downloadMediaBuffer(viewOnceContainer.videoMessage, 'video');
                if (buffer) {
                    mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
                    fs.writeFileSync(mediaPath, buffer);
                    isViewOnce = true;
                }
            }
        } else if (message.message?.conversation) {
            content = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            content = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage) {
            mediaType = 'image';
            content = message.message.imageMessage.caption || '';
            const buffer = await downloadMediaBuffer(message.message.imageMessage, 'image');
            if (buffer) {
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
                fs.writeFileSync(mediaPath, buffer);
            }
        } else if (message.message?.stickerMessage) {
            mediaType = 'sticker';
            const buffer = await downloadMediaBuffer(message.message.stickerMessage, 'sticker');
            if (buffer) {
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
                fs.writeFileSync(mediaPath, buffer);
            }
        } else if (message.message?.videoMessage) {
            mediaType = 'video';
            content = message.message.videoMessage.caption || '';
            const buffer = await downloadMediaBuffer(message.message.videoMessage, 'video');
            if (buffer) {
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
                fs.writeFileSync(mediaPath, buffer);
            }
        } else if (message.message?.audioMessage) {
            mediaType = 'audio';
            const buffer = await downloadMediaBuffer(message.message.audioMessage, 'audio');
            if (buffer) {
                const mime = message.message.audioMessage.mimetype || '';
                const ext = mime.includes('ogg') ? 'ogg' : 'mp3';
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.${ext}`);
                fs.writeFileSync(mediaPath, buffer);
            }
        }

        messageStore.set(messageId, {
            content, mediaType, mediaPath, sender,
            group: message.key.remoteJid.endsWith('@g.us') ? message.key.remoteJid : null,
            timestamp: new Date().toISOString()
        });

        if (isViewOnce && mediaType && fs.existsSync(mediaPath)) {
            try {
                const ownerNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const senderName = sender.split('@')[0];
                const mediaOptions = { caption: `*Anti-ViewOnce ${mediaType}*\nFrom: @${senderName}`, mentions: [sender] };
                if (mediaType === 'image') await sock.sendMessage(ownerNumber, { image: { url: mediaPath }, ...mediaOptions });
                else if (mediaType === 'video') await sock.sendMessage(ownerNumber, { video: { url: mediaPath }, ...mediaOptions });
                try { fs.unlinkSync(mediaPath); } catch {}
            } catch {}
        }

    } catch (err) {
        console.error('storeMessage error:', err);
    }
}

async function handleMessageRevocation(sock, revocationMessage) {
    try {
        const config = loadAntideleteConfig();
        if (!config.enabled) return;

        const messageId = revocationMessage.message.protocolMessage.key.id;
        const deletedBy = revocationMessage.participant || revocationMessage.key.participant || revocationMessage.key.remoteJid;
        const ownerNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        if (deletedBy.includes(sock.user.id) || deletedBy === ownerNumber) return;

        const original = messageStore.get(messageId);
        if (!original) return;

        const sender = original.sender;
        const senderName = sender.split('@')[0];
        const groupName = original.group ? (await sock.groupMetadata(original.group)).subject : '';

        const time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

        let text = `*🔰 ANTIDELETE REPORT 🔰*\n\n*🗑️ Deleted By:* @${deletedBy.split('@')[0]}\n*👤 Sender:* @${senderName}\n*📱 Number:* ${sender}\n*🕒 Time:* ${time}\n`;
        if (groupName) text += `*👥 Group:* ${groupName}\n`;
        if (original.content) text += `\n*💬 Deleted Message:*\n${original.content}`;

        await sock.sendMessage(ownerNumber, { text, mentions: [deletedBy, sender] });

        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            const mediaOptions = { caption: `*Deleted ${original.mediaType}*\nFrom: @${senderName}`, mentions: [sender] };
            try {
                if (original.mediaType === 'image') await sock.sendMessage(ownerNumber, { image: { url: original.mediaPath }, ...mediaOptions });
                else if (original.mediaType === 'sticker') await sock.sendMessage(ownerNumber, { sticker: { url: original.mediaPath }, ...mediaOptions });
                else if (original.mediaType === 'video') await sock.sendMessage(ownerNumber, { video: { url: original.mediaPath }, ...mediaOptions });
                else if (original.mediaType === 'audio') await sock.sendMessage(ownerNumber, { audio: { url: original.mediaPath }, mimetype: 'audio/mpeg', ptt: false, ...mediaOptions });
            } catch {}
            try { fs.unlinkSync(original.mediaPath); } catch {}
        }
        messageStore.delete(messageId);
    } catch (err) {
        console.error('handleMessageRevocation error:', err);
    }
}

module.exports = { handleAntideleteCommand, handleMessageRevocation, storeMessage };
