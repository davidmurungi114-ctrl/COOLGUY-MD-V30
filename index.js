/**
 * COOLGUY-MD.V10 Arsenal Edition - Main Bot
 * Copyright (c) 2026 COOLGUY TECH - Kampala Uganda
 * GitHub: davidmurungi114
 * Owner: 256750765838
 */

require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/myfunc')
const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion,
generateForwardMessageContent,
prepareWAMessageMedia,
generateWAMessageFromContent,
generateMessageID,
downloadContentFromMessage,
makeInMemoryStore,
jidDecode,
proto,
getAggregateVotesInPollMessage,
makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys')

const store = makeInMemoryStore({
logger: require('pino')().child({ level: 'silent', stream: 'store' })
})

const color = (text, color) => {
return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

async function startCOOLGUY() {
// AUTO-CREATE SESSION FOLDER - Fix for GitHub 404
if (!fs.existsSync('./session')) {
    fs.mkdirSync('./session', { recursive: true });
    console.log(color('Session folder created ✅', 'green'))
}

let { version, isLatest } = await fetchLatestBaileysVersion()
const { state, saveCreds } = await useMultiFileAuthState(`./session`)
const msgRetryCounterCache = new (await import('./lib/cache.js')).default()

const coolguy = makeWASocket({
version,
logger: require('pino')({ level: 'silent' }),
printQRInTerminal: false,
mobile: false,
browser: ["COOLGUY-MD.V10", "Chrome", "10.0"],
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, require('pino')({ level: "fatal" }).child({ level: "fatal" })),
},
markOnlineOnConnect: true,
generateHighQualityLinkPreview: true,
getMessage: async (key) => {
let jid = jidNormalizedUser(key.remoteJid)
let msg = await store.loadMessage(jid, key.id)
return msg?.message || ""
},
msgRetryCounterCache,
defaultQueryTimeoutMs: undefined,
})

store.bind(coolguy.ev)

coolguy.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect } = update
if (connection === 'close') {
let reason = new Boom(lastDisconnect?.error)?.output.statusCode
if (reason === DisconnectReason.badSession) { console.log(`Bad Session, Please Delete session and Scan Again`); process.exit() }
else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting...."); startCOOLGUY(); }
else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting..."); startCOOLGUY(); }
else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); process.exit() }
else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Delete session and Scan Again.`); process.exit(); }
else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); startCOOLGUY(); }
else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); startCOOLGUY(); }
else { console.log(`Unknown DisconnectReason: ${reason}|${connection}`); startCOOLGUY(); }
} else if (connection === "open") {
console.log(color('COOLGUY-MD.V10 Arsenal Edition Connected ✅', 'red'))
console.log(color('By COOLGUY TECH - Kampala Uganda 🇺🇬', 'red'))
let startup = `*🔴 COOLGUY-MD.V10 Arsenal Edition Connected!*\n\n*Owner:* 256750765838\n*By:* COOLGUY TECH\n*Mode:* ${global.public ? 'Public' : 'Self'}\n\nType *.menu* to start!`
coolguy.sendMessage(coolguy.user.id, { text: startup })
}
})

coolguy.ev.on('creds.update', saveCreds)
coolguy.ev.on('messages.upsert', async (chatUpdate) => {
try { await handleMessages(coolguy, chatUpdate, true) } catch (err) { console.log(err) }
})
coolguy.ev.on('group-participants.update', async (anu) => {
try { await handleGroupParticipantUpdate(coolguy, anu) } catch (err) { console.log(err) }
})
coolguy.ev.on('status.update', async (status) => {
try { await handleStatus(coolguy, status) } catch (err) { console.log(err) }
})

return coolguy
}

startCOOLGUY()

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.redBright(`Update ${__filename}`))
delete require.cache[file]
require(file)
})
