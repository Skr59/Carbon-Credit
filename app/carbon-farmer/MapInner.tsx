"use client";

import React, { useEffect, useRef, useState } from "react";

interface MapInnerProps {
  center: [number, number];
  markerPos: [number, number] | null;
  mapType: "satellite" | "street";
  onMapClick: (lat: number, lng: number) => void;
  onMarkerDrag: (lat: number, lng: number) => void;
  onPolygonChange?: (latlngs: [number, number][], areaHa: number, areaAcres: number) => void;
  registerMode?: boolean;
  onLiveLocation?: (lat: number, lng: number) => void;
}

export default function MapInner({
  center,
  markerPos,
  mapType,
  onMapClick,
  onMarkerDrag,
  onPolygonChange,
  registerMode = false,
  onLiveLocation,
}: MapInnerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const drawingPointsRef = useRef<[number, number][]>([]);
  const liveMarkerRef = useRef<any>(null);
  const liveCircleRef = useRef<any>(null);
  const registerModeRef = useRef(registerMode);
  const drawingRef = useRef(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(false);

  useEffect(() => { registerModeRef.current = registerMode; }, [registerMode]);
  useEffect(() => { drawingRef.current = isDrawing; }, [isDrawing]);

  const locateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const L = require("leaflet");
        const map = mapInstanceRef.current;
        setLocating(false);
        setLocated(true);
        if (map) {
          map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 1.2 });
          if (!liveMarkerRef.current) {
            const icon = L.divIcon({
              className: "",
              html: `<div style="width:18px;height:18px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 0 0 10px rgba(37,99,235,0.25);"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });
            liveMarkerRef.current = L.marker([lat, lng], { icon }).addTo(map);
            liveCircleRef.current = L.circle([lat, lng], {
              radius: (pos.coords.accuracy || 10) || 10,
              color: "#2563eb",
              weight: 1,
              fillColor: "#2563eb",
              fillOpacity: 0.15,
            }).addTo(map);
          } else {
            liveMarkerRef.current.setLatLng([lat, lng]);
            if (liveCircleRef.current) liveCircleRef.current.setLatLng([lat, lng]);
          }
        }
        if (onLiveLocation) onLiveLocation(lat, lng);
      },
      (err) => {
        setLocating(false);
        alert("Could not get your location. " + (err.message || ""));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 2000 }
    );
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = require("leaflet");

    const satelliteTiles = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    const streetTiles = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const labelsTiles = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

    const map = L.map(mapRef.current, {
      center,
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });

    const tileLayer = L.tileLayer(satelliteTiles, {
      attribution: "Esri World Imagery",
      maxZoom: 18,
    }).addTo(map);

    L.tileLayer(labelsTiles, {
      attribution: "",
      maxZoom: 18,
      opacity: 0.7,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    map.on("click", (e: any) => {
      if (registerModeRef.current) {
        const pts = drawingPointsRef.current;
        const latlng = [e.latlng.lat, e.latlng.lng] as [number, number];
        const alreadyClose = pts.some(
          (p) => Math.abs(p[0] - latlng[0]) < 0.00005 && Math.abs(p[1] - latlng[1]) < 0.00005
        );
        if (pts.length >= 3 && alreadyClose) {
          finishPolygon();
        } else {
          drawingPointsRef.current = [...pts, latlng];
          drawingRef.current = true;
          setIsDrawing(true);
          updatePolygonLayer();
        }
        return;
      }
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const updatePolygonLayer = () => {
    const L = require("leaflet");
    const map = mapInstanceRef.current;
    if (!map) return;
    const pts = drawingPointsRef.current;

    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }

    if (pts.length === 1) {
      const marker = L.marker(pts[0], { draggable: false }).addTo(map);
      markerRef.current = marker;
      return;
    }

    if (pts.length >= 2) {
      polygonRef.current = L.polyline(pts, {
        color: "#16a34a",
        weight: 3,
      }).addTo(map);
    }

    if (pts.length >= 3 && onPolygonChange) {
      const areaHa = polygonArea(pts);
      onPolygonChange(pts, areaHa, areaHa * 2.47105);
    }
  };

  const finishPolygon = () => {
    const pts = drawingPointsRef.current;
    const L = require("leaflet");
    const map = mapInstanceRef.current;
    if (!map || pts.length < 3) {
      drawingPointsRef.current = [];
      return;
    }

    if (polygonRef.current) map.removeLayer(polygonRef.current);

    polygonRef.current = L.polygon([...pts, pts[0]], {
      color: "#16a34a",
      weight: 3,
      fillColor: "#16a34a",
      fillOpacity: 0.25,
    }).addTo(map);

    const areaHa = polygonArea(pts);
    if (onPolygonChange) {
      onPolygonChange(pts, areaHa, areaHa * 2.47105);
    }

    drawingPointsRef.current = [];
    drawingRef.current = false;
    setIsDrawing(false);
  };

  const startNewPolygon = () => {
    if (!registerMode) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;
    if (!map) return;
    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    drawingPointsRef.current = [];
    drawingRef.current = true;
    setIsDrawing(true);
    if (onPolygonChange) onPolygonChange([], 0, 0);
  };

  function polygonArea(latlngs: [number, number][]) {
    if (latlngs.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < latlngs.length; i++) {
      const j = (i + 1) % latlngs.length;
      const xi = latlngs[i][0] * 111.32;
      const yi = latlngs[i][1] * (111.32 * Math.cos((latlngs[i][0] * Math.PI) / 180));
      const xj = latlngs[j][0] * 111.32;
      const yj = latlngs[j][1] * (111.32 * Math.cos((latlngs[j][0] * Math.PI) / 180));
      area += xi * yj - xj * yi;
    }
    return Math.abs(area / 2);
  }

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(center, mapInstanceRef.current.getZoom(), { duration: 1.5 });
  }, [center]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerPos || registerMode) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    if (markerRef.current) {
      markerRef.current.setLatLng(markerPos);
    } else {
      const greenIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background: #16a34a; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display:flex;align-items:center;justify-content:center;"><div style="transform: rotate(45deg);color:white;font-size:15px;font-weight:bold;">C</div></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      const marker = L.marker(markerPos, { icon: greenIcon, draggable: true }).addTo(map);
      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        onMarkerDrag(pos.lat, pos.lng);
      });
      markerRef.current = marker;
    }
  }, [markerPos, registerMode]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const satelliteTiles = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    const streetTiles = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const url = mapType === "satellite" ? satelliteTiles : streetTiles;
    const attr = mapType === "satellite" ? "Esri World Imagery" : "&copy; OpenStreetMap contributors";

    const tileLayer = L.tileLayer(url, { attribution: attr, maxZoom: 18 }).addTo(map);
    tileLayerRef.current = tileLayer;
  }, [mapType]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      <button
        onClick={locateMe}
        title="Use my live location"
        className={`absolute top-3 right-3 z-[1000] flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg shadow-lg transition-all ${located ? "bg-blue-600 text-white" : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"}`}
      >
        {locating ? <span className="w-3 h-3 rounded-full border-2 border-blue-300 border-t-white animate-spin" /> : (located ? <span className="w-2.5 h-2.5 rounded-full bg-white" /> : <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />)}
        {located ? "Live" : "Live Location"}
      </button>
      {registerMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
          <button
            onClick={startNewPolygon}
            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg transition-colors"
          >
            {isDrawing ? "Draw (click corners)" : "Start New Area"}
          </button>
          {isDrawing && (
            <button
              onClick={finishPolygon}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg transition-colors"
            >
              Finish Area
            </button>
          )}
        </div>
      )}
      {registerMode && isDrawing && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
          Click points on the map to outline your land, click near the first point to close
        </div>
      )}
      {located && (
        <div className="absolute bottom-3 right-3 z-[1000] bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Live location on
        </div>
      )}
    </div>
  );
}
