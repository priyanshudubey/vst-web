import { useEffect, useState } from "react";
import { X, User, MapPin, Phone, Package, Truck } from "lucide-react";
import api from "../api/axios";
import logo from "../assets/logo.jpg";

const BookingDetailsModal = ({ bookingId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    setData(null);

    const fetchDetails = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setData(res.data);
      } catch (error) {
        console.error("Failed to load details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [bookingId]);

  if (!bookingId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <img
                src={logo}
                alt="Veena Steel Traders"
                className="h-12 w-12 rounded-md object-cover border border-gray-200"
              />
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Veena Steel Traders
                </h2>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                  Sales Order
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 transition"
              aria-label="Close invoice">
              <X size={24} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">
                Invoice No.
              </p>
              <p className="text-sm font-bold text-gray-900">#{bookingId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">
                Invoice Date
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {data?.booking_date
                  ? new Date(data.booking_date).toLocaleDateString("en-IN")
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">
                Status
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {data?.status || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-8 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : !data ? (
            <div className="p-8 text-center text-red-500">
              Error loading data.
            </div>
          ) : (
            <>
              {/* SECTION 0: CUSTOMER & ORDER INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <User size={14} /> Customer Info
                  </h3>
                  <p className="text-lg font-bold text-gray-900">
                    {data.company_name || data.vendor_contact}
                  </p>
                  <div className="text-sm text-gray-600 space-y-1 mt-1">
                    <p className="flex items-center gap-2">
                      <User size={12} /> {data.vendor_contact}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={12} /> {data.phone_number}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={12} />{" "}
                      {data.vendor_address || "No address provided"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-start md:items-end">
                  <div className="text-right">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Total Amount
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹ {parseFloat(data.total_amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-2 text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        data.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : data.status === "PARTIAL"
                            ? "bg-orange-100 text-orange-800"
                            : data.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : data.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-200 text-gray-800"
                      }`}>
                      {data.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Created by: {data.created_by_name || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 1: ITEMS ORDERED */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Package
                    size={18}
                    className="text-blue-600"
                  />{" "}
                  Items Ordered
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3 text-right">Rate</th>
                        <th className="px-4 py-3 text-right">Qty</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.items?.map((item, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-bold text-gray-900">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-gray-600 font-medium">
                              {item.brand} • {item.type_or_dimension}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-800">
                            ₹{item.rate_per_ton.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">
                            {item.quantity_tons} T
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">
                            ₹
                            {parseFloat(
                              item.rate_per_ton * item.quantity_tons,
                            ).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 2: LOGISTICS (DISPATCH HISTORY) */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Truck
                    size={18}
                    className="text-orange-600"
                  />{" "}
                  Dispatch History
                </h3>

                {!data.logs || data.logs.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 font-medium">
                    No vehicles have been dispatched for this order yet.
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-orange-50 text-gray-900 font-bold border-b border-orange-200">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Vehicle Info</th>
                          <th className="px-4 py-3">Cargo</th>
                          <th className="px-4 py-3 text-right">Loaded</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.logs.map((log) => (
                          <tr
                            key={log.id}
                            className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium">
                              {new Date(log.dispatch_date).toLocaleDateString()}
                              <div className="text-[10px] text-gray-500 font-semibold">
                                {new Date(log.dispatch_date).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-gray-900">
                                {log.vehicle_number}
                              </p>
                              <div className="text-xs text-gray-600 font-medium">
                                Driver: {log.driver_name} <br /> Ph:{" "}
                                {log.driver_number}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-800 font-medium">
                              {log.product_name}
                              <div className="text-[10px] text-gray-500 font-semibold">
                                By: {log.dispatched_by}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-green-700">
                              {log.loaded_quantity_tons} T
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-bold hover:bg-gray-100 transition shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
