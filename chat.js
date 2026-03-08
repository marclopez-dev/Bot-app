const {Client, LocalAuth} = require('whatsapp-web.js');
const QRCode = require('qrcode');
function qr() {
const client = Client({
     authStrategy: new LocalAuth();
});
client.on("qr", async qr => {
    const qrImage = await QRCode.toDataUrl(qr);
    await fetch("/qr_generate", {
        method:"POST",
        headers: {
            "Content-Type": "application/json"},
        body: JSON.stringify({qr: qrImage});
});
});
client.initialize();
}