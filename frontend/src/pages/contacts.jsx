import { useState, useEffect } from "react";
import Sidebar from "../partials/sidebar";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Plus,
    Search,
    X,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    Mail,
    CalendarDays,
    CircleCheck,
    Circle,
} from "lucide-react";

import "../css/contacts.css";
import adminLogo from "../images/adminlogo.png";

const API_URL = "http://localhost:1222/api";

const Contacts = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncing, setDebouncing] = useState("");

    const [loading, setLoading] = useState(true);
    const [addingUser, setAddingUser] = useState(false);

    const [addUser, setAddUser] = useState({
        email: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showAddUser, setShowAddUser] = useState(false);

    const getToken = () => localStorage.getItem("token");

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    /* =====================================================
       GET USERS
    ===================================================== */

    const handleGetUser = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${API_URL}/userfilter`,
                {
                    ...authConfig(),
                    params: {
                        search: debouncing,
                        page: currentPage,
                        limit: 10,
                    },
                }
            );

            setUsers(response.data.users || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            console.error(
                "Get contacts error:",
                err.response?.data || err
            );

            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       SEARCH DEBOUNCE
    ===================================================== */

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncing(search);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        handleGetUser();
    }, [debouncing, currentPage]);

    /* =====================================================
       ADD USER
    ===================================================== */

    const handleAddUser = async () => {
        if (!addUser.email.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Email required",
                text: "Please enter the user's email address.",
                confirmButtonColor: "#657ff2",
            });

            return;
        }

        try {
            setAddingUser(true);

            const response = await axios.post(
                `${API_URL}/adduser`,
                {
                    email: addUser.email.trim(),
                },
                {
                    ...authConfig(),
                    withCredentials: true,
                }
            );

            await Swal.fire({
                icon: "success",
                title: "User Added",
                text:
                    response.data?.message ||
                    "The user has been added successfully.",
                confirmButtonColor: "#657ff2",
            });

            setAddUser({
                email: "",
            });

            setShowAddUser(false);

            handleGetUser();
        } catch (error) {
            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Unable to add user",
                text:
                    error.response?.data?.message ||
                    "Something went wrong. Please try again.",
                confirmButtonColor: "#657ff2",
            });
        } finally {
            setAddingUser(false);
        }
    };

    /* =====================================================
       MODAL CLOSE
    ===================================================== */

    const closeModal = () => {
        if (addingUser) return;

        setShowAddUser(false);

        setAddUser({
            email: "",
        });
    };

    /* =====================================================
       PAGINATION
    ===================================================== */

    const goToPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const goToNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    /* =====================================================
       AVATAR
    ===================================================== */

    const getAvatar = (user) => {
        if (user?.profileImage) {
            return `${API_URL.replace("/api", "")}/uploads/${user.profileImage}`;
        }

        return adminLogo;
    };

    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="contacts-container">

            <Sidebar />

            <main className="users-panels">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="users-header">

                    <div className="users-title">

                        <span className="users-eyebrow">
                            KikChat Community
                        </span>

                        <h2>
                            Contacts
                        </h2>

                        <p>
                            Discover and connect with people on KikChat.
                        </p>

                    </div>

                    <button
                        className="add-contact-btn"
                        onClick={() => setShowAddUser(true)}
                    >
                        <Plus size={18} strokeWidth={2.4} />

                        <span>Add User</span>
                    </button>

                </div>


                {/* =================================================
                    SEARCH + INFO
                ================================================= */}

                <div className="contacts-toolbar">

                    <div className="users-searchs">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                        {search && (
                            <button
                                className="clear-search"
                                onClick={() => setSearch("")}
                                type="button"
                            >
                                <X size={15} />
                            </button>
                        )}

                    </div>

                    <div className="contacts-result">

                        <span className="result-dot" />

                        {loading
                            ? "Searching..."
                            : `${users.length} users shown`}
                    </div>

                </div>


                {/* =================================================
                    USERS TABLE
                ================================================= */}

                <section className="users-lists">

                    <div className="table-heading">

                        <div>
                            <h3>All Users</h3>

                            <span>
                                People available on KikChat
                            </span>
                        </div>

                        <div className="table-page-info">
                            Page {currentPage} of {totalPages}
                        </div>

                    </div>


                    <div className="table-scroll">

                        <table className="users-table">

                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Joined</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (
                                    <>
                                        {[1, 2, 3, 4, 5].map((item) => (
                                            <tr
                                                key={item}
                                                className="skeleton-row"
                                            >
                                                <td>
                                                    <div className="skeleton small" />
                                                </td>

                                                <td>
                                                    <div className="skeleton-user">
                                                        <div className="skeleton avatar" />
                                                        <div className="skeleton name" />
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="skeleton email" />
                                                </td>

                                                <td>
                                                    <div className="skeleton date" />
                                                </td>

                                                <td>
                                                    <div className="skeleton status" />
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                ) : users.length > 0 ? (

                                    users.map((user, index) => (

                                        <tr key={user._id}>

                                            <td className="serial-number">
                                                {(currentPage - 1) * 10 +
                                                    index +
                                                    1}
                                            </td>

                                            <td>

                                                <div className="table-user">

                                                    <div className="avatar-wrapper">

                                                        <img
                                                            src={getAvatar(user)}
                                                            alt={
                                                                user?.name ||
                                                                "User"
                                                            }
                                                            className="user-avatar"
                                                        />

                                                        <span
                                                            className={
                                                                user?.isOnline
                                                                    ? "avatar-status online"
                                                                    : "avatar-status offline"
                                                            }
                                                        />

                                                    </div>

                                                    <div className="user-info">

                                                        <span className="user-name">
                                                            {user?.name ||
                                                                "Unknown User"}
                                                        </span>

                                                        <span className="user-label">
                                                            KikChat member
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            <td>

                                                <div className="email-cell">
                                                    <Mail size={14} />
                                                    <span>
                                                        {user?.email || "—"}
                                                    </span>
                                                </div>

                                            </td>

                                            <td>

                                                <div className="date-cell">
                                                    <CalendarDays size={14} />

                                                    <span>
                                                        {formatDate(
                                                            user?.createdAt
                                                        )}
                                                    </span>
                                                </div>

                                            </td>

                                            <td>

                                                <div
                                                    className={
                                                        user?.isOnline
                                                            ? "status-wrapper status-online"
                                                            : "status-wrapper status-offline"
                                                    }
                                                >

                                                    {user?.isOnline ? (
                                                        <CircleCheck size={14} />
                                                    ) : (
                                                        <Circle size={14} />
                                                    )}

                                                    <span>
                                                        {user?.isOnline
                                                            ? "Online"
                                                            : "Offline"}
                                                    </span>

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="empty-users"
                                        >

                                            <div className="empty-icon">
                                                <Search size={25} />
                                            </div>

                                            <h4>
                                                No users found
                                            </h4>

                                            <p>
                                                Try searching with a different
                                                name or email address.
                                            </p>

                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    {!loading && users.length > 0 && (
                        <div className="pagination">

                            <span className="pagination-label">
                                Showing page {currentPage} of {totalPages}
                            </span>

                            <div className="pagination-buttons">

                                <button
                                    type="button"
                                    onClick={goToPrevious}
                                    disabled={currentPage === 1}
                                    className="page-btn"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <span className="current-page">
                                    {currentPage}
                                </span>

                                <button
                                    type="button"
                                    onClick={goToNext}
                                    disabled={
                                        currentPage === totalPages
                                    }
                                    className="page-btn"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>

                            </div>

                        </div>
                    )}

                </section>

            </main>


            {/* =====================================================
                ADD USER MODAL
            ====================================================== */}

            {showAddUser && (

                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeModal();
                        }
                    }}
                >

                    <div className="add-user-modal">

                        <button
                            className="modal-close"
                            onClick={closeModal}
                            disabled={addingUser}
                            type="button"
                        >
                            <X size={18} />
                        </button>


                        <div className="modal-icon">
                            <UserPlus size={23} />
                        </div>


                        <span className="modal-eyebrow">
                            CONNECT
                        </span>

                        <h3>
                            Add a new user
                        </h3>

                        <p className="modal-description">
                            Enter the email address of the person you
                            want to connect with on KikChat.
                        </p>


                        <label className="modal-label">
                            User email
                        </label>

                        <div className="modal-input">

                            <Mail size={17} />

                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={addUser.email}
                                onChange={(e) =>
                                    setAddUser({
                                        ...addUser,
                                        email: e.target.value,
                                    })
                                }
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        !addingUser
                                    ) {
                                        handleAddUser();
                                    }
                                }}
                                autoFocus
                            />

                        </div>


                        <div className="modal-buttons">

                            <button
                                className="cancel-btn"
                                onClick={closeModal}
                                disabled={addingUser}
                                type="button"
                            >
                                Cancel
                            </button>

                            <button
                                className="modal-add-btn"
                                onClick={handleAddUser}
                                disabled={addingUser}
                                type="button"
                            >
                                <UserPlus size={16} />

                                {addingUser
                                    ? "Adding..."
                                    : "Add User"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default Contacts;