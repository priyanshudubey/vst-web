import { useState, useEffect } from "react";
import {
  Plus,
  Users,
  MapPin,
  Phone,
  Search,
  Building2,
  Pencil,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    phone_number: "",
    address: "",
  });

  // --- 1. FETCH VENDORS ---
  const fetchVendors = async () => {
    try {
      const res = await api.get("/vendors/list");
      setVendors(res.data);
    } catch (error) {
      toast.error(
        "Failed to load vendors: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const openAddModal = () => {
    setEditingVendor(null); // Clear edit mode
    setFormData({ name: "", company_name: "", phone_number: "", address: "" }); // Clear form
    setIsModalOpen(true);
  };

  const openEditModal = (vendor) => {
    setEditingVendor(vendor); // Set edit mode
    setFormData({
      name: vendor.name,
      company_name: vendor.company_name || "",
      phone_number: vendor.phone_number,
      address: vendor.address,
    });
    setIsModalOpen(true);
  };

  // --- 2. ADD VENDOR ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        // UPDATE MODE
        await api.put(`/vendors/update/${editingVendor.id}`, formData);
        toast.success("Vendor Updated Successfully!");
      } else {
        // ADD MODE
        await api.post("/vendors/add", formData);
        toast.success("Vendor Added Successfully!");
      }

      setIsModalOpen(false);
      fetchVendors(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    try {
      await api.delete(`/vendors/delete/${id}`);
      toast.success("Vendor Deleted");
      fetchVendors(); // Refresh List
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  // Filter Logic
  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.phone_number.includes(searchTerm),
  );

  // Highlight Search Term
  const highlightText = (text, term) => {
    if (!term || !text) return text;

    const regex = new RegExp(`(${term})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="bg-yellow-300 font-semibold">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  if (loading) return <div className="p-8">Loading Vendors...</div>;

  return (
    <div>
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Vendors & Clients
          </h1>
          <p className="text-gray-500 text-sm">Manage your buyer database</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus size={20} /> Add New Vendor
        </button>
      </div>

      {/* --- SEARCH --- */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-3 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by name or phone..."
          className="w-full text-black pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- GRID LIST --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className={`group relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition ${
              searchTerm &&
              (vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.company_name
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                vendor.phone_number.includes(searchTerm))
                ? "ring-2 ring-yellow-400 bg-yellow-50"
                : ""
            }`}>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEditModal(vendor)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                title="Edit">
                <Pencil size={20} />
              </button>
              <button
                onClick={() => handleDelete(vendor.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                title="Delete">
                <Trash2 size={20} />
              </button>
            </div>
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full mt-1">
                <Building2 size={24} />
              </div>
              <div>
                {/* 2. Show Company Name as Main Title, Contact Person as Subtitle */}
                <h3 className="font-bold text-gray-800 text-lg">
                  {vendor.company_name
                    ? highlightText(vendor.company_name, searchTerm)
                    : highlightText(vendor.name, searchTerm)}
                </h3>
                {vendor.company_name && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Users size={14} /> {highlightText(vendor.name, searchTerm)}{" "}
                    (Contact)
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <Phone
                  size={16}
                  className="text-gray-400"
                />
                <span className="text-black">
                  {highlightText(vendor.phone_number, searchTerm)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin
                  size={16}
                  className="text-gray-400"
                />
                <span className="text-black">{vendor.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center p-10 text-gray-500">
          No vendors found. Add one to get started.
        </div>
      )}
      {/* --- UPDATED MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl text-black font-bold mb-4">
              {editingVendor ? "Edit Vendor" : "Add New Vendor"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="space-y-4">
              {/* 3. New Company Name Input */}
              <div>
                <label className="text-sm font-medium text-black">
                  Company / Firm Name
                </label>
                <input
                  type="text"
                  className="w-full border p-2 border-gray-300 rounded mt-1 text-black"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  placeholder="e.g. Ultratech Cement Ltd"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  className="w-full border p-2 border-gray-300 rounded mt-1 text-black"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Rajesh Kumar"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="w-full border p-2 border-gray-300 rounded mt-1 text-black"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Address
                </label>
                <textarea
                  className="w-full border p-2 border-gray-300 rounded mt-1 text-black"
                  rows="3"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
