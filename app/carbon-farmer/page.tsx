"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Leaf, MapPin, Search, TreePine, Droplets, Globe, BarChart3, Info,
  ChevronDown, ChevronUp, Loader2, AlertCircle, Thermometer, Satellite,
  Layers, User, LogOut, LayoutDashboard, Calculator, Landmark, ImagePlus,
  Store, Wallet, TrendingUp, Shield, CheckCircle2, X, Sprout, Users,
  QrCode, Copy, Check, Share2, Banknote, Phone, Building2, Navigation,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import QRCode from "qrcode";
import { TREE_TYPES, TREE_TYPE_MAP, getCreditsPerHa } from "@/lib/carbonRates";
import type { TreeType } from "@/lib/carbonRates";

const MapInner = dynamic(() => import("./MapInner"), { ssr: false });

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  village?: string;
  state?: string;
  upiId?: string;
  acHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
}

interface Land {
  id: string;
  title: string;
  village: string;
  district: string;
  state: string;
  areaHa: number;
  areaAcres: number;
  lat: number;
  lng: number;
  polygons?: string;
  vegetationType: string;
  cropType?: string;
  soilType?: string;
  waterSource?: string;
  estCreditsPerHa: number;
  estTotalCredits: number;
  estValueINR: number;
  registeredAt: string;
}

interface Tree {
  id: string;
  species: string;
  ageYears: number;
  heightM: number;
  imageBase64?: string;
  lat: number;
  lng: number;
  locationName?: string;
  estCO2Kg: number;
  estValueINR: number;
  createdAt: string;
}

interface Listing {
  id: string;
  title: string;
  credits: number;
  pricePerCreditINR: number;
  totalValueINR: number;
  status: string;
  user: {
    name: string;
    village: string;
    state: string;
    upiId?: string;
    acHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
  };
}

interface Stats {
  landCount: number;
  treeCount: number;
  totalAreaHa: number;
  totalCredits: number;
  totalValueINR: number;
  listedCredits: number;
  activeListings: number;
}

const API = "/api";
const CREDIT_PRICE_INR = 1800;

