import mongoose from 'mongoose';
const connectDB = async () => {
    try {
        // .env file se MONGO_URI uthayega
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected!");
    } catch (err) {
        console.log("❌ Connection Error:", err);
    }
};
export default connectDB;