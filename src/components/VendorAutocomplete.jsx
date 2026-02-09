import { useState, useEffect, useRef } from "react";
import { Search, Plus, X, Building2, User, Check } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const VendorAutocomplete = ({ onSelect, selectedVendorId }) => {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: "",
    company_name: "",
    phone_number: "",
    address: "",
  });

  const wrapperRef = useRef(null);

  // 1. Fetch Vendors Once on Mount
  const fetchVendors = async () => {
    try {
      const res = await api.get("/vendors/list");
      setVendors(res.data);
    } catch (error) {
      console.error("Failed to load vendors: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // 2. Handle Clicking Outside to Close Dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // 3. Filter Logic (Local Search)
  const filteredVendors = vendors.filter((v) => {
    const search = searchTerm.toLowerCase();
    return (
      v.name.toLowerCase().includes(search) ||
      (v.company_name && v.company_name.toLowerCase().includes(search)) ||
      v.phone_number.includes(search)
    );
  });

  // 4. Handle Selection
  const handleSelect = (vendor) => {
    onSelect(vendor.id);
    setSearchTerm(vendor.company_name || vendor.name);
    setIsOpen(false);
  };

  // 5. Add New Vendor Logic
  const handleAddVendor = async () => {
    try {
      const res = await api.post("/vendors/add", newVendor);
      const createdVendor = { ...newVendor, id: res.data.vendorId };

      // Update local list immediately
      setVendors([...vendors, createdVendor]);

      // Auto-select the new vendor
      handleSelect(createdVendor);

      toast.success("Vendor Added!");
      setIsModalOpen(false);
      setNewVendor({
        name: "",
        company_name: "",
        phone_number: "",
        address: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add vendor");
    }
  };

  // Auto-fill input if a vendor is already selected (e.g. edit mode)
  useEffect(() => {
    if (selectedVendorId && vendors.length > 0) {
      const found = vendors.find((v) => v.id === parseInt(selectedVendorId));
      if (found) setSearchTerm(found.company_name || found.name);
    }
  }, [selectedVendorId, vendors]);

  return (
    <div
      className="relative"
      ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Client
      </label>

      {/* INPUT FIELD */}
      <div className="relative">
        <input
          type="text"
          className="w-full border border-gray-800 p-2 pl-10 text-black rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Type to search client..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            onSelect(""); // Clear selection if user types something new
          }}
          onFocus={() => setIsOpen(true)}
        />
        <Search
          className="absolute left-3 top-2.5 text-gray-800"
          size={18}
        />
      </div>

      {/* DROPDOWN LIST */}
      {isOpen && (
        <div className="absolute z-50 w-full bg-white border rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-gray-500 text-sm text-center">
              Loading...
            </div>
          ) : (
            <>
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  onClick={() => handleSelect(vendor)}
                  className="p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-50 last:border-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-800 text-sm">
                        {vendor.company_name || vendor.name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <User size={12} /> {vendor.name} • {vendor.phone_number}
                      </div>
                    </div>
                    {selectedVendorId === vendor.id && (
                      <Check
                        size={16}
                        className="text-blue-600"
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* "ADD NEW" OPTION (Always visible at bottom or if no results) */}
              <div
                onClick={() => {
                  setIsModalOpen(true);
                  setIsOpen(false);
                }}
                className="p-3 bg-gray-50 hover:bg-blue-600 hover:text-white cursor-pointer flex items-center justify-center gap-2 text-blue-600 font-medium transition-colors sticky bottom-0">
                <Plus size={18} />
                Add "{searchTerm}" as New Client
              </div>
            </>
          )}
        </div>
      )}

      {/* --- ADD NEW VENDOR MODAL (Internal) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-100">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Client</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 text-black">
              <div className="text-black">
                <label className="text-sm font-medium">Company Name</label>
                <input
                  className="w-full border p-2 rounded"
                  value={newVendor.company_name}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, company_name: e.target.value })
                  }
                  placeholder="e.g. Shubham Constructions"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Person *</label>
                <input
                  className="w-full border p-2 rounded"
                  value={newVendor.name}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number *</label>
                <input
                  className="w-full border p-2 rounded"
                  value={newVendor.phone_number}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, phone_number: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <input
                  className="w-full border p-2 rounded"
                  value={newVendor.address}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, address: e.target.value })
                  }
                />
              </div>
              <button
                type="button"
                onClick={handleAddVendor}
                className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
                Save & Select Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorAutocomplete;
