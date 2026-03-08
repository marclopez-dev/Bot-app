// tb.js
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

// Carpeta donde se guardará la sesión
if (!fs.existsSync("./session")) fs.mkdirSync("./session");

let sock;

async function startBot() {
  // Autenticación de múltiples archivos
  const { state, saveCreds } = await useMultiFileAuthState("./session");

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
} // <- cerrar la función startBot correctamente

// Llamada inicial
startBot();
<<<<<<< HEAD










=======
>>>>>>> 522de84 (Bot listo para Render)
