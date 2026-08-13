const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");

function getLocalStock(queryText) {
  try {
    const stockFile = path.join(__dirname, "..", "data", "stock-db.json");
    if (!fs.existsSync(stockFile)) return null;
    const db = JSON.parse(fs.readFileSync(stockFile, "utf-8"));
    const raw = queryText.trim().toUpperCase();
    const stripped = raw.replace(/[^A-Z0-9]/g, "");

    let item = db.find((i) => i.designNo.toUpperCase() === raw);
    if (!item) {
      item = db.find((i) => i.designNo.toUpperCase().replace(/[^A-Z0-9]/g, "") === stripped);
    }
    if (!item) {
      item = db.find((i) => {
        const iClean = i.designNo.toUpperCase();
        const iStrip = iClean.replace(/[^A-Z0-9]/g, "");
        return raw.includes(iClean) || (iStrip.length >= 3 && stripped.includes(iStrip));
      });
    }
    return item;
  } catch (err) {
    console.error("Local stock read error:", err);
    return null;
  }
}

async function connectToWhatsApp() {
  console.log("\n==================================================");
  console.log("  WALL KING ZERO-COST WHATSAPP 24x7 BOT ENGINE");
  console.log("==================================================\n");
  console.log("Initializing WhatsApp Web session...");

  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const { fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

  const pino = require("pino");

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "warn" }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n==================================================");
      console.log("  SCAN THIS QR CODE WITH YOUR PHONE WHATSAPP:");
      console.log("  (WhatsApp -> Settings -> Linked Devices -> Link a Device)");
      console.log("==================================================\n");
      qrcode.generate(qr, { small: true });

      // Write QR to data file for website Live Pairing display
      try {
        const QRCode = require("qrcode");
        const dataUrl = await QRCode.toDataURL(qr);
        const qrFile = path.join(__dirname, "..", "data", "qr-code.json");
        fs.writeFileSync(qrFile, JSON.stringify({ qr, dataUrl, updatedAt: Date.now() }));
      } catch (e) {
        console.error("Failed to write qr-code.json:", e);
      }
    }

    if (connection === "close") {
      const err = lastDisconnect && lastDisconnect.error;
      const statusCode = err && err.output && err.output.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log("Connection closed. Reconnecting...", shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("\n==================================================");
      console.log("  SUCCESS! Connected to Wall King WhatsApp!");
      console.log("  Listening for dealer design queries 24x7...");
      console.log("==================================================\n");

      // Save connected status
      try {
        const qrFile = path.join(__dirname, "..", "data", "qr-code.json");
        fs.writeFileSync(qrFile, JSON.stringify({ connected: true, updatedAt: Date.now() }));
      } catch (e) {}
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    try {
      const msg = m.messages && m.messages[0];
      if (!msg || msg.key.fromMe || !msg.message) return;

      const incomingText =
        msg.message.conversation ||
        (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) ||
        "";

      if (!incomingText) return;

      console.log(`[Dealer Received]: ${incomingText}`);

      let replyMessage = "";

      // Try local dev server endpoint first
      try {
        const res = await fetch("http://localhost:3000/api/whatsapp-stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: incomingText }),
        });
        const data = await res.json();
        if (data && data.replyMessage) {
          replyMessage = data.replyMessage;
        }
      } catch (apiErr) {
        // Fallback to local data/stock-db.json file
        const item = getLocalStock(incomingText);
        replyMessage = item && item.quantity > 0 ? `Available - ${item.quantity} Rolls` : "Out of Stock";
      }

      if (replyMessage) {
        await sock.sendMessage(msg.key.remoteJid, { text: replyMessage });
        console.log(`[Auto Replied]: ${replyMessage}`);
      }
    } catch (e) {
      console.error("Error processing incoming WhatsApp message:", e);
    }
  });
}

connectToWhatsApp();

