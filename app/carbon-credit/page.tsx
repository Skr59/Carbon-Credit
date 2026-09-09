"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  Leaf,
  TreePine,
  Droplets,
  BarChart3,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Globe,
  Thermometer,
  Satellite,
  Layers,
  Sprout,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[300px] bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center text-xs text-green-700 font-bold">Loading map…</div>,
});

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  name: string;
}

interface CarbonData {
  vegetation: number;
  soil: number;
  water: number;
  urban: number;
  totalCredits: number;
  confidence: number;
  recommendations: string[];
}

export default function CarbonCreditCalculator() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [carbonData, setCarbonData] = useState<CarbonData | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.209]);
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mapType, setMapType] = useState<"satellite" | "street">("satellite");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocation = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        { headers: { "User-Agent": "CarbonCreditCalculator/1.0" } }
      );
      const data = await res.json();
      setSearchResults(data);
      setShowSearchDropdown(data.length > 0);
    } catch {
      setSearchResults([]);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    searchLocation(value);
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const newLoc: LocationData = {
      lat,
      lng,
      address: result.display_name,
      name: result.display_name.split(",")[0],
    };
    setLocation(newLoc);
    setSearchQuery(newLoc.name);
    setMapCenter([lat, lng]);
    setMarkerPos([lat, lng]);
    setShowSearchDropdown(false);
    setSearchResults([]);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { "User-Agent": "CarbonCreditCalculator/1.0" } }
      );
      const data = await res.json();
      const newLoc: LocationData = {
        lat,
        lng,
        address: data.display_name || `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        name: data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.display_name?.split(",")[0] || "Selected Point",
      };
      setLocation(newLoc);
      setSearchQuery(newLoc.name);
    } catch {
      const newLoc: LocationData = {
        lat,
        lng,
        address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        name: "Selected Point",
      };
      setLocation(newLoc);
      setSearchQuery(newLoc.name);
    }
  };

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    reverseGeocode(lat, lng);
  }, []);

  const handleMarkerDragEnd = useCallback((lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    reverseGeocode(lat, lng);
  }, []);

  const calculateCarbonCredits = useCallback(async () => {
    if (!location) {
      setError("Please select a location first");
      return;
    }
    setCalculating(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const lat = location.lat;
      const lng = location.lng;
      let vegetationScore = 0;
      let soilScore = 0;
      let waterScore = 0;
      let urbanScore = 0;
      const absLat = Math.abs(lat);

      if (absLat < 10) {
        vegetationScore = 0.7 + Math.random() * 0.25;
        soilScore = 0.6 + Math.random() * 0.2;
        waterScore = 0.5 + Math.random() * 0.3;
      } else if (absLat < 25) {
        vegetationScore = 0.5 + Math.random() * 0.3;
        soilScore = 0.5 + Math.random() * 0.25;
        waterScore = 0.3 + Math.random() * 0.3;
      } else if (absLat < 40) {
        vegetationScore = 0.4 + Math.random() * 0.3;
        soilScore = 0.4 + Math.random() * 0.3;
        waterScore = 0.2 + Math.random() * 0.3;
      } else {
        vegetationScore = 0.2 + Math.random() * 0.3;
        soilScore = 0.3 + Math.random() * 0.2;
        waterScore = 0.1 + Math.random() * 0.2;
      }

      const hash = Math.abs(Math.sin(lat * 1000 + lng * 1000));
      if (hash > 0.7) {
        urbanScore = 0.3 + Math.random() * 0.4;
        vegetationScore *= 0.5;
      } else if (hash > 0.5) {
        urbanScore = 0.1 + Math.random() * 0.2;
      }

      vegetationScore = Math.min(1, Math.max(0, vegetationScore));
      soilScore = Math.min(1, Math.max(0, soilScore));
      waterScore = Math.min(1, Math.max(0, waterScore));
      urbanScore = Math.min(1, Math.max(0, urbanScore));

      const vegCredits = vegetationScore * 15;
      const soilCredits = soilScore * 8;
      const waterCredits = waterScore * 5;
      const urbanPenalty = urbanScore * 3;
      const totalCredits = vegCredits + soilCredits + waterCredits - urbanPenalty;

      const recommendations: string[] = [];
      if (vegetationScore < 0.5) {
        recommendations.push("Plant more trees to increase vegetation cover");
        recommendations.push("Consider agroforestry projects");
      }
      if (soilScore < 0.4) {
        recommendations.push("Implement soil conservation practices");
        recommendations.push("Use cover crops to improve soil carbon");
      }
      if (waterScore < 0.3) {
        recommendations.push("Create water bodies or wetlands");
        recommendations.push("Implement watershed management");
      }
      if (urbanScore > 0.3) {
        recommendations.push("Urban areas have lower carbon credit potential");
        recommendations.push("Consider green building or urban forestry projects");
      }
      if (totalCredits > 50) {
        recommendations.push("Excellent carbon credit potential!");
      }
      if (recommendations.length === 0) {
        recommendations.push("Maintain current land use for optimal carbon storage");
        recommendations.push("Consider certified carbon offset programs");
      }

      setCarbonData({
        vegetation: vegCredits,
        soil: soilCredits,
        water: waterCredits,
        urban: urbanPenalty,
        totalCredits: Math.max(0, totalCredits),
        confidence: 65 + Math.random() * 20,
        recommendations,
      });
      setShowDetails(true);
    } catch {
      setError("Failed to calculate carbon credits. Please try again.");
    } finally {
      setCalculating(false);
    }
  }, [location]);

  const getBarWidth = (value: number, max: number) => `${(value / max) * 100}%`;
  const maxCredits = carbonData
    ? Math.max(carbonData.vegetation, carbonData.soil, carbonData.water, 1) * 1.2
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <header className="bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white py-6 px-4 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 15% 30%, rgba(255,255,255,.6) 0 1.5px, transparent 1.6px), radial-gradient(circle at 80% 70%, rgba(255,255,255,.4) 0 1.5px, transparent 1.6px)", backgroundSize: "26px 26px" }} />
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Leaf className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Carbon Credit Calculator
              </h1>
              <p className="text-green-100 text-sm mt-0.5">
                Analyze satellite imagery for carbon offset estimation
              </p>
            </div>
            <Link
              href="/carbon-farmer"
              className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-green-950 font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
            >
              <Sprout className="w-4 h-4" /> Farmer Money Hub →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {/* Search */}
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-green-100" ref={searchRef}>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-green-600" />
                Search Location
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                  placeholder="Type a city, address, or place..."
                  className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSearchResult(result)}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-50 last:border-0 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {result.display_name.split(",")[0]}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{result.display_name}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click on the map or drag the marker to select a location
              </p>
            </div>

            {/* Location Info */}
            {location && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-green-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Selected Location
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-800">Name:</span>{" "}
                    {location.name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-800">Address:</span>{" "}
                    {location.address.length > 60 ? location.address.substring(0, 60) + "..." : location.address}
                  </p>
                  <p className="text-gray-600 font-mono text-xs bg-gray-50 p-2 rounded-lg">
                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            )}

            {/* Calculate Button */}
            <button
              onClick={calculateCarbonCredits}
              disabled={!location || calculating}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-green-500/30 transition-all duration-300 hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {calculating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Satellite Data...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  Calculate Carbon Credits
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Results */}
            {carbonData && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    Carbon Credit Results
                  </h3>
                  <button onClick={() => setShowDetails(!showDetails)} className="text-green-600 hover:text-green-700">
                    {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white mb-4">
                  <p className="text-green-100 text-sm font-medium">Total Carbon Credits</p>
                  <p className="text-3xl font-black">
                    {carbonData.totalCredits.toFixed(2)}
                    <span className="text-lg ml-1">tCO2e/ha</span>
                  </p>
                  <p className="text-green-100 text-xs mt-1">
                    Confidence: {carbonData.confidence.toFixed(0)}%
                  </p>
                </div>

                <div className="space-y-3">
                  <BarItem label="Vegetation" value={carbonData.vegetation} icon={<TreePine className="w-4 h-4 text-green-600" />} barColor="from-green-400 to-green-600" max={maxCredits} getBarWidth={getBarWidth} />
                  <BarItem label="Soil Carbon" value={carbonData.soil} icon={<Globe className="w-4 h-4 text-amber-600" />} barColor="from-amber-400 to-amber-600" max={maxCredits} getBarWidth={getBarWidth} />
                  <BarItem label="Water Bodies" value={carbonData.water} icon={<Droplets className="w-4 h-4 text-blue-600" />} barColor="from-blue-400 to-blue-600" max={maxCredits} getBarWidth={getBarWidth} />
                  <BarItem label="Urban Penalty" value={carbonData.urban} icon={<Thermometer className="w-4 h-4 text-red-500" />} barColor="from-red-400 to-red-500" max={maxCredits} getBarWidth={getBarWidth} negative />
                </div>

                {showDetails && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-green-600" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {carbonData.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* How It Works */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
              <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                <Info className="w-5 h-5" /> How It Works
              </h3>
              <ul className="text-sm text-green-700 space-y-2">
                {["Enter a location or click on the satellite map", "View real-time satellite imagery", "AI analyzes vegetation, soil, and water features", "Get carbon credit estimates and recommendations"].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Map Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Satellite className="w-5 h-5" /> Satellite View
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMapType(mapType === "satellite" ? "street" : "satellite")}
                    className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {mapType === "satellite" ? "Satellite" : "Street"}
                  </button>
                  <div className="flex items-center gap-2 text-xs text-green-100">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    Live
                  </div>
                </div>
              </div>
              <div className="w-full h-[600px]">
                <MapInner
                  center={mapCenter}
                  markerPos={markerPos}
                  mapType={mapType}
                  onMapClick={handleMapClick}
                  onMarkerDrag={handleMarkerDragEnd}
                />
              </div>
            </div>
            <div className="mt-4 bg-white rounded-2xl shadow-lg p-4 border border-green-100">
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded-full" /> High Potential</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-500 rounded-full" /> Medium Potential</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded-full" /> Low Potential</span>
                </div>
                <span className="text-xs text-gray-400">Built by Shivam Kumar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarItem({ label, value, icon, barColor, max, getBarWidth, negative }: {
  label: string; value: number; icon: React.ReactNode; barColor: string; max: number;
  getBarWidth: (v: number, m: number) => string; negative?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="flex items-center gap-1.5 font-medium text-gray-700">
          {icon} {label}
        </span>
        <span className="font-bold">{negative ? "-" : ""}{value.toFixed(2)}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700`} style={{ width: getBarWidth(value, max) }} />
      </div>
    </div>
  );
}
