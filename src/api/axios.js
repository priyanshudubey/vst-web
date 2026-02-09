import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// 1. Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Scenario A: Server is Dead (Network Error)
    if (!error.response) {
      toast.error("Cannot connect to server. Please try again later.");
      return Promise.reject(error);
    }

    // Scenario B: Token is Invalid/Expired (401 or 403)
    if (error.response.status === 401 || error.response.status === 403) {
      // --- THE FIX: Check if this request was a Login attempt ---
      // If the URL contains '/auth/login', do NOT auto-logout.
      // We want the Login component to handle "Invalid Credentials" itself.
      const isLoginRequest = error.config.url.includes("/auth/login");

      if (!isLoginRequest) {
        toast.error("Session Expired. Please login again.");

        // 1. Clear Storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // 2. Force Redirect to Login
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
