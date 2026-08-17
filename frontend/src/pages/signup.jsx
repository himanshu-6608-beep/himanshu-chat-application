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
  FaCheckCircle,
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getPasswordStrength = () => {
    const password = user.password;

    if (!password) {
      return {
        label: "",
        width: "0%",
        className: "",
      };
    }

    if (password.length < 6) {
      return {
        label: "Weak password",
        width: "33%",
        className: "weak",
      };
    }

    if (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return {
        label: "Strong password",
        width: "100%",
        className: "strong",
      };
    }

    return {
      label: "Good password",
      width: "66%",
      className: "medium",
    };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.name.trim() || !user.email.trim() || !user.password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing information",
        text: "Please fill in all fields.",
        confirmButtonColor: "#5f7ff2",
      });

      return;
    }

    if (user.password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password too short",
        text: "Your password should contain at least 6 characters.",
        confirmButtonColor: "#5f7ff2",
      });

      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "http://localhost:1222/api/signup",
        user
      );

      await Swal.fire({
        icon: "success",
        title: "Account Created!",
        text: data.message || "Your KikChat account has been created.",
        confirmButtonColor: "#5f7ff2",
      });

      navigate("/messages");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text:
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#5f7ff2",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">

      {/* =====================================================
          LEFT PROMOTIONAL SECTION
      ====================================================== */}

      <div className="auth-left">

        <div className="brand">
          <img
            src={logo}
            alt="KikChat logo"
            className="brand-logo"
          />

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
            Create your KikChat account and connect with
            friends, family and communities through fast,
            simple and secure conversations.
          </p>

          <div className="feature-list">

            <div className="feature-card">
              <FaComments />

              <h4>Real-time</h4>

              <span>
                Instant messaging
              </span>
            </div>

            <div className="feature-card">
              <FaShieldAlt />

              <h4>Secure</h4>

              <span>
                Private conversations
              </span>
            </div>

            <div className="feature-card">
              <FaUsers />

              <h4>Connect</h4>

              <span>
                People who matter
              </span>
            </div>

          </div>

        </div>

        <div className="auth-footer">
          © 2026 <span>KikChat</span>. All rights reserved.
        </div>

      </div>


      {/* =====================================================
          RIGHT SIGNUP SECTION
      ====================================================== */}

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
            Create <span>Account</span>
          </h2>

          <p className="form-subtitle">
            Join KikChat and start meaningful conversations today.
          </p>


          {/* Form */}

          <form onSubmit={handleSubmit}>

            {/* Full Name */}

            <div className="input-box">

              <FaUser className="input-icon" />

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={user.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />

            </div>


            {/* Email */}

            <div className="input-box">

              <FaEnvelope className="input-icon" />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={user.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />

            </div>


            {/* Password */}

            <div className="input-box">

              <FaLock className="input-icon" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create Password"
                value={user.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                minLength={6}
              />

              <button
                type="button"
                className="eye-btn"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>


            {/* Password strength */}

            {user.password && (
              <div className="password-strength">

                <div className="strength-track">

                  <div
                    className={`strength-bar ${passwordStrength.className}`}
                    style={{
                      width: passwordStrength.width,
                    }}
                  />

                </div>

                <span className={passwordStrength.className}>
                  {passwordStrength.label}
                </span>

              </div>
            )}


            {/* Login link */}

            <p className="bottom-link signup-login-link">
              Already have an account?

              <Link to="/">
                Login
              </Link>
            </p>


            {/* Submit */}

            <button
              className="submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create Account <span>→</span>
                </>
              )}
            </button>


            {/* Security message */}

            <div className="secure-message">
              <FaCheckCircle />

              <span>
                Your information is protected and secure
              </span>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Signup;