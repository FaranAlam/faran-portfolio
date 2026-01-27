import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 255
    },
    subject: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "New Contact Form Submission"
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    status: {
        type: String,
        enum: ["unread", "read", "replied", "archived"],
        default: "unread"
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1 });

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;