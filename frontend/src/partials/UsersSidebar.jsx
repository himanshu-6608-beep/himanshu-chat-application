import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Search, Users } from "lucide-react";
import "../css/UsersSidebar.css";
import { socket } from "../services/socket";
import adminLogo from "../images/adminlogo.png";

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
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const getToken = () => localStorage.getItem("token");
  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
  const handleGetUser = async () => {
    try {

      const response = await axios.get(
        "http://localhost:1222/api/userfilter",
        {
          ...authConfig(),
          params: {
            search: debouncing,
            page: currentPage,
            limit: 10
          }
        }
      );


      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);

    } catch (err) {
      console.error("Get contacts error:", err.response?.data || err);
      setUsers([]);
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
  return (
    <div className="users-panel">
      <div className="users-header">
        <h2>Chats</h2>
      </div>

      <div className="users-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="users-list">
        {users.length ? (
          users.map((user) => (
            <div
              key={user._id}
              className={`user-card ${selectedUser?._id === user._id
                ? "active-user"
                : ""
                }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="user-avatar">
                <img
                  src={
                    user?.profileImage
                      ? `http://localhost:1222/uploads/${user.profileImage}`
                      : adminLogo
                  }
                  alt="Profile"
                  className="settings-profile-image"
                />


                <span
                  className={`online-dot ${user.isOnline ? "online" : "offline"
                    }`}
                ></span>
              </div>

              <div className="user-info">
                <h4>{user.name}</h4>
                <span>
                  {user.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-users">
            No users found.
          </p>
        )}
      </div>
    </div>
  );
}

export default UsersSidebar;