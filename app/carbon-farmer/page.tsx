"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Leaf, MapPin, Search, TreePine, Droplets, Globe, BarChart3, Info,
  ChevronDown, ChevronUp, Loader2, AlertCircle, Thermometer, Satellite,
  Layers, User, LogOut, LayoutDashboard, Calculator, Landmark, ImagePlus,
  Store, Wallet, TrendingUp, Shield, CheckCircle2, X, Sprout, Users,
  QrCode, Copy, Check, Share2, Banknote, Phone, Building2, Navigation,
  Car, Contact, FileText, ScrollText, History, Plus, Trash2,
  Calendar, Wind, RefreshCw,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import QRCode from "qrcode";
import { TREE_TYPES, TREE_TYPE_MAP, getCreditsPerHa, CREDIT_PRICE_INR, DEFAULT_CREDIT_PRICE_INR, setCreditPriceINR } from "@/lib/carbonRates";
import type { TreeType } from "@/lib/carbonRates";
import { VEHICLE_TYPES, VEHICLE_TYPE_MAP, searchVehicleCatalog, getEmissionGPerKm, CATEGORY_LABELS, FUEL_LABELS } from "@/lib/vehicleRates";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[300px] bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center text-xs text-green-700 font-bold">Loading map…</div>,
});

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  village?: string;
  state?: string;
  upiId?: string;
  acHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  aadharNumber?: string;
  aadharImage?: string;
  dlNumber?: string;
  dlImage?: string;
}

interface Vehicle {
  id: string;
  name: string;
  category: string;
  fuel: string;
  make: string;
  model: string;
  regNumber?: string;
  year?: number;
  emissionGPerKm: number;
  createdAt: string;
  trips?: Trip[];
}

interface Trip {
  id: string;
  vehicleId: string;
  date: string;
  distanceKm: number;
  routeName?: string;
  notes?: string;
  emissionKg: number;
}

interface Licence {
  id: string;
  type: string;
  co2OffsetKg: number;
  credits: number;
  totalValueINR: number;
  status: string;
  purchasedAt: string;
}

