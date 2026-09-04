"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface MapInnerProps {
  center: [number, number];
  markerPos: [number, number] | null;
  mapType: "satellite" | "street";
  onMapClick: (lat: number, lng: number) => void;
  onMarkerDrag: (lat: number, lng: number) => void;
}

export default function MapInner({ center, markerPos, mapType, onMapClick, onMarkerDrag }: MapInnerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = require("leaflet");

    const satelliteTiles = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    const streetTiles = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const labelsTiles = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

    const map = L.map(mapRef.current, {
      center: center,
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
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = require("leaflet");
    mapInstanceRef.current.flyTo(center, mapInstanceRef.current.getZoom(), { duration: 1.5 });
  }, [center]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerPos) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    if (markerRef.current) {
      markerRef.current.setLatLng(markerPos);
    } else {
      const greenIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background: #16a34a; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <div style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: bold;">C</div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker(markerPos, { icon: greenIcon, draggable: true }).addTo(map);

      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        onMarkerDrag(pos.lat, pos.lng);
      });

      markerRef.current = marker;
    }
  }, [markerPos]);

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

  return <div ref={mapRef} className="w-full h-full" />;
}
