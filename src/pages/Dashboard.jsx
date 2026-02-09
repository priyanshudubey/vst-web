import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  TrendingUp,
  Package,
  Clock,
  IndianRupee,
  ArrowRight,
  Activity,
  Calendar,
  CreditCard,
  Briefcase,
  Layers,
} from "lucide-react";
import api from "../api/axios";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        setStats(res.data);
      } catch (error) {
        console.error("Dashboard Load Failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!stats)
    return (
      <div className="p-8 text-red-500 font-bold">
        Failed to load dashboard data.
      </div>
    );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {getGreeting()},{" "}
            <span className="text-blue-600">{user?.name || "Admin"}</span>
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm font-medium">
            <Calendar size={14} />{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="hidden md:block text-right">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
              Live Operations
            </span>
          </div>
        </div>
      </div>

      {/* --- EXECUTIVE METRICS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-blue-100 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <IndianRupee size={24} />
            </div>
            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
              Today
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">
              Revenue Generated
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              ₹ {parseInt(stats.today_overview.total_revenue).toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Metric 2: Orders & AOV */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-purple-100 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Briefcase size={24} />
            </div>
            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
              +{stats.today_overview.total_orders} Orders
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">
              Avg. Order Value
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              ₹{" "}
              {parseInt(
                stats.today_overview.average_order_value,
              ).toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Metric 3: Total Stock */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-orange-100 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Layers size={24} />
            </div>
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
              Across SKUs
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">
              Inventory Volume
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {stats.warehouse_summary.total_tons_in_godown}{" "}
              <span className="text-sm text-gray-400 font-normal">Tons</span>
            </h3>
          </div>
        </div>

        {/* Metric 4: Alerts */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-rose-100 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div
              className={`p-3 rounded-xl transition-colors ${stats.alerts.low_stock_count > 0 ? "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white" : "bg-emerald-50 text-emerald-600"}`}>
              <AlertTriangle size={24} />
            </div>
            {stats.alerts.low_stock_count > 0 && (
              <span className="animate-pulse w-2 h-2 bg-rose-500 rounded-full"></span>
            )}
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">System Alerts</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {stats.alerts.low_stock_count}{" "}
              <span className="text-sm text-gray-400 font-normal">Issues</span>
            </h3>
          </div>
        </div>
      </div>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: ACTIVITY & ALERTS (2/3 Width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Orders Table (NEW) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CreditCard
                  size={18}
                  className="text-blue-500"
                />{" "}
                Recent Transactions
              </h3>
              <Link
                to="/admin/bookings"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Client</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium text-center">
                      Status
                    </th>
                    <th className="px-6 py-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recent_orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-6 text-center text-gray-400">
                        No orders yet.
                      </td>
                    </tr>
                  ) : (
                    stats.recent_orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 font-bold text-gray-800">
                          {order.company_name}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(order.booking_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              order.status === "CONFIRMED"
                                ? "bg-green-100 text-green-700"
                                : order.status === "PARTIAL"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-800">
                          ₹ {parseFloat(order.total_amount).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Activity
                  size={18}
                  className="text-purple-500"
                />{" "}
                Operational Feed
              </h3>
            </div>
            <div className="p-6">
              <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                {stats.recent_activity.length === 0 ? (
                  <p className="text-gray-400 text-sm ml-6">
                    No recent activity logged.
                  </p>
                ) : (
                  stats.recent_activity.map((act, idx) => (
                    <div
                      key={idx}
                      className="relative pl-8 group">
                      {/* Dot */}
                      <div
                        className={`absolute -left-2.25 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${act.action_type === "STOCK_IN" ? "bg-emerald-500" : "bg-blue-500"}`}></div>

                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {act.action_type === "STOCK_IN"
                              ? "Stock Added"
                              : "Dispatch"}
                            :{" "}
                            <span className="text-gray-600 font-normal">
                              {act.product_name}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {act.remarks || "Updated via System"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-sm font-bold font-mono ${act.quantity_change > 0 ? "text-emerald-600" : "text-blue-600"}`}>
                            {act.quantity_change > 0 ? "+" : ""}
                            {act.quantity_change}T
                          </span>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(act.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ALERTS & CAPACITY (1/3 Width) */}
        <div className="space-y-8">
          {/* Low Stock Warning */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full max-h-125 flex flex-col">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle
                  size={18}
                  className="text-rose-500"
                />{" "}
                Critical Stock
              </h3>
              <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                {stats.alerts.low_stock_count}
              </span>
              <Link
                to="/admin/inventory"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition">
                View All <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {stats.alerts.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8">
                  <Package
                    size={40}
                    className="mb-2 opacity-20"
                  />
                  <p className="text-sm">Warehouse levels are optimal.</p>
                </div>
              ) : (
                stats.alerts.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-rose-50 border border-rose-100 group hover:shadow-sm transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">
                          {item.product_name}
                        </h4>
                        <p className="text-xs text-rose-700/70 font-medium">
                          {item.brand}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-rose-700 bg-white px-2 py-1 rounded shadow-sm">
                        {item.current_stock_tons} T
                      </span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-rose-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full w-[15%]"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
