import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import multer from "multer";
import fs from "fs/promises";
import Subscriber from "./models/Subscriber.js";
import Contact from "./models/Contact.js";
import Admin from "./models/Admin.js";
import Blog from "./models/Blog.js";
import Comment from "./models/Comment.js";

const app = express();
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");
dotenv.config({ path: envPath });

const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.CORS_ORIGIN || "*";
const CONTACT_TO = process.env.CONTACT_TO || "";
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

// Trust proxy for Render deployment
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const contactLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20 });
const subscribeLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 40 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.use(limiter);

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/newsletter";

mongoose
    .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MongoDB connected");
        initializeAdmin();
    })
    .catch((err) => console.error("MongoDB connection error", err));

// Initialize default admin user
async function initializeAdmin() {
    try {
        const adminEmail = process.env.ADMIN_USER ? `${process.env.ADMIN_USER}@admin.local` : 'admin@admin.local';
        const adminPassword = process.env.ADMIN_PASS || 'admin123';

        // Check by email or username
        let admin = await Admin.findOne({ $or: [{ email: adminEmail }, { username: 'admin' }] });

        if (!admin) {
            admin = await Admin.create({
                name: 'Admin',
                username: 'admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                isActive: true
            });
            console.log(`[Admin] Default admin created: ${adminEmail}`);
        } else {
            // Update existing admin with proper email if needed
            if (admin.email !== adminEmail) {
                admin.email = adminEmail;
                await admin.save();
                console.log(`[Admin] Admin email updated to: ${adminEmail}`);
            } else {
                console.log(`[Admin] Admin already exists: ${adminEmail}`);
            }
        }
    } catch (err) {
        console.error('[Admin] Initialization error:', err.message);
    }
}

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

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

// ==================== JWT Middleware ====================
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided. Access denied." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        console.error("[Auth] Token verification failed:", err.message);
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

// ==================== Image Upload Configuration ====================
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'blogs');
try {
    await fs.mkdir(uploadsDir, { recursive: true });
} catch (err) {
    console.error('Failed to create uploads directory:', err);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'));
        }
    }
});

// ==================== Public Health Endpoints ====================
app.get("/health", (_req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    res.json({
        status: "ok",
        database: dbStatus[dbState] || 'unknown',
        dbReadyState: dbState,
        mongoConnected: dbState === 1
    });
});

app.get("/db-check", async(_req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        if (dbState !== 1) {
            return res.status(503).json({
                connected: false,
                message: "Database not connected",
                state: dbState
            });
        }
        // Try a simple query to verify database is working
        const count = await Subscriber.countDocuments();
        return res.json({
            connected: true,
            message: "Database is connected and working",
            subscribersCount: count
        });
    } catch (err) {
        return res.status(500).json({
            connected: false,
            message: "Database connection test failed",
            error: err.message
        });
    }
});

app.get("/smtp-check", async(_req, res) => {
    if (!transporter) {
        return res.status(200).json({ configured: false, message: "SMTP not configured" });
    }
    try {
        // Add timeout to prevent hanging
        const verifyPromise = transporter.verify();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SMTP verification timeout')), 10000)
        );

        await Promise.race([verifyPromise, timeoutPromise]);
        return res.status(200).json({ configured: true, message: "SMTP is ready" });
    } catch (err) {
        return res.status(500).json({
            configured: true,
            message: "SMTP verify failed",
            error: err?.message || err.toString()
        });
    }
});

// ==================== Authentication Endpoints ====================

