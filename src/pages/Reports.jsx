import { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  IndianRupee,
  FileText,
  User,
  Search,
  X, // Clear button icon
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import BookingDetailsModal from "../components/BookingDetailsModal";

const Reports = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("date");
  const [loading, setLoading] = useState(false);
  const [viewBookingId, setViewBookingId] = useState(null);

  // 1. DATE REPORT STATE
  const today = new Date().toISOString().split("T")[0];
  const [dateRange, setDateRange] = useState({ start: today, end: today });
  const [dateReport, setDateReport] = useState(null);

  // 2. VENDOR REPORT STATE
  const [vendors, setVendors] = useState([]);
  const [selectedVendorName, setSelectedVendorName] = useState(""); // For Input Display
  const [selectedVendorId, setSelectedVendorId] = useState(""); // For API Call
  const [vendorReport, setVendorReport] = useState(null);

  // 3. PRODUCT REPORT STATE
  const [products, setProducts] = useState([]);
  const [selectedProductName, setSelectedProductName] = useState(""); // For Input Display
  const [selectedProductId, setSelectedProductId] = useState(""); // For API Call
  const [productReport, setProductReport] = useState(null);

  // --- INITIAL DATA LOADING ---
  useEffect(() => {
    const fetchLists = async () => {
      try {
        // CORRECTION: Using the specific /list endpoints you provided
        const [vRes, pRes] = await Promise.all([
          api.get("/vendors/list"),
          api.get("/inventory/list"),
        ]);

        console.log("Vendors Loaded:", vRes.data);
        console.log("Products Loaded:", pRes.data);

        setVendors(vRes.data);
        setProducts(pRes.data);
      } catch (err) {
        console.error("Failed to load lists", err);
        toast.error("Could not load vendor or product lists.");
      }
    };
    fetchLists();
  }, []);

  // --- API FETCHERS ---
  const fetchDateReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/reports/range?startDate=${dateRange.start}&endDate=${dateRange.end}`,
      );
      setDateReport(res.data);
    } catch (error) {
      toast.error("Failed to load date report", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorReport = async () => {
    if (!selectedVendorId) {
      toast.error("Please select a valid vendor from the list");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(
        `/reports/vendor-history?vendorId=${selectedVendorId}`,
      );
      setVendorReport(res.data);
    } catch (err) {
      toast.error("Failed to load vendor history", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductReport = async () => {
    if (!selectedProductId) {
      toast.error("Please select a valid product from the list");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(
        `/reports/product-sales?productId=${selectedProductId}`,
      );
      setProductReport(res.data);
    } catch (err) {
      toast.error("Failed to load product history", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch date report when tab or range changes
  useEffect(() => {
    if (activeTab === "date") fetchDateReport();
    // eslint-disable-next-line
  }, [dateRange, activeTab]);

  // --- HANDLERS FOR SEARCHABLE INPUTS ---
  const handleVendorInput = (e) => {
    const val = e.target.value;
    setSelectedVendorName(val);

    // Auto-select ID if name matches exactly
    const match = vendors.find((v) => v.company_name === val);
    if (match) setSelectedVendorId(match.id);
    else setSelectedVendorId("");
  };

  const handleProductInput = (e) => {
    const val = e.target.value;
    setSelectedProductName(val);

    // Auto-select ID if name matches exactly
    // We match against the full string shown in datalist options
    const match = products.find(
      (p) => `${p.product_name} - ${p.brand} (${p.type_or_dimension})` === val,
    );
    if (match) setSelectedProductId(match.id);
    else setSelectedProductId("");
  };

  // Quick Date Helpers
  const setToday = () => {
    const t = new Date().toISOString().split("T")[0];
    setDateRange({ start: t, end: t });
  };
  const setLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    setDateRange({
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    });
  };
  const setThisMonth = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    setDateRange({
      start: firstDay.toISOString().split("T")[0],
      end: lastDay.toISOString().split("T")[0],
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* --- HEADER --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 pb-0 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="text-blue-600" /> Business Intelligence
          </h1>
          <div className="flex gap-8 overflow-x-auto">
            {["date", "vendor", "product"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                {tab === "date" && <Calendar size={18} />}
                {tab === "vendor" && <User size={18} />}
                {tab === "product" && <Package size={18} />}
                {tab === "date"
                  ? "Date Summary"
                  : tab === "vendor"
                    ? "Vendor History"
                    : "Product Sales"}
              </button>
            ))}
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="p-6 bg-gray-50 min-h-100">
          {/* TAB 1: DATE REPORT */}
          {activeTab === "date" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-xs text-gray-500 font-bold">
                    RANGE:
                  </span>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className="bg-transparent text-sm font-bold text-gray-900 outline-none cursor-pointer scheme-light"
                  />
                  <span className="text-gray-300">|</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className="bg-transparent text-sm font-bold text-gray-900 outline-none cursor-pointer scheme-light"
                  />
                </div>
                <div className="flex bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
                  <button
                    onClick={setToday}
                    className="px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded">
                    Today
                  </button>
                  <button
                    onClick={setLast7Days}
                    className="px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded">
                    Last 7 Days
                  </button>
                  <button
                    onClick={setThisMonth}
                    className="px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded">
                    This Month
                  </button>
                </div>
              </div>

              {loading && (
                <div className="text-center py-10 text-gray-500">
                  Loading Report...
                </div>
              )}

              {dateReport && !loading && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Total Revenue
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                          <IndianRupee size={24} />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">
                          ₹{" "}
                          {parseInt(
                            dateReport.stats.total_revenue,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Orders
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                          <FileText size={24} />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">
                          {dateReport.stats.orders_count}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Purchased
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="p-3 bg-purple-100 text-purple-700 rounded-lg">
                          <TrendingUp size={24} />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">
                          {dateReport.stats.stock_added_tons}{" "}
                          <span className="text-sm font-normal text-gray-500">
                            T
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Sold
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="p-3 bg-orange-100 text-orange-700 rounded-lg">
                          <TrendingDown size={24} />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">
                          {dateReport.stats.stock_dispatched_tons}{" "}
                          <span className="text-sm font-normal text-gray-500">
                            T
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-125">
                      <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                        <h3 className="font-bold text-gray-800">Sales Log</h3>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-white text-gray-500 border-b sticky top-0">
                            <tr>
                              <th className="px-4 py-2">Date</th>
                              <th className="px-4 py-2">Client</th>
                              <th className="px-4 py-2 text-right">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dateReport.bookings.map((b) => (
                              <tr
                                key={b.id}
                                className="hover:bg-gray-50 border-b border-gray-100">
                                <td className="px-4 py-3 text-gray-600">
                                  {new Date(
                                    b.booking_date,
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {b.vendor_name}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-800">
                                  ₹{parseFloat(b.total_amount).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-125">
                      <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between">
                        <h3 className="font-bold text-gray-800">
                          Stock Movement
                        </h3>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                          {dateReport.movements.length} Actions
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {dateReport.movements.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-3 border border-gray-100 rounded-lg hover:shadow-sm flex items-start gap-3 bg-white">
                            <div
                              className={`mt-1 w-2 h-2 rounded-full shrink-0 ${m.quantity_change > 0 ? "bg-green-500" : "bg-red-500"}`}></div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-800 text-sm">
                                  {m.product_name}
                                </span>
                                <span
                                  className={`text-sm font-bold ${m.quantity_change > 0 ? "text-green-600" : "text-red-600"}`}>
                                  {m.quantity_change > 0 ? "+" : ""}
                                  {m.quantity_change} T
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {m.action_type.replace("_", " ")} • {m.remarks}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(m.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: VENDOR HISTORY (With SEARCHABLE Input) */}
          {activeTab === "vendor" && (
            <div className="space-y-6">
              <div className="flex gap-4 max-w-2xl items-end">
                <div className="relative flex-1">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    SEARCH VENDOR
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />

                    {/* INPUT + DATALIST for Searchable Dropdown */}
                    <input
                      list="vendor-options"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                      placeholder="Type vendor name..."
                      value={selectedVendorName}
                      onChange={handleVendorInput}
                    />

                    <datalist id="vendor-options">
                      {vendors.map((v) => (
                        <option
                          key={v.id}
                          value={v.company_name}
                        />
                      ))}
                    </datalist>

                    {selectedVendorName && (
                      <button
                        onClick={() => {
                          setSelectedVendorName("");
                          setSelectedVendorId("");
                        }}
                        className="absolute right-3 top-3 text-gray-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={fetchVendorReport}
                  disabled={!selectedVendorId || loading}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-11.5">
                  {loading ? "..." : "Search"}
                </button>
              </div>

              {vendorReport && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800">Order History</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-green-600">
                        ₹ {vendorReport.summary.totalSpent.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-500 border-b">
                      <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Order ID</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorReport.bookings.map((b) => (
                        <tr
                          key={b.id}
                          className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(b.booking_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-mono text-blue-600 font-bold">
                            #{b.id}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-800">
                            ₹ {parseFloat(b.total_amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setViewBookingId(b.id)}
                              className="text-blue-600 hover:underline font-bold text-xs">
                              View Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {vendorReport.bookings.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No orders found.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRODUCT SALES (With SEARCHABLE Input) */}
          {activeTab === "product" && (
            <div className="space-y-6">
              <div className="flex gap-4 max-w-2xl items-end">
                <div className="relative flex-1">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    SEARCH PRODUCT
                  </label>
                  <div className="relative">
                    <Package
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />

                    <input
                      list="product-options"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                      placeholder="Type product name (e.g. TMT)"
                      value={selectedProductName}
                      onChange={handleProductInput}
                    />

                    <datalist id="product-options">
                      {products.map((p) => (
                        <option
                          key={p.id}
                          value={`${p.product_name} - ${p.brand} (${p.type_or_dimension})`}
                        />
                      ))}
                    </datalist>

                    {selectedProductName && (
                      <button
                        onClick={() => {
                          setSelectedProductName("");
                          setSelectedProductId("");
                        }}
                        className="absolute right-3 top-3 text-gray-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={fetchProductReport}
                  disabled={!selectedProductId || loading}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-11.5">
                  {loading ? "..." : "Search"}
                </button>
              </div>

              {productReport && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800">Product Sales</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-blue-600">
                        {productReport.summary.totalSoldTons} Tons
                      </span>
                    </div>
                  </div>
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-500 border-b">
                      <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3 text-right">Qty</th>
                        <th className="px-6 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productReport.sales.map((s, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(s.booking_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {s.company_name}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-800">
                            {s.quantity_tons} T
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setViewBookingId(s.booking_id)}
                              className="text-blue-600 hover:underline font-bold text-xs">
                              View Order
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {productReport.sales.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No sales found.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BookingDetailsModal
        bookingId={viewBookingId}
        onClose={() => setViewBookingId(null)}
      />
    </div>
  );
};

export default Reports;
