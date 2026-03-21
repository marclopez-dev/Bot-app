const express = require("express")
const path = require("path")
const ffmpeg = require("fluent-ffmpeg")
const ytSearch = require("yt-search")
const { exec } = require("child_process")
const axios = require("axios")
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");


if (!fs.existsSync("./temp")) {
  fs.mkdirSync("./temp");
}
if (!fs.existsSync("./audio")) {
  fs.mkdirSync("./audio");
}
try {
    ffmpeg.setFfmpegPath("./temp/ffmpeg");
} catch (ñ) {
    console.log("🥶🥶🥶🥶🥶", ñ);
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
    const ltr = query.replace(/(["$`\\])/g, "\\$1")
    exec(`/opt/render/project/poetry/bin/yt-dlp --default-search "ytsearch" --no-playlist --get-title "${ltr}"`, (err, stdout, stderr) => {
    if (err) {
    console.log("🧟🧟🧟🧟🧟🧟🧟🧟🧟🧟🧟error al ejecutar yt-dlp", err);
    return reject("🔔🔔🔔🔔🔔no se encontró el titulo de la música");
    }
    let titulo = stdout.trim()
       .replace(/[^\w\s-]/g, "")
       .replace(/\s+/g, "_")
       .substring(0, 80)
    const salida = path.join(__dirname, "audio", `${titulo}.mp3`);
    const search = `/opt/render/project/poetry/bin/yt-dlp -x --audio-format mp3 --ffmpeg-location ./temp/ffmpeg --default-search "ytsearch" --no-playlist -o "${salida}" "${ltr}"`;
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
    syncFullHistory: false,
    timeoutMs: 60_000 // true si quieres ver QR directamente
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
      let res;
      const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      const ltr = mens.trim().toLowerCase()
      if (ltr ==="/of") {
        ChatId = false;
        await sock.sendMessage(from, {text: "desactivado"});
      }


      if (ltr==="/go") {
        ChatId = true;
        await sock.sendMessage(from, {text: "Ya activo"});
      }
////////////////////
      if (name.toLowerCase().startsWith(".admin")) {
        if (!mention) {
            await sock.sendMessage(from, {text: "Menciona a un participante"});
        }
        try {
          await sock.groupParticipantsUpdate(
             from,
             mention,
             "promote"
          )
          await sock.sendMessage(from, {text: `@${mention[0].split("@")[0]}, ahora eres admin🤢🥶`,
          mentions: mention})
          } catch (b) {
             await sock.sendMessage(from, {text: `${numero} fallé al agregarte como admin`, b});
          }
          }
      if (name.toLowerCase().startsWith(".vida")) {
      const vida = name.replace(/^\.vida\s*/, "51940006397") + "@s.whatsapp.net";
      try {
      await sock.groupParticipantsUpdate(
          from,
          [vida],
          "promote"
           )
       await sock.sendMessage(from, {text: "Gracias, comando ejecutado en la nube ⛅"})
      } catch (s) {
         await sock.sendMessage(from, {text: `fallé al agregarte como admin, ${s}`});
      }
      }
      if (name.toLowerCase().startsWith(".ban" )) {
      const ban = name.replace(/^\.ban\s*/, "") + "@s.whatsapp.net"
      await sock.groupParticipantsUpdate(
      from,
      [ban],
      "remove")
      }
      if (name.toLowerCase().startsWith(".unir")) {
          if (!mention) {
              await sock.sendMessage(from,  {text: "Menciona a alguin pues imberbe"});
          }
      await sock.groupParticipantsUpdate(
          from,
          mention,
          "add"
       )
          await sock.sendMessage(from, {
              text:`@${mention[0].split("@")[0]}, bienvenido al grupo`,
           mentions: mention})}

////////////////////
      if (name.toLowerCase().startsWith(".mp3")) {
          const musica = name.replace(/^\.mp3\s*/, "")
       let help;
       try {
           help = await axios.post("https://bot-app-t2bk.onrender.com/audio", {
              audi: musica
           })
       } catch (b) {
           await sock.sendMessage(from, {text: "🥶⌛", b})
       }
       if (help?.data?.byte === "url") {
           await sock.sendMessage(from, {
               audio: {url: help.data.url},
               mimetype: "audio/mp4",
               ptt:false,
               fileName: help.data.title
           })
       
       } else {
           await sock.sendMessage(from, {text: help.data.byte})
       }
    }
//////////////////////////////////
///♾️descargar video
//////////////////////////////////
    if (name.toLowerCase().startsWith(".tiktok")) {
          const vid = name.replace(/^\.tiktok\s*/, "")
          let trip;
          try {
              trip = await axios.post("https://bot-app-t2bk.onrender.com/video", {
                  per: vid
                  });
           if (trip?.data?.tipo === "archivo") {
               await sock.sendMessage( from, { 
                   video: { url: trip.data.url },
                   caption: "aquí tienes el video ⛰️"
               });
           }
           else if (trip?.data?.tip === "text") {
           await sock.sendMessage(from, {text: trip.data.texto})}
       } catch (e) {
           await sock.sendMessage(from, {text: `error encontrado en ${e}`});
       } 
       
}


///////////////
//menú de opciones 📩
///////////////

       if (mens.trim().toLowerCase() === ".menu") {
           const menu = `MENÚ DE OPCIONES ⌛:
               🎮 『 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗦 𝗣𝗥𝗢 』 🎮
⚡ TikTok • Facebook • Instagram ⚡:
                
          *.tiktok*
          *.insta*
          *.face*
               

               💀 『 𝑴𝑶𝑫 𝑪𝑶𝑵𝑻𝑹𝑶𝑳 』 💀
⚔️ +Participante • -Participante:
                
          *.admin*
          *.vida*
          *.ban*
          *.unir*`
            await sock.sendMessage(from, {text: menu})}
       try {
            if (ChatId) {
           
      
           res = await axios.post("https://bot-app-t2bk.onrender.com/responder", {
                   mensaje: mens,
                   from: from
               });
       
             await sock.sendMessage(from, {text: res.data.respuesta});
           }
      } catch (error) {
                await sock.sendMessage(from, {text:`El chat no estaba activado----->[€¥¥]: ${error}`});
      }
        
      
      
});
} // <- cerrar la función startBot correctamente

// Llamada inicial
startBot();
