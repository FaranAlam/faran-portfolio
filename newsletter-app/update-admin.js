import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

console.log('Updating admin account...\n');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected\n');
        
        const admin = await Admin.findOne({ email: 'admin@admin.local' });
        
        if (admin) {
            console.log('Found existing admin, updating...\n');
            
            const newEmail = `${process.env.ADMIN_USER}@admin.local`;
            const hashedPassword = await bcryptjs.hash(process.env.ADMIN_PASS, 10);
            
            admin.email = newEmail;
            admin.username = process.env.ADMIN_USER;
            admin.password = hashedPassword;
            
            await admin.save();
            
            console.log('✅ Admin account updated!');
            console.log(`  Email: ${admin.email}`);
            console.log(`  Username: ${admin.username}`);
            console.log(`  Password: ${process.env.ADMIN_PASS}`);
            console.log('\n🔐 You can now login with these credentials!');
        } else {
            console.log('⚠️  Admin not found!');
        }
        
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
