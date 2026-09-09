"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  Shield,
  LogOut,
  RefreshCw,
  Mail,
  Phone,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Leaf,
  TreePine,
  Car,
  FileText,
  IndianRupee,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  village: string | null;
  state: string | null;
  createdAt: string;
  _count: { lands: number; trees: number; listings: number; vehicles: number; licences: number };
};

type Listing = {
  id: string;
  title: string;
  credits: number;
  pricePerCreditINR: number;
  totalValueINR: number;
  status: string;
  listedAt: string;
  user: { id: string; name: string; email: string; phone: string; village: string | null; state: string | null };
};

type AdminStats = {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerification: number;
  totalLands: number;
  totalTrees: number;
  totalAreaHa: number;
  totalVehicles: number;
  totalLicences: number;
  totalTrips: number;
  totalCredits: number;
  totalValueINR: number;
  activeListings: number;
  listedCredits: number;
  creditPriceINR: number;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState<"dashboard" | "users" | "listings">("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [q, setQ] = useState("");
  const [actingId, setActingId] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return setLoading(false);
    api<{ user: User }>("/api/auth/me")
      .then((d) => {
        if (d.user.role !== "admin") {
          localStorage.removeItem("adminToken");
          setUser(null);
        } else setUser(d.user);
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadStats = useCallback(() => {
    api<AdminStats>("/api/admin/stats").then((d) => setStats(d as unknown as AdminStats)).catch(() => {});
  }, []);

  const loadUsers = useCallback(() => {
    api<{ users: User[] }>(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`)
      .then((d) => setUsers(d.users))
      .catch(() => {});
  }, [q]);

  const loadListings = useCallback(() => {
    api<{ listings: Listing[] }>("/api/admin/listings").then((d) => setListings(d.listings)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    loadStats();
    loadUsers();
    loadListings();
  }, [user, loadStats, loadUsers, loadListings]);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setLoginErr("");
    try {
      const d = await api<{ user: User; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      if (d.user.role !== "admin") {
        setLoginErr("This account does not have admin access");
        return;
      }
      localStorage.setItem("adminToken", d.token);
      setUser(d.user);
    } catch (err) {
      setLoginErr(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("adminToken");
    setUser(null);
    setTab("dashboard");
  }

  async function act(fn: () => Promise<unknown>) {
    setNotice("");
    try {
      await fn();
      setNotice("Done");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Action failed");
    }
  }

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2500);
  };

  async function toggleVerified(u: User, field: "emailVerified" | "phoneVerified") {
    const next = !u[field];
    setActingId(u.id + field);
    await act(async () => {
      await api(`/api/admin/users/${u.id}`, { method: "PATCH", body: JSON.stringify({ [field]: next }) });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, [field]: next } : x)));
      loadStats();
    });
    setActingId("");
    flash(`${field === "emailVerified" ? "Email" : "Phone"} verification ${next ? "ON" : "OFF"} for ${u.name}`);
  }

  async function removeUser(u: User) {
    if (!confirm(`Delete user ${u.name} (${u.email}) and all their data? This cannot be undone.`)) return;
    setActingId(u.id);
    await act(async () => {
      await api(`/api/admin/users/${u.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      loadStats();
    });
    setActingId("");
    flash(`User ${u.name} deleted`);
  }

  async function removeListing(l: Listing) {
    if (!confirm(`Remove listing "${l.title}"?`)) return;
    setActingId(l.id);
    await act(async () => {
      await api(`/api/admin/listings/${l.id}`, { method: "DELETE" });
      setListings((prev) => prev.filter((x) => x.id !== l.id));
      loadStats();
    });
    setActingId("");
    flash(`Listing removed`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form onSubmit={doLogin} className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Kisan Carbon Hub</p>
            </div>
          </div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Admin email</label>
          <input
            type="text"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="admin@kisan.com"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
          <input
            type="password"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {loginErr && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {loginErr}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Login
          </button>
          <p className="text-xs text-gray-400 text-center mt-4">Only administrators can access this area</p>
        </form>
      </div>
    );
  }

  const cards = [
    { label: "Farmers", value: stats?.totalUsers ?? 0, icon: Users, sub: `${stats?.verifiedUsers ?? 0} verified`, color: "bg-green-600" },
    { label: "Pending Verification", value: stats?.pendingVerification ?? 0, icon: Mail, sub: "need email + phone check", color: "bg-amber-500" },
    { label: "Lands", value: stats?.totalLands ?? 0, icon: Leaf, sub: `${(stats?.totalAreaHa ?? 0).toFixed(2)} ha`, color: "bg-emerald-600" },
    { label: "Trees", value: stats?.totalTrees ?? 0, icon: TreePine, sub: "registered trees", color: "bg-lime-600" },
    { label: "Vehicles", value: stats?.totalVehicles ?? 0, icon: Car, sub: `${stats?.totalTrips ?? 0} trips logged`, color: "bg-sky-600" },
    { label: "Licences", value: stats?.totalLicences ?? 0, icon: FileText, sub: "verified licences", color: "bg-indigo-600" },
    { label: "Listings", value: stats?.activeListings ?? 0, icon: Package, sub: `${stats?.listedCredits ?? 0} credits listed`, color: "bg-violet-600" },
    {
      label: "Platform Value",
      value: `₹${(stats?.totalValueINR ?? 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      sub: `${(stats?.totalCredits ?? 0).toFixed(1)} credits @ ₹${stats?.creditPriceINR ?? 0}`,
      color: "bg-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white sticky top-0 z-20 shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold leading-tight">Kisan Carbon Admin</h1>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {(
            [
              ["dashboard", "Dashboard", LayoutDashboard],
              ["users", "Users", Users],
              ["listings", "Listings", Package],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${
                tab === key ? "bg-green-600 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {notice && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2 mb-4">{notice}</p>}

        {tab === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Overview</h2>
              <button
                onClick={() => {
                  loadStats();
                  loadUsers();
                  loadListings();
                  flash("Refreshed");
                }}
                className="text-sm bg-white border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cards.map((c) => (
                <div key={c.label} className="bg-white rounded-2xl shadow-sm p-4">
                  <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
                    <c.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 leading-tight">{c.value}</div>
                  <div className="text-sm text-gray-500">{c.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{c.sub}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              This panel is the single control point for the Kisan Carbon platform: manage farmer onboarding, verification status and
              marketplace listings. Farmers can only ever see their own lands, trees, vehicles, licences and listings — this panel is the only
              place where platform-wide data is visible (admins only).
            </p>
          </div>
        )}

        {tab === "users" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, email, phone, village..."
                  className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button onClick={loadUsers} className="text-sm bg-white border border-gray-300 hover:bg-gray-100 px-3 py-2 rounded-xl flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Search
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-2.5 font-medium">Farmer</th>
                      <th className="px-4 py-2.5 font-medium">Contact</th>
                      <th className="px-4 py-2.5 font-medium">Location</th>
                      <th className="px-4 py-2.5 font-medium">Data</th>
                      <th className="px-4 py-2.5 font-medium">Verification</th>
                      <th className="px-4 py-2.5 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 align-top">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-400">
                            {u.role === "admin" ? "Admin" : "Farmer"} · {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div>{u.email}</div>
                          <div className="text-xs text-gray-400">{u.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {u.village || "—"}
                          <div className="text-xs text-gray-400">{u.state || ""}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          <div>{u._count.lands} lands · {u._count.trees} trees</div>
                          <div>{u._count.vehicles} vehicles · {u._count.listings} listings</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 mr-1">
                            <Mail className="w-3 h-3" /> {u.emailVerified ? "email ✓" : "email ✗"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            <Phone className="w-3 h-3" /> {u.phoneVerified ? "phone ✓" : "phone ✗"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => toggleVerified(u, "emailVerified")}
                              disabled={actingId === u.id + "emailVerified"}
                              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg flex items-center gap-1"
                              title="Toggle email verification"
                            >
                              <Mail className="w-3 h-3" /> {u.emailVerified ? "Unverify" : "Verify"}
                            </button>
                            <button
                              onClick={() => toggleVerified(u, "phoneVerified")}
                              disabled={actingId === u.id + "phoneVerified"}
                              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg flex items-center gap-1"
                              title="Toggle phone verification"
                            >
                              <Phone className="w-3 h-3" /> {u.phoneVerified ? "Unverify" : "Verify"}
                            </button>
                            {u.role !== "admin" && (
                              <button
                                onClick={() => removeUser(u)}
                                disabled={actingId === u.id}
                                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded-lg flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            )}
                            {actingId === u.id + "emailVerified" || actingId === u.id + "phoneVerified" || actingId === u.id ? (
                              <Loader2 className="w-3 h-3 animate-spin ml-1" />
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No farmers found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "listings" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Marketplace Listings</h2>
              <button onClick={loadListings} className="text-sm bg-white border border-gray-300 hover:bg-gray-100 px-3 py-2 rounded-xl flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-2.5 font-medium">Listing</th>
                      <th className="px-4 py-2.5 font-medium">Owner</th>
                      <th className="px-4 py-2.5 font-medium">Credits</th>
                      <th className="px-4 py-2.5 font-medium">Per credit</th>
                      <th className="px-4 py-2.5 font-medium">Value</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((l) => (
                      <tr key={l.id} className="border-b border-gray-100 align-top">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{l.title}</div>
                          <div className="text-xs text-gray-400">{new Date(l.listedAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div>{l.user.name}</div>
                          <div className="text-xs text-gray-400">{l.user.email}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{l.credits}</td>
                        <td className="px-4 py-3 text-gray-900">₹{l.pricePerCreditINR.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-gray-900">₹{l.totalValueINR.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${l.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeListing(l)}
                            disabled={actingId === l.id}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded-lg flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {listings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No listings yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        Kisan Carbon Hub · Admin console · only authorized admins can view other farmers' data
      </footer>
    </div>
  );
}