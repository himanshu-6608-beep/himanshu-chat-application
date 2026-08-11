import React, { useState } from "react";
import Sidebar from "../partials/sidebar";
import "../css/settings.css";
import adminLogo from "../images/adminlogo.png";
import Swal from "sweetalert2";
import axios from "axios";
import { socket } from "../services/socket.js"
const Settings = () => {
    const [showModel, setShowModel] = useState(false);
    const [showUpdateProfile, setShowUpdateProfile] = useState(false);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [image, setImage] = useState(null);
    const getToken = () => localStorage.getItem("token");
    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
    // =========================
    // CHANGE PASSWORD
    // =========================
    const controlChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Swal.fire({
                title: "Fill all the fields",
                icon: "error",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({
                title: "Passwords Don't Match",
                icon: "error",
            });
            return;
        }

        if (!user) {
            Swal.fire({
                title: "Please login again",
                icon: "error",
            });
            return;
        }

        try {
            const response = await axios.patch(
                "http://localhost:1222/api/passwordchange",
                {
                    id: user._id,
                    oldPassword,
                    newPassword,
                }
            );

            Swal.fire({
                title: response.data.message,
                icon: "success",
            });

            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowModel(false);

        } catch (error) {
            console.log(error);

            Swal.fire({
                title: error.response?.data?.message || "Something went wrong",
                icon: "error",
            });
        }
    };

    // =========================
    // UPDATE PROFILE
    // =========================
    const handleUpdateProfile = async () => {
        if (!user) {
            Swal.fire({
                title: "Please login again",
                icon: "error",
            });
            return;
        }

        const formData = new FormData();

        if (name.trim()) {
            formData.append("name", name);
        }

        if (email.trim()) {
            formData.append("email", email);
        }

        if (image) {
            formData.append("profileImage", image);
        }

        try {
            const response = await axios.put(
                `http://localhost:1222/api/profile/${user._id}`,
                formData,
                authConfig()
            );

            Swal.fire({
                title: response.data.message,
                icon: "success",
            });

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            setShowUpdateProfile(false);
            setImage(null);

        } catch (error) {
            console.log(error);

            Swal.fire({
                title:
                    error.response?.data?.message ||
                    "Something went wrong",
                icon: "error",
            });
        }
    };

    return (
        <div className="settings-page">

            <Sidebar />

            <main className="settings-main">

                <div className="settings-header">
                    <h1>Settings</h1>
                    <p>Manage your account and profile settings</p>
                </div>

                <div className="settings-content">

                    <section className="settings-card profile-card">

                        <div className="card-title">
                            <div>
                                <h2>Profile Information</h2>
                                <p>Update your personal information</p>
                            </div>
                        </div>

                        <div className="profile-section">

                            <div className="profile-image-wrapper">

                                <img
                                    src={
                                        user?.profileImage
                                            ? `http://localhost:1222/uploads/${user.profileImage}`
                                            : adminLogo
                                    }
                                    alt="Profile"
                                    className="settings-profile-image"
                                />

                                <span className="profile-online-dot"></span>

                            </div>

                            <div className="profile-details">

                                {user ? (
                                    <>
                                        <h3>{user.name}</h3>
                                        <p>{user.email}</p>

                                        <span className="profile-status">
                                            <span></span>
                                            Online
                                        </span>
                                    </>
                                ) : (
                                    <h3>Login First</h3>
                                )}

                            </div>

                        </div>

                        <div className="profile-actions">

                            <button
                                className="primary-settings-btn"
                                onClick={() => {
                                    setName(user?.name || "");
                                    setEmail(user?.email || "");
                                    setImage(null);
                                    setShowUpdateProfile(true);
                                }}
                            >
                                Update Profile
                            </button>

                        </div>

                    </section>

                    <section className="settings-card security-card">

                        <div className="card-title">
                            <div>
                                <h2>Security</h2>
                                <p>Keep your account secure</p>
                            </div>
                        </div>

                        <div className="security-row">

                            <div className="security-icon">
                                🔒
                            </div>

                            <div className="security-info">
                                <h3>Password</h3>
                                <p>
                                    Change your password regularly to keep
                                    your account secure.
                                </p>
                            </div>

                            <button
                                className="secondary-settings-btn"
                                onClick={() => setShowModel(true)}
                            >
                                Change Password
                            </button>

                        </div>

                    </section>

                </div>

                {/* =========================
                    CHANGE PASSWORD MODAL
                ========================= */}
                {showModel && (
                    <div
                        className="modal-overlay"
                        onClick={() => setShowModel(false)}
                    >

                        <div
                            className="settings-modal"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <button
                                className="modal-close"
                                onClick={() => setShowModel(false)}
                            >
                                &times;
                            </button>

                            <div className="modal-heading">

                                <div className="modal-icon">
                                    🔒
                                </div>

                                <div>
                                    <h2>Change Password</h2>
                                    <p>
                                        Update your password to keep your
                                        account secure.
                                    </p>
                                </div>

                            </div>

                            <div className="input-group">
                                <label>Old Password</label>

                                <input
                                    type="password"
                                    placeholder="Enter old password"
                                    value={oldPassword}
                                    onChange={(e) =>
                                        setOldPassword(e.target.value)
                                    }
                                />
                            </div>

                            <div className="input-group">
                                <label>New Password</label>

                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                />
                            </div>

                            <div className="input-group">
                                <label>Confirm Password</label>

                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                />
                            </div>

                            <div className="modal-actions">

                                <button
                                    className="cancel-btn"
                                    onClick={() => setShowModel(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="update-btn"
                                    onClick={controlChangePassword}
                                >
                                    Update Password
                                </button>

                            </div>

                        </div>

                    </div>
                )}

                {/* =========================
                    UPDATE PROFILE MODAL
                ========================= */}
                {showUpdateProfile && (
                    <div
                        className="modal-overlay"
                        onClick={() => setShowUpdateProfile(false)}
                    >

                        <div
                            className="settings-modal"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowUpdateProfile(false)
                                }
                            >
                                &times;
                            </button>

                            <div className="modal-heading">

                                <div className="modal-icon">
                                    👤
                                </div>

                                <div>
                                    <h2>Update Profile</h2>
                                    <p>
                                        Update your profile information.
                                    </p>
                                </div>

                            </div>

                            <div className="input-group">
                                <label>Name</label>

                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                />
                            </div>

                            <div className="input-group">
                                <label>Email</label>

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                />
                            </div>

                            <div className="input-group">

                                <label>Profile Image</label>

                                <div className="file-input-wrapper">

                                    <input
                                        type="file"
                                        id="profile-image"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setImage(e.target.files[0])
                                        }
                                    />

                                    <label
                                        htmlFor="profile-image"
                                        className="file-label"
                                    >
                                        {image
                                            ? image.name
                                            : "Choose profile image"}
                                    </label>

                                </div>

                            </div>

                            <div className="modal-actions">

                                <button
                                    className="cancel-btn"
                                    onClick={() =>
                                        setShowUpdateProfile(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    className="update-btn"
                                    onClick={handleUpdateProfile}
                                >
                                    Update Profile
                                </button>

                            </div>

                        </div>

                    </div>
                )}

            </main>

        </div>
    );
};

export default Settings;
