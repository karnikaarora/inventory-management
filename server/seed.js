import mongoose from 'mongoose';
import User from './models/user.js';
import bcrypt from 'bcrypt'; // for hashing passwords

// Atlas Connection String
const dbURL = "mongodb+srv://kransarora:pavini12@cluster0.jth2zse.mongodb.net/inventory_db?retryWrites=true&w=majority";

const seedData = async () => {
    try {
        //connect to MongoDB Atlas
        await mongoose.connect(dbURL);
        console.log("✅ Connected to MongoDB for seeding...");

        // delete only admin user if exists, keep other users safe
        await User.deleteOne({ email: "admin@gmail.com" });
        console.log("🗑️  Admin user cleared (other users preserved).");

        //hashing the password before saving to database
        const plainPassword = "adminpassword123";
        const salt = await bcrypt.genSalt(10); // Salt ek extra security layer hai
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // define admin user data  
        const adminUser = {
            name: "Admin User",
            email: "admin@gmail.com",
            password: hashedPassword,
            phone: "9876543210", 
            address: "Delhi, India",
            role: "admin"
        };

        // save admin user to database
        const newAdmin = new User(adminUser);
        await newAdmin.save();

        console.log("🚀 Admin account seeded successfully!");

        //close the connection after seeding
        mongoose.connection.close();
        console.log("🔌 Connection closed.");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
    }
};

seedData();

