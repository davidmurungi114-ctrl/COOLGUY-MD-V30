const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
const sharp = require('sharp');

async function blurCommand(sock, chatId, message, quotedMessage) {
    try {
        let imageBuffer;
        
        if (quotedMessage) {
            if (!quotedMessage.imageMessage) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Please reply to an image message' 
                }, { quoted: message });
                return;
            }
            
            const quoted = {
                message: {
                    imageMessage: quotedMessage.imageMessage
                }
            };
            
            imageBuffer = await downloadMediaMessage(
                quoted,
                'buffer',
                { },
                { }
            );
        } else if (message.message?.imageMessage) {
            imageBuffer = await downloadMediaMessage(
                message,
                'buffer',
                { },
                { }
            );
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Please reply to an image or send an image with caption .blur' 
            }, { quoted: message });
            return;
        }

        const resizedImage = await sharp(imageBuffer)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toBuffer();

        const blurredImage = await sharp(resizedImage)
            .blur(10)
            .toBuffer();

        await sock.sendMessage(chatId, {
            image: blurredImage,
            caption: '*[ ✔ ] Image Blurred Successfully*\n> © COOLGUY MD V10',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'COOLGUY MD V10',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in blur command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to blur image. Please try again later.' 
        }, { quoted: message });
    }
}

module.exports = blurCommand;
