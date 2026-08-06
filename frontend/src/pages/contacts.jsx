import { useState, useEffect, useMemo } from "react";
import Sidebar from "../partials/sidebar";
import axios from "axios";
import Swal from "sweetalert2";
import { Plus, Search } from "lucide-react";
import "../css/contacts.css";

const API_URL = "http://localhost:1222/api";

const Contacts = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [addUser, setAddUser] = useState({
        email: ""
    })
    const [showAddUser, setShowAddUser] = useState(false)
    const handleGetUser = async () => {
        try {
            setLoading(true);

            const response = await axios.get(`${API_URL}/users`, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setUsers(response.data.users || []);
            } else {
                Swal.fire({
                    title: "Something went wrong",
                    text: "Unable to fetch users.",
                    icon: "error",
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Failed to fetch users",
                text: error.response?.data?.message || error.message,
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetUser();
    }, []);

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

        } catch (error) {
            console.log(error)
            Swal.fire({
                icon: "error",
                title: error.response?.data?.message || "Something went wrong",
            });
        }
    };
    const filteredUsers = useMemo(() => {
        return users.filter((user) =>
            user.name?.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

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
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user, index) => (
                                    <tr key={user._id}>
                                        <td>{index + 1}.</td>

                                        <td>
                                            <div className="table-user">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                        user.name || "User"
                                                    )}&background=748d4b&color=fff`}
                                                    alt={user.name}
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
                <div className="add-user-modal">
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

                    <button onClick={handleAddUser}>
                        Add User
                    </button>

                    <button onClick={() => setShowAddUser(false)}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default Contacts;