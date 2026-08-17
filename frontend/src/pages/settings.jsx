import React, { useEffect, useState } from "react";
import Sidebar from "../partials/sidebar";
import "../css/settings.css";
import adminLogo from "../images/adminlogo.png";
import Swal from "sweetalert2";
import axios from "axios";

import {
    FaLock,
    FaUser,
    FaEye,
    FaEyeSlash,
    FaCamera,
    FaCheckCircle,
    FaEnvelope,
    FaShieldAlt,
    FaTimes,
} from "react-icons/fa";

const API_URL = "http://localhost:1222/api";
const UPLOAD_URL = "http://localhost:1222/uploads";

const Settings = () => {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Password
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    // Loading
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);

    const [user, setUser] = useState(null);

    // =====================================================
    // LOAD USER
    // =====================================================

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) return;

        try {
            const parsedUser = JSON.parse(storedUser);

            setUser(parsedUser);
            setName(parsedUser?.name || "");
            setEmail(parsedUser?.email || "");
        } catch (error) {
            console.error("Invalid user data:", error);
            localStorage.removeItem("user");
        }
    }, []);

    // =====================================================
    // CLEAN IMAGE PREVIEW
    // =====================================================

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // =====================================================
    // AUTH
    // =====================================================

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    // =====================================================
    // PROFILE IMAGE
    // =====================================================

    const getProfileImage = () => {
        if (imagePreview) {
            return imagePreview;
        }

        if (user?.profileImage) {
            return `${UPLOAD_URL}/${user.profileImage}`;
        }

        return adminLogo;
    };

    // =====================================================
    // OPEN PROFILE MODAL
    // =====================================================

    const openProfileModal = () => {
        setName(user?.name || "");
        setEmail(user?.email || "");
        setImage(null);
        setImagePreview("");
        setShowProfileModal(true);
    };

    // =====================================================
    // IMAGE CHANGE
    // =====================================================

    const handleImageChange = (e) => {
        const selectedImage = e.target.files?.[0];

        if (!selectedImage) return;

        if (!selectedImage.type.startsWith("image/")) {
            Swal.fire({
                icon: "warning",
                title: "Invalid file",
                text: "Please select a valid image file.",
                confirmButtonColor: "#7c3aed",
            });

            return;
        }

        if (selectedImage.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: "warning",
                title: "Image too large",
                text: "Please select an image smaller than 5MB.",
                confirmButtonColor: "#7c3aed",
            });

            return;
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setImage(selectedImage);
        setImagePreview(URL.createObjectURL(selectedImage));
    };

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    const controlChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Swal.fire({
                title: "Fill all fields",
                text: "Please enter all password fields.",
                icon: "warning",
                confirmButtonColor: "#7c3aed",
            });

            return;
        }

        if (newPassword.length < 6) {
            Swal.fire({
                title: "Weak Password",
                text: "Password must contain at least 6 characters.",
                icon: "warning",
                confirmButtonColor: "#7c3aed",
            });

            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({
                title: "Passwords Don't Match",
                text: "New password and confirm password must be the same.",
                icon: "error",
                confirmButtonColor: "#7c3aed",
            });

            return;
        }

        if (!user?._id) {
            Swal.fire({
                title: "Please login again",
                text: "Your user session could not be found.",
                icon: "error",
                confirmButtonColor: "#7c3aed",
            });

            return;
        }

        try {
            setLoadingPassword(true);

            const response = await axios.patch(
                `${API_URL}/passwordchange`,
                {
                    id: user._id,
                    oldPassword,
                    newPassword,
                },
                authConfig()
            );

            await Swal.fire({
                title: "Password Updated",
                text:
                    response.data?.message ||
                    "Your password has been changed successfully.",
                icon: "success",
                confirmButtonColor: "#7c3aed",
            });

            closePasswordModal();
        } catch (error) {
            console.error("Password change error:", error);

            Swal.fire({
                title: "Unable to update password",
                text:
                    error.response?.data?.message ||
                    "Something went wrong. Please try again.",
                icon: "error",
                confirmButtonColor: "#7c3aed",
            });
        } finally {
            setLoadingPassword(false);
        }
    };

    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    const handleUpdateProfile = async () => {
        if (!user?._id) {
            Swal.fire({
                title: "Please login again",
                icon: "error",
                confirmButtonColor: "#7c3aed",
            });

            return;
        }

        if (!name.trim()) {
            Swal.fire({
                title: "Name is required",
                text: "Please enter your name.",
                icon: "warning",
                confirmButtonColor: "#7c3aed",
            });

            return;
        }

        if (!email.trim()) {
            Swal.fire({
                title: "Email is required",
                text: "Please enter your email.",
                icon: "warning",
                confirmButtonColor: "#7c3aed",
            });

            return;
        }

        const formData = new FormData();

        formData.append("name", name.trim());
        formData.append("email", email.trim());

        if (image) {
            formData.append("profileImage", image);
        }

        try {
            setLoadingProfile(true);

            const response = await axios.put(
                `${API_URL}/profile/${user._id}`,
                formData,
                authConfig()
            );

            const updatedUser = response.data?.user;

            if (updatedUser) {
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }

            await Swal.fire({
                title: "Profile Updated",
                text:
                    response.data?.message ||
                    "Your profile has been updated successfully.",
                icon: "success",
                confirmButtonColor: "#7c3aed",
            });

            closeProfileModal();
        } catch (error) {
            console.error("Profile update error:", error);

            Swal.fire({
                title: "Unable to update profile",
                text:
                    error.response?.data?.message ||
                    "Something went wrong. Please try again.",
                icon: "error",
                confirmButtonColor: "#7c3aed",
            });
        } finally {
            setLoadingProfile(false);
        }
    };

    // =====================================================
    // CLOSE PASSWORD MODAL
    // =====================================================

    const closePasswordModal = () => {
        if (loadingPassword) return;

        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);

        setShowPasswordModal(false);
    };

    // =====================================================
    // CLOSE PROFILE MODAL
    // =====================================================

    const closeProfileModal = () => {
        if (loadingProfile) return;

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setImage(null);
        setImagePreview("");

        setShowProfileModal(false);
    };

    // =====================================================
    // ESCAPE KEY
    // =====================================================

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key !== "Escape") return;

            if (showPasswordModal && !loadingPassword) {
                closePasswordModal();
            }

            if (showProfileModal && !loadingProfile) {
                closeProfileModal();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [
        showPasswordModal,
        showProfileModal,
        loadingPassword,
        loadingProfile,
        imagePreview,
    ]);

    return (
        <div className="settings-page">
            <Sidebar />

            <main className="settings-main">
                {/* =================================================
            HEADER
        ================================================= */}

                <header className="settings-header">
                    <span className="settings-eyebrow">ACCOUNT SETTINGS</span>

                    <h1>Settings</h1>

                    <p>
                        Manage your account, profile and security preferences.
                    </p>
                </header>

                <div className="settings-content">
                    {/* =================================================
              PROFILE CARD
          ================================================= */}

                    <section className="settings-card profile-card">
                        <div className="card-title">
                            <div>
                                <h2>Profile Information</h2>

                                <p>
                                    Update your personal information and profile picture.
                                </p>
                            </div>

                            <div className="card-icon">
                                <FaUser />
                            </div>
                        </div>

                        <div className="profile-section">
                            <div className="profile-image-wrapper">
                                <img
                                    src={getProfileImage()}
                                    alt="Profile"
                                    className="settings-profile-image"
                                />

                                <span className="profile-online-dot" />
                            </div>

                            <div className="profile-details">
                                {user ? (
                                    <>
                                        <h3>{user.name || "User"}</h3>

                                        <p>{user.email || "No email available"}</p>

                                        <span className="profile-status">
                                            <span />
                                            Active account
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <h3>Login First</h3>

                                        <p>Please login to manage your profile.</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button
                                type="button"
                                className="primary-settings-btn"
                                onClick={openProfileModal}
                                disabled={!user}
                            >
                                <FaUser />
                                Update Profile
                            </button>
                        </div>
                    </section>

                    {/* =================================================
              SECURITY CARD
          ================================================= */}

                    <section className="settings-card security-card">
                        <div className="card-title">
                            <div>
                                <h2>Security</h2>

                                <p>
                                    Keep your account protected and secure.
                                </p>
                            </div>

                            <div className="card-icon">
                                <FaShieldAlt />
                            </div>
                        </div>

                        <div className="security-row">
                            <div className="security-icon">
                                <FaLock />
                            </div>

                            <div className="security-info">
                                <h3>Password</h3>

                                <p>
                                    Change your password regularly to keep your
                                    KikChat account secure.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="secondary-settings-btn"
                                onClick={() => setShowPasswordModal(true)}
                                disabled={!user}
                            >
                                Change Password
                            </button>
                        </div>
                    </section>
                </div>

                {/* =================================================
            CHANGE PASSWORD MODAL
        ================================================= */}

                {showPasswordModal && (
                    <div
                        className="modal-overlay"
                        onClick={closePasswordModal}
                    >
                        <div
                            className="settings-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                className="modal-close"
                                onClick={closePasswordModal}
                                disabled={loadingPassword}
                                aria-label="Close"
                            >
                                <FaTimes />
                            </button>

                            <div className="modal-heading">
                                <div className="modal-icon">
                                    <FaLock />
                                </div>

                                <div>
                                    <h2>Change Password</h2>

                                    <p>
                                        Update your password to keep your account secure.
                                    </p>
                                </div>
                            </div>

                            {/* OLD PASSWORD */}

                            <div className="input-group">
                                <label>Old Password</label>

                                <div className="password-input">
                                    <FaLock className="password-input-icon" />

                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        placeholder="Enter old password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        autoComplete="current-password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowOldPassword((prev) => !prev)
                                        }
                                    >
                                        {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* NEW PASSWORD */}

                            <div className="input-group">
                                <label>New Password</label>

                                <div className="password-input">
                                    <FaLock className="password-input-icon" />

                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNewPassword((prev) => !prev)
                                        }
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                                <small className="input-hint">
                                    Use at least 6 characters.
                                </small>
                            </div>

                            {/* CONFIRM PASSWORD */}

                            <div className="input-group">
                                <label>Confirm Password</label>

                                <div className="password-input">
                                    <FaLock className="password-input-icon" />

                                    <input
                                        type={
                                            showConfirmPassword ? "text" : "password"
                                        }
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword((prev) => !prev)
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <FaEyeSlash />
                                        ) : (
                                            <FaEye />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closePasswordModal}
                                    disabled={loadingPassword}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="update-btn"
                                    onClick={controlChangePassword}
                                    disabled={loadingPassword}
                                >
                                    {loadingPassword ? (
                                        <>
                                            <span className="button-spinner" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheckCircle />
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* =================================================
            UPDATE PROFILE MODAL
        ================================================= */}

                {showProfileModal && (
                    <div
                        className="modal-overlay"
                        onClick={closeProfileModal}
                    >
                        <div
                            className="settings-modal profile-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeProfileModal}
                                disabled={loadingProfile}
                                aria-label="Close"
                            >
                                <FaTimes />
                            </button>

                            <div className="modal-heading">
                                <div className="modal-icon">
                                    <FaUser />
                                </div>

                                <div>
                                    <h2>Update Profile</h2>

                                    <p>
                                        Update your profile information.
                                    </p>
                                </div>
                            </div>

                            {/* PROFILE PREVIEW */}

                            <div className="profile-upload-preview">
                                <div className="modal-profile-image">
                                    <img
                                        src={getProfileImage()}
                                        alt="Profile Preview"
                                    />

                                    <label
                                        htmlFor="profile-image"
                                        className="camera-button"
                                    >
                                        <FaCamera />
                                    </label>
                                </div>

                                <div>
                                    <h4>Profile Picture</h4>

                                    <p>
                                        JPG, PNG or WEBP. Maximum 5MB.
                                    </p>
                                </div>
                            </div>

                            {/* NAME */}

                            <div className="input-group">
                                <label>Name</label>

                                <div className="normal-input">
                                    <FaUser />

                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}

                            <div className="input-group">
                                <label>Email</label>

                                <div className="normal-input">
                                    <FaEnvelope />

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* IMAGE */}

                            <div className="input-group">
                                <label>Profile Image</label>

                                <div className="file-input-wrapper">
                                    <input
                                        type="file"
                                        id="profile-image"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={handleImageChange}
                                    />

                                    <label
                                        htmlFor="profile-image"
                                        className="file-label"
                                    >
                                        <FaCamera />

                                        <span>
                                            {image
                                                ? image.name
                                                : "Choose profile image"}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeProfileModal}
                                    disabled={loadingProfile}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="update-btn"
                                    onClick={handleUpdateProfile}
                                    disabled={loadingProfile}
                                >
                                    {loadingProfile ? (
                                        <>
                                            <span className="button-spinner" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheckCircle />
                                            Update Profile
                                        </>
                                    )}
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