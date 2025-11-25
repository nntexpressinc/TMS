import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { ApiService } from "../../api/auth";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { lightLogo } from "../../images";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { OverlayLoader } from "../loader/PulseDotsLoader";
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [pageVisibility, setPageVisibility] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    // Get geolocation
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
          },
          (err) => {
            setError("Please allow geolocation");
            toast.error("Please allow location access!");
          }
        );
      } else {
        setError("Browser does not support geolocation");
        toast.error("Browser does not support geolocation");
      }
    };

    // Get device information
    const getDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      setDeviceInfo(userAgent);
    };

    // Get page visibility status
    const getPageVisibility = () => {
      setPageVisibility(document.visibilityState === "visible" ? "open" : "hidden");
    };

    // Add visibility change event listener
    const handleVisibilityChange = () => {
      setPageVisibility(document.visibilityState === "visible" ? "open" : "hidden");
    };

    getLocation();
    getDeviceInfo();
    getPageVisibility();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup event listener
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Login so'rovi
      const data = { email, password };
      const response = await ApiService.login(data);
      // console.log("Login Response:", response);

      // Save tokens
      localStorage.setItem("accessToken", response.access);
      localStorage.setItem("refreshToken", response.refresh);
      localStorage.setItem("userid", response.user_id);
      // Save user info (if present in response)
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      } else {
        try {
          const userData = await ApiService.getData(`/auth/users/${response.user_id}/`);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (userError) {
          console.error("Error fetching user data:", userError);
        }
      }
      // Fetch and encode role and permissions
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.role) {
          // Get role info (to get permission_id)
          const roleData = await ApiService.getData(`/auth/role/${user.role}/`);
          const roleNameEnc = btoa(unescape(encodeURIComponent(roleData.name)));
          localStorage.setItem("roleNameEnc", roleNameEnc);
          // Remove plain text
          localStorage.removeItem("roleName");
          // Get permissions using permission_id from role
          if (roleData.permission_id) {
            const permissionData = await ApiService.getData(`/auth/permission/${roleData.permission_id}/`);
            const permissionsEnc = btoa(unescape(encodeURIComponent(JSON.stringify(permissionData))));
            localStorage.setItem("permissionsEnc", permissionsEnc);
            localStorage.removeItem("permissions");
          }
        }
      } catch (err) {
        console.error("Error encoding role/permissions:", err);
      }
      
      login();

      // 2. Geolokatsiya, qurilma va sahifa holatini API'ga yuborish
      if (location && deviceInfo && pageVisibility) {
        const additionalData = {
          latitude: location.latitude,
          longitude: location.longitude,
          user: response.user_id,
          device_info: deviceInfo,
          page_status: pageVisibility,
        };
        // console.log("Yuborilayotgan additionalData:", additionalData);
        try {
          const additionalResponse = await ApiService.postData("/auth/location/", additionalData, response.access);
          console.log("Additional Data Response:", additionalResponse);
        } catch (additionalError) {
          console.error("Error saving data:", additionalError);
          toast.error("Error occurred while saving data!");
        }
      } else {
        console.error("Incomplete data");
        toast.error("Incomplete data!");
      }

      // Find first allowed route after login
      function getFirstAllowedRoute() {
        const permissionsEnc = localStorage.getItem("permissionsEnc");
        let permissions = {};
        if (permissionsEnc) {
          try {
            permissions = JSON.parse(decodeURIComponent(escape(atob(permissionsEnc))));
          } catch (e) {
            permissions = {};
          }
        }
        const sidebarRoutes = [
          { path: "/loads", key: "loads" },
          { path: "/truck", key: "vehicles" },
          { path: "/trailer", key: "vehicles" },
          { path: "/customer_broker", key: "customer_broker" },
          { path: "/driver", key: "driver" },
          { path: "/employee", key: "employee" },
          { path: "/dispatcher", key: "dispatcher" },
          { path: "/users-actives", key: "users_actives" },
          { path: "/accounting", key: "accounting" },
          { path: "/manage-users", key: "manage_users" },
          { path: "/manage-units", key: "manage_units" },
          { path: "/manage-teams", key: "manage_teams" },
        ];
        for (const route of sidebarRoutes) {
          if (permissions[route.key] === true) {
            return route.path;
          }
        }
        return "/permission-denied";
      }

      toast.success("Login successful!");
      navigate(getFirstAllowedRoute(), { replace: true });
    } catch (error) {
      console.error("Login Failed:", error);
      const errorMessage = error.response?.data?.detail || "Login failed. Please check your credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* Animated background pattern */}
      <div className="login-background">
        <div className="animated-grid"></div>
      </div>

      {/* Main login container */}
      <div className="login-container">
        <div className="login-card">
          {/* Logo and header */}
          <div className="login-header">
            <div className="logo-wrapper">
              <img src={lightLogo} alt="logo" className="login-logo" />
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Please sign in to continue</p>
          </div>

          {/* Login form */}
          <form className="login-form" onSubmit={handleLogin}>
            {error && (
              <div className="error-message">
                <span>{error}</span>
              </div>
            )}

            {/* Email field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="form-input"
                  required
                  disabled={!location}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper password-wrapper">
                <input
                  type={showPassword ? "password" : "text"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input"
                  required
                  disabled={!location}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={!location}
                >
                  {showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="forgot-password-wrapper">
              <NavLink to="/forgot-password" className="forgot-password-link">
                {t("Forgot Password")}?
              </NavLink>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="login-button"
              disabled={!location || !deviceInfo || !pageVisibility || loading}
            >
              {loading ? (
                <span className="button-loading">Signing in...</span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="login-footer">
            <NavLink to="/support" className="footer-link">
              {t("Support")}
            </NavLink>
            <span className="footer-separator">•</span>
            <NavLink to="/terms" className="footer-link">
              {t("Terms")}
            </NavLink>
            <span className="footer-separator">•</span>
            <NavLink to="/privacy" className="footer-link">
              {t("Privacy")}
            </NavLink>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && <OverlayLoader label={t("Signing in") || "Signing in"} />}
    </main>
  );
};

export default LoginPage;