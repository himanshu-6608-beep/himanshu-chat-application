import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  MessageCircle,
  Users,
  Bell,
  Settings,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import "../css/sidebar.css";
import axios from "axios";
import Swal from "sweetalert2";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const getToken = () => localStorage.getItem("token");
  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:1222/api/logout",
        {},
        authConfig()
      )

      if (response.status !== 200) {
        Swal.fire({
          title: "Logout failed",
          icon: "error"
        })
        return;
      }
      Swal.fire({
        title: "Logout Succes",
        icon: "success"
      })
      localStorage.removeItem("user")
      localStorage.removeItem("token")

      navigate("/")
    } catch (error) {
      Swal.fire({
        title: "Something went wrong",
        icon: "error"
      })
    }
  }
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      <div className="sidebar-header">

        {!collapsed && (
          <h2>KikChat</h2>
        )}

        <button
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>

      </div>

      <div className="menu">

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            `menu-item ${isActive ? "active" : ""}`
          }
        >
          <MessageCircle size={22} />
          {!collapsed && <span>Messages</span>}
        </NavLink>

        <NavLink
          to="/contacts"
          className={({ isActive }) =>
            `menu-item ${isActive ? "active" : ""}`
          }
        >
          <Users size={22} />
          {!collapsed && <span>Contacts</span>}
        </NavLink>

        {/* <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `menu-item ${isActive ? "active" : ""}`
          }
        >
          <Bell size={22} />
          {!collapsed && <span>Notifications</span>}
        </NavLink> */}

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `menu-item ${isActive ? "active" : ""}`
          }
        >
          <Settings size={22} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <button className="logout-button" onClick={handleLogout}>Logout</button>

      </div>

      <div className="sidebar-footer">

        {!collapsed && (
          <div>

            <h4>{user?.name}</h4>

            <span>You</span>

          </div>
        )}

      </div>

    </div>
  );
}

export default Sidebar;