// Admin Login
app.post("/admin/login", authLimiter, async(req, res) => {
    const email = sanitizeInput(req.body.email, 255).toLowerCase();
    const password = req.body.password || "";

    if (!isValidEmail(email) || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        if (!admin.isActive) {
            return res.status(403).json({ message: "Admin account is disabled." });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate JWT token
        const token = jwt.sign({ id: admin._id, email: admin.email, role: admin.role },
            JWT_SECRET, { expiresIn: JWT_EXPIRE }
        );

        return res.json({
            message: "Login successful!",
            token,
            admin: admin.toJSON()
        });
    } catch (err) {
        console.error("[Login] Error:", err);
        return res.status(500).json({ message: "Login failed. Please try again." });
    }
});

app.post("/subscribe", subscribeLimiter, async(req, res) => {
    console.log("[Subscribe] Received request body:", req.body);
    console.log("[Subscribe] Request headers:", req.headers);

    if (!req.body || !req.body.email) {
        console.log("[Subscribe] No email in request body");
        return res.status(400).json({ message: "Email is required." });
    }

    const email = sanitizeInput(req.body.email, 255).toLowerCase();
    console.log("[Subscribe] Sanitized email:", email);

    if (!isValidEmail(email)) {
        console.log("[Subscribe] Invalid email format:", email);
        return res.status(400).json({ message: "Please provide a valid email address." });
    }
    try {
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            console.log("[Subscribe] Email already exists:", email);
            return res.status(400).json({ message: "You are already subscribed!" });
        }
        await Subscriber.create({ email });
        console.log("[Subscribe] New subscriber:", email);

        // Send welcome email asynchronously (don't wait for it)
        if (transporter) {
            transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: email,
                subject: "Thanks for subscribing!",
                html: `<p>Hi there,</p><p>Thanks for subscribing to my newsletter. You'll hear from me soon!</p>`,
            }).catch(err => {
                console.error("Failed to send welcome email", err.message);
            });
        } else {
            console.log("[Newsletter] SMTP not configured. Skipping welcome email for:", email);
        }

        // Respond immediately without waiting for email
        return res.json({ message: "Subscription successful! Check your email." });
    } catch (err) {
        console.error("[Subscribe] Error:", err.message);
        return res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

// ==================== GET All Subscribers (Admin) ====================
app.get("/subscribers", verifyToken, async(req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
        return res.json(subscribers);
    } catch (err) {
        console.error("[Get Subscribers] Error:", err);
        return res.status(500).json({ message: "Failed to fetch subscribers." });
    }
});

// ==================== GET All Contact Messages (Admin) ====================
app.get("/contact", verifyToken, async(req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        return res.json(contacts);
    } catch (err) {
        console.error("[Get Contacts] Error:", err);
        return res.status(500).json({ message: "Failed to fetch contacts." });
    }
});

// ==================== CREATE Blog Post (Admin) ====================
app.post("/blogs", verifyToken, async(req, res) => {
    try {
        const { title, excerpt, content, tags, featured } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required." });
        }

        // Generate unique slug from title with timestamp
        const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const timestamp = Date.now();
        const slug = `${baseSlug}-${timestamp}`;

        const blog = await Blog.create({
            title: sanitizeInput(title, 200),
            excerpt: sanitizeInput(excerpt, 300),
            content: sanitizeInput(content, 50000),
            slug: slug,
            image: 'https://placehold.co/800x400/667eea/ffffff?text=Blog+Post', // Placeholder image
            tags: Array.isArray(tags) ? tags : [],
            featured: featured || false,
            published: true, // Auto-publish
            author: req.admin.email
        });

        return res.status(201).json({ message: "Blog created successfully!", blog });
    } catch (err) {
        console.error("[Create Blog] Error:", err);
        return res.status(500).json({ message: "Failed to create blog." });
    }
});

