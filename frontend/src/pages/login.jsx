import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaComments,
  FaShieldAlt,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

import "../css/auth.css";

import logo from "../images/ChatGPT_Image_Jul_30__2026__11_05_27_AM-removebg-preview.png";

const Login = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.email.trim() || !user.password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing information",
        text: "Please enter your email and password.",
        confirmButtonColor: "#7c3aed",
      });

      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "http://localhost:1222/api/login",
        {
          email: user.email.trim(),
          password: user.password,
        },
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      await Swal.fire({
        icon: "success",
        title: "Welcome back! 👋",
        text: data.message || "Login successful.",
        confirmButtonColor: "#7c3aed",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/messages");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text:
          err.response?.data?.message ||
          "Unable to login. Please check your credentials.",
        confirmButtonColor: "#7c3aed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="auth-left">

        {/* Brand */}

        <div className="brand">
          <img
            src={logo}
            alt="KikChat logo"
            className="brand-logo"
          />

          <h2>KikChat</h2>
        </div>


        {/* Hero */}

        <div className="hero-content">

          <h1>
            Chat freely.
            <br />

            Connect deeply.
            <br />

            <span>Be real.</span>
          </h1>

          <p>
            KikChat brings real-time conversations,
            closer connections, and endless
            possibilities to your fingertips.
          </p>


          {/* Features */}

          <div className="feature-list">

            <div className="feature-card">
              <FaComments />

              <h4>Real-time</h4>

              <span>
                Messaging
              </span>
            </div>


            <div className="feature-card">
              <FaShieldAlt />

              <h4>Secure</h4>

              <span>
                & Private
              </span>
            </div>


            <div className="feature-card">
              <FaUsers />

              <h4>Connect</h4>

              <span>
                & Share
              </span>
            </div>

          </div>

        </div>


        {/* Footer */}

        <div className="auth-footer">
          © {new Date().getFullYear()}{" "}
          <span>KikChat</span>. All rights reserved.
        </div>

      </div>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="auth-right">

        <div className="auth-card">

          {/* Logo */}

          <div className="top-logo">
            <img
              src={logo}
              alt="KikChat"
            />
          </div>


          {/* Heading */}

          <h2 className="form-heading">
            Welcome Back
          </h2>

          <p className="form-subtitle">
            Login to continue your conversations.
          </p>


          {/* Login Form */}

          <form onSubmit={handleSubmit}>

            {/* Email */}

            <div className="input-box">

              <FaEnvelope
                className="input-icon"
                aria-hidden="true"
              />

              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={user.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
              />

            </div>


            {/* Password */}

            <div className="input-box">

              <FaLock
                className="input-icon"
                aria-hidden="true"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Password"
                value={user.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                disabled={loading}
              />


              <button
                type="button"
                className="eye-btn"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={loading}
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>


            {/* Forgot password */}

            <div className="remember-row">

              <label className="remember-me">

                <input
                  type="checkbox"
                  name="remember"
                />

                <span>
                  Remember me
                </span>

              </label>


              <Link
                to="/forgot-password"
                className="forgot-password"
              >
                Forgot password?
              </Link>

            </div>


            {/* Login button */}

            <button
              className="submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  Signing in...
                </>
              ) : (
                <>
                  Login
                  <span style={{ marginLeft: "8px" }}>
                    →
                  </span>
                </>
              )}
            </button>


            {/* Security indicator */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                marginTop: "14px",
                color: "#8b8499",
                fontSize: "11px",
              }}
            >
              <FaCheckCircle
                style={{
                  color: "#22c55e",
                  fontSize: "12px",
                }}
              />

              Secure & encrypted login
            </div>


            {/* Signup */}

            <p className="bottom-link">
              Don't have an account?

              <Link to="/signup">
                Sign up
              </Link>
            </p>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Login;