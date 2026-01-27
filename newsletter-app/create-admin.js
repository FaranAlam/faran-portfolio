import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async() => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/newsletter', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ MongoDB connected');

        // Check if admin already exists
        const existing = await Admin.findOne({ email: 'faranalam14203@gmail.com' });
        if (existing) {
            console.log('⚠️  Admin already exists!');
            console.log('Email:', existing.email);
            console.log('Name:', existing.name);
            process.exit(0);
        }

        // Create new admin
        const admin = await Admin.create({
            username: 'faranalam',
            email: 'faranalam14203@gmail.com',
            password: 'Admin@123', // Will be hashed automatically by pre-save hook
            name: 'Faran Alam',
            role: 'super-admin',
            isActive: true
        });

        console.log('\n🎉 Admin created successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', admin.email);
        console.log('👤 Username:', admin.username);
        console.log('🔑 Password: Admin@123');
        console.log('⚠️  IMPORTANT: Change this password after first login!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

createAdmin();