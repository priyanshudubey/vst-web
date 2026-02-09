import { useState, useEffect } from "react";
import { Truck, Package, CheckCircle, Clock, History, X } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const LogisticsDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState(null); // The order being worked on
  const [orderItems, setOrderItems] = useState([]); // Items inside that order
  const [dispatchLogs, setDispatchLogs] = useState([]);
  const [doForm, setDoForm] = useState({
    product_id: "",
    dispatch_qty: "",
    vehicle_number: "",
    driver_name: "",
    driver_number: "",
  });

  // 1. Fetch Pending List
  const fetchPending = async () => {
    try {
      const res = await api.get("/logistics/pending");
      setBookings(res.data);
    } catch (error) {
      toast.error("Failed to load pending orders", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // 2. Open Modal & Fetch Items
  const openDispatchModal = async (booking) => {
    setSelectedBooking(booking);
    setDoForm({
      product_id: "",
      dispatch_qty: "",
      vehicle_number: "",
      driver_name: "",
      driver_number: "",
    });
    setOrderItems([]);
    setDispatchLogs([]); // Clear old logs

    try {
      const res = await api.get(`/logistics/items/${booking.id}`);
      // Backend now sends { items: [], logs: [] }
      setOrderItems(res.data.items);
      setDispatchLogs(res.data.logs);
    } catch (error) {
      toast.error("Failed to load order details", error.message);
    }
  };

  // 3. Submit Challan
  const handleSubmitDO = async (e) => {
    e.preventDefault();
    if (!doForm.product_id || doForm.product_id === "") {
      toast.error("Please select a product to load.");
      return;
    }
    try {
      const payload = {
        booking_id: selectedBooking.id,
        ...doForm,
        product_id: parseInt(doForm.product_id), // Force Integer
        dispatch_qty: parseFloat(doForm.dispatch_qty),
      };

      await api.post("/logistics/create-do", payload);
      toast.success("Delivery Order Created!");
      setSelectedBooking(null); // Close Modal
      fetchPending(); // Refresh Dashboard
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create DO");
    }
  };

  if (loading) return <div className="p-8">Loading Logistics Panel...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Truck className="text-blue-600" /> Logistics Dashboard
        </h1>
        <p className="text-gray-500 text-sm">
          Manage dispatch and vehicle loading
        </p>
      </div>

      {/* PENDING ORDERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.length === 0 ? (
          <p className="text-gray-500">No pending orders. Good job!</p>
        ) : (
          bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    ORDER #{b.id}
                  </span>
                  <h3 className="font-bold text-gray-800 text-lg mt-2">
                    {b.company_name}
                  </h3>
                  <p className="text-sm text-gray-500">{b.vendor_contact}</p>
                </div>
                {b.status === "PARTIAL" && (
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded flex items-center gap-1">
                    <Clock size={12} /> Partial
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-600 space-y-1 mb-6">
                <p>
                  Total Sent So Far:{" "}
                  <span className="font-bold text-gray-800">
                    {b.total_sent || 0} Tons
                  </span>
                </p>
                <p>Date: {new Date(b.booking_date).toLocaleDateString()}</p>
              </div>

              <button
                onClick={() => openDispatchModal(b)}
                className="w-full py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition flex items-center justify-center gap-2">
                <Truck size={16} /> Create Delivery Order
              </button>
            </div>
          ))
        )}
      </div>

      {/* --- DISPATCH MODAL --- */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-0 w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row overflow-hidden relative shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="absolute top-3 right-3 p-2 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition z-10"
              aria-label="Close modal">
              <X size={20} />
            </button>

            {/* LEFT SIDE: FORM (Create New DO) */}
            <div className="p-6 w-full md:w-1/2 border-r border-gray-100 overflow-y-auto text-gray-900 bg-white">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Dispatch for Order #{selectedBooking.id}
              </h2>
              <p className="text-sm text-gray-500 mb-6 border-b pb-4">
                {selectedBooking.company_name}
              </p>

              <form
                onSubmit={handleSubmitDO}
                className="space-y-5">
                {/* 1. PRODUCT SELECTION */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                    Cargo Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Select Item to Load{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={doForm.product_id}
                        onChange={(e) =>
                          setDoForm({ ...doForm, product_id: e.target.value })
                        }
                        required>
                        <option value="">-- Choose Product --</option>
                        {orderItems.map((item) => (
                          <option
                            key={item.product_id}
                            value={item.product_id}
                            disabled={item.remaining_qty <= 0}>
                            {item.product_name} ({item.remaining_qty}T Rem)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Quantity to Load (Tons){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={doForm.dispatch_qty}
                        onChange={(e) =>
                          setDoForm({ ...doForm, dispatch_qty: e.target.value })
                        }
                        placeholder="e.g. 15.5"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 2. VEHICLE DETAILS */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                    Transport Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Vehicle Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm uppercase"
                        value={doForm.vehicle_number}
                        onChange={(e) =>
                          setDoForm({
                            ...doForm,
                            vehicle_number: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="UK-07-AB-1234"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Driver Name
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 p-2.5 rounded-lg text-sm"
                          value={doForm.driver_name}
                          onChange={(e) =>
                            setDoForm({
                              ...doForm,
                              driver_name: e.target.value,
                            })
                          }
                          placeholder="Name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Mobile
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 p-2.5 rounded-lg text-sm"
                          value={doForm.driver_number}
                          onChange={(e) =>
                            setDoForm({
                              ...doForm,
                              driver_number: e.target.value,
                            })
                          }
                          placeholder="Phone"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
                    <Truck size={16} /> Confirm Dispatch
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT SIDE: HISTORY (Previous Trucks) */}
            <div className="p-6 w-full md:w-1/2 bg-slate-50 overflow-y-auto h-full min-h-100">
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                <History
                  size={16}
                  className="text-gray-500"
                />{" "}
                Previous Dispatches
              </h3>

              {dispatchLogs.length === 0 ? (
                <div className="text-center text-gray-400 mt-20 text-sm">
                  <Truck
                    size={40}
                    className="mx-auto mb-3 opacity-20"
                  />
                  <p>No trucks have left for this order yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dispatchLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition text-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-800 text-base">
                          {log.vehicle_number}
                        </span>
                        <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                          {log.loaded_quantity_tons} T
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs space-y-1.5">
                        <p className="font-medium text-gray-700">
                          {log.product_name}
                        </p>
                        <div className="flex justify-between items-center text-gray-400">
                          <span>Driver: {log.driver_name}</span>
                          <span>
                            {new Date(log.dispatch_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsDashboard;
