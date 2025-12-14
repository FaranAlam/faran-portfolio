import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import Subscriber from "./models/Subscriber.js";
import ContactMessage from "./models/ContactMessage.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");
dotenv.config({ path: envPath });

const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.CORS_ORIGIN || "*";
const CONTACT_TO = process.env.CONTACT_TO || "";

app.use(helmet());
app.use(cors({ origin: allowedOrigin === "*" ? true : allowedOrigin.split(","), credentials: true }));
app.use(bodyParser.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const contactLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20 });
const subscribeLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 40 });
app.use(limiter);

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/newsletter";

mongoose
    .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error", err));

const isValidEmail = (email) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email || "");

const sanitizeInput = (value = "", max = 500) => {
    return value.replace(/[<>]/g, "").trim().slice(0, max);
};

const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;
    if (!host || !port || !user || !pass) return null;
    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
};

const transporter = createTransporter();

app.get("/health", (_req, res) => {
    res.json({ status: "ok", db: mongoose.connection.readyState });
});

app.get("/subscribers", async (_req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
        return res.json(subscribers);
    } catch (err) {
        console.error("Failed to fetch subscribers", err);
        return res.status(500).json({ message: "Failed to fetch subscribers" });
    }
});

app.get("/messages", async (_req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ submittedAt: -1 });
        return res.json(messages);
    } catch (err) {
        console.error("Failed to fetch messages", err);
        return res.status(500).json({ message: "Failed to fetch messages" });
    }
});

app.delete("/subscribers/:id", async (req, res) => {
    try {
        const result = await Subscriber.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Subscriber not found" });
        }
        return res.json({ message: "Subscriber deleted successfully" });
    } catch (err) {
        console.error("Failed to delete subscriber", err);
        return res.status(500).json({ message: "Failed to delete subscriber" });
    }
});

app.delete("/messages/:id", async (req, res) => {
    try {
        const result = await ContactMessage.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Message not found" });
        }
        return res.json({ message: "Message deleted successfully" });
    } catch (err) {
        console.error("Failed to delete message", err);
        return res.status(500).json({ message: "Failed to delete message" });
    }
});

app.get("/smtp-check", async (_req, res) => {
    if (!transporter) {
        return res.status(200).json({ configured: false, message: "SMTP not configured" });
    }
    try {
        // verify checks the connection configuration
        await transporter.verify();
        return res.status(200).json({ configured: true, message: "SMTP is ready" });
    } catch (err) {
        return res.status(500).json({ configured: true, message: "SMTP verify failed", error: err?.message });
    }
});

app.post("/subscribe", subscribeLimiter, async(req, res) => {
    const email = sanitizeInput(req.body.email, 255).toLowerCase();
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Please provide a valid email." });
    }
    try {
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "You are already subscribed!" });
        }
        await Subscriber.create({ email });

        if (transporter) {
            try {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || process.env.SMTP_USER,
                    to: email,
                    subject: "Thanks for subscribing!",
                    html: `<p>Hi there,</p><p>Thanks for subscribing to my newsletter. You'll hear from me soon!</p>`,
                });
            } catch (err) {
                console.error("Failed to send welcome email", err.message);
            }
        } else {
            console.log("[Newsletter] SMTP not configured. Skipping welcome email for:", email);
        }

        return res.json({ message: "Subscription successful!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

app.post("/contact", contactLimiter, async(req, res) => {
    const name = sanitizeInput(req.body.name, 120);
    const email = sanitizeInput(req.body.email, 255);
    const subject = sanitizeInput(req.body.subject, 200) || "New Contact Form Submission";
    const message = sanitizeInput(req.body.message, 2000);

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Please provide a valid email." });
    }
    if (!message) {
        return res.status(400).json({ message: "Message cannot be empty." });
    }

    try {
        // Save to database
        await ContactMessage.create({ name, email, subject, message });
        console.log("[Contact] Message saved to database:", { name, email, subject });

        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: CONTACT_TO || process.env.SMTP_USER,
            replyTo: email,
            subject: `${subject}`,
            html: `<p><strong>Name:</strong> ${name || "(not provided)"}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong></p>
               <p>${message.replace(/\n/g, "<br>")}</p>`
        };

        if (!transporter) {
            console.log("[Contact] SMTP not configured. Email service skipped.");
            return res.json({ message: "Message received and saved!" });
        }

        try {
            await transporter.sendMail(mailOptions);
            return res.json({ message: "Message sent successfully!" });
        } catch (err) {
            console.error("Contact email failed", err.message);
            return res.json({ message: "Message saved but email notification failed." });
        }
    } catch (err) {
        console.error("Failed to save contact message", err);
        return res.status(500).json({ message: "Failed to save message." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});