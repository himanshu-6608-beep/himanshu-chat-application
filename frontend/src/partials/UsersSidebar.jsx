import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Search } from "lucide-react";
import "../css/UsersSidebar.css";

function UsersSidebar({
  selectedUser,
  setSelectedUser,
  search,
  setSearch,
}) {
  const [users, setUsers] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const getUsers = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:1222/api/users", {
        withCredentials: true 
      }
      );

      const allUsers = data.users || data;

      setUsers(
        allUsers.filter(
          (user) => user._id !== currentUser._id
        )
      );
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Failed to load users",
        text: "Unable to fetch users.",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

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
        {filteredUsers.length ? (
          filteredUsers.map((user) => (
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
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name
                  )}&background=748d4b&color=ffffff`}
                  alt={user.name}
                />

                <span className="online-dot"></span>
              </div>

              <div className="user-info">
                <h4>{user.name}</h4>

                <span>Online</span>
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