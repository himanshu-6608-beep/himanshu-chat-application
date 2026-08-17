import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Users,
    MessageCircle,
    X,
} from "lucide-react";

import "../css/UsersSidebar.css";
import adminLogo from "../images/adminlogo.png";

const API_URL = "http://localhost:1222";
const USERS_PER_PAGE = 10;

function UsersSidebar({
    selectedUser,
    setSelectedUser,
    search,
    setSearch,
}) {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [debouncing, setDebouncing] = useState("");
    const [loading, setLoading] = useState(false);

    const getToken = () => localStorage.getItem("token");

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    /*
     * Fetch users
     */
    const handleGetUser = useCallback(async () => {
        const token = getToken();

        if (!token) {
            setUsers([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = await axios.get(
                `${API_URL}/api/userfilter`,
                {
                    ...authConfig(),
                    params: {
                        search: debouncing.trim(),
                        page: currentPage,
                        limit: USERS_PER_PAGE,
                    },
                }
            );

            const fetchedUsers = response.data?.users || [];

            setUsers(fetchedUsers);
            setTotalPages(
                Math.max(Number(response.data?.totalPages) || 1, 1)
            );
        } catch (error) {
            console.error(
                "Get contacts error:",
                error.response?.data || error
            );

            setUsers([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [debouncing, currentPage]);

    /*
     * Search debounce
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncing(search);
            setCurrentPage(1);
        }, 450);

        return () => clearTimeout(timer);
    }, [search]);

    /*
     * Fetch users whenever page/search changes
     */
    useEffect(() => {
        handleGetUser();
    }, [handleGetUser]);

    /*
     * Select user
     */
    const handleSelectUser = (user) => {
        setSelectedUser(user);
    };

    /*
     * Clear search
     */
    const handleClearSearch = () => {
        setSearch("");
        setDebouncing("");
        setCurrentPage(1);
    };

    /*
     * Pagination
     */
    const goToPreviousPage = () => {
        setCurrentPage((page) => Math.max(page - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage((page) =>
            Math.min(page + 1, totalPages)
        );
    };

    return (
        <aside className="users-panel">

            {/* ================= HEADER ================= */}

            <header className="users-header">
                <div className="users-title-wrapper">
                    <div className="users-title-icon">
                        <MessageCircle size={20} strokeWidth={2.3} />
                    </div>

                    <div>
                        <h2>Chats</h2>

                        <span className="users-subtitle">
                            Your conversations
                        </span>
                    </div>
                </div>

                <div className="users-count">
                    <Users size={14} />
                    <span>{users.length}</span>
                </div>
            </header>

            {/* ================= SEARCH ================= */}

            <div className="users-search">
                <Search
                    size={18}
                    strokeWidth={2}
                    className="search-icon"
                />

                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    autoComplete="off"
                    aria-label="Search conversations"
                />

                {search && (
                    <button
                        type="button"
                        className="clear-search"
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* ================= LIST HEADER ================= */}

            {!loading && users.length > 0 && (
                <div className="users-list-header">
                    <span>
                        {search
                            ? `Results for "${search}"`
                            : "All conversations"}
                    </span>

                    <span className="users-result-count">
                        {users.length} {users.length === 1 ? "user" : "users"}
                    </span>
                </div>
            )}

            {/* ================= USER LIST ================= */}

            <div className="users-list">

                {loading ? (
                    <div className="users-loading">

                        <div className="loading-spinner" />

                        <div className="loading-lines">
                            <span />
                            <span />
                            <span />
                        </div>

                        <p>Loading conversations...</p>
                    </div>
                ) : users.length > 0 ? (
                    users.map((user, index) => {

                        const isSelected =
                            selectedUser?._id?.toString() ===
                            user?._id?.toString();

                        const profileImage = user?.profileImage
                            ? `${API_URL}/uploads/${user.profileImage}`
                            : adminLogo;

                        return (
                            <div
                                key={user._id}
                                className={`user-card ${
                                    isSelected ? "active-user" : ""
                                }`}
                                style={{
                                    "--animation-delay": `${index * 35}ms`,
                                }}
                                onClick={() =>
                                    handleSelectUser(user)
                                }
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {
                                        handleSelectUser(user);
                                    }
                                }}
                            >
                                {/* Avatar */}

                                <div className="user-avatar">
                                    <img
                                        src={profileImage}
                                        alt={
                                            user?.name ||
                                            "Profile"
                                        }
                                        onError={(event) => {
                                            event.currentTarget.src =
                                                adminLogo;
                                        }}
                                    />

                                    <span
                                        className={`online-dot ${
                                            user?.isOnline
                                                ? "online"
                                                : "offline"
                                        }`}
                                    />
                                </div>

                                {/* User information */}

                                <div className="user-info">
                                    <h4 title={user?.name}>
                                        {user?.name || "Unknown User"}
                                    </h4>

                                    <span
                                        className={
                                            user?.isOnline
                                                ? "online-text"
                                                : "offline-text"
                                        }
                                    >
                                        <i className="status-indicator" />

                                        {user?.isOnline
                                            ? "Online"
                                            : "Offline"}
                                    </span>
                                </div>

                                {/* Selection indicator */}

                                <div className="user-arrow">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-users">

                        <div className="empty-users-icon">
                            <Search size={25} />
                        </div>

                        <h3>
                            {search
                                ? "No users found"
                                : "No conversations yet"}
                        </h3>

                        <p>
                            {search
                                ? "Try searching with a different name or spelling."
                                : "Your available conversations will appear here."}
                        </p>

                        {search && (
                            <button
                                type="button"
                                className="empty-clear-btn"
                                onClick={handleClearSearch}
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ================= PAGINATION ================= */}

            {totalPages > 1 && (
                <div className="users-pagination">

                    <button
                        type="button"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={17} />
                    </button>

                    <div className="pagination-info">
                        <span className="pagination-current">
                            {currentPage}
                        </span>

                        <span className="pagination-separator">
                            /
                        </span>

                        <span>
                            {totalPages}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={goToNextPage}
                        disabled={
                            currentPage === totalPages
                        }
                        aria-label="Next page"
                    >
                        <ChevronRight size={17} />
                    </button>

                </div>
            )}
        </aside>
    );
}

export default UsersSidebar;