import { Navigate, Outlet, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const RequireRole = ({ allowedRoles }) => {
  const location = useLocation();

  // 1. Get User from Local Storage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    user = null;
  }

  // 2. CHECK: Is User Logged In?
  // If no user or no token, kick them back to Login
  const token = localStorage.getItem("token");
  if (!user || !token) {
    // We pass 'state' so we can redirect them back after they login (optional UX improvement)
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // 3. CHECK: Does User Have Permission?
  // If the user's role is NOT in the allowed list, kick them to Dashboard
  if (!allowedRoles.includes(user.role)) {
    // Optional: Show an error message (comment out if it gets annoying)
    // toast.error("Access Denied: You don't have permission for this page.");

    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }

  // 4. ACCESS GRANTED
  // Render the child route (The actual page they wanted to see)
  return <Outlet />;
};

export default RequireRole;
