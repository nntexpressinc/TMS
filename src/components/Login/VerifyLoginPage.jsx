import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ApiService } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { initializeAuthSession, clearAuthSession } from "../../utils/authSession";
import { getFirstAllowedRoute } from "../../utils/navigation";
import {
  clearPendingVerification,
  loadPendingVerification,
  savePendingVerification,
} from "../../utils/verification";
import "./VerifyLoginPage.css";

const LOCATION_MISMATCH_THRESHOLD_KM = 50;

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

const parseCoordinate = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Average Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const buildTelemetryPayload = (email, method, lat, lng, extra = {}) => ({
  email: email || null,
  method,
  lat: lat ?? null,
  lng: lng ?? null,
  ...extra,
});

const VerifyLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const urlEmail = searchParams.get("email") || "";
  const urlCode = searchParams.get("code") || "";
  const urlLat = searchParams.get("lat") || "";
  const urlLng = searchParams.get("lng") || "";

  const locationState = location.state?.pendingVerification;
  const storedPending = useMemo(() => loadPendingVerification(), []);
  const initialPending = locationState || storedPending || null;

  const [pendingInfo, setPendingInfo] = useState(initialPending);
  const [email, setEmail] = useState(urlEmail || initialPending?.email || "");
  const [code, setCode] = useState(urlCode || initialPending?.debugCode || "");
  const [emailTouched, setEmailTouched] = useState(false);
  const [codeTouched, setCodeTouched] = useState(false);
  const [manualMode, setManualMode] = useState(!(urlEmail && urlCode));
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null);
  const [autoAttempted, setAutoAttempted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [browserLocation, setBrowserLocation] = useState(null);
  const [geolocationError, setGeolocationError] = useState("");
  const [locationMismatch, setLocationMismatch] = useState(false);
  const [distanceKm, setDistanceKm] = useState(null);
  const [expiresAt, setExpiresAt] = useState(initialPending?.verificationExpiresAt || null);
  const [resendAvailableAt, setResendAvailableAt] = useState(initialPending?.resendAvailableAt || null);
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    computeRemainingSeconds(initialPending?.verificationExpiresAt)
  );
  const [resendRemainingSeconds, setResendRemainingSeconds] = useState(() =>
    computeRemainingSeconds(initialPending?.resendAvailableAt)
  );

  const deviceInfo = useMemo(
    () => (typeof navigator !== "undefined" ? navigator.userAgent : ""),
    []
  );

  const linkLat = parseCoordinate(urlLat) ?? parseCoordinate(pendingInfo?.lat);
  const linkLng = parseCoordinate(urlLng) ?? parseCoordinate(pendingInfo?.lng);

  const fireTelemetry = useCallback((eventName, payload) => {
    try {
      if (typeof window !== "undefined" && window.analytics?.track) {
        window.analytics.track(eventName, payload);
      } else {
        console.debug(`[telemetry] ${eventName}`, payload);
      }
    } catch (error) {
      console.error("Telemetry error", error);
    }
  }, []);

  useEffect(() => {
    if (locationState && locationState !== pendingInfo) {
      savePendingVerification(locationState);
      setPendingInfo(locationState);
      if (!urlEmail && !emailTouched) {
        setEmail(locationState.email || "");
      }
      if (!urlCode && !codeTouched && locationState.debugCode) {
        setCode(locationState.debugCode);
      }
    }
  }, [locationState, pendingInfo, urlEmail, urlCode, emailTouched, codeTouched]);

  useEffect(() => {
    if (!pendingInfo) {
      setExpiresAt(null);
      setResendAvailableAt(null);
      return;
    }
    setExpiresAt(pendingInfo.verificationExpiresAt || null);
    setResendAvailableAt(pendingInfo.resendAvailableAt || null);
  }, [pendingInfo]);

  useEffect(() => {
    if (urlEmail && !emailTouched && urlEmail !== email) {
      setEmail(urlEmail);
    }
  }, [urlEmail, emailTouched, email]);

  useEffect(() => {
    if (urlCode && !codeTouched && urlCode !== code) {
      setCode(urlCode);
      setManualMode(false);
    }
  }, [urlCode, codeTouched, code]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeolocationError("Browser does not support geolocation");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setBrowserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeolocationError("");
      },
      (error) => {
        setGeolocationError(error.message || "Unable to access current location");
      },
      { maximumAge: 2 * 60 * 1000 }
    );
  }, []);

  useEffect(() => {
    if (
      browserLocation &&
      linkLat !== null &&
      linkLng !== null &&
      Number.isFinite(browserLocation.latitude) &&
      Number.isFinite(browserLocation.longitude)
    ) {
      const distance = calculateDistanceKm(
        linkLat,
        linkLng,
        browserLocation.latitude,
        browserLocation.longitude
      );
      setDistanceKm(distance);
      setLocationMismatch(distance > LOCATION_MISMATCH_THRESHOLD_KM);
    } else {
      setDistanceKm(null);
      setLocationMismatch(false);
    }
  }, [browserLocation, linkLat, linkLng]);

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

  const handleVerify = useCallback(
    async (method = "manual", options = {}) => {
      if (isVerifying) {
        return;
      }

      if (!email || !code) {
        setErrorMessage("Enter your email and verification code to continue.");
        return;
      }

      const trimmedEmail = email.trim();
      const trimmedCode = code.trim();

      setIsVerifying(true);
      setActiveMethod(method);
      setErrorMessage("");

      const payload = {
        email: trimmedEmail,
        code: trimmedCode,
        device_info: deviceInfo || "unknown",
      };

      try {
        const response = await ApiService.verifyCode(payload);

        await initializeAuthSession(response, {
          location: browserLocation,
          deviceInfo,
          pageVisibility:
            typeof document !== "undefined" && document.visibilityState === "visible"
              ? "open"
              : "hidden",
        });

        clearPendingVerification();
        setPendingInfo(null);
        fireTelemetry(
          "verification_success",
          buildTelemetryPayload(trimmedEmail, method, linkLat, linkLng, {
            auto: Boolean(options.auto),
          })
        );
        toast.success("Verification successful! Redirecting...");
        login();
        navigate(getFirstAllowedRoute(), { replace: true });
      } catch (error) {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          clearAuthSession();
          clearPendingVerification();
          navigate("/auth/login", { replace: true });
          return;
        }

        if (status === 503 || error.response?.data?.error === "verification_email_failed") {
          const failMessage = "код не отправлен, попробуйте позже";
          setErrorMessage(failMessage);
          toast.error(failMessage);
          return;
        }

        const backendMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Verification failed. Please try again.";

        let friendlyMessage = backendMessage;
        if (/expired/i.test(backendMessage)) {
          friendlyMessage = "Code expired - request a new code";
        } else if (/invalid/i.test(backendMessage)) {
          friendlyMessage = "Code is invalid - please check the code or request a new one";
        } else if (!error.response) {
          friendlyMessage = "Network error - please retry";
        }

        setErrorMessage(friendlyMessage);
        fireTelemetry(
          "verification_failed",
          buildTelemetryPayload(trimmedEmail, method, linkLat, linkLng, {
            auto: Boolean(options.auto),
            reason: backendMessage,
          })
        );
        if (method === "link") {
          setManualMode(true);
        }
        toast.error(friendlyMessage);
      } finally {
        setIsVerifying(false);
      }
    },
    [
      isVerifying,
      email,
      code,
      deviceInfo,
      browserLocation,
      fireTelemetry,
      linkLat,
      linkLng,
      login,
      navigate,
    ]
  );

  const allowAutoVerify = Boolean(urlEmail && urlCode);
  const linkEventLoggedRef = useRef(false);

  useEffect(() => {
    if (allowAutoVerify && !linkEventLoggedRef.current) {
      fireTelemetry(
        "verification_link_clicked",
        buildTelemetryPayload(urlEmail, "link", linkLat, linkLng, { auto: true })
      );
      linkEventLoggedRef.current = true;
    }
  }, [allowAutoVerify, fireTelemetry, urlEmail, linkLat, linkLng]);

  useEffect(() => {
    if (allowAutoVerify && !autoAttempted && !codeTouched) {
      setManualMode(false);
      setAutoAttempted(true);
      handleVerify("link", { auto: true });
    }
  }, [allowAutoVerify, autoAttempted, handleVerify, codeTouched]);

  const handleEmailChange = (event) => {
    setEmailTouched(true);
    setManualMode(true);
    setEmail(event.target.value);
  };

  const handleCodeChange = (event) => {
    setCodeTouched(true);
    setManualMode(true);
    setCode(event.target.value);
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMessage("Enter your email address first.");
      return;
    }

    setResendLoading(true);
    setErrorMessage("");

    try {
      const response = await ApiService.resendVerificationCode({
        email: email.trim(),
        device_info: deviceInfo || "unknown",
      });

      const message =
        response?.message || "We sent a fresh verification code. Please check your email.";
      toast.success(message);
      fireTelemetry(
        "verification_code_resent",
        buildTelemetryPayload(email.trim(), manualMode ? "manual" : "link", linkLat, linkLng)
      );

      const updatedPending = {
        ...(pendingInfo || {}),
        email: email.trim(),
        debugCode: response?.debug?.verification_code || pendingInfo?.debugCode,
        lat: pendingInfo?.lat ?? linkLat,
        lng: pendingInfo?.lng ?? linkLng,
        message: response?.message || pendingInfo?.message,
        activeSessionsCount:
          typeof response?.active_sessions_count === "number"
            ? response.active_sessions_count
            : pendingInfo?.activeSessionsCount,
        verificationExpiresAt: response?.verification_expires_at || null,
        resendAvailableAt: response?.resend_available_at || null,
      };

      setPendingInfo(updatedPending);
      savePendingVerification(updatedPending);

      setExpiresAt(updatedPending.verificationExpiresAt || null);
      setResendAvailableAt(updatedPending.resendAvailableAt || null);

      if (response?.debug?.verification_code) {
        setCode(response.debug.verification_code);
        setCodeTouched(false);
      }
    } catch (error) {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        clearAuthSession();
        clearPendingVerification();
        navigate("/auth/login", { replace: true });
        return;
      }

      if (status === 503 || error.response?.data?.error === "verification_email_failed") {
        const failMessage = "код не отправлен, попробуйте позже";
        setErrorMessage(failMessage);
        toast.error(failMessage);
        return;
      }

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Unable to resend the code right now.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/auth/login");
  };

  const activeSessionsCount = pendingInfo?.activeSessionsCount;
  const infoMessage = pendingInfo?.message;
  const verificationExpired = Boolean(expiresAt) && remainingSeconds <= 0;
  const resendCooldownActive = resendRemainingSeconds > 0;

  return (
    <main className="verify-page">
      <div className="verify-card">
        <header className="verify-header">
          <h1>Verify your login</h1>
          <p className="verify-subheading">
            We sent a verification code to
            {" "}
            <span className="verify-email">{email || "your email address"}</span>
          </p>
        </header>

        <p className="verify-description">
          We detected a login attempt. Verify with the code below or click Verify Login to continue.
        </p>

        {infoMessage && (
          <div className="verify-banner">
            <span>{infoMessage}</span>
          </div>
        )}

        {typeof activeSessionsCount === "number" && activeSessionsCount > 0 && (
          <div className="verify-banner subtle">
            <span>
              You currently have {activeSessionsCount} active session
              {activeSessionsCount === 1 ? "" : "s"}.
            </span>
          </div>
        )}

        {linkLat !== null && linkLng !== null && (
          <div className="verify-location">
            <span>
              Last known location for this account: {linkLat.toFixed(4)}, {linkLng.toFixed(4)}
            </span>
            <a
              href={`https://www.google.com/maps?q=${linkLat},${linkLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="verify-map-link"
            >
              View on Google Maps
            </a>
          </div>
        )}

        {locationMismatch && (
          <div className="verify-warning">
            <strong>Login location differs from current device.</strong>
            {typeof distanceKm === "number" && (
              <span> Approximate difference: {distanceKm.toFixed(1)} km.</span>
            )}
          </div>
        )}

        {expiresAt && (
          <div className={`verify-banner subtle${verificationExpired ? " expired" : ""}`}>
            {verificationExpired ? (
              <span>Code expired — request a new code to continue.</span>
            ) : (
              <span>Code expires in {formatCountdown(remainingSeconds)}.</span>
            )}
          </div>
        )}

        {geolocationError && !browserLocation && (
          <div className="verify-hint warning">{geolocationError}</div>
        )}

        {activeMethod === "link" && isVerifying && (
          <div className="verify-status">Verifying the login link...</div>
        )}

        {errorMessage && <div className="verify-error">{errorMessage}</div>}

        <form
          className="verify-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleVerify("manual");
          }}
        >
          <label htmlFor="verify-email" className="verify-label">
            Email
          </label>
          <input
            id="verify-email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className="verify-input"
            placeholder="you@example.com"
            required
          />

          <label htmlFor="verify-code" className="verify-label">
            Verification code
          </label>
          <input
            id="verify-code"
            type="text"
            value={code}
            onChange={handleCodeChange}
            className="verify-input"
            placeholder="Enter the code"
            required
          />

          <button
            type="submit"
            className="verify-button"
            disabled={isVerifying || !email || !code}
          >
            {isVerifying ? "Verifying..." : "Verify Login"}
          </button>
        </form>

        <div className="verify-secondary">
          <button
            type="button"
            className="verify-secondary-button"
            onClick={handleResend}
            disabled={resendLoading || !email || resendCooldownActive}
          >
            {resendLoading ? "Resending..." : "Resend code"}
          </button>
          <button
            type="button"
            className="verify-secondary-button ghost"
            onClick={handleBackToLogin}
          >
            Back to login
          </button>
        </div>

        {resendCooldownActive && (
          <div className="verify-hint">
            Resend available in {formatCountdown(resendRemainingSeconds)}.
          </div>
        )}
      </div>
    </main>
  );
};

export default VerifyLoginPage;
