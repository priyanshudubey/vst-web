import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import CreateBookings from "./pages/CreateBookings";
import Inventory from "./pages/Inventory";
import AdminLayout from "./AdminLayout";
import EditBooking from "./pages/EditBooking";
import LogisticsDashboard from "./pages/logisticsDashboard";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import Vendors from "./pages/Vendors";

import RequireRole from "./components/RequireRole";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />

        {/* 2. PROTECTED ADMIN ROUTES */}
        <Route
          path="/admin"
          element={<AdminLayout />}>
          {/* GROUP A: SHARED ACCESS (Everyone needs Dashboard & Booking List) */}
          <Route
            element={
              <RequireRole
                allowedRoles={["ADMIN", "SALES", "LOGISTICS", "BILLING"]}
              />
            }>
            <Route
              index
              element={<Dashboard />}
            />
            <Route
              path="dashboard"
              element={<Dashboard />}
            />
            <Route
              path="bookings"
              element={<Bookings />}
            />
          </Route>

          {/* GROUP B: SALES OPERATIONS (Admin + Sales) */}
          <Route element={<RequireRole allowedRoles={["ADMIN", "SALES"]} />}>
            <Route
              path="bookings/create"
              element={<CreateBookings />}
            />
            <Route
              path="bookings/edit/:id"
              element={<EditBooking />}
            />
          </Route>

          {/* GROUP C: LOGISTICS OPERATIONS (Admin + Logistics) */}
          <Route
            element={<RequireRole allowedRoles={["ADMIN", "LOGISTICS"]} />}>
            <Route
              path="logistics"
              element={<LogisticsDashboard />}
            />
          </Route>

          {/* GROUP D: BILLING & INVENTORY (Admin + Billing) */}
          <Route element={<RequireRole allowedRoles={["ADMIN", "BILLING"]} />}>
            <Route
              path="inventory"
              element={<Inventory />}
            />
          </Route>

          {/* GROUP E: SUPER ADMIN ONLY */}
          <Route element={<RequireRole allowedRoles={["ADMIN"]} />}>
            <Route
              path="vendors"
              element={<Vendors />}
            />
            <Route
              path="reports"
              element={<Reports />}
            />
            <Route
              path="users"
              element={<UserManagement />}
            />
            {/* <Route path="users" element={<UserManagement />} /> */}
          </Route>
        </Route>
        {/* Fallback for 404s */}
        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
