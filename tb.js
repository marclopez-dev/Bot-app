const express = require("express")
const axios = require("axios")
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

// Carpeta donde se guardará la sesión
if (!fs.existsSync("./wh_session")) fs.mkdirSync("./wh_session");
const apk = express();
const PORT = process.env.PORT || 3000;
apk.get("/", (req, res) => res.send("bot activado"));
apk.listen(PORT, () => console.log(`servidor escuchando en ${PORT}`))
let sock = null;

async function startBot() {
  if (sock) {
      console.log("🥶el bot ya está iniciado🔪🧟")
  }
  const { state, saveCreds } = await useMultiFileAuthState("./wh_session");

  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }));

  sock = makeWASocket({
    auth: state,
    version,
    browser: Browsers.macOS("Desktop"),
    printQRInTerminal: false // true si quieres ver QR directamente
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      console.log("\n📲 Escanea este QR en WhatsApp:");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open") console.log("🚀 BOT CONECTADO");

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log("❌ Sesión cerrada. Borra la carpeta ./session para reiniciar.");
        return;
      }
      console.log("♻️ Reintentando conexión en 900ms...");
      sock = null;
      setTimeout(startBot, 8000);
    }
  });
  sock.ev.on("messages.upsert", async ( { messages } ) => {  
      const msg = messages[0];
      if (!msg || msg.key.fromMe) return;
      const from = msg.key.remoteJid;
      const mens = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
      if (mens) {
          try {
               const res = await axios.post("https://bot-app-t2bk.onrender.com/responder", {
                   mensaje: mens,
                   from: from
               });
               await sock.sendMessage(from, {text: res.data.respuesta});
               if (res.data.tipo === "archivo") {
                   await sock.sendMessage(from, { text: `descarga: ${res.data.url}`});
               }
          } catch (err) {
                console.log(err.message)
          }
      }
});
} // <- cerrar la función startBot correctamente

// Llamada inicial
startBot();
