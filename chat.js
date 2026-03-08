const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const fetch = require('node-fetch');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: "/usr/bin/chromium",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    }
});

client.on("qr", async (qr) => {

    const qrImage = await QRCode.toDataURL(qr);

    await fetch("https://bot-app-t2bk.onrender.com/qr_generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ qr: qrImage })
    });

    console.log("QR enviado a Flask");
});

client.on("ready", () => {
    console.log("Bot conectado a WhatsApp");
});

client.initialize();