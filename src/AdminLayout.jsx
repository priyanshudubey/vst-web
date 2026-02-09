import { useState, useEffect } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import api from "./api/axios";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Security Check: If no token, kick them out
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const verifySession = async () => {
      try {
        // We make a lightweight call.
        // If this fails (Server Down / 401), the Axios Interceptor in Step 1
        // will automatically kick the user out.
        await api.get("/dashboard");
      } catch (error) {
        // Error is handled by Interceptor, but we can double check here
        if (!localStorage.getItem("token")) {
          console.error("Session invalid, redirecting to login.", error);
          navigate("/admin/login");
        }
      }
    };

    if (isAuthenticated) {
      verifySession();
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 1. Sidebar with Mobile State Management */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* 2. Main Scrollable Content Area */}
      <main className="flex-1 overflow-auto p-4 md:p-8 mt-12 md:mt-0">
        <Outlet /> {/* This is where Dashboard, Inventory, etc. will render */}
      </main>
    </div>
  );
};

export default AdminLayout;