export default function CarbonFarmer() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [loading, setLoading] = useState(true);

  // Auth form state
  const [aName, setAName] = useState("");
  const [aEmail, setAEmail] = useState("");
  const [aPhone, setAPhone] = useState("");
  const [aVillage, setAVillage] = useState("");
  const [aState, setAState] = useState("");
  const [aPassword, setAPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // Nav + data
  const [tab, setTab] = useState<"overview" | "calculator" | "lands" | "trees" | "market" | "payment">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [lands, setLands] = useState<Land[]>([]);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [landTrees, setLandTrees] = useState<Tree[]>([]);

  // Calculator state
  const [calcLocation, setCalcLocation] = useState<{ lat: number; lng: number; name: string; address: string } | null>(null);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calcBusy, setCalcBusy] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [showCalcDetails, setShowCalcDetails] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.209]);
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const [mapType, setMapType] = useState<"satellite" | "street">("satellite");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Register land state
  const [regMode, setRegMode] = useState(false);
  const [regLat, setRegLat] = useState<number | null>(null);
  const [regLng, setRegLng] = useState<number | null>(null);
  const [regPolygons, setRegPolygons] = useState<[number, number][]>([]);
  const [regAreaHa, setRegAreaHa] = useState(0);
  const [regAreaAcres, setRegAreaAcres] = useState(0);
  const [regTitle, setRegTitle] = useState("");
  const [regVillage, setRegVillage] = useState("");
  const [regDistrict, setRegDistrict] = useState("");
  const [regState, setRegState] = useState("");
  const [regVeg, setRegVeg] = useState("mango");
  const [regCrop, setRegCrop] = useState("");
  const [regSoil, setRegSoil] = useState("");
  const [regWater, setRegWater] = useState("");
  const [regBusy, setRegBusy] = useState(false);
  const [landMsg, setLandMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showRegForm, setShowRegForm] = useState(false);

  // Tree upload state
  const [treeSpecies, setTreeSpecies] = useState("");
  const [treeAge, setTreeAge] = useState("");
  const [treeHeight, setTreeHeight] = useState("");
  const [treeImage, setTreeImage] = useState<string | null>(null);
  const [treeLoc, setTreeLoc] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [treeBusy, setTreeBusy] = useState(false);
  const [treeMsg, setTreeMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showTreeForm, setShowTreeForm] = useState(false);

  // Marketplace state
  const [mkTitle, setMkTitle] = useState("");
  const [mkCredits, setMkCredits] = useState("");
  const [mkPrice, setMkPrice] = useState("");
  const [mkLandId, setMkLandId] = useState("");
  const [mkBusy, setMkBusy] = useState(false);
  const [mkMsg, setMkMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [mkShowForm, setMkShowForm] = useState(false);

  // Payment state
  const [payUpi, setPayUpi] = useState(user?.upiId || "");
  const [payHolder, setPayHolder] = useState(user?.acHolderName || "");
  const [payBank, setPayBank] = useState(user?.bankName || "");
  const [payAccount, setPayAccount] = useState(user?.accountNumber || "");
  const [payIfsc, setPayIfsc] = useState(user?.ifsc || "");
  const [payBusy, setPayBusy] = useState(false);
  const [payMsg, setPayMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [activeBuy, setActiveBuy] = useState<Listing | null>(null);

  useEffect(() => {
    if (user) {
      setPayUpi(user?.upiId || "");
      setPayHolder(user?.acHolderName || "");
      setPayBank(user?.bankName || "");
      setPayAccount(user?.accountNumber || "");
      setPayIfsc(user?.ifsc || "");
    }
  }, [user]);

  // Refs for dynamic import
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cc_token");
    if (stored) setToken(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser(token);
    }
  }, [token]);

  useEffect(() => {
    if (user) loadAll(user);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function api(path: string, options?: RequestInit) {
    return fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options?.headers || {}),
      },
    });
  }

  const fetchUser = async (t: string) => {
    try {
      const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("cc_token");
        setToken(null);
      }
    } catch { /* ignore */ }
  };

  const loadAll = async (u: AuthUser) => {
    try {
      const [sRes, lRes, tRes, mkRes] = await Promise.all([
        api(`/api/stats`),
        api(`/api/lands`),
        api(`/api/trees`),
        api(`/api/marketplace`),
      ]);
      if (sRes.ok) setStats((await sRes.json()).stats);
      if (lRes.ok) setLands((await lRes.json()).lands);
      if (tRes.ok) setTrees((await tRes.json()).trees);
      if (mkRes.ok) setListings((await mkRes.json()).listings);
    } catch { /* ignore */ }
  };

  const doAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      if (authMode === "register") {
        if (!aName || !aEmail || !aPhone || !aPassword) {
          setAuthError("Please fill in Name, Email, Phone and Password to register.");
          setAuthBusy(false);
          return;
        }
      } else {
        if ((!aEmail && !aPhone) || !aPassword) {
          setAuthError("Please enter your email/phone and password.");
          setAuthBusy(false);
          return;
        }
      }
      const body =
        authMode === "register"
          ? { name: aName, email: aEmail, phone: aPhone, password: aPassword, village: aVillage, state: aState }
          : { email: aEmail || aPhone, password: aPassword };

      const url = authMode === "register" ? `${API}/auth/register` : `${API}/auth/login`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Something went wrong");
        setAuthBusy(false);
        return;
      }
      localStorage.setItem("cc_token", data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  };

  const demoLogin = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "ramesh@farm.com", password: "hello123" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Demo account issue");
        setAuthBusy(false);
        return;
      }
      localStorage.setItem("cc_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthMode("login");
    } catch {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("cc_token");
    setToken(null);
    setUser(null);
    setStats(null);
    setLands([]);
    setTrees([]);
    setListings([]);
    setTab("overview");
  };

  const searchLocation = async (q: string) => {
    if (!q || q.length < 2) { setSearchResults([]); setShowSearch(false); return; }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6`, { headers: { "User-Agent": "CarbonFarmer/1.0" } });
      const data = await res.json();
      setSearchResults(data);
      setShowSearch(data.length > 0);
    } catch { setSearchResults([]); }
  };

  const selectResult = (r: any) => {
    const lat = parseFloat(r.lat), lng = parseFloat(r.lon);
    const loc = { lat, lng, name: r.display_name.split(",")[0], address: r.display_name };
    setCalcLocation(loc);
    setSearchQuery(loc.name);
    setMapCenter([lat, lng]);
    setMarkerPos([lat, lng]);
    setShowSearch(false);
    setSearchResults([]);
    setCalcResult(null);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    reverseGeocode(lat, lng);
    setCalcResult(null);
  };

  const handleMarkerDrag = (lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    reverseGeocode(lat, lng);
    setCalcResult(null);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, { headers: { "User-Agent": "CarbonFarmer/1.0" } });
      const data = await res.json();
      setCalcLocation({
        lat,
        lng,
        name: data.name || data.display_name?.split(",")[0] || "Selected Point",
        address: data.display_name || `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });
    } catch {
      setCalcLocation({ lat, lng, name: "Selected Point", address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    }
  };

  const calculateCarbon = useCallback(() => {
    if (!calcLocation) { setCalcError("Please select a location on the map first"); return; }
    setCalcBusy(true);
    setCalcError(null);
    setTimeout(() => {
      const { lat, lng } = calcLocation;
      const absLat = Math.abs(lat);
      let veg = 0, soil = 0, water = 0, urban = 0;

      if (absLat < 10) { veg = 0.7 + Math.random() * 0.25; soil = 0.6 + Math.random() * 0.2; water = 0.5 + Math.random() * 0.3; }
      else if (absLat < 25) { veg = 0.5 + Math.random() * 0.3; soil = 0.5 + Math.random() * 0.25; water = 0.3 + Math.random() * 0.3; }
      else if (absLat < 40) { veg = 0.4 + Math.random() * 0.3; soil = 0.4 + Math.random() * 0.3; water = 0.2 + Math.random() * 0.3; }
      else { veg = 0.2 + Math.random() * 0.3; soil = 0.3 + Math.random() * 0.2; water = 0.1 + Math.random() * 0.2; }

      const hash = Math.abs(Math.sin(lat * 1000 + lng * 1000));
      if (hash > 0.7) { urban = 0.3 + Math.random() * 0.4; veg *= 0.5; }
      else if (hash > 0.5) { urban = 0.1 + Math.random() * 0.2; }

      veg = Math.min(1, Math.max(0, veg));
      soil = Math.min(1, Math.max(0, soil));
      water = Math.min(1, Math.max(0, water));
      urban = Math.min(1, Math.max(0, urban));

      const creditsPerHa = veg * 18 + soil * 8 + water * 5 - urban * 3;
      const treesPerHa = Math.round(veg * 120);
      const co2PerHa = creditsPerHa * 1000;
      const valuePerHa = creditsPerHa * CREDIT_PRICE_INR;

      const rec = [];
      if (veg < 0.5) rec.push("Plant more trees to increase vegetation cover");
      if (soil < 0.4) rec.push("Adopt soil conservation and cover cropping");
      if (water < 0.3) rec.push("Create water bodies or wetlands");

      setCalcResult({ veg, soil, water, urban, creditsPerHa, treesPerHa, co2PerHa, valuePerHa, rec });
      setShowCalcDetails(true);
      setCalcBusy(false);
    }, 1500);
  }, [calcLocation]);

  const handlePolygon = (latlngs: [number, number][], areaHa: number, areaAcres: number) => {
    setRegPolygons(latlngs);
    setRegAreaHa(areaHa);
    setRegAreaAcres(areaAcres);
    if (latlngs.length >= 1) {
      setRegLat(latlngs[0][0]);
      setRegLng(latlngs[0][1]);
    }
  };

  const handleLiveLocation = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setRegLat(lat);
    setRegLng(lng);
  };

  const goSellFromCalc = (credits: string, price: string, treeLabel: string) => {
    setMkTitle(`${treeLabel} carbon credits`);
    setMkCredits(credits);
    setMkPrice(price);
    setMkShowForm(true);
    setTab("market");
  };

  const registerLand = async (e: React.FormEvent) => {
    e.preventDefault();
    setLandMsg(null);
    if (regAreaHa <= 0) { setLandMsg({ ok: false, text: "Please draw your land area on the map first (outline it using Start New Area)" }); return; }
    setRegBusy(true);
    try {
      const body = {
        title: regTitle || `${regVillage || "My"} farmland`,
        village: regVillage,
        district: regDistrict,
        state: regState,
        areaHa: regAreaHa,
        areaAcres: regAreaAcres,
        lat: regLat,
        lng: regLng,
        polygons: regPolygons,
        vegetationType: regVeg,
        treeType: regVeg,
        cropType: regCrop,
        soilType: regSoil,
        waterSource: regWater,
      };
      const res = await api(`/api/lands`, { method: "POST", body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setLandMsg({ ok: false, text: data.error || "Failed to register" }); setRegBusy(false); return; }
      setLandMsg({ ok: true, text: `Land registered! Estimated ₹${Math.round(data.land.estValueINR).toLocaleString('en-IN')} in carbon credits.` });
      setShowRegForm(false);
      setRegMode(false);
      if (user) loadAll(user);
    } catch { setLandMsg({ ok: false, text: "Network error" }); } finally { setRegBusy(false); }
  };

  const addTree = async (e: React.FormEvent) => {
    e.preventDefault();
    setTreeMsg(null);
    if (!treeSpecies || !treeLoc) { setTreeMsg({ ok: false, text: "Species and location (map click) required" }); return; }
    setTreeBusy(true);
    try {
      const body = {
        species: treeSpecies,
        ageYears: parseInt(treeAge) || 1,
        heightM: parseFloat(treeHeight) || 5,
        imageBase64: treeImage,
        lat: treeLoc.lat,
        lng: treeLoc.lng,
        locationName: treeLoc.name,
      };
      const res = await api(`/api/trees`, { method: "POST", body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setTreeMsg({ ok: false, text: data.error || "Failed" }); setTreeBusy(false); return; }
      setTreeMsg({ ok: true, text: `Tree added! Stores ~${Math.round(data.tree.estCO2Kg).toLocaleString()} kg CO2 worth ~₹${Math.round(data.tree.estValueINR).toLocaleString('en-IN')}.` });
      setShowTreeForm(false);
      setTreeImage(null);
      setTreeLoc(null);
      setTreeSpecies("");
      if (user) loadAll(user);
    } catch { setTreeMsg({ ok: false, text: "Network error" }); } finally { setTreeBusy(false); }
  };

  const createListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setMkMsg(null);
    if (!mkCredits || !mkPrice) { setMkMsg({ ok: false, text: "Credits and price required" }); return; }
    setMkBusy(true);
    try {
      const body = { title: mkTitle, credits: parseFloat(mkCredits), pricePerCreditINR: parseFloat(mkPrice), landId: mkLandId || null };
      const res = await api(`/api/marketplace`, { method: "POST", body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setMkMsg({ ok: false, text: data.error || "Failed" }); setMkBusy(false); return; }
      setMkMsg({ ok: true, text: `Listing created for ₹${Math.round(data.listing.totalValueINR).toLocaleString('en-IN')}!` });
      setMkShowForm(false);
      if (user) loadAll(user);
    } catch { setMkMsg({ ok: false, text: "Network error" }); } finally { setMkBusy(false); }
  };

  const savePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayMsg(null);
    if (!payUpi && !payAccount) { setPayMsg({ ok: false, text: "Enter a UPI ID or bank account details" }); return; }
    setPayBusy(true);
    try {
      const res = await api(`/api/payment`, {
        method: "PUT",
        body: JSON.stringify({ upiId: payUpi, acHolderName: payHolder, bankName: payBank, accountNumber: payAccount, ifsc: payIfsc }),
      });
      const data = await res.json();
      if (!res.ok) { setPayMsg({ ok: false, text: data.error || "Failed to save" }); setPayBusy(false); return; }
      setPayMsg({ ok: true, text: "Payment details saved! Your QR code is ready for buyers." });
      if (user) setUser({ ...user, ...data.payment });
    } catch { setPayMsg({ ok: false, text: "Network error" }); } finally { setPayBusy(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setTreeImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen mode={authMode} setMode={setAuthMode} form={{ aName,setAName,aEmail,setAEmail,aPhone,setAPhone,aVillage,setAVillage,aState,setAState,aPassword,setAPassword }} error={authError} busy={authBusy} onSubmit={doAuth} onDemoLogin={demoLogin} />;
  }

  const totalCredits = stats?.totalCredits || 0;
  const convertedValue = stats?.totalValueINR || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-green-800 via-emerald-800 to-teal-900 text-white shrink-0">
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Leaf className="w-6 h-6" /></div>
          <div>
            <p className="font-black leading-tight">Kisan Carbon</p>
            <p className="text-[10px] text-green-200 uppercase tracking-widest">Farmer Credit Hub</p>
          </div>
        </div>

        <div className="mx-4 p-3 bg-white/10 rounded-xl mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-amber-400 text-green-900 rounded-full flex items-center justify-center font-black">{user.name.charAt(0).toUpperCase()}</div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-green-200 truncate">{user.village || user.state || "Farmer"}</p>
            </div>
          </div>
          <button onClick={logout} className="mt-3 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-xs font-bold py-2 rounded-lg transition-colors"><LogOut className="w-4 h-4" /> Logout</button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {[
            { key: "overview", label: "Dashboard", icon: LayoutDashboard },
            { key: "calculator", label: "Carbon Calculator", icon: Calculator },
            { key: "lands", label: "My Lands", icon: Landmark },
            { key: "trees", label: "My Trees", icon: TreePine },
            { key: "market", label: "Marketplace", icon: Store },
            { key: "payment", label: "Payment & Wallet", icon: Wallet },
          ].map((item) => (
            <button key={item.key} onClick={() => setTab(item.key as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === item.key ? "bg-white text-green-800 shadow" : "hover:bg-white/10"}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 text-[10px] text-green-300 border-t border-white/10">Built by Shivam Kumar</div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-gradient-to-r from-green-700 to-emerald-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><Leaf className="w-6 h-6" /><span className="font-black">Kisan Carbon</span></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">{user.name.charAt(0)}</div>
            <button onClick={logout} className="bg-white/20 p-2 rounded-lg"><LogOut className="w-4 h-4" /></button>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden flex overflow-x-auto gap-1 p-2 bg-white border-b border-green-100">
          {[
            { key: "overview", label: "Home", icon: LayoutDashboard },
            { key: "calculator", label: "Calculator", icon: Calculator },
            { key: "lands", label: "Lands", icon: Landmark },
            { key: "trees", label: "Trees", icon: TreePine },
            { key: "market", label: "Market", icon: Store },
            { key: "payment", label: "Pay", icon: Wallet },
          ].map((i) => (
            <button key={i.key} onClick={() => setTab(i.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${tab === i.key ? "bg-green-600 text-white" : "bg-green-50 text-green-700"}`}>
              <i.icon className="w-3.5 h-3.5" /> {i.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {tab === "overview" && <Overview user={user} stats={stats} lands={lands} trees={trees} onGo={setTab} />}
          {tab === "calculator" && (
            <CalculatorTab
              searchRef={searchRef} searchQuery={searchQuery} setSearchQuery={(v) => { setSearchQuery(v); searchLocation(v); }}
              searchResults={searchResults} showSearch={showSearch} setShowSearch={setShowSearch}
              selectResult={selectResult}
              calcLocation={calcLocation} calcResult={calcResult} calcBusy={calcBusy} calcError={calcError}
              calculate={calculateCarbon} showDetails={showCalcDetails} setShowDetails={setShowCalcDetails}
              mapCenter={mapCenter} markerPos={markerPos} mapType={mapType} setMapType={setMapType}
              onMapClick={handleMapClick} onMarkerDrag={handleMarkerDrag}
              onSell={goSellFromCalc}
            />
          )}
          {tab === "lands" && (
            <LandsTab
              lands={lands} regMode={regMode} setRegMode={setRegMode} showForm={showRegForm} setShowForm={setShowRegForm}
              mapCenter={mapCenter} setMapCenter={setMapCenter} mapType={mapType} setMapType={setMapType}
              form={{ regTitle,setRegTitle,regVillage,setRegVillage,regDistrict,setRegDistrict,regState,setRegState,regVeg,setRegVeg,regCrop,setRegCrop,regSoil,setRegSoil,regWater,setRegWater }}
              areaHa={regAreaHa} areaAcres={regAreaAcres} busy={regBusy} msg={landMsg} onSubmit={registerLand} onPolygon={handlePolygon} onLiveLocation={handleLiveLocation}
            />
          )}
          {tab === "trees" && (
            <TreesTab
              trees={trees} showForm={showTreeForm} setShowForm={setShowTreeForm}
              species={treeSpecies} setSpecies={setTreeSpecies} age={treeAge} setAge={setTreeAge}
              height={treeHeight} setHeight={setTreeHeight} image={treeImage} onImage={handleImageUpload}
              treeLoc={treeLoc} setTreeLoc={setTreeLoc} mapCenter={mapCenter} setMapCenter={setMapCenter}
              mapType={mapType} setMapType={setMapType} onMapClick={handleMapClick} onMarkerDrag={handleMarkerDrag}
              busy={treeBusy} msg={treeMsg} onSubmit={addTree}
            />
          )}
          {tab === "market" && (
            <MarketTab listings={listings} showForm={mkShowForm} setShowForm={setMkShowForm}
              title={mkTitle} setTitle={setMkTitle} credits={mkCredits} setCredits={setMkCredits}
              price={mkPrice} setPrice={setMkPrice} landId={mkLandId} setLandId={setMkLandId}
              lands={lands} busy={mkBusy} msg={mkMsg} onSubmit={createListing} user={user}
              onBuy={setActiveBuy} />
          )}
          {tab === "payment" && (
            <PaymentTab
              user={user}
              upi={payUpi} setUpi={setPayUpi}
              holder={payHolder} setHolder={setPayHolder}
              bank={payBank} setBank={setPayBank}
              account={payAccount} setAccount={setPayAccount}
              ifsc={payIfsc} setIfsc={setPayIfsc}
              busy={payBusy} msg={payMsg} onSave={savePayment}
            />
          )}
        </main>

        {activeBuy && (
          <PaymentModal listing={activeBuy} buyer={user} onClose={() => setActiveBuy(null)} />
        )}
      </div>
    </div>
  );
}

/* ================= AUTH SCREEN ================= */
function AuthScreen({ mode, setMode, form, error, busy, onSubmit, onDemoLogin }: {
  mode: "login" | "register";
  setMode: (m: "login" | "register") => void;
  form: any;
  error: string | null;
  busy: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onDemoLogin: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-800 via-emerald-700 to-teal-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center"><Leaf className="w-7 h-7" /></div>
              <div>
                <h1 className="text-xl font-black">Kisan Carbon Hub</h1>
                <p className="text-green-100 text-xs">Earn money by saving the planet</p>
              </div>
            </div>
            <Link href="/" className="text-[11px] text-green-100 underline">← Back to home</Link>
          </div>

          <div className="p-6">
            <div className="flex bg-green-50 rounded-xl p-1 mb-5">
              <button onClick={() => setMode("register")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mode === "register" ? "bg-green-600 text-white shadow" : "text-green-700"}`}>Register</button>
              <button onClick={() => setMode("login")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mode === "login" ? "bg-green-600 text-white shadow" : "text-green-700"}`}>Login</button>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              {mode === "register" && (
                <>
                  <Field icon={User} placeholder="Full Name" value={form.aName} set={form.setAName} />
                  <Field icon={MapPin} placeholder="Village" value={form.aVillage} set={form.setAVillage} />
                  <Field icon={Globe} placeholder="State" value={form.aState} set={form.setAState} />
                  <Field icon={Users} placeholder="Phone Number" value={form.aPhone} set={form.setAPhone} />
                </>
              )}
              <Field icon={Globe} placeholder="Email" type="email" value={form.aEmail} set={form.setAEmail} />
              <Field icon={Shield} placeholder="Password (min 6)" type="password" value={form.aPassword} set={form.setAPassword} />

              {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}

              <button disabled={busy} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "register" ? "Create Account & Start Earning" : "Login"}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[11px] text-gray-400 mb-2 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Try the demo instantly:</p>
              <button
                onClick={onDemoLogin}
                disabled={busy}
                className="w-full bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Sprout className="w-4 h-4" /> Login with Demo Farmer
              </button>
            </div>

            {mode === "register" && (
              <div className="mt-4 bg-green-50 rounded-xl p-3 text-xs text-green-700 space-y-1">
                <p><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Register your farmland free</p>
                <p><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Estimate carbon credits from satellite</p>
                <p><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Convert credits into Rupees & sell</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, ...props }: any) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input {...props} className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm" />
    </div>
  );
}

/* ================= OVERVIEW ================= */
function Overview({ user, stats, lands, trees, onGo }: { user: AuthUser; stats: Stats | null; lands: Land[]; trees: Tree[]; onGo: (t: any) => void }) {
  const totalCredits = stats?.totalCredits || 0;
  const totalValue = stats?.totalValueINR || 0;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800">Welcome back, {user.name.split(" ")[0]}! 🌱</h1>
        <p className="text-gray-500 text-sm">Here's how your land is helping fight climate change.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Landmark} label="Registered Lands" value={stats?.landCount || 0} color="green" />
        <StatCard icon={TreePine} label="Trees Tracked" value={stats?.treeCount || 0} color="emerald" />
        <StatCard icon={BarChart3} label="Total Credits" value={totalCredits.toFixed(1)} suffix=" tCO2e" color="teal" />
        <StatCard icon={Wallet} label="Potential Earnings" value={`₹${Math.round(totalValue).toLocaleString('en-IN')}`} color="amber" />
      </div>

      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <p className="text-green-100 text-sm">Total carbon you can earn from</p>
            <p className="text-3xl font-black mt-1">₹{Math.round(totalValue).toLocaleString('en-IN')}</p>
            <p className="text-green-100 text-xs mt-1">≈ {totalCredits.toFixed(1)} carbon credits available</p>
          </div>
          <Link href="/carbon-farmer" onClick={() => onGo("market")}
            className="bg-white text-green-700 font-bold px-5 py-3 rounded-xl shadow hover:-translate-y-0.5 transition-all">
            Sell Credits →
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Landmark className="w-5 h-5 text-green-600" /> Your Lands</h3>
          {lands.length === 0 ? (
            <div className="text-center py-8">
              <Landmark className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-gray-500 text-sm mt-2">No lands registered yet</p>
              <button onClick={() => onGo("lands")} className="mt-3 text-green-600 font-bold text-sm">Register your land →</button>
            </div>
          ) : (
            <div className="space-y-2">
              {lands.slice(0, 3).map((l: any) => (
                <div key={l.id} className="flex justify-between items-center p-3 bg-green-50 rounded-xl text-sm">
                  <div>
                    <p className="font-bold text-gray-800">{l.title}</p>
                    <p className="text-xs text-gray-500">{l.village}, {l.state} · {l.areaHa.toFixed(2)} ha</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">{l.estTotalCredits.toFixed(1)} t</p>
                    <p className="text-xs text-gray-500">₹{Math.round(l.estValueINR).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Store className="w-5 h-5 text-green-600" /> Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon={Calculator} label="Measure & Calculate" onClick={() => onGo("calculator")} />
            <QuickAction icon={Landmark} label="Register Land" onClick={() => onGo("lands")} />
            <QuickAction icon={ImagePlus} label="Upload Tree Photo" onClick={() => onGo("trees")} />
            <QuickAction icon={Store} label="Go to Market" onClick={() => onGo("market")} />
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>1 carbon credit = 1 tonne CO2. Current price ≈ ₹{1800}/credit. Prices vary by market.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color }: any) {
  const colors: any = {
    green: "bg-green-100 text-green-600",
    emerald: "bg-emerald-100 text-emerald-600",
    teal: "bg-teal-100 text-teal-600",
    amber: "bg-amber-100 text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}><Icon className="w-5 h-5" /></div>
      <p className="text-2xl font-black text-gray-800 mt-2">{value}{suffix}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
      <Icon className="w-6 h-6 text-green-600" />
      <span className="text-xs font-bold text-gray-700 text-center">{label}</span>
    </button>
  );
}

/* ================= CALCULATOR ================= */
function QuickSellCard({ onSell }: { onSell: (credits: string, price: string, treeLabel: string) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<TreeType | null>(null);
  const [area, setArea] = useState("");
  const [unit, setUnit] = useState<"ha" | "acres">("ha");
  const [showList, setShowList] = useState(false);

  const areaHa = unit === "ha" ? parseFloat(area) || 0 : (parseFloat(area) || 0) * 0.404686;
  const areaAcres = areaHa * 2.47105;
  const matches = query.trim()
    ? TREE_TYPES.filter((t) => t.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const credits = selected ? areaHa * getCreditsPerHa(selected.key) : 0;
  const cost = credits * CREDIT_PRICE_INR;

  const pick = (t: TreeType) => {
    setSelected(t);
    setQuery(t.label);
    setShowList(false);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-xl p-5 text-white mb-4">
      <h3 className="font-black text-lg flex items-center gap-2"><Store className="w-5 h-5" /> Sell Carbon Credits</h3>
      <p className="text-emerald-100 text-xs mb-4">Type your tree, enter your land area — we auto-calculate the carbon credits and their value in Rupees.</p>

      <div className="relative">
        <input
          type="text" value={query} onFocus={() => setShowList(true)}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
          placeholder="Type tree type (e.g. Mango, Teak, Neem)..."
          className="w-full px-4 py-3 pl-10 border border-white/30 bg-white/95 text-gray-800 rounded-xl focus:ring-2 focus:ring-white outline-none"
        />
        <TreePine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {showList && matches.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto">
            {matches.map((t) => (
              <button key={t.key} onClick={() => pick(t)} className="w-full text-left px-4 py-2.5 hover:bg-green-50 text-sm flex justify-between">
                <span className="font-medium text-gray-800">{t.label}</span>
                <span className="text-xs text-green-600 font-bold">{t.creditsPerHa} t/ha</span>
              </button>
            ))}
            {matches.length === 0 && query.trim() && (
              <button onClick={() => pick({ key: "custom", label: query.trim(), desc: "Custom tree type", creditsPerHa: 18 })} className="w-full text-left px-4 py-2.5 hover:bg-green-50 text-sm text-gray-700">
                Use "<b>{query.trim()}</b>" (avg 18 t/ha)
              </button>
            )}
          </div>
        )}
      </div>

      {selected && (
        <p className="mt-2 text-[11px] bg-white/20 rounded-lg px-3 py-1.5 inline-block">
          {selected.label} · <b>{getCreditsPerHa(selected.key)} credits per hectare/year</b> {selected.desc && <span className="opacity-80">— {selected.desc}</span>}
        </p>
      )}

      <div className="flex items-center gap-2 mt-4 bg-white/95 rounded-xl p-2">
        <TreePine className="w-4 h-4 text-green-600 ml-1" />
        <input
          type="number" min="0" value={area} onChange={(e) => setArea(e.target.value)}
          placeholder="Enter land area" className="flex-1 bg-transparent outline-none text-gray-800 text-sm px-2 py-2"
        />
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setUnit("ha")} className={`px-3 py-1.5 rounded-md text-xs font-bold ${unit === "ha" ? "bg-green-600 text-white" : "text-gray-500"}`}>Ha</button>
          <button onClick={() => setUnit("acres")} className={`px-3 py-1.5 rounded-md text-xs font-bold ${unit === "acres" ? "bg-green-600 text-white" : "text-gray-500"}`}>Acres</button>
        </div>
      </div>
      {area && unit === "acres" && <p className="mt-1 text-[11px] text-emerald-100">= {areaHa.toFixed(2)} hectares</p>}
      {area && unit === "ha" && <p className="mt-1 text-[11px] text-emerald-100">= {areaAcres.toFixed(2)} acres</p>}

      {areaHa > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-emerald-100">Carbon Credits</p>
            <p className="text-2xl font-black">{credits.toFixed(2)} <span className="text-xs font-medium">tCO2e</span></p>
            <p className="text-[10px] text-emerald-100">≈ {Math.round(areaHa * getCreditsPerHa(selected?.key || "mango") * 120)} trees</p>
          </div>
          <div className="bg-amber-400 text-amber-950 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-amber-800">Total Value</p>
            <p className="text-2xl font-black">₹{Math.round(cost).toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-amber-800">@{CREDIT_PRICE_INR}/credit</p>
          </div>
        </div>
      )}

      <button
        onClick={() => selected && onSell(credits.toFixed(2), String(CREDIT_PRICE_INR), selected.label)}
        disabled={!selected || areaHa <= 0}
        className="mt-4 w-full bg-white hover:bg-emerald-50 text-emerald-700 font-black py-3 rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
      >
        <Store className="w-4 h-4" /> Sell {(credits || 0).toFixed(0)} Credits for ₹{Math.round(cost).toLocaleString("en-IN")}
      </button>
    </div>
  );
}

function CalculatorTab(props: {
  searchRef: any;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searchResults: any[];
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  selectResult: (r: any) => void;
  calcLocation: any;
  calcResult: any;
  calcBusy: boolean;
  calcError: string | null;
  calculate: () => void;
  showDetails: boolean;
  setShowDetails: (v: boolean) => void;
  mapCenter: [number, number];
  markerPos: [number, number] | null;
  mapType: "satellite" | "street";
  setMapType: (t: "satellite" | "street") => void;
  onMapClick: (lat: number, lng: number) => void;
  onMarkerDrag: (lat: number, lng: number) => void;
  onSell: (credits: string, price: string, treeLabel: string) => void;
}) {
  const r = props.calcResult;
  const maxCredits = r ? Math.max(r.creditsPerHa, 1) * 1.2 : 100;
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800 mb-4">Carbon Credit Calculator</h1>
        <p className="text-gray-500 text-sm mb-4">Search a location or click the satellite map to estimate your area's carbon credit value in Rupees.</p>

        <QuickSellCard onSell={props.onSell} />

        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-5" ref={props.searchRef}>
          <div className="relative">
            <input
              type="text" value={props.searchQuery}
              onChange={(e) => props.setSearchQuery(e.target.value)}
              onFocus={() => props.searchResults.length > 0 && props.setShowSearch(true)}
              placeholder="Type a location (village, city, place)..."
              className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            {props.showSearch && props.searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto">
                {props.searchResults.map((res: any, i: number) => (
                  <button key={i} onClick={() => props.selectResult(res)} className="w-full text-left px-4 py-2.5 hover:bg-green-50 text-sm">
                    <p className="font-medium truncate">{res.display_name.split(",")[0]}</p>
                    <p className="text-xs text-gray-500 truncate">{res.display_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {props.calcLocation && (
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-5 mt-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><MapPin className="w-5 h-5 text-green-600" /> Selected</h3>
            <p className="text-sm font-bold text-gray-800 mt-1">{props.calcLocation.name}</p>
            <p className="text-xs text-gray-500">{props.calcLocation.address}</p>
            <p className="text-xs font-mono bg-gray-50 p-2 rounded-lg mt-2">Lat {props.calcLocation.lat.toFixed(5)}, Lng {props.calcLocation.lng.toFixed(5)}</p>
          </div>
        )}

        <button onClick={props.calculate} disabled={!props.calcLocation || props.calcBusy}
          className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all">
          {props.calcBusy ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Satellite...</> : <><Calculator className="w-5 h-5" /> Estimate Credits & Value</>}
        </button>

        {props.calcError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg mt-3">{props.calcError}</p>}

        {r && (
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-5 mt-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white mb-4">
              <p className="text-green-100 text-xs">Value per hectare (Rupees)</p>
              <p className="text-3xl font-black">₹{Math.round(r.valuePerHa).toLocaleString('en-IN')}</p>
              <p className="text-green-100 text-xs mt-1">≈ {r.creditsPerHa.toFixed(1)} tCO2e/ha · {r.treesPerHa} trees/ha</p>
            </div>
            <div className="space-y-3">
              <Bar label="Vegetation" value={r.veg * 18} max={maxCredits} color="green" />
              <Bar label="Soil Carbon" value={r.soil * 8} max={maxCredits} color="amber" />
              <Bar label="Water" value={r.water * 5} max={maxCredits} color="blue" />
              <Bar label="Urban penalty" value={r.urban * 3} max={maxCredits} color="red" />
            </div>
            {r.rec.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-1"><Sprout className="w-4 h-4 text-green-600" /> Recommendations</p>
                {r.rec.map((x: string, i: number) => <p key={i} className="text-xs text-gray-600 bg-green-50 p-2 rounded-lg mb-1">{x}</p>)}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100 self-start">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2"><Satellite className="w-5 h-5" /> Satellite View</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => props.setMapType(props.mapType === "satellite" ? "street" : "satellite")}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {props.mapType === "satellite" ? "Satellite" : "Street"}</button>
          </div>
        </div>
        <div className="w-full h-[520px]">
          <MapInner center={props.mapCenter} markerPos={props.markerPos} mapType={props.mapType}
            onMapClick={props.onMapClick} onMarkerDrag={props.onMarkerDrag} />
        </div>
      </div>
    </div>
  );
}

function Bar({ label, value, max, color }: any) {
  const c: any = { green: "from-green-400 to-green-600", amber: "from-amber-400 to-amber-600", blue: "from-blue-400 to-blue-600", red: "from-red-400 to-red-500" };
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span className="text-gray-600 font-medium">{label}</span><span className="font-bold">{value.toFixed(2)}</span></div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${c[color]} rounded-full transition-all duration-700`} style={{ width: `${(value / max) * 100}%` }} /></div>
    </div>
  );
}

/* ================= LANDS ================= */
function LandsTab({ lands, regMode, setRegMode, showForm, setShowForm, mapCenter, setMapCenter, mapType, setMapType, form, areaHa, areaAcres, busy, msg, onSubmit, onPolygon, onLiveLocation }: {
  lands: Land[];
  regMode: boolean;
  setRegMode: (v: boolean) => void;
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  mapCenter: [number, number];
  setMapCenter: (c: [number, number]) => void;
  mapType: "satellite" | "street";
  setMapType: (t: "satellite" | "street") => void;
  form: any;
  areaHa: number;
  areaAcres: number;
  busy: boolean;
  msg: { ok: boolean; text: string } | null;
  onSubmit: (e: React.FormEvent) => void;
  onPolygon: (latlngs: [number, number][], areaHa: number, areaAcres: number) => void;
  onLiveLocation: (lat: number, lng: number) => void;
}) {
  const selType = TREE_TYPE_MAP[form.regVeg] || TREE_TYPE_MAP["mango"];
  const selCredits = getCreditsPerHa(form.regVeg);
  const selValue = areaHa * selCredits * CREDIT_PRICE_INR;

  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [coordMsg, setCoordMsg] = useState<string | null>(null);

  const locateByCoord = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setCoordMsg("Enter valid coordinates (Lat: -90 to 90, Lng: -180 to 180).");
      return;
    }
    setCoordMsg(null);
    setMapCenter([lat, lng]);
    onLiveLocation(lat, lng);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setCoordMsg("Geolocation not supported by this browser."); return; }
    setCoordMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatInput(String(lat));
        setLngInput(String(lng));
        setMapCenter([lat, lng]);
        onLiveLocation(lat, lng);
      },
      () => setCoordMsg("Could not get your location."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">My Registered Lands</h1>
          <p className="text-gray-500 text-sm">{lands.length} lands registered</p>
        </div>
        <button onClick={() => { setRegMode(!regMode); setShowForm(false); }} className={`flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl transition-all ${regMode ? "bg-white text-gray-700 border border-gray-200" : "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30"}`}>
          {regMode ? "Cancel Drawing" : <><Landmark className="w-4 h-4" /> Draw & Register New Land</>}
        </button>
      </div>

      {regMode && (
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-4">
          <div className="flex flex-wrap items-center gap-4 mb-3">
            {!showForm && (
              <div className="flex-1 min-w-[250px]">
                <p className="text-sm font-bold text-gray-800 mb-1">Outline your land on the satellite map below</p>
                <p className="text-xs text-gray-500">Click "Start New Area" then click corner points around your land. Click the first point again to finish.</p>
              </div>
            )}
            <div className="flex gap-6 text-sm">
              <div><p className="text-xs text-gray-500">Area</p><p className="font-black text-gray-800">{areaHa.toFixed(2)} ha</p></div>
              <div><p className="text-xs text-gray-500">Acres</p><p className="font-black text-gray-800">{areaAcres.toFixed(2)} ac</p></div>
              <div><p className="text-xs text-gray-500">Est. Credits</p><p className="font-black text-teal-600">{(areaHa * selCredits).toFixed(1)} t</p></div>
              <div><p className="text-xs text-gray-500">Est. Value</p><p className="font-black text-green-600">₹{Math.round(selValue).toLocaleString('en-IN')}</p></div>
            </div>
            {areaHa > 0 && !showForm && (
              <button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl">Continue →</button>
            )}
          </div>

          {!showForm && (
            <div className="flex flex-wrap items-center gap-2 bg-green-50 rounded-xl p-3 mb-3">
              <span className="text-xs font-bold text-green-700 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Find by Coordinates:</span>
              <input
                type="number" step="any" value={latInput} onChange={(e) => setLatInput(e.target.value)}
                placeholder="Latitude (e.g. 28.6139)" className="input !py-2 w-36"
              />
              <input
                type="number" step="any" value={lngInput} onChange={(e) => setLngInput(e.target.value)}
                placeholder="Longitude (e.g. 77.2090)" className="input !py-2 w-40"
              />
              <button onClick={locateByCoord} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1">
                <Search className="w-3.5 h-3.5" /> Locate
              </button>
              <button onClick={useMyLocation} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" /> Use My Location
              </button>
              {coordMsg && <p className="text-xs text-red-600 w-full">{coordMsg}</p>}
            </div>
          )}

          {showForm ? (
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input value={form.regTitle} onChange={(e) => form.setRegTitle(e.target.value)} placeholder="Land Title (e.g. My 2 acre mango farm)" className="input" />
                <input value={form.regVillage} onChange={(e) => form.setRegVillage(e.target.value)} placeholder="Village *" className="input" />
                <input value={form.regDistrict} onChange={(e) => form.setRegDistrict(e.target.value)} placeholder="District" className="input" />
                <input value={form.regState} onChange={(e) => form.setRegState(e.target.value)} placeholder="State *" className="input" />
                <input value={form.regCrop} onChange={(e) => form.setRegCrop(e.target.value)} placeholder="Main Crop (e.g. Mango, Rice)" className="input" />
                <input value={form.regSoil} onChange={(e) => form.setRegSoil(e.target.value)} placeholder="Soil Type (e.g. Alluvial)" className="input" />
                <input value={form.regWater} onChange={(e) => form.setRegWater(e.target.value)} placeholder="Water Source (e.g. Well, Canal)" className="input" />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-800 mb-2">Select the tree type on your land</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TREE_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t.key}
                      onClick={() => form.setRegVeg(t.key)}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${form.regVeg === t.key ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
                    >
                      <p className={`font-bold text-xs ${form.regVeg === t.key ? "text-green-700" : "text-gray-700"}`}>{t.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{t.creditsPerHa} credits/ha/yr</p>
                    </button>
                  ))}
                </div>
                {selType && (
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-green-600" />
                    {selType.desc} → <b className="text-green-700">{getCreditsPerHa(form.regVeg)} tCO2e/ha/year</b>
                  </p>
                )}
              </div>

              <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700 flex items-center justify-between">
                <span>Area: <b>{areaHa.toFixed(2)} ha</b> ({areaAcres.toFixed(2)} acres) · <b>{selType.label}</b> @ {selCredits} t/ha</span>
                <span className="font-black">{ (areaHa * selCredits).toFixed(1) } tCO2e ≈ ₹{Math.round(selValue).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={busy} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />} Register Land
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 rounded-xl">Back</button>
              </div>
              {msg && <p className={`text-sm p-2 rounded-lg ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
            </form>
          ) : (
            <div className="w-full h-[420px] rounded-xl overflow-hidden border border-green-100">
              <MapInner center={mapCenter} markerPos={null} mapType={mapType} onMapClick={() => {}} onMarkerDrag={() => {}}
                onPolygonChange={onPolygon} registerMode onLiveLocation={onLiveLocation} />
            </div>
          )}
        </div>
      )}

      {!regMode && lands.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-10 text-center">
          <Landmark className="w-14 h-14 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-700 mt-3">No lands registered yet</h3>
          <p className="text-gray-500 text-sm mt-1">Draw your land boundary on the satellite map to estimate its carbon credit value.</p>
          <button onClick={() => setRegMode(true)} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl">Draw & Register Your Land</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {lands.map((l: any) => (
            <div key={l.id} className="bg-white rounded-2xl shadow-lg border border-green-100 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-gray-800">{l.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">📍 {l.village}, {l.district && l.district + ","} {l.state}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full capitalize">{l.vegetationType}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-green-50 rounded-xl p-2"><p className="text-[10px] text-gray-500">Area</p><p className="font-bold text-gray-800 text-sm">{l.areaHa.toFixed(2)} ha</p></div>
                <div className="bg-green-50 rounded-xl p-2"><p className="text-[10px] text-gray-500">Credits</p><p className="font-bold text-green-700 text-sm">{l.estTotalCredits.toFixed(1)} t</p></div>
                <div className="bg-green-50 rounded-xl p-2"><p className="text-[10px] text-gray-500">Value</p><p className="font-bold text-green-700 text-sm">₹{Math.round(l.estValueINR).toLocaleString('en-IN')}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= TREES ================= */
function TreesTab({ trees, showForm, setShowForm, species, setSpecies, age, setAge, height, setHeight, image, onImage, treeLoc, setTreeLoc, mapCenter, setMapCenter, mapType, setMapType, onMapClick, onMarkerDrag, busy, msg, onSubmit }: {
  trees: Tree[];
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  species: string;
  setSpecies: (v: string) => void;
  age: string;
  setAge: (v: string) => void;
  height: string;
  setHeight: (v: string) => void;
  image: string | null;
  onImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  treeLoc: { lat: number; lng: number; name: string } | null;
  setTreeLoc: (v: any) => void;
  mapCenter: [number, number];
  setMapCenter: (c: [number, number]) => void;
  mapType: "satellite" | "street";
  setMapType: (t: "satellite" | "street") => void;
  onMapClick: (lat: number, lng: number) => void;
  onMarkerDrag: (lat: number, lng: number) => void;
  busy: boolean;
  msg: { ok: boolean; text: string } | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">My Trees</h1>
          <p className="text-gray-500 text-sm">{trees.length} trees tracked</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-green-500/30">
          <ImagePlus className="w-4 h-4" /> Add Tree
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-5">
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              <input value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="Tree Species * (e.g. Neem, Mango)" className="input" />
              <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age (years)" type="number" className="input" />
              <input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Height (m)" type="number" className="input" />
            </div>

            <div className="flex items-center gap-4">
              <input type="file" accept="image/*" onChange={onImage} className="text-sm" />
              {image && <img src={image} alt="tree" className="w-16 h-16 object-cover rounded-lg border" />}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-gray-700 mb-1">Mark tree location on map (click)</p>
                <div className="w-full h-[300px] rounded-xl overflow-hidden border border-green-100">
                  <MapInner center={mapCenter} markerPos={treeLoc ? [treeLoc.lat, treeLoc.lng] : null} mapType={mapType}
                    onMapClick={onMapClick} onMarkerDrag={onMarkerDrag} />
                </div>
              </div>
              <div className="space-y-3">
                {treeLoc ? (
                  <div className="bg-green-50 rounded-xl p-3 text-sm">
                    <p className="font-bold text-green-700">📍 {treeLoc.name}</p>
                    <p className="text-xs text-gray-500">{treeLoc.lat.toFixed(5)}, {treeLoc.lng.toFixed(5)}</p>
                  </div>
                ) : <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-500">Click the map to mark the tree's location. This helps us verify your tree.</div>}
                <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" /> Each mature tree can store 15-25 kg CO2 per year. Uploading photos + location helps verify and increases your credit value.
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={busy} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Save Tree
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 rounded-xl">Cancel</button>
            </div>
            {msg && <p className={`text-sm p-2 rounded-lg ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
          </form>
        </div>
      )}

      {trees.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-10 text-center">
          <TreePine className="w-14 h-14 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-700 mt-3">No trees tracked yet</h3>
          <p className="text-gray-500 text-sm mt-1">Upload photos of your trees with their location to calculate their carbon storage.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trees.map((t: any) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
              {t.imageBase64 ? <img src={t.imageBase64} alt={t.species} className="w-full h-40 object-cover" /> : <div className="w-full h-40 bg-green-100 flex items-center justify-center"><TreePine className="w-12 h-12 text-green-400" /></div>}
              <div className="p-4">
                <h3 className="font-black text-gray-800 capitalize">{t.species}</h3>
                <p className="text-xs text-gray-500">{t.ageYears} yrs · {t.heightM} m {t.locationName && "· 📍" + t.locationName}</p>
                <div className="flex justify-between mt-3 text-sm bg-green-50 rounded-lg p-2">
                  <span className="text-gray-600 font-medium">CO2: <b>{t.estCO2Kg.toFixed(0)} kg</b></span>
                  <span className="text-green-600 font-bold">₹{Math.round(t.estValueINR).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= MARKET ================= */
function MarketTab({ listings, showForm, setShowForm, title, setTitle, credits, setCredits, price, setPrice, landId, setLandId, lands, busy, msg, onSubmit, user, onBuy }: {
  listings: Listing[];
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  title: string;
  setTitle: (v: string) => void;
  credits: string;
  setCredits: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  landId: string;
  setLandId: (v: string) => void;
  lands: Land[];
  busy: boolean;
  msg: { ok: boolean; text: string } | null;
  onSubmit: (e: React.FormEvent) => void;
  user: AuthUser;
  onBuy: (l: Listing) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Carbon Credit Marketplace</h1>
          <p className="text-gray-500 text-sm">Buy and sell verified carbon credits</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-green-500/30">
          <Store className="w-4 h-4" /> List Credits
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <MarketStat label="Live Price" value="₹1,800" sub="per credit" color="text-green-600" />
          <MarketStat label="Total Listed" value={listings.length} sub="listings" color="text-gray-800" />
          <MarketStat label="Credits Listed" value={creditsCount(listings)} sub="tCO2e" color="text-teal-600" />
          <MarketStat label="Market Size" value={`₹${marketSize(listings).toLocaleString('en-IN')}`} sub="value" color="text-amber-600" />
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-5">
          <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Listing Title" className="input" />
            <select value={landId} onChange={(e) => setLandId(e.target.value)} className="input">
              <option value="">Source Land (optional)</option>
              {lands.map((l: any) => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
            <input value={credits} onChange={(e) => setCredits(e.target.value)} placeholder="Credits to sell (tCO2e) *" type="number" className="input" />
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price per credit (₹) *" type="number" className="input" />
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" disabled={busy} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Create Listing
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 rounded-xl">Cancel</button>
            </div>
            {msg && <p className={`md:col-span-2 text-sm p-2 rounded-lg ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {listings.map((l: any) => (
          <div key={l.id} className="bg-white rounded-2xl shadow-lg border border-green-100 p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-gray-800">{l.title}</h3>
                <p className="text-xs text-gray-500 mt-1">By {l.user.name}{l.user.village ? ` · ${l.user.village}, ${l.user.state}` : ""}</p>
              </div>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full capitalize">{l.status}</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-green-700">{l.credits} <span className="text-sm text-gray-500">tCO2e</span></p>
              <p className="text-sm text-gray-600">@ ₹{l.pricePerCreditINR}/credit</p>
            </div>
            <div className="mt-3 pt-3 border-t border-green-100 flex justify-between items-center">
              <span className="font-bold text-gray-800">₹{Math.round(l.totalValueINR).toLocaleString('en-IN')}</span>
              <button onClick={() => onBuy(l)} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg">Buy</button>
            </div>
          </div>
        ))}
        {listings.length === 0 && (
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg border border-green-100 p-10 text-center">
            <Store className="w-14 h-14 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-700 mt-3">No credits listed yet</h3>
            <p className="text-gray-500 text-sm mt-1">Be the first to list carbon credits on the marketplace.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MarketStat({ label, value, sub, color }: any) {
  return (
    <div className="p-3 bg-green-50 rounded-xl">
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-[10px] text-gray-400">{sub}</p>
    </div>
  );
}

function creditsCount(listings: any[]) {
  return listings.reduce((s, l) => s + l.credits, 0).toFixed(1);
}
function marketSize(listings: any[]) {
  return listings.reduce((s, l) => s + l.totalValueINR, 0);
}

/* ================= PAYMENT / QR ================= */

function buildUpiUri(upiId: string, name: string, amount?: number, note?: string) {
  const params = new URLSearchParams();
  params.set("pa", upiId);
  params.set("pn", name || "Kisan Carbon");
  if (amount && amount > 0) { params.set("am", amount.toFixed(2)); params.set("cu", "INR"); }
  if (note) params.set("tn", note);
  return `upi://pay?${params.toString()}`;
}

function PaymentQR({ value, size = 180 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    setSrc(null);
    if (!value) return;
    QRCode.toDataURL(value, { width: size * 2, margin: 2, errorCorrectionLevel: "M" })
      .then((u) => { if (live) setSrc(u); })
      .catch(() => { if (live) setSrc(null); });
    return () => { live = false; };
  }, [value, size]);
  if (!src) {
    return (
      <div style={{ width: size, height: size }} className="bg-gray-100 rounded-lg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }
  return <img src={src} alt="Payment QR" width={size} height={size} className="rounded-lg bg-white" />;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };
  return (
    <button onClick={copy} className="text-green-600 hover:text-green-800 p-1" title="Copy">
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function PaymentTab({ user, upi, setUpi, holder, setHolder, bank, setBank, account, setAccount, ifsc, setIfsc, busy, msg, onSave }: {
  user: AuthUser;
  upi: string; setUpi: (v: string) => void;
  holder: string; setHolder: (v: string) => void;
  bank: string; setBank: (v: string) => void;
  account: string; setAccount: (v: string) => void;
  ifsc: string; setIfsc: (v: string) => void;
  busy: boolean; msg: { ok: boolean; text: string } | null;
  onSave: (e: React.FormEvent) => void;
}) {
  const qrValue = user?.upiId
    ? buildUpiUri(user.upiId, user.acHolderName || user.name)
    : `Payment Details:${(user?.acHolderName || user?.name || "")}|${user?.bankName || ""}|${user?.accountNumber || ""}|${user?.ifsc || ""}`;
  const hasPayment = !!(user?.upiId || user?.accountNumber);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-800">Payment & Wallet</h1>
        <p className="text-gray-500 text-sm">Receive money from credit buyers via UPI or bank transfer</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* QR Card */}
        <div className="bg-gradient-to-br from-green-700 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5" />
            <h3 className="font-black">Your Payment QR</h3>
          </div>
          <div className="flex justify-center bg-white/90 p-4 rounded-2xl w-fit mx-auto">
            <PaymentQR value={qrValue} size={190} />
          </div>
          <p className="text-center text-xs text-green-100 mt-4">
            Buyers scan this QR to send you money instantly.
          </p>
          {user?.upiId && (
            <div className="mt-4 bg-white/10 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-green-200">UPI ID</p>
                <p className="font-bold text-sm">{user.upiId}</p>
              </div>
              <CopyButton text={user.upiId} />
            </div>
          )}
          {hasPayment ? (
            <div className="mt-3 bg-white/10 rounded-xl p-3 text-xs space-y-1">
              <p className="text-green-100">Paid to: <span className="font-bold">{user.acHolderName || user.name}</span></p>
              {user?.bankName && <p>{user.bankName}{user?.accountNumber ? ` • ****${(user.accountNumber || "").slice(-4)}` : ""}</p>}
              {user?.ifsc && <p>IFSC: {user.ifsc}</p>}
            </div>
          ) : (
            <p className="mt-3 text-center text-xs text-amber-200 bg-white/10 rounded-lg p-2">
              No payment details yet — add your UPI or bank account to receive money.
            </p>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-5">
          <h3 className="font-black text-gray-800 mb-1 flex items-center gap-2"><Banknote className="w-5 h-5 text-green-600" /> Payment Details</h3>
          <p className="text-xs text-gray-500 mb-4">Buyers will see these details (and QR) when buying your credits.</p>
          <form onSubmit={onSave} className="space-y-3">
            <input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Account Holder Name" className="input" />
            <input value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="UPI ID (e.g. 91xxxxx@upi)" className="input" />
            <div className="grid grid-cols-2 gap-3">
              <input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Bank Name" className="input" />
              <input value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="IFSC Code" className="input" />
            </div>
            <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Account Number" className="input" />
            <div className="flex items-center gap-3 pt-2">
              <button disabled={busy} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Save Payment Details
              </button>
              <button type="button" onClick={() => { try { navigator.clipboard.writeText(buildUpiUri(upi || "yourid@upi", holder)); } catch { /* ignore */ } }} className="bg-green-50 text-green-700 font-bold px-3 py-2.5 rounded-xl flex items-center gap-1">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
            {msg && <p className={`text-sm p-2 rounded-lg ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
          </form>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard icon={Phone} title="UPI Payment" desc="Scan QR in any UPI app (GPay, PhonePe, Paytm) to pay instantly." />
        <InfoCard icon={Building2} title="Bank Transfer" desc="Buyers can also make a direct NEFT/IMPS transfer using your account details." />
        <InfoCard icon={Shield} title="Secure & Instant" desc="Your money reaches you instantly. No transaction fees for farmers." />
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-4">
      <div className="w-10 h-10 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mb-2"><Icon className="w-5 h-5" /></div>
      <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </div>
  );
}

function PaymentModal({ listing, buyer, onClose }: { listing: Listing; buyer: AuthUser; onClose: () => void }) {
  const seller = listing.user as any;
  const sellerUpi = (seller as any).upiId;
  const sellerName = (seller as any).acHolderName || seller.name;
  const total = listing.totalValueINR;
  const vpa = sellerUpi || (buyer as any)?.upiId;
  const qrValue = vpa ? buildUpiUri(vpa, sellerName, total, `Kisan Carbon - ${listing.title}`) : "";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-lg">Pay with UPI</h3>
              <p className="text-green-100 text-xs">Complete your purchase securely</p>
            </div>
            <button onClick={onClose} className="bg-white/20 p-2 rounded-lg hover:bg-white/30"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-center bg-green-50 rounded-xl p-4">
            <div>
              <p className="text-xs text-gray-500">Total payable</p>
              <p className="text-2xl font-black text-green-700">₹{Math.round(total).toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right text-xs text-gray-600">
              <p className="font-bold text-gray-800">{listing.credits} tCO2e</p>
              <p>@{listing.pricePerCreditINR}/credit</p>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            {qrValue ? (
              <div className="p-3 border-2 border-green-200 rounded-2xl">
                <PaymentQR value={qrValue} size={200} />
              </div>
            ) : (
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <Banknote className="w-10 h-10 text-green-600 mx-auto" />
                <p className="font-bold text-gray-700 mt-2">Manual Bank Transfer</p>
                <p className="text-xs text-gray-500 mt-1">The seller pays to: {sellerName}</p>
              </div>
            )}
          </div>

          <div className="mt-4 bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Pay to</span>
              <span className="font-bold text-gray-800">{sellerName || seller.name}</span>
            </div>
            {vpa ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">UPI ID</span>
                <span className="font-bold text-gray-800 flex items-center gap-1">{vpa} <CopyButton text={vpa} /></span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Bank</span>
                  <span className="font-bold text-gray-800">{buyer?.bankName || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Account</span>
                  <span className="font-bold text-gray-800">{buyer?.accountNumber || "—"}</span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/30"
          >
            I&apos;ve Made the Payment
          </button>
        </div>
      </div>
    </div>
  );
}
