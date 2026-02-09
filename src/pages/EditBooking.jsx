import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  User,
  Truck,
  FileText,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import VendorAutocomplete from "../components/VendorAutocomplete";

const EditBooking = () => {
  const { id } = useParams(); // Get Booking ID from URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Data Lists
  const [products, setProducts] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    vendor_id: "",
    booking_date: "",
    gst_type: "EXTRA",
    freight_type: "INCLUSIVE",
    processing_state: "STRAIGHT",
    dispatched_from: "",
  });

  const [items, setItems] = useState([]);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch Products and the Booking Details in parallel
        const [pRes, bRes] = await Promise.all([
          api.get("/inventory/list"),
          api.get(`/bookings/${id}`), // This uses your existing Details API
        ]);

        setProducts(pRes.data);
        const booking = bRes.data;

        // Security Check
        if (booking.status !== "CONFIRMED") {
          toast.error("Cannot edit dispatched/cancelled orders");
          navigate("/admin/bookings");
          return;
        }

        // Populate Form
        setFormData({
          vendor_id: booking.vendor_id,
          // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
          booking_date: new Date(booking.booking_date)
            .toISOString()
            .slice(0, 16),
          gst_type: booking.gst_type,
          freight_type: booking.freight_type,
          processing_state: booking.processing_state,
          dispatched_from: booking.dispatched_from,
        });

        // Populate Items (Map API structure to Form structure)
        setItems(
          booking.items.map((i) => ({
            product_id: i.product_id,
            quantity_tons: i.quantity_tons,
            rate: i.rate_per_ton,
          })),
        );
      } catch (error) {
        toast.error(
          "Failed to load booking data: " +
            (error.response?.data?.message || error.message),
        );
        navigate("/admin/bookings");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  // --- HANDLERS (Same as Create) ---
  const handleHeaderChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addNewRow = () =>
    setItems([...items, { product_id: "", quantity_tons: "", rate: "" }]);

  const removeRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce(
      (acc, item) =>
        acc +
        (parseFloat(item.quantity_tons) || 0) * (parseFloat(item.rate) || 0),
      0,
    );
  };

  // --- SUBMIT (UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendor_id) return toast.error("Please select a Vendor");
    if (!items[0].product_id)
      return toast.error("Please add at least one product");

    const payload = {
      ...formData,
      items: items.map((i) => ({
        product_id: parseInt(i.product_id),
        quantity_tons: parseFloat(i.quantity_tons),
        rate: parseFloat(i.rate),
      })),
    };

    try {
      // THE ONLY DIFFERENCE: PUT request to /update/:id
      await api.put(`/bookings/update/${id}`, payload);
      toast.success("Booking Updated Successfully!");
      navigate("/admin/bookings");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update Failed");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/bookings"
            className="p-2 bg-white rounded-lg border hover:bg-gray-50">
            <ArrowLeft
              size={20}
              className="text-gray-600"
            />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Edit Booking #{id}
            </h1>
            <p className="text-gray-500 text-sm">Update order details</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Updated Total</p>
          <p className="text-3xl font-bold text-blue-600">
            ₹ {calculateTotal().toLocaleString()}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6">
        {/* CLIENT SECTION */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <User size={16} /> Client & Dates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              {/* Reuse your Autocomplete Component */}
              <VendorAutocomplete
                selectedVendorId={formData.vendor_id}
                onSelect={(id) => setFormData({ ...formData, vendor_id: id })}
              />
            </div>
            <div>
              <label className="block text-sm  font-medium text-gray-700 mb-1">
                Booking Date
              </label>
              <input
                type="datetime-local"
                name="booking_date"
                className="w-full border p-2 rounded-lg border-gray-900 text-black"
                value={formData.booking_date}
                onChange={handleHeaderChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dispatched From
              </label>
              <input
                type="text"
                name="dispatched_from"
                className="w-full border p-2 rounded-lg border-gray-900 text-black"
                value={formData.dispatched_from}
                onChange={handleHeaderChange}
              />
            </div>
          </div>
        </div>

        {/* TERMS SECTION */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Same dropdowns as CreateBooking... */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Type
              </label>
              <select
                name="gst_type"
                value={formData.gst_type}
                onChange={handleHeaderChange}
                className="w-full border p-2 rounded-lg border-gray-900 text-black">
                <option value="EXTRA">Extra</option>
                <option value="INCLUSIVE">Inclusive</option>
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
                className="w-full border p-2 rounded-lg border-gray-900 text-black">
                <option value="INCLUSIVE">Inclusive</option>
                <option value="EXTRA">Extra</option>
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
                className="w-full border p-2 rounded-lg border-gray-900 text-black">
                <option value="STRAIGHT">Straight</option>
                <option value="CUT_INTO_PIECES">Cut into pieces</option>
              </select>
            </div>
          </div>
        </div>

        {/* ITEMS TABLE (Identical to CreateBooking) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <Truck size={16} /> Products
          </h3>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3 w-32">Qty (Tons)</th>
                <th className="p-3 w-40">Rate</th>
                <th className="p-3 w-40">Total</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {items.map((row, index) => (
                <tr key={index}>
                  <td className="p-2">
                    <select
                      className="w-full border p-2 rounded border-gray-900 text-black"
                      value={row.product_id}
                      onChange={(e) =>
                        handleItemChange(index, "product_id", e.target.value)
                      }
                      required>
                      <option value="">Select Product...</option>
                      {products.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}>
                          {p.product_name} - {p.brand} ({p.type_or_dimension})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      step="0.001"
                      className="w-full border p-2 rounded border-gray-900 text-black"
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
                      className="w-full border p-2 rounded border-gray-900 text-black"
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
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2">
            <Save size={20} /> Update Booking
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBooking;
