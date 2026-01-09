// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const app = express();

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));

// Rate limit (anti-spam)
const limiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10, 
  message: { error: "Too many requests, try again later." }
});
app.use("/api/contact", limiter);

// ROUTE CONTACT
app.post(
  "/api/contact",
  body("name").trim().notEmpty().withMessage("Name required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("message").trim().isLength({ min: 5 }).withMessage("Message too short"),
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.CONTACT_RECEIVER,
        subject: `New contact: ${name}`,
        text: `
Name: ${name}
Email: ${email}

Message:
${message}
        `,
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `
      });

      return res.json({ ok: true, message: "Message sent successfully." });

    } catch (error) {
      console.error("Mail error:", error);
      return res.status(500).json({ error: "Failed to send message." });
    }
  }
);

// Test route
app.get("/", (req, res) => res.send("Backend running"));

app.listen(process.env.PORT || 4000, () => {
  console.log("Server running on port " + (process.env.PORT || 4000));
});
