import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaComments,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/auth.css";
import logo from "../images/ChatGPT_Image_Jul_30__2026__11_05_27_AM-removebg-preview.png";

function Signup() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.name || !user.email || !user.password) {
      return Swal.fire("Please fill all fields", "", "warning");
    }

    try {
      const { data } = await axios.post(
        "http://localhost:1222/api/signup",
        user
      );

      Swal.fire("Success", data.message, "success");

      navigate("/messages");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Signup Failed",
        "error"
      );
    }
  };

  return (
    <div className="auth-wrapper">

      <div className="auth-left">

        <div className="brand">
          <img src={logo} alt="KikChat" className="brand-logo" />
          <h2>KikChat</h2>
        </div>

        <div className="hero-content">

          <h1>
            Chat freely.
            <br />
            Connect deeply.
            <br />
            <span>Be real.</span>
          </h1>

          <p>
            Join thousands of users on KikChat and enjoy
            secure conversations, instant messaging and
            seamless communication.
          </p>

          <div className="feature-list">

            <div className="feature-card">
              <FaComments />
              <h4>Real-time</h4>
              <span>Messaging</span>
            </div>

            <div className="feature-card">
              <FaShieldAlt />
              <h4>Secure</h4>
              <span>& Private</span>
            </div>

            <div className="feature-card">
              <FaUsers />
              <h4>Connect</h4>
              <span>& Share</span>
            </div>

          </div>

        </div>

      </div>

      <div className="auth-right">

        <div className="auth-card">

          <div className="top-logo">
            <img src={logo} alt="logo" />
          </div>

          <h2 className="form-heading">
            Create Account
          </h2>

          <p className="form-subtitle">
            Join KikChat and start chatting today.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="input-box">
              <FaUser className="input-icon" />

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={user.name}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">
              <FaEnvelope className="input-icon" />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={user.email}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">

              <FaLock className="input-icon" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={user.password}
                onChange={handleChange}
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>


            </div>
            <p className="bottom-link">
              Already have an account?
              <Link to="/"> Login</Link>
            </p>

            <button
              className="submit-btn"
              type="submit"
            >
              Create Account →
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}
export default Signup;    