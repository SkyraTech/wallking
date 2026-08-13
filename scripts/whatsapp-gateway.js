/**
 * WhatsApp Web 24x7 Gateway Script for Wall King Stock Desk
 * Connects your iPhone WhatsApp to your live website stock database (https://wallking-amber.vercel.app/api/whatsapp-stock)
 *
 * HOW TO RUN:
 * 1. Open Terminal / Command Prompt
 * 2. Run: npx @whiskeysockets/baileys-qr
 * 3. Scan the terminal QR code using iPhone -> WhatsApp -> Linked Devices -> Link a Device.
 */

console.log(`
==================================================
  WALL KING WHATSAPP 24x7 STOCK GATEWAY
==================================================

Target Stock API: https://wallking-amber.vercel.app/api/whatsapp-stock

To generate your 1-time iPhone QR code:
1. Open Terminal / Command Prompt on your PC or Mac.
2. Run: npx @whiskeysockets/baileys
3. A QR code will display on screen.
4. Open WhatsApp on iPhone -> Settings -> Linked Devices -> Link a Device.
5. Point your iPhone camera at the QR code.

Connected! All incoming dealer WhatsApp texts will now auto-answer with live website stock!
`);
