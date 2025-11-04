// api/contact.js
import nodemailer from "nodemailer";

// Protection anti-spam simple
const rateLimitMap = new Map();
const RATE_LIMIT = 3; // 3 messages max
const RATE_WINDOW = 60 * 60 * 1000; // par heure

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || {
    count: 0,
    resetTime: now + RATE_WINDOW,
  };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + RATE_WINDOW;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  rateLimitMap.set(ip, record);
  return true;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: "Trop de requêtes. Réessayez dans une heure.",
    });
  }

  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  if (message.length < 10) {
    return res
      .status(400)
      .json({ error: "Message trop court (min 10 caractères)" });
  }

  if (message.length > 2000) {
    return res
      .status(400)
      .json({ error: "Message trop long (max 2000 caractères)" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Email invalide" });
  }

  try {
    // Configuration de l'email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email cyberpunk style
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `📩 [VRAITH.DEV] Message de ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: 'Courier New', monospace;
                background: #0a0e1a;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: linear-gradient(135deg, #0a0e1a 0%, #0f1419 100%);
                border: 2px solid #00ffff;
                border-radius: 8px;
                box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
              }
              .header {
                background: linear-gradient(90deg, #00ffff 0%, #00d9ff 100%);
                color: #000;
                padding: 20px;
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 2px;
                text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
              }
              .content {
                padding: 30px;
                color: #00ffff;
              }
              .field {
                background: rgba(0, 0, 0, 0.6);
                border-left: 4px solid #00ffff;
                padding: 15px;
                margin: 15px 0;
                border-radius: 4px;
              }
              .field-label {
                color: #00ffff;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8px;
                opacity: 0.8;
              }
              .field-value {
                color: #fff;
                font-size: 16px;
                line-height: 1.6;
              }
              .field-value a {
                color: #00ffff;
                text-decoration: none;
                border-bottom: 1px dashed #00ffff;
              }
              .message-box {
                background: #000;
                border: 1px solid rgba(0, 255, 255, 0.3);
                padding: 20px;
                margin-top: 10px;
                border-radius: 4px;
                white-space: pre-wrap;
                word-wrap: break-word;
                color: #00ffff;
                font-family: 'Courier New', monospace;
              }
              .footer {
                text-align: center;
                padding: 20px;
                font-size: 11px;
                color: rgba(0, 255, 255, 0.5);
                border-top: 1px solid rgba(0, 255, 255, 0.2);
              }
              .scan-line {
                height: 2px;
                background: linear-gradient(90deg, transparent, #00ffff, transparent);
                animation: scan 3s linear infinite;
              }
              @keyframes scan {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                ⚡ NOUVEAU MESSAGE ⚡
              </div>
              <div class="scan-line"></div>
              <div class="content">
                <div class="field">
                  <div class="field-label">◉ Nom</div>
                  <div class="field-value">${name}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">◉ Email</div>
                  <div class="field-value">
                    <a href="mailto:${email}">${email}</a>
                  </div>
                </div>
                
                <div class="field">
                  <div class="field-label">◉ Message</div>
                  <div class="message-box">${message.replace(
                    /\n/g,
                    "<br>"
                  )}</div>
                </div>
              </div>
              <div class="footer">
                📡 Transmis depuis VRAITH.DEV<br>
                ${new Date().toLocaleString("fr-FR")}
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Message envoyé avec succès ! Je vous répondrai bientôt.",
    });
  } catch (error) {
    console.error("Erreur email:", error);
    return res.status(500).json({
      error:
        "Erreur lors de l'envoi. Veuillez réessayer ou me contacter directement.",
    });
  }
}
