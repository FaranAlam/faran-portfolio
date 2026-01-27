import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 4,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    role: {
        type: String,
        enum: ["admin", "super-admin"],
        default: "admin"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
};

// Remove password from JSON response
adminSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// Index for faster queries
adminSchema.index({ email: 1 });
adminSchema.index({ username: 1 });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;