import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Active"
    },
    profileImage: {
        type: String,
        default: null
    },

    isOnline: {
        type: Boolean,
        default: false,
    },

    lastLogin: {
        type: Date,
        default: null
    },
    otp: {
        type: Number,
        default: null
    },
    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    lastMessageAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});


const User = mongoose.model("User", userSchema);
export default User;