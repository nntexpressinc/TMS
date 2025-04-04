import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { ApiService } from "../../api/auth";
import { TextField, Button } from "@mui/material";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Loader1 from "../loader/loader1";
import { lightLogo } from "../../images";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

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
    // Geolokatsiyani aniqlash
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
          },
          (err) => {
            setError("Please allow geolocation");
            toast.error("Joylashuvni aniqlash uchun ruxsat kerak!");
          }
        );
      } else {
        setError("Brauzer geolokatsiyani qo‘llab-quvvatlamaydi");
        toast.error("Brauzer geolokatsiyani qo‘llab-quvvatlamaydi");
      }
    };

    // Qurilma ma'lumotlarini aniqlash
    const getDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      setDeviceInfo(userAgent);
    };

    // Sahifa holatini aniqlash
    const getPageVisibility = () => {
      setPageVisibility(document.visibilityState === "visible" ? "open" : "hidden");
    };

    // Visibility change event listener qo'shish
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
      // 1. Login so‘rovi
      const data = { email, password };
      const response = await ApiService.postData("/auth/login/", data);
      console.log("Login Response:", response);

      // Tokenlarni saqlash
      localStorage.setItem("accessToken", response.access);
      localStorage.setItem("refreshToken", response.refresh);
      localStorage.setItem("userId", response.user_id);
      login();

      // 2. Geolokatsiya, qurilma va sahifa holatini API’ga yuborish
      if (location && deviceInfo && pageVisibility) {
        const additionalData = {
          latitude: location.latitude,
          longitude: location.longitude,
          user: response.user_id,
          device_info: deviceInfo, // Qurilma ma'lumotlari
          page_status: pageVisibility, // Sahifa holati (open/hidden)
        };
        console.log("Yuborilayotgan additionalData:", additionalData); // Debugging
        try {
          const additionalResponse = await ApiService.postData("/auth/location/", additionalData);
          console.log("Additional Data Response:", additionalResponse);
        } catch (additionalError) {
          console.error("Ma'lumotlarni saqlashda xatolik:", {
            status: additionalError.response?.status,
            data: additionalError.response?.data,
            message: additionalError.message,
          });
          toast.error("Ma'lumotlarni saqlashda xatolik yuz berdi!");
        }
      } else {
        throw new Error("Ma'lumotlar to‘liq emas");
      }

      toast.success("Login muvaffaqiyatli!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login Failed:", error.response?.data || error.message);
      setError(error.response?.data?.detail || "Email yoki parol noto‘g‘ri!");
      toast.error("Login amalga oshmadi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative w-full h-screen flex justify-center items-center bg-gray-100 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#F3F4F6"
          fillOpacity="1"
          d="M0,256L80,240C160,224,320,192,480,176C640,160,800,160,960,165.3C1120,171,1280,181,1360,186.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        ></path>
      </svg>
      <section className="bg-white shadow-lg rounded-lg p-6 w-[90%] max-w-[400px] z-10">
        <div className="flex flex-col items-center gap-4">
          <img className="w-20 h-20" src={lightLogo} alt="logo" />
          <h1 className="text-xl font-bold text-gray-700">Log in to your account</h1>
        </div>
        <form className="flex flex-col gap-4 mt-6" onSubmit={handleLogin}>
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label className="block text-sm font-semibold text-gray-600" htmlFor="email">
              Email
            </label>
            <TextField
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              type="email"
              id="email"
              value={email}
              name="email"
              placeholder="youremail@gmail.com"
              required
              disabled={!location}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <TextField
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                type={showPassword ? "password" : "text"}
                placeholder="*******"
                id="password"
                value={password}
                name="password"
                required
                disabled={!location}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                onClick={togglePasswordVisibility}
                disabled={!location}
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
            disabled={!location || !deviceInfo || !pageVisibility}
          >
            Login
          </Button>
          <NavLink to="/forgot-password" className="text-center text-sm text-gray-600">
            {t("Forgot Password")}
          </NavLink>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <NavLink to="/support" className="text-xs text-gray-500">
              {t("Support Center")}
            </NavLink>
            <span className="text-xs text-gray-500">•</span>
            <NavLink to="/terms" className="text-xs text-gray-500">
              {t("Terms of Use")}
            </NavLink>
            <span className="text-xs text-gray-500">•</span>
            <NavLink to="/privacy" className="text-xs text-gray-500">
              {t("Privacy Policy")}
            </NavLink>
          </div>
        </form>
      </section>
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <Loader1 />
        </div>
      )}
    </main>
  );
};

export default LoginPage;