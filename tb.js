
const axios = require("axios")
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

// Carpeta donde se guardará la sesión
if (!fs.existsSync("./session")) fs.mkdirSync("./session");

let sock;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

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
      setTimeout(startBot, 900);
    }
  });
  sock.ev.on("messages.upsert", async (m) => {
      const mens = m.messages[0].mensaje?.conversación;
      const from = m.message[0].key.remoteJid;
      if (mens) {
          try {
               const res = await axios.post("coloca tu enlace", {
                   mensaje: mens,
                   from: from
               });
               await stock.sendMessage(from, {text: res.data.respuesta});
          } catch (err) {
                console.log(err.message);
          }
      }
});
} // <- cerrar la función startBot correctamente

// Llamada inicial
startBot();
