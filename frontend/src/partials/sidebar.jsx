import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  MessageCircle,
  Users,
  Settings,
  LogOut,
  X,
  PanelLeft,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import "../css/sidebar.css";
import axios from "axios";
import Swal from "sweetalert2";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const getToken = () => localStorage.getItem("token");

  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  /*
   * Logout
   */
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:1222/api/logout",
        {},
        authConfig()
      );

      if (response.status !== 200) {
        Swal.fire({
          title: "Logout failed",
          text: "Unable to logout. Please try again.",
          icon: "error",
          confirmButtonColor: "#7c3aed",
        });

        return;
      }

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      await Swal.fire({
        title: "Logout Successful",
        text: "You have been logged out.",
        icon: "success",
        confirmButtonColor: "#7c3aed",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);

      Swal.fire({
        title: "Something went wrong",
        text: "Unable to logout. Please try again.",
        icon: "error",
        confirmButtonColor: "#7c3aed",
      });
    }
  };

  /*
   * Navigation items
   */
  const menuItems = [
    {
      path: "/messages",
      label: "Messages",
      icon: MessageCircle,
    },
    {
      path: "/contacts",
      label: "Contacts",
      icon: Users,
    },
    {
      path: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  /*
   * Clear search
   */
  const handleClearSearch = () => {
    setSearch("");
  };

  /*
   * Filter navigation items
   */
  const filteredMenuItems = menuItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sidebar-header">

        <div className="brand-wrapper">
          <div className="brand-icon">
            <MessageCircle
              size={20}
              strokeWidth={2.4}
            />
          </div>

          {!collapsed && (
            <div className="brand-text">
              <h2>KikChat</h2>
              <span>Stay connected</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="toggle-btn"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>

      </header>


      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="search-box">

        <Search
          size={18}
          strokeWidth={2}
          className="search-icon"
        />

        {!collapsed && (
          <>
            <input
              type="text"
              placeholder="Search menu..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              autoComplete="off"
              aria-label="Search menu"
            />

            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </>
        )}

      </div>


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="menu">

        {!collapsed && (
          <div className="menu-label">
            MAIN MENU
          </div>
        )}

        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map(
            ({ path, label, icon: Icon }, index) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `menu-item ${
                    isActive ? "active" : ""
                  }`
                }
                title={collapsed ? label : ""}
                style={{
                  "--menu-delay": `${index * 45}ms`,
                }}
              >
                <span className="menu-icon">
                  <Icon
                    size={20}
                    strokeWidth={2}
                  />
                </span>

                {!collapsed && (
                  <span className="menu-text">
                    {label}
                  </span>
                )}

                {!collapsed && (
                  <ChevronRight
                    className="menu-arrow"
                    size={15}
                  />
                )}
              </NavLink>
            )
          )
        ) : (
          !collapsed && (
            <div className="no-menu-results">
              <Search size={20} />

              <span>
                No menu found
              </span>
            </div>
          )
        )}

      </nav>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="sidebar-footer">

        {/* USER PROFILE */}

        {!collapsed && (
          <div className="sidebar-user">

            <div className="sidebar-user-avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}

              <span className="user-online-dot" />
            </div>

            <div className="sidebar-user-info">

              <h4 title={user?.name || "User"}>
                {user?.name || "User"}
              </h4>

              <span>
                <i />
                Online
              </span>

            </div>

          </div>
        )}


        {/* LOGOUT */}

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : ""}
        >
          <span className="logout-icon">
            <LogOut
              size={18}
              strokeWidth={2}
            />
          </span>

          {!collapsed && (
            <span>
              Logout
            </span>
          )}
        </button>

      </footer>

    </aside>
  );
}

export default Sidebar;