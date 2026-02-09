import { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  XCircle,
  Search,
  Calendar,
  FileText,
  Truck,
  Pencil,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import BookingDetailsModal from "../components/BookingDetailsModal";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" means all statuses

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    bookingId: null,
    message: "",
  });

  // Details Modal State
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  // --- 1. FETCH BOOKINGS LIST ---
  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/list");
      setBookings(res.data);
    } catch (error) {
      toast.error(
        "Failed to load bookings: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- 2. OPEN DETAILS MODAL ---
  const handleViewDetails = (id) => {
    setSelectedBookingId(id);
  };

  // --- ACTION HANDLERS ---
  const openConfirmModal = (type, bookingId, message) => {
    setConfirmModal({ isOpen: true, type, bookingId, message });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: "", bookingId: null, message: "" });
  };

  const executeConfirmedAction = async () => {
    const { type, bookingId } = confirmModal;
    closeConfirmModal();

    if (type === "dispatch") {
      try {
        await api.patch(`/bookings/dispatch/${bookingId}`);
        toast.success("Order Dispatched Successfully!");
        fetchBookings();
      } catch (error) {
        toast.error(error.response?.data?.message || "Dispatch failed");
      }
    } else if (type === "cancel") {
      try {
        await api.patch(`/bookings/cancel/${bookingId}`);
        toast.success("Booking Cancelled");
        fetchBookings();
      } catch (error) {
        toast.error(error.response?.data?.message || "Cancel failed");
      }
    }
  };

  const handleDispatch = (bookingId) => {
    openConfirmModal(
      "dispatch",
      bookingId,
      "Confirm Dispatch? This will deduct stock from Inventory.",
    );
  };

  const handleCancel = (bookingId) => {
    openConfirmModal(
      "cancel",
      bookingId,
      "Are you sure you want to cancel this booking? Stock will be restored.",
    );
  };

  // Filter Logic
  const filteredBookings = bookings
    .filter(
      (b) =>
        (b.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.booking_id.toString().includes(searchTerm)) &&
        (statusFilter === "" || b.status === statusFilter),
    )
    .sort((a, b) => b.booking_id - a.booking_id);

  if (loading)
    return <div className="p-8 text-gray-900">Loading Orders...</div>;

  return (
    <div>
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
          <p className="text-gray-600 text-sm">
            View and manage all sales orders
          </p>
        </div>
        <Link
          to="/admin/bookings/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
          <Plus size={20} /> New Booking
        </Link>
      </div>

      {/* --- SEARCH --- */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-3 text-gray-500"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by Vendor Name or Booking ID..."
          className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-4 font-bold text-gray-800">Order ID</th>
              <th className="p-4 font-bold text-gray-800">Date</th>
              <th className="p-4 font-bold text-gray-800">Client / Vendor</th>
              <th className="p-4 font-bold text-gray-800 text-right">
                Total Amount
              </th>
              <th className="p-4 font-bold text-gray-800 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span>Status</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-semibold">
                    <option value="">All</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </th>
              <th className="p-4 font-bold text-gray-800 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredBookings.map((booking) => (
              <tr
                key={booking.booking_id}
                className="hover:bg-gray-50 transition">
                <td className="p-4 font-mono text-blue-700 font-bold">
                  #{booking.booking_id}
                </td>
                <td className="p-4 text-sm text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={14}
                      className="text-gray-500"
                    />
                    {new Date(booking.booking_date).toLocaleDateString(
                      "en-IN",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium text-gray-900">
                  {booking.vendor_name}
                  <div className="text-xs text-gray-500 font-semibold">
                    By: {booking.booked_by || "Admin"}
                  </div>
                </td>
                <td className="p-4 text-right font-bold text-gray-900">
                  ₹ {parseFloat(booking.total_amount).toLocaleString("en-IN")}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      booking.status === "CONFIRMED"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : booking.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-200 text-gray-800"
                    }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  {booking.status === "CONFIRMED" && (
                    <>
                      <button
                        onClick={() => handleDispatch(booking.booking_id)}
                        title="Dispatch Order"
                        className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200">
                        <Truck size={18} />
                      </button>
                      <Link
                        to={`/admin/bookings/edit/${booking.booking_id}`}
                        className="p-2 text-yellow-700 hover:bg-yellow-50 rounded-lg border border-transparent hover:border-yellow-200"
                        title="Edit Order">
                        <Pencil size={18} />
                      </Link>
                    </>
                  )}
                  {booking.status !== "CANCELLED" && (
                    <button
                      onClick={() => handleCancel(booking.booking_id)}
                      title="Cancel Booking"
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <XCircle size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetails(booking.booking_id)}
                    className="p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                    title="View Full Details">
                    <FileText size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredBookings.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-gray-500">
                  No bookings found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Confirm Action
            </h3>
            <p className="text-gray-700 mb-6 font-medium">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">
                Cancel
              </button>
              <button
                onClick={executeConfirmedAction}
                className={`px-4 py-2 rounded-lg text-white font-bold transition ${
                  confirmModal.type === "dispatch"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}>
                {confirmModal.type === "dispatch"
                  ? "Confirm Dispatch"
                  : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FULL DETAILS MODAL --- */}
      {selectedBookingId && (
        <BookingDetailsModal
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
        />
      )}
    </div>
  );
};

export default Bookings;
