import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  ClipboardList,
  Truck,
  PieChart,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logo from "../assets/logo.jpg";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get User Details
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }
  const role = user?.role || "SALES";
  const userName =
    user?.name || user?.full_name || user?.fullName || user?.email || "User";
  const userInitials = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  const closeSidebar = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={18} />,
      roles: ["ADMIN", "SALES", "LOGISTICS", "BILLING"],
    },
    {
      name: "New Order",
      path: "/admin/bookings/create",
      icon: <ShoppingCart size={18} />,
      roles: ["ADMIN", "SALES"],
    },
    {
      name: "All Bookings",
      path: "/admin/bookings",
      icon: <ClipboardList size={18} />,
      roles: ["ADMIN", "SALES", "LOGISTICS", "BILLING"],
    },
    {
      name: "Logistics / Dispatch",
      path: "/admin/logistics",
      icon: <Truck size={18} />,
      roles: ["ADMIN", "LOGISTICS"],
    },
    {
      name: "Inventory",
      path: "/admin/inventory",
      icon: <Package size={18} />,
      roles: ["ADMIN", "BILLING"],
    },
    {
      name: "Vendors",
      path: "/admin/vendors",
      icon: <Users size={18} />,
      roles: ["ADMIN"],
    },
    {
      name: "Daily Reports",
      path: "/admin/reports",
      icon: <PieChart size={18} />,
      roles: ["ADMIN"],
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: <Users size={18} />,
      roles: ["ADMIN"], // <--- Admin Only!
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed md:hidden top-4 left-4 z-50 bg-slate-900 text-white p-2 rounded-lg shadow-lg"
        aria-label="Toggle sidebar">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed md:static flex flex-col h-screen w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}>
        {/* --- 1. HEADER --- */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo"
              className="h-10 w-10 rounded-lg object-cover border border-slate-700"
            />
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                Veena Steel
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* --- 2. NAVIGATION --- */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-1">
            {navItems
              .filter((item) => item.roles.includes(role))
              .map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                        : "hover:bg-slate-700 hover:text-white"
                    }`}>
                    <span
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white"
                      }>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* --- 3. USER PROFILE FOOTER --- */}
        <div className="border-t border-slate-800 p-4 bg-slate-900">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50">
            {/* User Info */}
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-900 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold truncate">
                  {role}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
