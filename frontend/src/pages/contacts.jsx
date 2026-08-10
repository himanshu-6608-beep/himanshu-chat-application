import { useState, useEffect, useMemo } from "react";
import Sidebar from "../partials/sidebar";
import axios from "axios";
import Swal from "sweetalert2";
import { Plus, Search } from "lucide-react";
import "../css/contacts.css";
import { socket } from "../services/socket";
import adminLogo from "../images/adminlogo.png";

const API_URL = "http://localhost:1222/api";
const currentUser = JSON.parse(localStorage.getItem("user"))
const Contacts = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [addUser, setAddUser] = useState({
        email: ""
    })
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [debouncing, setDebouncing] = useState("");

    const [showAddUser, setShowAddUser] = useState(false)
    const getToken = () => localStorage.getItem("token");
    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
  
    const handleGetUser = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${API_URL}/userfilter`,
                {
                    params: {
                        search: debouncing,
                        page: currentPage,
                        limit: 10
                    },
                    withCredentials: true
                }
            );

            console.log("Contacts:", response.data);

            setUsers(response.data.users || []);
            setTotalPages(response.data.totalPages || 1);

        } catch (err) {
            console.error("Get contacts error:", err.response?.data || err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };
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

    const handleAddUser = async () => {
        try {
            const response = await axios.post(
                `${API_URL}/adduser`,
                {
                    email: addUser.email,
                },
                {
                    withCredentials: true,
                }
            );

            Swal.fire({
                icon: "success",
                title: "User added successfully",
            });

            setAddUser({ email: "" });
            setShowAddUser(false);
            handleGetUser();
        } catch (error) {
            console.log(error)
            Swal.fire({
                icon: "error",
                title: error.response?.data?.message || "Something went wrong",
            });
        }
    };

    return (
        <div className="contacts-container">
            <Sidebar />

            <div className="users-panels">
                <div className="users-header">
                    <h2>Total Users</h2>

                    <button
                        className="add-btn"
                        title="Add User"
                        onClick={() => {
                            setShowAddUser(true);
                        }}
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="users-searchs">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="users-lists">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Sr.No</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Joined Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="empty-users">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length > 0 ? (
                                users.map((user, index) => (
                                    <tr key={user._id}>
                                        <td>{index + 1}.</td>

                                        <td>
                                            <div className="table-user">
                                                <img
                                                    src={
                                                        user?.profileImage
                                                            ? `http://localhost:1222/uploads/${user.profileImage}`
                                                            : adminLogo
                                                    }
                                                    alt="Profile"
                                                    className="settings-profile-image"
                                                />

                                                <span>{user.name}</span>
                                            </div>
                                        </td>

                                        <td>{user.email}</td>

                                        <td>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>

                                        <td>
                                            <span className="status online"></span>
                                            Online
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="empty-users">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {showAddUser && (
                <div className="modal-overlay">
                    <div className="add-user-modal">
                        <h3>Add New User</h3>

                        <input
                            type="email"
                            placeholder="Enter User Email"
                            value={addUser.email}
                            onChange={(e) =>
                                setAddUser({
                                    ...addUser,
                                    email: e.target.value,
                                })
                            }
                        />

                        <div className="modal-buttons">
                            <button className="add-btn" onClick={handleAddUser}>
                                Add User
                            </button>

                            <button
                                className="cancel-btn"
                                onClick={() => setShowAddUser(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Contacts;