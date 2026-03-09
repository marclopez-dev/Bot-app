// tb.js
<<<<<<< HEAD
const axios = require("axios");
=======
>>>>>>> eefec34 (Subo tb.js y la sesión de WhatsApp)
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

// Carpeta donde se guardará la sesión
<<<<<<< HEAD
if (!fs.existsSync("./session")) fs.mkdirSync("./session");
=======
if (!fs.existsSync("./wh_session")) fs.mkdirSync("./wh_session");
>>>>>>> eefec34 (Subo tb.js y la sesión de WhatsApp)

let sock;

async function startBot() {
  // Autenticación de múltiples archivos
<<<<<<< HEAD
  const { state, saveCreds } = await useMultiFileAuthState("./session");
=======
  const { state, saveCreds } = await useMultiFileAuthState("./wh_session");
>>>>>>> eefec34 (Subo tb.js y la sesión de WhatsApp)

  // Última versión de WhatsApp
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }));

  // Inicializa el socket
  sock = makeWASocket({
    auth: state,
    version,
    browser: Browsers.macOS("Desktop"),
    printQRInTerminal: false // true si quieres ver QR directamente
  });

  // Guardar credenciales automáticamente
  sock.ev.on("creds.update", saveCreds);

  // Evento de conexión
  sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      console.log("\n📲 Escanea este QR en WhatsApp:");
      qrcode.generate(qr, { small: true }); // QR en terminal
      // También podrías enviar este QR a tu servidor Flask si quieres
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
<<<<<<< HEAD
 

sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;

    // Llamada al bot de Flask
    try {
        const res = await axios.post("https://tu-app.onrender.com/responder", { mensaje: texto });
        const respuesta = res.data.respuesta;

        // Enviar respuesta por WhatsApp
        await sock.sendMessage(msg.key.remoteJid, { text: respuesta });
    } catch (error) {
        console.log("Error al llamar Flask:", error.message);
    }
});
=======
>>>>>>> eefec34 (Subo tb.js y la sesión de WhatsApp)
} // <- cerrar la función startBot correctamente

// Llamada inicial
startBot();





<<<<<<< HEAD





=======
>>>>>>> eefec34 (Subo tb.js y la sesión de WhatsApp)
