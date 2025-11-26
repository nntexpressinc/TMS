import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { ApiService } from "../../api/auth";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { lightLogo } from "../../images";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { OverlayLoader } from "../loader/PulseDotsLoader";
import "./LoginPage.css";
import { initializeAuthSession, clearAuthSession } from "../../utils/authSession";
import { getFirstAllowedRoute } from "../../utils/navigation";
import {
  clearPendingVerification,
  loadPendingVerification,
  savePendingVerification,
} from "../../utils/verification";

const computeRemainingSeconds = (isoString) => {
  if (!isoString) {
    return 0;
  }
  const timestamp = Date.parse(isoString);
  if (Number.isNaN(timestamp)) {
    return 0;
  }
  const diff = Math.floor((timestamp - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
};

const formatCountdown = (seconds) => {
  const value = seconds > 0 ? seconds : 0;
  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const secs = (value % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [pageVisibility, setPageVisibility] = useState(null);
  const [mode, setMode] = useState("login");
  const [code, setCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [activeSessionsCount, setActiveSessionsCount] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [resendAvailableAt, setResendAvailableAt] = useState(null);
  const [resendRemainingSeconds, setResendRemainingSeconds] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [lastKnownLat, setLastKnownLat] = useState(null);
  const [lastKnownLng, setLastKnownLng] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const userAgent = useMemo(() => (typeof navigator !== "undefined" ? navigator.userAgent : ""), []);
  const pendingEmailRef = useRef(null);
  const pendingPasswordRef = useRef(null);

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
          },
          () => {
            setError("Please allow geolocation");
            toast.error("Please allow location access!");
          }
        );
      } else {
        setError("Browser does not support geolocation");
        toast.error("Browser does not support geolocation");
      }
    };

    const getDeviceInfo = () => {
      setDeviceInfo(userAgent);
    };

    const getPageVisibility = () => {
      setPageVisibility(document.visibilityState === "visible" ? "open" : "hidden");
    };

    const handleVisibilityChange = () => {
      setPageVisibility(document.visibilityState === "visible" ? "open" : "hidden");
    };

    getLocation();
    getDeviceInfo();
    getPageVisibility();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userAgent]);

  const resetVerificationState = useCallback(
    (clearStorage = false) => {
      setMode("login");
      setCode("");
      setVerificationMessage("");
      setActiveSessionsCount(null);
      setExpiresAt(null);
      setRemainingSeconds(0);
      setResendAvailableAt(null);
      setResendRemainingSeconds(0);
      setResendLoading(false);
      setLastKnownLat(null);
      setLastKnownLng(null);
      setError(null);
      pendingEmailRef.current = null;
      pendingPasswordRef.current = null;
      if (clearStorage) {
        clearPendingVerification();
      }
    },
    []
  );

  useEffect(() => {
    const stored = loadPendingVerification();
    if (stored?.email) {
      setEmail((prev) => prev || stored.email);
      pendingEmailRef.current = stored.email;
      pendingPasswordRef.current = null;
      setMode("verify");
      setVerificationMessage(stored.message || "We sent a verification code to your email.");
      setActiveSessionsCount(
        typeof stored.activeSessionsCount === "number" ? stored.activeSessionsCount : null
      );
      setExpiresAt(stored.verificationExpiresAt || null);
      setRemainingSeconds(computeRemainingSeconds(stored.verificationExpiresAt));
      setResendAvailableAt(stored.resendAvailableAt || null);
      setResendRemainingSeconds(computeRemainingSeconds(stored.resendAvailableAt));
      setCode("");
      setLastKnownLat(stored.lat ?? null);
      setLastKnownLng(stored.lng ?? null);
    }
  }, []);

  useEffect(() => {
    if (!expiresAt) {
      setRemainingSeconds(0);
      return;
    }

    const update = () => {
      setRemainingSeconds(computeRemainingSeconds(expiresAt));
    };

    update();
    const intervalId = setInterval(update, 1000);
    return () => clearInterval(intervalId);
  }, [expiresAt]);

  useEffect(() => {
    if (!resendAvailableAt) {
      setResendRemainingSeconds(0);
      return;
    }

    const update = () => {
      setResendRemainingSeconds(computeRemainingSeconds(resendAvailableAt));
    };

    update();
    const intervalId = setInterval(update, 1000);
    return () => clearInterval(intervalId);
  }, [resendAvailableAt]);

  useEffect(() => {
    const trimmed = email.trim();
    if (mode === "verify" && pendingEmailRef.current && trimmed && trimmed !== pendingEmailRef.current) {
      resetVerificationState(true);
    }
  }, [email, mode, resetVerificationState]);

  useEffect(() => {
    if (
      mode === "verify" &&
      pendingPasswordRef.current !== null &&
      password !== pendingPasswordRef.current
    ) {
      resetVerificationState(true);
    }
  }, [mode, password, resetVerificationState]);

  const enterVerificationMode = useCallback(
    (response, trimmedEmail) => {
      const {
        message,
        active_sessions_count: activeCount,
        debug,
        lat,
        lng,
        verification_expires_at: verificationExpiresAt,
        resend_available_at: resendAt,
      } = response || {};

      const pendingData = {
        email: trimmedEmail,
        message,
        activeSessionsCount: activeCount,
        debugCode: debug?.verification_code,
        lat: lat ?? debug?.lat ?? null,
        lng: lng ?? debug?.lng ?? null,
        verificationExpiresAt: verificationExpiresAt || null,
        resendAvailableAt: resendAt || null,
        createdAt: new Date().toISOString(),
      };

      pendingEmailRef.current = trimmedEmail;
      pendingPasswordRef.current = password;
      setMode("verify");
      setError(null);
      setVerificationMessage(message || "We sent a verification code to your email.");
      setActiveSessionsCount(typeof activeCount === "number" ? activeCount : null);
      setCode("");
      setExpiresAt(verificationExpiresAt || null);
      setRemainingSeconds(computeRemainingSeconds(verificationExpiresAt));
      setResendAvailableAt(resendAt || null);
      setResendRemainingSeconds(computeRemainingSeconds(resendAt));
      setLastKnownLat(pendingData.lat ?? null);
      setLastKnownLng(pendingData.lng ?? null);
      savePendingVerification(pendingData);
      clearAuthSession();
      toast(message || "Additional verification required. A code has been emailed to you.");
    },
    [password]
  );

  const handleLogin = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const trimmedEmail = email.trim();
      const payload = {
        email: trimmedEmail,
        password,
        device_info: deviceInfo || "unknown",
      };

      const response = await ApiService.login(payload);

      if (response?.requires_verification) {
        enterVerificationMode(response, trimmedEmail);
        return;
      }

      await initializeAuthSession(response, {
        location,
        deviceInfo,
        pageVisibility,
      });

      clearPendingVerification();
      resetVerificationState();
      login();
      toast.success("Login successful!");
      navigate(getFirstAllowedRoute(), { replace: true });
    } catch (error) {
      console.error("Login Failed:", error);
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        clearAuthSession();
        navigate("/auth/login", { replace: true });
      }

      if (status === 503 || error.response?.data?.error === "verification_email_failed") {
        const message = "Verification email was not sent, please try again later.";
        setError(message);
        toast.error(message);
        return;
      }

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [deviceInfo, email, enterVerificationMode, location, login, navigate, pageVisibility, password, resetVerificationState]);

  const handleVerify = useCallback(async () => {
    if (!code) {
      setError("Enter the verification code to continue.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const trimmedEmail = (pendingEmailRef.current || email).trim();
      const response = await ApiService.verifyCode({
        email: trimmedEmail,
        code: code.trim(),
        device_info: deviceInfo || "unknown",
      });

      await initializeAuthSession(response, {
        location,
        deviceInfo,
        pageVisibility,
      });

      clearPendingVerification();
      resetVerificationState();
      login();
      toast.success("Verification successful! Redirecting...");
      navigate(getFirstAllowedRoute(), { replace: true });
    } catch (error) {
      console.error("Verification Failed:", error);
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        clearAuthSession();
        clearPendingVerification();
        navigate("/auth/login", { replace: true });
        return;
      }

      if (status === 503 || error.response?.data?.error === "verification_email_failed") {
        const message = "Verification email was not sent, please try again later.";
        setError(message);
        toast.error(message);
        return;
      }

      const backendMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Verification failed. Please try again.";

      let friendlyMessage = backendMessage;
      if (/expired/i.test(backendMessage)) {
        friendlyMessage = "Code expired - request a new one.";
      } else if (/invalid/i.test(backendMessage)) {
        friendlyMessage = "Incorrect code - double-check and try again.";
      } else if (!error.response) {
        friendlyMessage = "Network unavailable - try again.";
      }

      setError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [code, deviceInfo, email, location, login, navigate, pageVisibility, resetVerificationState]);

  const handleResend = useCallback(async () => {
    if (!pendingEmailRef.current) {
      setError("Enter your email and request a verification code first.");
      return;
    }

    setResendLoading(true);
    setError(null);

    try {
      const trimmedEmail = pendingEmailRef.current;
      const response = await ApiService.resendVerificationCode({
        email: trimmedEmail,
        device_info: deviceInfo || "unknown",
      });

      const message =
        response?.message || "We sent a new verification code. Please check your inbox.";
      toast.success(message);

      const updatedLat = response?.lat ?? response?.debug?.lat ?? lastKnownLat ?? null;
      const updatedLng = response?.lng ?? response?.debug?.lng ?? lastKnownLng ?? null;
      const updatedActive =
        typeof response?.active_sessions_count === "number"
          ? response.active_sessions_count
          : activeSessionsCount;
      const updatedDebugCode = response?.debug?.verification_code || code;

      const updatedPending = {
        email: trimmedEmail,
        message: response?.message,
        activeSessionsCount: updatedActive,
        debugCode: updatedDebugCode,
        lat: updatedLat,
        lng: updatedLng,
        verificationExpiresAt: response?.verification_expires_at || null,
        resendAvailableAt: response?.resend_available_at || null,
        createdAt: new Date().toISOString(),
      };

      setVerificationMessage(response?.message || verificationMessage);
      setActiveSessionsCount(updatedActive ?? null);
      setCode("");
      setExpiresAt(updatedPending.verificationExpiresAt || null);
      setRemainingSeconds(computeRemainingSeconds(updatedPending.verificationExpiresAt));
      setResendAvailableAt(updatedPending.resendAvailableAt || null);
      setResendRemainingSeconds(computeRemainingSeconds(updatedPending.resendAvailableAt));
      setLastKnownLat(updatedLat);
      setLastKnownLng(updatedLng);

      savePendingVerification(updatedPending);
    } catch (error) {
      console.error("Resend Failed:", error);
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        clearAuthSession();
        clearPendingVerification();
        navigate("/auth/login", { replace: true });
        return;
      }

      if (status === 503 || error.response?.data?.error === "verification_email_failed") {
        const message = "Verification email was not sent, please try again later.";
        setError(message);
        toast.error(message);
        return;
      }

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Unable to resend the verification code.";
      setError(message);
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  }, [activeSessionsCount, code, deviceInfo, lastKnownLat, lastKnownLng, navigate, verificationMessage]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mode === "verify") {
      handleVerify();
    } else {
      handleLogin();
    }
  };

  return (
    <main className="login-page">
      <div className="login-background">
        <div className="animated-grid"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-wrapper">
              <img src={lightLogo} alt="logo" className="login-logo" />
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Please sign in to continue</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <span>{error}</span>
              </div>
            )}

            {mode !== "verify" && (
              <>
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
                      disabled={!location || loading}
                    />
                  </div>
                </div>

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
                      disabled={!location || loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                      disabled={!location || loading}
                    >
                      {showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {mode === "verify" && (
              <>
                <div className="verification-panel">
                  {verificationMessage && (
                    <p className="verification-message">{verificationMessage}</p>
                  )}
                  {typeof activeSessionsCount === "number" && activeSessionsCount > 0 && (
                    <p className="verification-subtle">Active sessions: {activeSessionsCount}.</p>
                  )}
                  {lastKnownLat !== null && lastKnownLng !== null && (
                    <a
                      className="verification-link"
                      href={`https://www.google.com/maps?q=${lastKnownLat},${lastKnownLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View last known location in Google Maps
                    </a>
                  )}
                  {expiresAt && (
                    <p className={`verification-subtle${remainingSeconds <= 0 ? " expired" : ""}`}>
                      {remainingSeconds > 0
                        ? `Code expires in ${formatCountdown(remainingSeconds)}.`
                        : "The verification code has expired - request a new one."}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="verificationCode" className="form-label">
                    Verification Code
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="verificationCode"
                      name="verificationCode"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter the code from the email"
                      className="form-input"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="verification-actions">
                  <button
                    type="button"
                    className="resend-button"
                    onClick={handleResend}
                    disabled={resendLoading || resendRemainingSeconds > 0 || loading}
                  >
                    {resendLoading ? "Resending..." : "Resend code"}
                  </button>
                  {resendRemainingSeconds > 0 && (
                    <span className="resend-timer">
                      You can resend in {formatCountdown(resendRemainingSeconds)}
                    </span>
                  )}
                </div>
              </>
            )}

            <div className="forgot-password-wrapper">
              <NavLink to="/forgot-password" className="forgot-password-link">
                {t("Forgot Password")}?
              </NavLink>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={
                !location ||
                !deviceInfo ||
                !pageVisibility ||
                loading ||
                (mode === "verify" && !code)
              }
            >
              {loading ? (
                <span className="button-loading">
                  {mode === "verify" ? "Verifying..." : "Signing in..."}
                </span>
              ) : (
                <span>{mode === "verify" ? "Verify Code" : "Sign In"}</span>
              )}
            </button>
          </form>

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

      {loading && <OverlayLoader label={mode === "verify" ? "Verifying" : t("Signing in") || "Signing in"} />}
    </main>
  );
};

export default LoginPage;