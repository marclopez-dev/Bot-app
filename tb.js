const express = require("express")
const ytSearch = require("yt-search")
const { exec } = require("child_process")
const axios = require("axios")
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");


if (!fs.existsSync("./temp")) {
  fs.mkdirSync("./temp");
}
// Carpeta donde se guardará la sesión
if (!fs.existsSync("./wh_session")) fs.mkdirSync("./wh_session");
const apk = express();
const PORT = process.env.PORT || 3000;
apk.get("/", (req, res) => res.send("bot activado"));
apk.listen(PORT, () => console.log(`servidor escuchando en ${PORT}`))
let sock = null;
let ChatId = false;


exec("which yt-dlp", (err, stdout, stderr) => {
    if (err) {
        console.log("yt-dlp no encontrado en el PATH");
    } else {
        console.log("yt-dlp está en:", stdout.trim());
    }
});
/////////////////////
////////DESCARGAR MÚSICA 🎵 🎼 
/////////////////////
async function downloadMusica(query) {
    return new Promise((resolve, reject) => {
    exec(`/opt/render/project/.venv/bin/yt-dlp --get-title "ytsearch:${query}"`, (err, stdout, stderr) => {
    if (err) {
    console.log("🧟🧟🧟🧟🧟🧟🧟🧟🧟🧟🧟audio no enviado", stderr);
    return reject("🔔🔔🔔🔔🔔no se encontró el titulo de la música");
    }
    let titulo = stdout.trim()
       .replace(/[^\w\s-]/g, "")
       .replace(/\s+/g, "_")
       .substring(0, 80)
    const salida = `./temp/${titulo}.mp3`
    const search = `/opt/render/project/.venv/bin/yt-dlp -x --audio-format mp3 -o "${salida}" "ytsearch:${query}"`
    exec(search, (err1, stdout1, stderr1) => {
    if (err1) {
        console.log("ERROR ENCONTRADO EN: ", stderr1);
        return reject("📩📩📩📩📩📩📩error al descargar el audio");
    }
    resolve(salida);
   });
  });
 });
}
/////////////////
/////////////////







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
    printQRInTerminal: false,
    syncFullHistory: false // true si quieres ver QR directamente
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  sock.ev.on("messages.upsert", async ( { messages } ) => {  
      const msg = messages[0];
      if (!msg || msg.key.fromMe) return;
      const from = msg.key.remoteJid;
      const mens = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
      if (!mens) return;
      const name = mens.trim()
      const ltr = mens.trim().toLowerCase()
      if (ltr ==="/of") {
        ChatId = false;
        await sock.sendMessage(from, {text: "desactivado"});
      }


      if (ltr==="/go") {
        ChatId = true;
        await sock.sendMessage(from, {text: "Ya activo"});
      }

      if (name.toLowerCase().startsWith(".mp3")) {
          const musica = name.replace(/^\.mp3\s*/, "")
       try {
          const letra = await downloadMusica(musica);
          const dow = letra.split("/").pop();
          await sock.sendMessage(from, {text: `descargando: ${dow}`});
          await sock.sendMessage(from, {
              audio: {url: letra},
              mimetype: "audio/mpeg"
              }
          );
          await sock.sendMessage(from, {text: `Musica enviada a: ${from}`});
       } catch (w) {
           await sock.sendMessage(from, {text: `error al descargar la música: ${w}`});
       } 
    }
          
          





      let res;
      try {
           res = await axios.post("https://bot-app-t2bk.onrender.com/responder", {
                   mensaje: mens,
                   from: from
               });
       } catch (err) {
            await sock.sendMessage(from, {text: `error en la petición: ${err}`});
       }

       


       try {
           if (res?.data?.tipo === "archivo") {
               await sock.sendMessage( from, { 
                   video: { url: res.data.url },
                   caption: "aquí tienes el video ⛰️"
               });
           }
       } catch (e) {
           await sock.sendMessage(from, {text: `error encontrado en ${e}`});
       } 
       

       try {
            if (res?.data?.respuesta && ChatId) {
             await sock.sendMessage(from, {text: res.data.respuesta});
           }
      } catch (error) {
                await sock.sendMessage(from, {text:`El chat no estaba activado----->[€¥¥]: ${error}`});
      }
        
      
      
});
} // <- cerrar la función startBot correctamente

// Llamada inicial
startBot();