interface Documents {
  id: string;
  name: string;
  aadharNumber?: string;
  aadharImage?: string;
  dlNumber?: string;
  dlImage?: string;
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

interface MarketInfo {
  price: number;
  live: boolean;
  fetchedAt: string;
  token?: string;
}

interface VerifyState {
  mode: "gate" | "profile";
  email: string;
  phone: string;
  devEmail?: string;
  devPhone?: string;
  emailOk: boolean;
  phoneOk: boolean;
  pendingLogin?: { email: string; password: string };
}

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
  const [verifyState, setVerifyState] = useState<VerifyState | null>(null);
  const [verifyBusy, setVerifyBusy] = useState<"email" | "phone" | "done" | null>(null);
  const [verifyMsg, setVerifyMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Nav + data
  const [tab, setTab] = useState<"overview" | "calculator" | "lands" | "trees" | "market" | "payment" | "vehicle">("overview");
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

  // Vehicle / Pollution state
  const [documents, setDocuments] = useState<Documents | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [licences, setLicences] = useState<Licence[]>([]);
  const [market, setMarket] = useState<MarketInfo | null>(null);

  const loadMarket = useCallback(async () => {
    try {
      const r = await fetch(`${API}/carbon-price`);
      if (r.ok) {
        const d = await r.json();
        setCreditPriceINR(d.price);
        setMarket({ price: d.price, live: d.live, fetchedAt: d.fetchedAt, token: d.tokenLabel });
        if (user && token) {
          const s = await api(`/api/stats`);
          if (s.ok) setStats((await s.json()).stats);
        }
      }
    } catch { /* ignore */ }
  }, [user, token]);

  useEffect(() => {
    loadMarket();
    const t = setInterval(loadMarket, 10 * 60 * 1000);
    return () => clearInterval(t);
  }, [loadMarket]);

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
      const [sRes, lRes, tRes, mkRes, vRes, dRes, lcRes] = await Promise.all([
        api(`/api/stats`),
        api(`/api/lands`),
        api(`/api/trees`),
        api(`/api/marketplace`),
        api(`/api/vehicles`),
        api(`/api/documents`),
        api(`/api/licence`),
      ]);
      if (sRes.ok) setStats((await sRes.json()).stats);
      if (lRes.ok) setLands((await lRes.json()).lands);
      if (tRes.ok) setTrees((await tRes.json()).trees);
      if (mkRes.ok) setListings((await mkRes.json()).listings);
      if (vRes.ok) setVehicles((await vRes.json()).vehicles);
      if (dRes.ok) setDocuments((await dRes.json()).documents);
      if (lcRes.ok) setLicences((await lcRes.json()).licences);
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
      if (data.needsVerification || res.status === 403) {
        if (data.needsVerification) {
          setVerifyState({
            mode: "gate",
            email: data.email,
            phone: data.phone,
            devEmail: data.devEmail,
            devPhone: data.devPhone,
            emailOk: false,
            phoneOk: false,
            pendingLogin: { email: data.email, password: aPassword },
          });
          setAuthError(null);
        } else {
          setAuthError(data.error || "Something went wrong");
        }
        setAuthBusy(false);
        return;
      }
      if (!res.ok) {
        setAuthError(data.error || "Something went wrong");
        setAuthBusy(false);
        return;
      }
      localStorage.setItem("cc_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthMode("login");
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

  const verifyResend = async (type: "email" | "phone") => {
    if (!verifyState) return;
    setVerifyBusy(type);
    setVerifyMsg(null);
    try {
      const value = type === "email" ? verifyState.email : verifyState.phone;
      const r = await fetch(`${API}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to send OTP");
      setVerifyMsg({ ok: true, text: `${type === "email" ? "Email" : "SMS"} OTP sent to ${type === "email" ? verifyState.email : verifyState.phone} (valid 10 min)` });
      if (d.devOtp) {
        setVerifyState((s) => s ? { ...s, ...(type === "email" ? { devEmail: d.devOtp } : { devPhone: d.devOtp }) } : s);
      }
    } catch (err: any) {
      setVerifyMsg({ ok: false, text: err.message || "Failed to send OTP" });
    } finally {
      setVerifyBusy(null);
    }
  };

  const verifyChannel = async (type: "email" | "phone", code: string) => {
    if (!verifyState) return;
    setVerifyBusy(type);
    setVerifyMsg(null);
    try {
      const value = type === "email" ? verifyState.email : verifyState.phone;
      const r = await fetch(`${API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value, code }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Verification failed");
      setVerifyState((s) => s ? { ...s, ...(type === "email" ? { emailOk: true } : { phoneOk: true }) } : s);
      setVerifyMsg({ ok: true, text: `${type === "email" ? "Email" : "Phone"} verified` });
    } catch (err: any) {
      setVerifyMsg({ ok: false, text: err.message || "Verification failed" });
    } finally {
      setVerifyBusy(null);
    }
  };

  const verifyDone = async () => {
    if (!verifyState || !verifyState.emailOk || !verifyState.phoneOk) return;
    setVerifyBusy("done");
    setVerifyMsg(null);
    try {
      if (verifyState.mode === "gate" && verifyState.pendingLogin) {
        const r = await fetch(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: verifyState.pendingLogin.email, password: verifyState.pendingLogin.password }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Login failed");
        localStorage.setItem("cc_token", d.token);
        setToken(d.token);
        setUser(d.user);
        setVerifyState(null);
      } else if (verifyState.mode === "profile" && token) {
        await fetchUser(token);
        setVerifyState(null);
      }
    } catch (err: any) {
      setVerifyMsg({ ok: false, text: err.message || "Please try again" });
    } finally {
      setVerifyBusy(null);
    }
  };

  const openVerifyFromProfile = () => {
    if (!user) return;
    setVerifyMsg(null);
    setVerifyState({
      mode: "profile",
      email: user.email,
      phone: user.phone,
      emailOk: !!user.emailVerified,
      phoneOk: !!user.phoneVerified,
    });
  };

  const logout = () => {
    localStorage.removeItem("cc_token");
    setToken(null);
    setUser(null);
    setVerifyState(null);
    setStats(null);
    setLands([]);
    setTrees([]);
    setListings([]);
    setVehicles([]);
    setDocuments(null);
    setLicences([]);
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
    if (verifyState && verifyState.mode === "gate") {
      return (
        <VerifyScreen
          state={verifyState}
          busy={verifyBusy}
          msg={verifyMsg}
          onResend={verifyResend}
          onVerify={verifyChannel}
          onDone={verifyDone}
          onBack={() => setVerifyState(null)}
        />
      );
    }
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

        <div className="mx-4 p-3 bg-white/10 backdrop-blur rounded-xl mb-4 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 text-green-950 rounded-full flex items-center justify-center font-black ring-2 ring-white/30">{user.name.charAt(0).toUpperCase()}</div>
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
            { key: "vehicle", label: "Vehicles & Pollution", icon: Car },
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
            { key: "vehicle", label: "Vehicles", icon: Car },
          ].map((i) => (
            <button key={i.key} onClick={() => setTab(i.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${tab === i.key ? "bg-green-600 text-white" : "bg-green-50 text-green-700"}`}>
              <i.icon className="w-3.5 h-3.5" /> {i.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {(!user.emailVerified || !user.phoneVerified) && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-800 flex items-center justify-between gap-3">
              <p className="font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> Verify your email & phone to fully secure your account.</p>
              <button onClick={openVerifyFromProfile} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-lg shrink-0">Verify now</button>
            </div>
          )}
          {tab === "overview" && <Overview user={user} stats={stats} lands={lands} trees={trees} market={market} onGo={setTab} />}
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
              onBuy={setActiveBuy} market={market} onRefresh={loadMarket} />
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
          {tab === "vehicle" && (
            <VehicleTab
              user={user}
              api={api}
              vehicles={vehicles}
              setVehicles={setVehicles}
              documents={documents}
              setDocuments={setDocuments}
              licences={licences}
              setLicences={setLicences}
            />
          )}
        </main>

        {activeBuy && (
          <PaymentModal listing={activeBuy} buyer={user} onClose={() => setActiveBuy(null)} />
        )}
        {verifyState && verifyState.mode === "profile" && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setVerifyState(null)}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md my-8">
              <VerifyScreen
                state={verifyState}
                busy={verifyBusy}
                msg={verifyMsg}
                onResend={verifyResend}
                onVerify={verifyChannel}
                onDone={verifyDone}
                onBack={() => setVerifyState(null)}
              />
            </div>
          </div>
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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-950 via-emerald-900 to-teal-900 p-4">
      <div className="absolute -top-28 -left-28 w-[26rem] h-[26rem] bg-green-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-36 -right-24 w-[30rem] h-[30rem] bg-emerald-500/15 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-10 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl animate-pulse" />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden lg:grid lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 20% 25%, rgba(255,255,255,.5) 0 1.5px, transparent 1.6px), radial-gradient(circle at 75% 70%, rgba(255,255,255,.35) 0 1.5px, transparent 1.6px)", backgroundSize: "28px 28px" }} />
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                <Leaf className="w-9 h-9" />
              </div>
              <h2 className="text-[1.7rem] leading-snug font-black">Farmers earn real money by saving the planet 🌾</h2>
              <p className="mt-3 text-green-100 text-sm leading-relaxed">
                Measure your land &amp; trees with satellite imagery, earn certified carbon credits, and sell them on the live digital marketplace.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  { icon: Landmark, text: "Register your farmland — completely free" },
                  { icon: Satellite, text: "Estimate credits directly from satellite data" },
                  { icon: Wallet, text: "Sell credits & get paid in Rupees" },
                  { icon: TrendingUp, text: "Live market pricing, updated every 10 min" },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm">{f.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex items-center gap-2 text-green-100 text-xs">
              <Info className="w-4 h-4 shrink-0" />
              <span>1 carbon credit = 1 tonne CO₂ saved. Prices follow the live digital market.</span>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="lg:hidden flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-black text-gray-900 leading-tight">Kisan Carbon Hub</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Farmer Credit Hub</p>
                </div>
              </div>
              <Link href="/" className="text-xs text-green-700 font-semibold underline">← Home</Link>
            </div>

            <div className="flex bg-green-50 rounded-xl p-1 mb-6">
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
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-amber-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/40 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Sprout className="w-4 h-4" /> Login with Demo Farmer
              </button>
            </div>

            {mode === "register" && (
              <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 text-xs text-green-800 space-y-1">
                <p><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Register your farmland free</p>
                <p><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Estimate carbon credits from satellite</p>
                <p><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Convert credits into Rupees &amp; sell</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= VERIFY SCREEN ================= */
function VerifyRow({ label, value, devOtp, ok, busy, code, setCode, onSend, onVerify }: {
  label: string;
  value: string;
  devOtp?: string;
  ok: boolean;
  busy: boolean;
  code: string;
  setCode: (c: string) => void;
  onSend: () => void;
  onVerify: () => void;
}) {
  return (
    <div className={`rounded-xl border p-3 ${ok ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
            {ok ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
            {label} verified
          </p>
          <p className="text-sm text-gray-600 font-semibold truncate mt-0.5">{value}</p>
        </div>
      </div>
      {!ok && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              inputMode="numeric"
              className="flex-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-bold tracking-widest"
            />
            <button onClick={onVerify} disabled={busy || code.length !== 6}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50 shrink-0">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Verify
            </button>
          </div>
          <button onClick={onSend} disabled={busy} className="text-xs text-green-700 font-semibold underline disabled:opacity-50">Resend OTP</button>
          {devOtp && (
            <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span><b>DEV MODE:</b> your OTP is <b className="tracking-widest">{devOtp}</b> (shown for testing)</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function VerifyScreen({ state, busy, msg, onResend, onVerify, onDone, onBack }: {
  state: VerifyState;
  busy: "email" | "phone" | "done" | null;
  msg: { ok: boolean; text: string } | null;
  onResend: (t: "email" | "phone") => void;
  onVerify: (t: "email" | "phone", code: string) => void;
  onDone: () => void;
  onBack?: () => void;
}) {
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const done = state.emailOk && state.phoneOk;
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-950 via-emerald-900 to-teal-900 p-4">
      <div className="absolute -top-24 -right-24 w-[24rem] h-[24rem] bg-green-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-20 w-[26rem] h-[26rem] bg-amber-400/10 rounded-full blur-3xl" />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,255,255,.5) 0 1.5px, transparent 1.6px)", backgroundSize: "22px 22px" }} />
            <div className="relative flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur"><Shield className="w-7 h-7" /></div>
              <div>
                <h1 className="text-xl font-black">Verify your account</h1>
                <p className="text-green-100 text-xs">Confirm your email &amp; phone number with the OTPs we sent.</p>
              </div>
            </div>
            {onBack && <button onClick={onBack} className="relative text-[11px] text-green-100 underline">← Back to login</button>}
          </div>

          <div className="p-6 space-y-3">
            <VerifyRow label="Email" value={state.email} devOtp={state.devEmail} ok={state.emailOk} busy={busy === "email"} code={emailCode} setCode={setEmailCode} onSend={() => onResend("email")} onVerify={() => onVerify("email", emailCode)} />
            <VerifyRow label="Phone" value={state.phone} devOtp={state.devPhone} ok={state.phoneOk} busy={busy === "phone"} code={phoneCode} setCode={setPhoneCode} onSend={() => onResend("phone")} onVerify={() => onVerify("phone", phoneCode)} />

            {msg && (
              <p className={`text-sm p-2 rounded-lg ${msg.ok ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>{msg.text}</p>
            )}

            <button onClick={onDone} disabled={!done || busy === "done"}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {busy === "done" ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in…</> : done ? "Verify & Continue" : "Verify both to continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, set, ...props }: any) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        {...props}
        value={props.value ?? ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => set && set(e.target.value)}
        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
      />
    </div>
  );
}

/* ================= OVERVIEW ================= */
function Overview({ user, stats, lands, trees, market, onGo }: { user: AuthUser; stats: Stats | null; lands: Land[]; trees: Tree[]; market: MarketInfo | null; onGo: (t: any) => void }) {
  const totalCredits = stats?.totalCredits || 0;
  const totalValue = stats?.totalValueINR || 0;
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,255,255,.6) 0 1.5px, transparent 1.6px)", backgroundSize: "26px 26px" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-green-200 text-[11px] font-bold uppercase tracking-[0.2em]">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <h1 className="text-2xl lg:text-3xl font-black mt-1">Welcome back, {user.name.split(" ")[0]} 🌾</h1>
            <p className="text-green-100 text-sm mt-1">Here's how your land is helping fight climate change.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2.5 text-sm font-bold border border-white/20">
              {market ? (
                <>
                  ₹{market.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}/credit
                  <span className={`ml-2 text-[9px] font-black uppercase tracking-wider rounded-full px-2 py-0.5 ${market.live ? "bg-green-400/30 text-green-100" : "bg-white/10 text-green-100"}`}>
                    {market.live ? "● Live market" : "● Cached"}
                  </span>
                </>
              ) : (
                <>Market loading…</>
              )}
            </div>
            <button onClick={() => onGo("market")} className="bg-white text-green-700 font-bold px-5 py-2.5 rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all">
              Sell credits →
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Landmark} label="Registered Lands" value={stats?.landCount || 0} color="green" />
        <StatCard icon={TreePine} label="Trees Tracked" value={stats?.treeCount || 0} color="emerald" />
        <StatCard icon={BarChart3} label="Total Credits" value={totalCredits.toFixed(1)} suffix=" tCO2e" color="teal" />
        <StatCard icon={Wallet} label="Potential Earnings" value={`₹${Math.round(totalValue).toLocaleString('en-IN')}`} color="amber" />
      </div>

      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,.6) 0 1.5px, transparent 1.6px), radial-gradient(circle at 30% 90%, rgba(255,255,255,.4) 0 1.5px, transparent 1.6px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
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
                    <p className="text-xs text-gray-500">₹{Math.round(l.estTotalCredits * CREDIT_PRICE_INR).toLocaleString('en-IN')}</p>
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
            <span className="flex-1">
              1 carbon credit = 1 tonne CO2.{" "}
              {market ? (
                <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
                  <b className="text-amber-900">₹{market.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/credit</b>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${market.live ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {market.live ? "● Live digital market" : "● Offline (cached)"}
                  </span>
                  {market.token && <span className="opacity-70">via {market.token}</span>}
                  <span className="opacity-60">updated {market.fetchedAt}</span>
                </span>
              ) : (
                <>Current price ≈ ₹{DEFAULT_CREDIT_PRICE_INR}/credit. Prices vary by market.</>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color }: any) {
  const colors: any = {
    green: "from-green-500 to-emerald-500 shadow-green-500/30",
    emerald: "from-emerald-500 to-teal-500 shadow-emerald-500/30",
    teal: "from-teal-500 to-cyan-500 shadow-teal-500/30",
    amber: "from-amber-400 to-orange-500 shadow-amber-500/30",
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center text-white`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-black text-gray-800 mt-2 tracking-tight">{value}{suffix}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 hover:-translate-y-0.5 rounded-xl transition-all duration-300 border border-green-100/70">
      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
        <Icon className="w-5 h-5 text-green-600" />
      </div>
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
                  <span className="text-green-600 font-bold">₹{Math.round((t.estCO2Kg / 1000) * CREDIT_PRICE_INR).toLocaleString('en-IN')}</span>
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
function MarketTab({ listings, showForm, setShowForm, title, setTitle, credits, setCredits, price, setPrice, landId, setLandId, lands, busy, msg, onSubmit, user, onBuy, market, onRefresh }: {
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
  market?: MarketInfo | null;
  onRefresh?: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Carbon Credit Marketplace</h1>
          <p className="text-gray-500 text-sm">Buy and sell verified carbon credits</p>
        </div>
        <div className="flex items-center gap-2">
          {!!onRefresh && (
            <button onClick={onRefresh} title="Refresh live market rate"
              className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-2 rounded-xl border border-green-200 text-green-700 bg-white hover:bg-green-50">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh rate
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-green-500/30">
            <Store className="w-4 h-4" /> List Credits
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <MarketStat label="Live Price" value={`₹${CREDIT_PRICE_INR.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
            sub={market ? `${market.live ? "● Live" : "● Offline (cached)"} · ${market.fetchedAt}` : "per credit"}
            color={market && !market.live ? "text-gray-500" : "text-green-600"} />
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

function VehicleTab({ user, api, vehicles, setVehicles, documents, setDocuments, licences, setLicences }: {
  user: AuthUser;
  api: (path: string, options?: RequestInit) => Promise<Response>;
  vehicles: Vehicle[];
  setVehicles: (v: Vehicle[]) => void;
  documents: Documents | null;
  setDocuments: (d: Documents | null) => void;
  licences: Licence[];
  setLicences: (l: Licence[]) => void;
}) {
  // Documents state
  const [aadharNum, setAadharNum] = useState(documents?.aadharNumber || "");
  const [aadharImg, setAadharImg] = useState<string | null>(documents?.aadharImage || null);
  const [dlNum, setDlNum] = useState(documents?.dlNumber || "");
  const [dlImg, setDlImg] = useState<string | null>(documents?.dlImage || null);
  const [docBusy, setDocBusy] = useState(false);
  const [docMsg, setDocMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Add vehicle state
  const [vShow, setVShow] = useState(false);
  const [vTypeKey, setVTypeKey] = useState("car_petrol");
  const [vName, setVName] = useState("");
  const [vMake, setVMake] = useState("");
  const [vModel, setVModel] = useState("");
  const [vReg, setVReg] = useState("");
  const [vYear, setVYear] = useState("");
  const [vBusy, setVBusy] = useState(false);
  const [vMsg, setVMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Trip state
  const [tripVehicleId, setTripVehicleId] = useState<string | null>(null);
  const [tripDate, setTripDate] = useState("");
  const [tripKm, setTripKm] = useState("");
  const [tripRoute, setTripRoute] = useState("");
  const [tripBusy, setTripBusy] = useState(false);
  const [tripMsg, setTripMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Catalog search
  const [catQuery, setCatQuery] = useState("");

  // Licence
  const [licBusy, setLicBusy] = useState(false);
  const [licMsg, setLicMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const readFile = (file: File, cb: (b64: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => cb(String(reader.result));
    reader.readAsDataURL(file);
  };

  const saveDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocBusy(true);
    setDocMsg(null);
    const body: any = {};
    if (aadharNum) body.aadharNumber = aadharNum.trim();
    if (aadharImg) body.aadharImage = aadharImg;
    if (dlNum) body.dlNumber = dlNum.trim();
    if (dlImg) body.dlImage = dlImg;
    try {
      const res = await api("/api/documents", { method: "PUT", body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setDocMsg({ ok: false, text: data.error || "Failed to save" }); return; }
      setDocuments(data.documents);
      setDocMsg({ ok: true, text: "Documents saved successfully" });
    } catch {
      setDocMsg({ ok: false, text: "Network error" });
    } finally {
      setDocBusy(false);
    }
  };

  const addVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim()) { setVMsg({ ok: false, text: "Enter a name for the vehicle" }); return; }
    setVBusy(true); setVMsg(null);
    const vt = VEHICLE_TYPE_MAP[vTypeKey];
    try {
      const res = await api("/api/vehicles", {
        method: "POST",
        body: JSON.stringify({
          name: vName.trim(), category: vt.category, fuel: vt.fuel,
          make: vMake.trim() || vName.trim(), model: vModel.trim(),
          regNumber: vReg.trim(), year: vYear ? Number(vYear) : undefined, typeKey: vTypeKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setVMsg({ ok: false, text: data.error || "Failed to add" }); return; }
      setVehicles([data.vehicle, ...vehicles]);
      setVMsg({ ok: true, text: `${data.vehicle.name} added` });
      setVShow(false); setVName(""); setVMake(""); setVModel(""); setVReg(""); setVYear("");
    } catch {
      setVMsg({ ok: false, text: "Network error" });
    } finally {
      setVBusy(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    const res = await api(`/api/vehicles/${id}`, { method: "DELETE" });
    if (res.ok) setVehicles(vehicles.filter((v) => v.id !== id));
  };

  const addTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripVehicleId || !tripKm || Number(tripKm) <= 0) {
      setTripMsg({ ok: false, text: "Pick a vehicle and a valid distance" }); return;
    }
    setTripBusy(true); setTripMsg(null);
    try {
      const res = await api(`/api/vehicles/${tripVehicleId}/trips`, {
        method: "POST",
        body: JSON.stringify({ date: tripDate || new Date().toISOString(), distanceKm: Number(tripKm), routeName: tripRoute.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setTripMsg({ ok: false, text: data.error || "Failed" }); return; }
      setVehicles(vehicles.map((v) => v.id === tripVehicleId ? { ...v, trips: [data.trip, ...(v.trips || [])] } : v));
      setTripMsg({ ok: true, text: "Trip logged" });
      setTripKm(""); setTripRoute("");
    } catch {
      setTripMsg({ ok: false, text: "Network error" });
    } finally {
      setTripBusy(false);
    }
  };

  const deleteTrip = async (vehicleId: string, tripId: string) => {
    const res = await api(`/api/trips/${tripId}`, { method: "DELETE" });
    if (res.ok) {
      setVehicles(vehicles.map((v) => v.id === vehicleId ? { ...v, trips: (v.trips || []).filter((t) => t.id !== tripId) } : v));
    }
  };

  const buyLicence = async () => {
    const fleetKg = vehicles.reduce((s, v) => s + (v.trips || []).reduce((a, t) => a + t.emissionKg, 0), 0);
    if (fleetKg <= 0) { setLicMsg({ ok: false, text: "No logged trips yet — add trips to your vehicles first" }); return; }
    setLicBusy(true); setLicMsg(null);
    try {
      const res = await api("/api/licence", {
        method: "POST",
        body: JSON.stringify({ co2OffsetKg: fleetKg }),
      });
      const data = await res.json();
      if (!res.ok) { setLicMsg({ ok: false, text: data.error || "Failed" }); return; }
      setLicences([data.licence, ...licences]);
      setLicMsg({ ok: true, text: `Carbon licence purchased — ₹${Math.round(data.licence.totalValueINR).toLocaleString("en-IN")} (${data.licence.credits.toFixed(2)} credits)` });
    } catch {
      setLicMsg({ ok: false, text: "Network error" });
    } finally {
      setLicBusy(false);
    }
  };

  const fleetKg = vehicles.reduce((s, v) => s + (v.trips || []).reduce((a, t) => a + t.emissionKg, 0), 0);
  const fleetKms = vehicles.reduce((s, v) => s + (v.trips || []).reduce((a, t) => a + t.distanceKm, 0), 0);
  const licCost = Math.ceil(fleetKg / 1000) * CREDIT_PRICE_INR;
  const catResults = searchVehicleCatalog(catQuery);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2"><Car className="w-6 h-6 text-green-600" /> Vehicles &amp; Pollution</h1>
        <p className="text-gray-500 text-sm">Register your ID documents, log vehicle travel, track pollution, and buy carbon licences.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1"><Car className="w-3 h-3" /> Vehicles</p>
          <p className="text-2xl font-black text-gray-800 mt-1">{vehicles.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1"><Wind className="w-3 h-3" /> CO2 logged</p>
          <p className="text-2xl font-black text-gray-800 mt-1">{(fleetKg / 1000).toFixed(2)} <span className="text-sm font-bold text-gray-500">t</span></p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1"><History className="w-3 h-3" /> Kms logged</p>
          <p className="text-2xl font-black text-gray-800 mt-1">{Math.round(fleetKms).toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1"><Shield className="w-3 h-3" /> Licences</p>
          <p className="text-2xl font-black text-gray-800 mt-1">{licences.length}</p>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5">
        <h3 className="font-black text-gray-800 flex items-center gap-2 mb-1"><Contact className="w-5 h-5 text-green-600" /> Identity Documents</h3>
        <p className="text-xs text-gray-500 mb-4">Upload your Aadhaar card and Driving Licence to register for vehicle pollution tracking.</p>
        <form onSubmit={saveDocuments} className="grid md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
            <p className="font-bold text-sm text-gray-700 flex items-center gap-2"><Contact className="w-4 h-4 text-green-600" /> Aadhaar Card</p>
            <input value={aadharNum} onChange={(e) => setAadharNum(e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="12-digit Aadhaar number" className="input" inputMode="numeric" />
            <label className="block cursor-pointer">
              <span className="input text-center block py-2.5 text-green-700 font-bold text-xs bg-green-50 hover:bg-green-100 rounded-xl">
                {aadharImg ? "Change Aadhaar photo" : "Upload Aadhaar photo"}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], setAadharImg)} />
            </label>
            {aadharImg && <img src={aadharImg} alt="Aadhaar" className="max-h-32 rounded-xl object-cover border" />}
          </div>
          <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
            <p className="font-bold text-sm text-gray-700 flex items-center gap-2"><ScrollText className="w-4 h-4 text-green-600" /> Driving Licence</p>
            <input value={dlNum} onChange={(e) => setDlNum(e.target.value)} placeholder="Driving Licence number" className="input" />
            <label className="block cursor-pointer">
              <span className="input text-center block py-2.5 text-green-700 font-bold text-xs bg-green-50 hover:bg-green-100 rounded-xl">
                {dlImg ? "Change Licence photo" : "Upload Licence photo"}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], setDlImg)} />
            </label>
            {dlImg && <img src={dlImg} alt="Licence" className="max-h-32 rounded-xl object-cover border" />}
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            {docMsg && <p className={`text-sm font-semibold ${docMsg.ok ? "text-green-600" : "text-red-600"}`}>{docMsg.text}</p>}
            <button disabled={docBusy} className="ml-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2">
              {docBusy && <Loader2 className="w-4 h-4 animate-spin" />} Save Documents
            </button>
          </div>
        </form>
      </div>

      {/* Add vehicle + list */}
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-800 flex items-center gap-2"><Car className="w-5 h-5 text-green-600" /> My Vehicles ({vehicles.length})</h3>
          <button onClick={() => setVShow(!vShow)} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold ${vShow ? "bg-gray-200 text-gray-700" : "bg-green-600 text-white"}`}>
            <Plus className="w-3.5 h-3.5" /> {vShow ? "Cancel" : "Add Vehicle"}
          </button>
        </div>

        {vShow && (
          <form onSubmit={addVehicle} className="grid md:grid-cols-2 gap-3 bg-green-50 rounded-2xl p-4 mb-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600 block mb-1">Vehicle Type</label>
              <select value={vTypeKey} onChange={(e) => setVTypeKey(e.target.value)} className="input">
                {VEHICLE_TYPES.map((vt) => <option key={vt.key} value={vt.key}>{vt.label} — {vt.emissionGPerKm} g/km</option>)}
              </select>
            </div>
            <input value={vName} onChange={(e) => setVName(e.target.value)} placeholder="Name (e.g. My Bike)" className="input" />
            <input value={vReg} onChange={(e) => setVReg(e.target.value)} placeholder="Registration number (optional)" className="input" />
            <input value={vMake} onChange={(e) => setVMake(e.target.value)} placeholder="Make (e.g. Hero, Tata)" className="input" />
            <input value={vModel} onChange={(e) => setVModel(e.target.value)} placeholder="Model (e.g. Splendor, Nexon)" className="input" />
            <input value={vYear} onChange={(e) => setVYear(e.target.value)} placeholder="Year (optional)" className="input" inputMode="numeric" />
            <div className="md:col-span-2 flex items-center gap-3">
              {vMsg && <p className={`text-sm font-semibold ${vMsg.ok ? "text-green-600" : "text-red-600"}`}>{vMsg.text}</p>}
              <button disabled={vBusy} className="ml-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2">
                {vBusy && <Loader2 className="w-4 h-4 animate-spin" />} Add Vehicle
              </button>
            </div>
          </form>
        )}

        {vMsg && !vShow && <p className={`mb-3 text-sm font-semibold ${vMsg.ok ? "text-green-600" : "text-red-600"}`}>{vMsg.text}</p>}

        <div className="space-y-3">
          {vehicles.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <Car className="w-12 h-12 mx-auto opacity-40" />
              <p className="text-sm mt-2">No vehicles yet. Add your vehicles to track pollution and carbon licences.</p>
            </div>
          )}
          {vehicles.map((v) => {
            const totalKg = (v.trips || []).reduce((a, t) => a + t.emissionKg, 0);
            return (
              <div key={v.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-gray-800">{v.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {v.make}{v.model ? ` ${v.model}` : ""} • {CATEGORY_LABELS[v.category] || v.category} • {FUEL_LABELS[v.fuel] || v.fuel}
                        {v.regNumber ? ` • ${v.regNumber}` : ""}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{v.emissionGPerKm} g CO2 / km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-1">
                      <p className="text-lg font-black text-red-600">{(totalKg / 1000).toFixed(2)} t</p>
                      <p className="text-[10px] text-gray-400">CO2</p>
                    </div>
                    <button onClick={() => setTripVehicleId(tripVehicleId === v.id ? null : v.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold ${tripVehicleId === v.id ? "bg-gray-200 text-gray-700" : "bg-blue-600 text-white"}`}>
                      <History className="w-3.5 h-3.5 inline mr-1" />Trips
                    </button>
                    <button onClick={() => deleteVehicle(v.id)} className="p-2 rounded-xl text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {tripVehicleId === v.id && (
                  <div className="bg-gray-50 border-t border-gray-200 p-4">
                    <form onSubmit={addTrip} className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                      <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className="input" />
                      <input value={tripKm} onChange={(e) => setTripKm(e.target.value)} placeholder="Distance (km)" className="input" inputMode="decimal" />
                      <input value={tripRoute} onChange={(e) => setTripRoute(e.target.value)} placeholder="Route (e.g. Village → City)" className="input md:col-span-2" />
                      <button disabled={tripBusy} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1">
                        {tripBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Log Trip
                      </button>
                      {tripMsg && <p className={`col-span-2 md:col-span-5 text-sm font-semibold ${tripMsg.ok ? "text-green-600" : "text-red-600"}`}>{tripMsg.text}</p>}
                    </form>
                    <div className="max-h-56 overflow-y-auto space-y-1.5">
                      {(v.trips || []).length === 0 && <p className="text-xs text-gray-400 text-center py-4">No trips logged yet.</p>}
                      {(v.trips || []).map((t) => (
                        <div key={t.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100">
                          <div className="flex items-center gap-2 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-semibold text-gray-700">{new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-700">{t.distanceKm} km</span>
                            {t.routeName && <span className="text-gray-400">{t.routeName}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-red-600">{(t.emissionKg / 1000).toFixed(3)} t</span>
                            <button onClick={() => deleteTrip(v.id, t.id)} className="text-gray-400 hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Catalog search */}
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5">
        <h3 className="font-black text-gray-800 flex items-center gap-2 mb-1"><Search className="w-5 h-5 text-green-600" /> Vehicle Pollution Lookup</h3>
        <p className="text-xs text-gray-500 mb-4">Search any vehicle by name, model or fuel to see how much CO2 it produces per km.</p>
        <input value={catQuery} onChange={(e) => setCatQuery(e.target.value)} placeholder="Search e.g. 'SUV', 'CNG', 'scooter', 'truck'..." className="input mb-3" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
          {catResults.map((vt) => (
            <div key={vt.key} className="border border-gray-100 rounded-xl p-3 hover:border-green-300 transition-colors">
              <p className="font-bold text-sm text-gray-800">{vt.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{vt.desc}</p>
              <p className="text-xs mt-2 flex items-center justify-between">
                <span className="text-gray-500">CO2 / km</span>
                <span className="font-black text-red-600">{vt.emissionGPerKm} g</span>
              </p>
              <p className="text-[10px] text-gray-400">100 km trip ⇒ {(vt.emissionGPerKm * 100 / 1000).toFixed(2)} kg</p>
            </div>
          ))}
        </div>
      </div>

      {/* Carbon licence */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6" />
          <h3 className="font-black text-lg">Buy Carbon Licence</h3>
        </div>
        <p className="text-sm text-green-100 mb-4">
          Offset the exact CO2 from your vehicles' logged travel. Your fleet has emitted{" "}
          <span className="font-black text-white">{(fleetKg / 1000).toFixed(3)} tonnes</span> of CO2.
        </p>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-widest text-green-200">CO2 to offset</p>
            <p className="text-xl font-black">{(fleetKg / 1000).toFixed(3)} t</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-widest text-green-200">Credits needed</p>
            <p className="text-xl font-black">{Math.max(0.001, fleetKg / 1000).toFixed(2)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-widest text-green-200">Licence cost (₹{CREDIT_PRICE_INR}/credit)</p>
            <p className="text-xl font-black">₹{licCost.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={buyLicence} disabled={licBusy}
            className="bg-white text-green-700 hover:bg-green-50 disabled:opacity-50 font-black px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            {licBusy && <Loader2 className="w-4 h-4 animate-spin" />} <Shield className="w-4 h-4" /> Buy Licence
          </button>
          {licMsg && <p className={`text-sm font-semibold ${licMsg.ok ? "text-green-100" : "text-red-300"}`}>{licMsg.text}</p>}
        </div>

        {licences.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/20">
            <p className="text-xs uppercase tracking-widest text-green-200 font-bold mb-2">Licence history</p>
            <div className="space-y-2">
              {licences.map((l) => (
                <div key={l.id} className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                    <span className="font-bold">{l.credits.toFixed(2)} credits</span>
                    <span className="text-xs text-green-200">offset {(l.co2OffsetKg / 1000).toFixed(3)} t CO2</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black">₹{l.totalValueINR.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-green-200">{new Date(l.purchasedAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
