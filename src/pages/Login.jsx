import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  BarChart3,
  Truck,
} from "lucide-react";
import api from "../api/axios";

// IMPORT THE LOGO
import logo from "../assets/logo.jpg";

const Login = () => {
  const [username, setUsername] = useState("vst_admin01");
  const [password, setPassword] = useState("Into@Inventory#42");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { username, password });

      const userData = { ...res.data.user, token: res.data.token };
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success(`Welcome back, ${res.data.user.name || "Admin"}!`);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Invalid Credentials";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-stone-50">
      {/* --- LEFT SIDE: HERO / BRANDING (Desktop Only) --- */}
      <div className="hidden lg:flex w-[45%] bg-slate-950 relative overflow-hidden flex-col justify-between p-10 xl:p-14">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Warm accent glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl" />

        {/* Top Branding with LOGO */}
        <div className="relative z-10 flex items-center gap-4">
          <img
            src={logo || "/placeholder.svg"}
            alt="Veena Steels Logo"
            className="h-12 w-12 rounded-lg object-cover ring-1 ring-white/10"
          />
          <div>
            <span className="block text-lg font-semibold tracking-wide text-white">
              VEENA STEEL TRADERS
            </span>
            <span className="text-xs text-amber-400/80 tracking-[0.2em] uppercase font-medium">
              Inventory Portal
            </span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md">
          <h1 className="text-4xl xl:text-4xl font-bold text-white leading-tight tracking-tight text-balance">
            Manage your inventory with{" "}
            <span className="text-amber-400">precision.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mt-5 max-w-sm">
            Real-time stock tracking, dispatch management, and vendor analytics,
            at one secure portal.
          </p>

          {/* Feature highlights */}
          <div className="mt-10 flex flex-col gap-4">
            {[
              {
                icon: BarChart3,
                title: "Live Analytics",
                desc: "Monitor stock levels in real time",
              },
              {
                icon: Truck,
                title: "Dispatch Tracking",
                desc: "End-to-end delivery visibility",
              },
              {
                icon: ShieldCheck,
                title: "Secure Access",
                desc: "Role-based permissions & audit logs",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3.5">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/6 shrink-0 mt-0.5">
                  <feature.icon
                    size={16}
                    className="text-amber-400/90"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">
                    {feature.title}
                  </p>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-600 font-medium pt-6 border-t border-white/6">
          &copy; {new Date().getFullYear()} Veena Steels Traders. Internal
          System.
        </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-8 relative">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-3">
          <img
            src={logo || "/placeholder.svg"}
            alt="Veena Steels Logo"
            className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200"
          />
          <div>
            <span className="text-base font-semibold text-slate-900">
              VEENA STEELS
            </span>
            <span className="block text-[10px] text-amber-600 tracking-[0.15em] uppercase font-medium">
              Inventory Portal
            </span>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-8">
          {/* Header */}
          <div className="mt-14 lg:mt-0">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 mt-1.5 text-sm">
              Enter your credentials to access the dashboard.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5">
            {/* Error Message Box */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 text-sm">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0"
                />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User
                    size={18}
                    className="text-slate-400 group-focus-within:text-amber-600 transition-colors"
                  />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all bg-white text-slate-900 text-sm placeholder:text-slate-400"
                  placeholder="Enter your ID"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock
                    size={18}
                    className="text-slate-400 group-focus-within:text-amber-600 transition-colors"
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-11 pr-11 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all bg-white text-slate-900 text-sm placeholder:text-slate-400"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider + Footer */}
          <div className="pt-6 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Protected by Veena Steels Security.
              <br />
              Unauthorized access attempts will be logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
