import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("users", userSchema);
export default User;
