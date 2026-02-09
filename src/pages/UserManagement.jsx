import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const initialForm = { name: "", username: "", password: "", role: "SALES" };
  const [formData, setFormData] = useState(initialForm);

  // --- 1. FETCH USERS ---
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- 2. CREATE USER ---
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await api.post("/users/create", formData);
      toast.success(`User ${formData.username} created!`);
      setFormData(initialForm); // Reset form
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  // --- 3. DELETE USER ---
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this user access?"))
      return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success("User access revoked");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) return <div className="p-8">Loading Staff...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-blue-600" /> User Management
        </h1>
        <p className="text-gray-500 text-sm">
          Create accounts and manage access levels for your staff.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- LEFT: CREATE USER FORM --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <UserPlus size={20} /> Add New Staff
          </h2>

          <form
            onSubmit={handleCreate}
            className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                placeholder="e.g. Raju Singh"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Username (Login ID)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                placeholder="e.g. raju_sales"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-mono"
                placeholder="Set a strong password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Access Level (Role)
              </label>
              <div className="relative">
                <Shield
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <select
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }>
                  <option value="SALES">Sales Executive</option>
                  <option value="LOGISTICS">Logistics Manager</option>
                  <option value="BILLING">Billing / Inventory</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * <span className="font-bold">Sales:</span> Create orders only.
                <br />* <span className="font-bold">Logistics:</span> Dispatch
                trucks only.
                <br />* <span className="font-bold">Billing:</span> Manage
                inventory & invoices.
                <br />* <span className="font-bold">Admin:</span> Full access.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md mt-4">
              Create Account
            </button>
          </form>
        </div>

        {/* --- RIGHT: STAFF LIST --- */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Existing Staff Accounts</h3>
            <span className="text-xs bg-white border px-2 py-1 rounded text-gray-500">
              {users.length} Users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-gray-500 border-b">
                <tr>
                  <th className="px-6 py-3">Staff Name</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 font-mono">
                        @{user.username}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "SALES"
                              ? "bg-green-100 text-green-700"
                              : user.role === "LOGISTICS"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-gray-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-full"
                        title="Revoke Access">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="p-10 text-center text-gray-400">
                No users found. Create one to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
