import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('Checking admin accounts...\n');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected\n');
        
        const admins = await Admin.find({});
        console.log(`Found ${admins.length} admin account(s):\n`);
        
        admins.forEach((admin, index) => {
            console.log(`Admin ${index + 1}:`);
            console.log(`  Email: ${admin.email}`);
            console.log(`  Username: ${admin.username}`);
            console.log(`  Name: ${admin.name}`);
            console.log(`  Active: ${admin.isActive}`);
            console.log(`  Created: ${admin.createdAt}`);
            console.log('');
        });
        
        if (admins.length === 0) {
            console.log('⚠️  No admin accounts found! Creating one...\n');
            
            const adminEmail = `${process.env.ADMIN_USER}@admin.local`;
            const newAdmin = await Admin.create({
                name: 'Admin',
                username: process.env.ADMIN_USER,
                email: adminEmail,
                password: process.env.ADMIN_PASS,
                role: 'admin',
                isActive: true
            });
            
            console.log('✅ Admin created:');
            console.log(`  Email: ${newAdmin.email}`);
            console.log(`  Password: ${process.env.ADMIN_PASS}`);
        }
        
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