app.post("/contact", contactLimiter, async(req, res) => {
    console.log("[Contact] Received request:", { name: req.body.name, email: req.body.email });
    const name = sanitizeInput(req.body.name, 120);
    const email = sanitizeInput(req.body.email, 255);
    const subject = sanitizeInput(req.body.subject, 200) || "New Contact Form Submission";
    const message = sanitizeInput(req.body.message, 2000);

    if (!isValidEmail(email)) {
        console.log("[Contact] Invalid email:", email);
        return res.status(400).json({ message: "Please provide a valid email." });
    }
    if (!message) {
        return res.status(400).json({ message: "Message cannot be empty." });
    }
    if (!name) {
        return res.status(400).json({ message: "Name is required." });
    }

    try {
        // Save contact message to database
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || null;
        const userAgent = req.headers['user-agent'] || null;

        const contactEntry = await Contact.create({
            name,
            email,
            subject,
            message,
            ipAddress,
            userAgent,
            status: "unread"
        });
        console.log("[Contact] Message saved:", contactEntry._id);

        // Send email notification if SMTP is configured
        if (transporter) {
            const mailOptions = {
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: CONTACT_TO || process.env.SMTP_USER,
                replyTo: email,
                subject: `🔔 New Contact: ${subject}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                        <div style="background-color: #4a90e2; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h2 style="color: white; margin: 0;">New Contact Form Submission</h2>
                        </div>
                        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">You have received a new message from your website contact form:</p>
                            
                            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4a90e2; margin: 15px 0;">
                                <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
                                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #4a90e2;">${email}</a></p>
                                <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
                            </div>
                            
                            <div style="margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Message:</strong></p>
                                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
                                    <p style="margin: 0; line-height: 1.6; color: #555;">${message.replace(/\n/g, "<br>")}</p>
                                </div>
                            </div>
                            
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
                                <p style="margin: 3px 0;">Submission ID: ${contactEntry._id}</p>
                                <p style="margin: 3px 0;">Submitted at: ${new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log("[Contact] Email sent successfully for:", email);
            } catch (err) {
                console.error("[Contact] Failed to send email notification:", err.message);
                // Don't fail the request if email fails - message is still saved
            }
        } else {
            console.log("[Contact] SMTP not configured. Message saved but no email sent.");
        }

        return res.json({
            message: "Message sent successfully! I'll get back to you soon.",
            success: true
        });
    } catch (err) {
        console.error("[Contact] Error:", err);
        return res.status(500).json({ message: "Failed to send message. Please try again." });
    }
});

// ==================== Admin Protected Endpoints ====================

// Get all contact messages
app.get("/admin/contacts", verifyToken, async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        let query = {};
        if (status && ["unread", "read", "replied", "archived"].includes(status)) {
            query.status = status;
        }

        const total = await Contact.countDocuments(query);
        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        return res.json({
            contacts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("[Get Contacts] Error:", err);
        return res.status(500).json({ message: "Failed to fetch contacts." });
    }
});

// Update contact message status
app.patch("/admin/contacts/:id", verifyToken, async(req, res) => {
    const status = req.body.status;

    if (!status || !["unread", "read", "replied", "archived"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value." });
    }

    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id, { status }, { new: true }
        );

        if (!contact) {
            return res.status(404).json({ message: "Contact not found." });
        }

        return res.json({
            message: "Contact status updated successfully!",
            contact
        });
    } catch (err) {
        console.error("[Update Contact] Error:", err);
        return res.status(500).json({ message: "Failed to update contact." });
    }
});

// Delete contact message
app.delete("/admin/contacts/:id", verifyToken, async(req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: "Contact not found." });
        }

        return res.json({
            message: "Contact deleted successfully!"
        });
    } catch (err) {
        console.error("[Delete Contact] Error:", err);
        return res.status(500).json({ message: "Failed to delete contact." });
    }
});

// Get all subscribers
app.get("/admin/subscribers", verifyToken, async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Subscriber.countDocuments();
        const subscribers = await Subscriber.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        return res.json({
            subscribers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("[Get Subscribers] Error:", err);
        return res.status(500).json({ message: "Failed to fetch subscribers." });
    }
});

// Delete subscriber
app.delete("/admin/subscribers/:id", verifyToken, async(req, res) => {
    try {
        const subscriber = await Subscriber.findByIdAndDelete(req.params.id);

        if (!subscriber) {
            return res.status(404).json({ message: "Subscriber not found." });
        }

        return res.json({
            message: "Subscriber deleted successfully!"
        });
    } catch (err) {
        console.error("[Delete Subscriber] Error:", err);
        return res.status(500).json({ message: "Failed to delete subscriber." });
    }
});

// Get dashboard statistics
app.get("/admin/stats", verifyToken, async(req, res) => {
    try {
        const totalContacts = await Contact.countDocuments();
        const unreadContacts = await Contact.countDocuments({ status: "unread" });
        const totalSubscribers = await Subscriber.countDocuments();

        return res.json({
            totalContacts,
            unreadContacts,
            totalSubscribers
        });
    } catch (err) {
        console.error("[Get Stats] Error:", err);
        return res.status(500).json({ message: "Failed to fetch statistics." });
    }
});

// ==================== Blog Management Endpoints ====================

// Public: Get all published blogs
app.get("/blogs", async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const featured = req.query.featured === 'true';

        let query = { published: true };
        if (featured) {
            query.featured = true;
        }

        const total = await Blog.countDocuments(query);
        const blogs = await Blog.find(query)
            .select('title slug excerpt image imageAlt category tags featured author createdAt readTime views')
            .sort({ featured: -1, createdAt: -1 })
            .limit(limit)
            .skip(skip);

        return res.json({
            blogs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("[Get Blogs] Error:", err);
        return res.status(500).json({ message: "Failed to fetch blogs." });
    }
});

// Public: Get single blog by slug
app.get("/blogs/:slug", async(req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug, published: true });

        if (!blog) {
            return res.status(404).json({ message: "Blog not found." });
        }

        // Increment views
        blog.views = (blog.views || 0) + 1;
        await blog.save();

        return res.json(blog);
    } catch (err) {
        console.error("[Get Blog] Error:", err);
        return res.status(500).json({ message: "Failed to fetch blog." });
    }
});

// Admin: Upload blog image
app.post("/admin/blogs/upload", verifyToken, upload.single('image'), async(req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image provided." });
    }

    try {
        const imageUrl = `/uploads/blogs/${req.file.filename}`;
        return res.json({
            message: "Image uploaded successfully!",
            imageUrl
        });
    } catch (err) {
        console.error("[Upload Image] Error:", err);
        return res.status(500).json({ message: "Failed to upload image." });
    }
});

// Admin: Create new blog
app.post("/admin/blogs", verifyToken, async(req, res) => {
    const { title, content, excerpt, image, imageAlt, tags, category, featured, published, seoTitle, seoDescription } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required." });
    }

    try {
        const blog = await Blog.create({
            title: sanitizeInput(title, 200),
            content,
            excerpt: sanitizeInput(excerpt, 500),
            image: image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E',
            imageAlt: sanitizeInput(imageAlt, 200) || 'Blog image',
            tags: tags || [],
            category: sanitizeInput(category, 100) || 'Technology',
            featured: featured || false,
            published: published !== false,
            seoTitle: sanitizeInput(seoTitle, 60),
            seoDescription: sanitizeInput(seoDescription, 160)
        });

        return res.json({
            message: "Blog created successfully!",
            blog
        });
    } catch (err) {
        console.error("[Create Blog] Error:", err);
        return res.status(500).json({ message: "Failed to create blog." });
    }
});

// Admin: Update blog
app.put("/admin/blogs/:id", verifyToken, async(req, res) => {
    const { title, content, excerpt, image, imageAlt, tags, category, featured, published, seoTitle, seoDescription } = req.body;

    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id, {
                title: title ? sanitizeInput(title, 200) : undefined,
                content: content || undefined,
                excerpt: excerpt ? sanitizeInput(excerpt, 500) : undefined,
                image: image || undefined,
                imageAlt: imageAlt ? sanitizeInput(imageAlt, 200) : undefined,
                tags: tags || undefined,
                category: category ? sanitizeInput(category, 100) : undefined,
                featured: featured !== undefined ? featured : undefined,
                published: published !== undefined ? published : undefined,
                seoTitle: seoTitle ? sanitizeInput(seoTitle, 60) : undefined,
                seoDescription: seoDescription ? sanitizeInput(seoDescription, 160) : undefined
            }, { new: true, runValidators: true }
        );

        if (!blog) {
            return res.status(404).json({ message: "Blog not found." });
        }

        return res.json({
            message: "Blog updated successfully!",
            blog
        });
    } catch (err) {
        console.error("[Update Blog] Error:", err);
        return res.status(500).json({ message: "Failed to update blog." });
    }
});

// Admin: Delete blog
app.delete("/admin/blogs/:id", verifyToken, async(req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found." });
        }

        // Delete associated image file
        if (blog.image && blog.image.startsWith('/uploads/blogs/')) {
            try {
                const imagePath = path.join(__dirname, blog.image);
                await fs.unlink(imagePath);
            } catch (err) {
                console.warn('Failed to delete image file:', err);
            }
        }

        return res.json({
            message: "Blog deleted successfully!"
        });
    } catch (err) {
        console.error("[Delete Blog] Error:", err);
        return res.status(500).json({ message: "Failed to delete blog." });
    }
});

// Admin: Get all blogs (including unpublished)
app.get("/admin/blogs", verifyToken, async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Blog.countDocuments();
        const blogs = await Blog.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        return res.json({
            blogs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("[Get All Blogs] Error:", err);
        return res.status(500).json({ message: "Failed to fetch blogs." });
    }
});

// ======================
// COMMENT ENDPOINTS
// ======================

// Add comment to a blog post
app.post("/blogs/:slug/comments", contactLimiter, async(req, res) => {
    try {
        const { slug } = req.params;
        const { name, email, comment } = req.body;

        // Validation
        if (!name || !email || !comment) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email address." });
        }

        // Check if blog exists
        const blog = await Blog.findOne({ slug, published: true });
        if (!blog) {
            return res.status(404).json({ message: "Blog not found." });
        }

        // Sanitize inputs
        const sanitizedName = name.trim().substring(0, 100);
        const sanitizedEmail = email.trim().toLowerCase().substring(0, 200);
        const sanitizedComment = comment.trim().substring(0, 1000);

        // Create comment
        const newComment = await Comment.create({
            blogSlug: slug,
            name: sanitizedName,
            email: sanitizedEmail,
            comment: sanitizedComment,
            approved: true
        });

        return res.status(201).json({
            message: "Comment added successfully!",
            comment: {
                _id: newComment._id,
                name: newComment.name,
                comment: newComment.comment,
                createdAt: newComment.createdAt
            }
        });
    } catch (err) {
        console.error("[Add Comment] Error:", err);
        return res.status(500).json({ message: "Failed to add comment." });
    }
});

// Get all comments for a blog post
app.get("/blogs/:slug/comments", async(req, res) => {
    try {
        const { slug } = req.params;

        // Get approved comments for this blog
        const comments = await Comment.find({ blogSlug: slug, approved: true })
            .sort({ createdAt: -1 })
            .select('name comment createdAt');

        return res.json({
            comments,
            total: comments.length
        });
    } catch (err) {
        console.error("[Get Comments] Error:", err);
        return res.status(500).json({ message: "Failed to fetch comments." });
    }
});

// Admin: Get all comments
app.get("/admin/comments", verifyToken, async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const total = await Comment.countDocuments();
        const comments = await Comment.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        return res.json({
            comments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("[Get All Comments] Error:", err);
        return res.status(500).json({ message: "Failed to fetch comments." });
    }
});

// Admin: Delete comment
app.delete("/admin/comments/:id", verifyToken, async(req, res) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findByIdAndDelete(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        return res.json({ message: "Comment deleted successfully!" });
    } catch (err) {
        console.error("[Delete Comment] Error:", err);
        return res.status(500).json({ message: "Failed to delete comment." });
    }
});

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global error handler
app.use((err, req, res, next) => {
    console.error("[Error]", err.message);
    res.status(500).json({ message: "Server error. Please try again later." });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Endpoint not found" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});