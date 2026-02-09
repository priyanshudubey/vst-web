import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Save,
  Calendar,
  User,
  Truck,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import VendorAutocomplete from "../components/VendorAutocomplete";

const CreateBookings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const bookingDateRef = useRef(null);

  // Data Lists
  const [products, setProducts] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    vendor_id: "",
    booking_date: new Date().toISOString().split("T")[0], // Default to Today
    booking_time: "09:00",
    gst_type: "EXTRA",
    freight_type: "INCLUSIVE",
    processing_state: "STRAIGHT",
    dispatched_from: "Raipur Warehouse",
  });

  // Items State (Array of rows)
  const [items, setItems] = useState([
    { product_id: "", quantity_tons: "", rate: "" },
  ]);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const pRes = await api.get("/inventory/list");
        setProducts(pRes.data);
      } catch (error) {
        toast.error(
          "Failed to load form data: " +
            (error.response?.data?.message || error.message),
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- 2. HANDLERS ---

  // Handle Header Input Changes
  const handleHeaderChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Item Row Changes
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Add New Row
  const addNewRow = () => {
    setItems([...items, { product_id: "", quantity_tons: "", rate: "" }]);
  };

  // Remove Row
  const removeRow = (index) => {
    if (items.length === 1) return; // Keep at least one row
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Calculate Grand Total for Display
  const calculateTotal = () => {
    return items.reduce((acc, item) => {
      const qty = parseFloat(item.quantity_tons) || 0;
      const rate = parseFloat(item.rate) || 0;
      return acc + qty * rate;
    }, 0);
  };

  // --- 3. SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Check if vendor and at least one product is selected
    if (!formData.vendor_id) return toast.error("Please select a Vendor");
    if (!items[0].product_id)
      return toast.error("Please add at least one product");

    const payload = {
      vendor_id: formData.vendor_id,
      booking_date: `${formData.booking_date}T${formData.booking_time}`,
      gst_type: formData.gst_type,
      freight_type: formData.freight_type,
      processing_state: formData.processing_state,
      dispatched_from: formData.dispatched_from,
      items: items.map((i) => ({
        product_id: parseInt(i.product_id),
        quantity_tons: parseFloat(i.quantity_tons),
        rate: parseFloat(i.rate),
      })),
    };

    try {
      await api.post("/bookings/create", payload);
      toast.success("Booking Created Successfully!");
      navigate("/admin/dashboard"); // Redirect to Dashboard
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Booking Failed");
    }
  };

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = String(Math.floor(i / 2)).padStart(2, "0");
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hours}:${minutes}`;
  });

  if (loading) return <div className="p-8">Loading Form...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">New Booking</h1>
          <p className="text-gray-500 text-sm">Create a new sales order</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Estimated Total</p>
          <p className="text-3xl font-bold text-blue-600">
            ₹ {calculateTotal().toLocaleString()}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6">
        {/* --- SECTION 1: ORDER DETAILS --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <User size={16} /> Client & Dates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vendor Select */}
            <div className="col-span-1">
              <VendorAutocomplete
                selectedVendorId={formData.vendor_id}
                onSelect={(id) => setFormData({ ...formData, vendor_id: id })}
              />
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Client
              </label>
              <select
                name="vendor_id"
                className="w-full border p-2 text-black rounded-lg bg-gray-50 focus:bg-white transition"
                value={formData.vendor_id}
                onChange={handleHeaderChange}
                required>
                <option value="">-- Choose Vendor --</option>
                {vendors.map((v) => (
                  <option
                    key={v.id}
                    value={v.id}>
                    {v.company_name ? `${v.company_name} (${v.name})` : v.name}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking Date
              </label>
              <div className="relative">
                <input
                  ref={bookingDateRef}
                  type="date"
                  name="booking_date"
                  className="w-full border p-2 text-black rounded-lg pr-10"
                  value={formData.booking_date}
                  onChange={handleHeaderChange}
                />
                <button
                  type="button"
                  onClick={() => bookingDateRef.current?.showPicker?.()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Open calendar">
                  <Calendar size={18} />
                </button>
              </div>
            </div>

            {/* Time Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking Time
              </label>
              <select
                name="booking_time"
                className="w-full border p-2 text-black rounded-lg bg-gray-50 focus:bg-white transition"
                value={formData.booking_time}
                onChange={handleHeaderChange}>
                {timeOptions.map((time) => (
                  <option
                    key={time}
                    value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Dispatch Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dispatched From
              </label>
              <input
                type="text"
                name="dispatched_from"
                className="w-full border p-2 text-black rounded-lg border-gray-300"
                value={formData.dispatched_from}
                onChange={handleHeaderChange}
              />
            </div>
          </div>
        </div>

        {/* --- SECTION 2: TERMS --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <FileText size={16} /> Terms & Conditions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Type
              </label>
              <select
                name="gst_type"
                value={formData.gst_type}
                onChange={handleHeaderChange}
                className="w-full border p-2 rounded-lg text-black border-gray-300">
                <option value="EXTRA">Extra (Tax added later)</option>
                <option value="INCLUSIVE">Inclusive (Tax included)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Freight
              </label>
              <select
                name="freight_type"
                value={formData.freight_type}
                onChange={handleHeaderChange}
                className="w-full border p-2 rounded-lg text-black border-gray-300">
                <option value="INCLUSIVE">Inclusive (We pay)</option>
                <option value="EXTRA">Extra (Client pays)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processing
              </label>
              <select
                name="processing_state"
                value={formData.processing_state}
                onChange={handleHeaderChange}
                className="w-full border p-2 rounded-lg text-black border-gray-300">
                <option value="STRAIGHT">Straight</option>
                <option value="CUT_INTO_PIECES">Cut into pieces</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- SECTION 3: ITEMS TABLE --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <Truck size={16} /> Products
          </h3>

          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-3 rounded-l-lg">Product</th>
                <th className="p-3 w-32">Quantity (Tons)</th>
                <th className="p-3 w-40">Rate (Per Ton)</th>
                <th className="p-3 w-40">Total</th>
                <th className="p-3 w-10 rounded-r-lg"></th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {items.map((row, index) => (
                <tr key={index}>
                  <td className="p-2">
                    <select
                      className="w-full border p-2 rounded text-black border-gray-300"
                      value={row.product_id}
                      onChange={(e) =>
                        handleItemChange(index, "product_id", e.target.value)
                      }
                      required>
                      <option value="">Select Product...</option>
                      {products.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          disabled={p.current_stock_tons <= 0}>
                          {p.product_name} - {p.brand} ({p.type_or_dimension})
                          {p.current_stock_tons <= 0
                            ? " [OUT OF STOCK]"
                            : ` [Stock: ${p.current_stock_tons}]`}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      className="w-full border p-2 rounded text-black border-gray-300"
                      value={row.quantity_tons}
                      onChange={(e) =>
                        handleItemChange(index, "quantity_tons", e.target.value)
                      }
                      required
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      step="1"
                      placeholder="₹ 0"
                      className="w-full border p-2 rounded text-black border-gray-300"
                      value={row.rate}
                      onChange={(e) =>
                        handleItemChange(index, "rate", e.target.value)
                      }
                      required
                    />
                  </td>
                  <td className="p-2 font-mono text-right text-gray-600">
                    ₹{" "}
                    {(
                      (parseFloat(row.quantity_tons) || 0) *
                      (parseFloat(row.rate) || 0)
                    ).toLocaleString()}
                  </td>
                  <td className="p-2 text-center">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="text-red-400 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={addNewRow}
            className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-semibold hover:bg-blue-50 px-3 py-2 rounded transition">
            <Plus size={16} /> Add Another Product
          </button>
        </div>

        {/* --- SUBMIT BUTTON --- */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition flex items-center gap-2">
            <Save size={20} /> Confirm Booking
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBookings;
