import User from "../models/user.js";
import bcrypt from "bcrypt"
import { setUser } from "../services/auth.js"

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

        const loggedInUser = await User.findById(req.user._id);

        const userToAdd = await User.findOne({ email });

        if (!userToAdd) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (loggedInUser._id.equals(userToAdd._id)) {
            return res.status(400).json({
                success: false,
                message: "You cannot add yourself."
            });
        }

        if (loggedInUser.contacts.includes(userToAdd._id)) {
            return res.status(400).json({
                success: false,
                message: "User already added."
            });
        }
        loggedInUser.contacts.push(userToAdd._id);

        if (!userToAdd.contacts.includes(loggedInUser._id)) {
            userToAdd.contacts.push(loggedInUser._id);
        }

        await loggedInUser.save();
        await userToAdd.save();

        const io = req.app.get("io");

        io.to(loggedInUser._id.toString()).emit("contact-added");
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

const handleImage = async (req, res) => {

    try {

        const { name, email } = req.body;
        const data = {}
        if (name) data.name = name;
        if (email) data.email = email;
        if (req.file) {
            data.profileImage = req.file.filename
        }

        const updateUser = await User.findByIdAndUpdate(
            req.params.id,
            data,
            { new: true }
        )
        if (!updateUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            updateUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}
export default {
    handleSignUp,
    handleLogin,
    getUsers,
    addUser,
    handleLogOut,
    handleImage
}