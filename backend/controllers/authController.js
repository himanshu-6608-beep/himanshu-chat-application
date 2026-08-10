import User from "../models/user.js";
import bcrypt from "bcrypt"
import { setUser } from "../services/auth.js"
import upload from "../middlewares/uploads.js";

const handleSignUp = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        const existingUser = await User.findOne({ email })

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields required"
            })
        }

        if (existingUser) {
            return res.status(400).json({
                message: "User Already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 4)

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })
        const token = setUser(user)

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/"
        })

        return res.status(200).json({
            success: true,
            message: "User Created successfully",
            user,
            token
        })


    } catch (err) {
        res.status(500).json({
            message: "Server error"
        })
    }

}

const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({
                message: "User does not exist",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password",
            });
        }

        const token = setUser(existingUser);

        res.cookie("token", token, {
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/",
        });

        return res.status(200).json({
            success: true,
            message: "Login successfully",
            user: {
                _id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                profileImage: existingUser.profileImage
            },
            token,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Server error",
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.findById(req.user._id).populate("contacts", "-password");

        return res.status(200).json({
            success: true,
            message: "User fetched successfull",
            users: users.contacts
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const addUser = async (req, res) => {
    try {
        const { email } = req.body;

        const addUser = await User.findById(req.user._id);

        const userToAdd = await User.findOne({ email });

        if (!userToAdd) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (addUser._id.equals(userToAdd._id)) {
            return res.status(400).json({
                success: false,
                message: "You cannot add yourself."
            });
        }

        if (addUser.contacts.includes(userToAdd._id)) {
            return res.status(400).json({
                success: false,
                message: "User already added."
            });
        }
        addUser.contacts.push(userToAdd._id);

        if (!userToAdd.contacts.includes(addUser._id)) {
            userToAdd.contacts.push(addUser._id);
        }

        await addUser.save();
        await userToAdd.save();

        const io = req.app.get("io");

        io.to(addUser._id.toString()).emit("contact-added");
        io.to(userToAdd._id.toString()).emit("contact-added");

        return res.status(200).json({
            success: true,
            message: "User added successfully"
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const handleLogOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/"
        });

        return res.status(200).json({
            success: true,
            message: "Logout successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const handleChangePassword = async (req, res) => {
    try {
        const {
            id,
            oldPassword,
            newPassword,
        } = req.body;


        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: "Fill all fields",
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const currentPassword = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!currentPassword) {
            return res.status(400).json({
                message: "Incorrect old password",
            });
        }

        const newPass = await bcrypt.hash(newPassword, 10);

        user.password = newPass;

        await user.save();

        return res.status(200).json({
            message: "Password updated successfully",
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server error",
        });
    }
};
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const data = {};
        if (name) data.name = name;
        if (email) data.email = email;
        if (req.file) {
            data.profileImage = req.file.filename;
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            data,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
const handleFilter = async (req, res) => {
    try {
        const {
            search = "",
            page = 1,
            limit = 10
        } = req.query;

        const currentUser = await User.findById(req.user._id)
            .populate({
                path: "contacts",
                select: "-password",
                match: search.trim()
                    ? {
                        $or: [
                            {
                                name: {
                                    $regex: search.trim(),
                                    $options: "i"
                                }
                            },
                            {
                                email: {
                                    $regex: search.trim(),
                                    $options: "i"
                                }
                            }
                        ]
                    }
                    : {}
            });

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const contacts = currentUser.contacts || [];

        const totalUsers = contacts.length;

        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);

        const users = contacts.slice(startIndex, endIndex);

        return res.status(200).json({
            success: true,
            message: "Contacts fetched successfully",
            users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / Number(limit))
        });

    } catch (err) {
        console.error("Contact filter error:", err);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
export default {
    handleSignUp,
    handleLogin,
    getUsers,
    addUser,
    handleLogOut,
    handleChangePassword,
    updateProfile,
    handleFilter
}