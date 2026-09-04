"use client";

import React, { useRef } from "react";
import {
  Building2,
  MapPin,
  Tag,
  Sparkles,
  Wand2,
  Camera,
  Image as ImageIcon,
  Upload,
  Link2,
} from "lucide-react";

export interface PropertyData {
  title: string;
  location: string;
  price: string;
  highlights: string;
}

export type InteriorDesign =
  | "modern"
  | "minimalist"
  | "industrial"
  | "classic"
  | "coastal";

export const INTERIOR_IMAGES: Record<InteriorDesign, string> = {
  modern:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop",
  minimalist:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80&auto=format&fit=crop",
  industrial:
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80&auto=format&fit=crop",
  classic:
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80&auto=format&fit=crop",
  coastal:
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80&auto=format&fit=crop",
};

const INTERIOR_LIST: { key: InteriorDesign; label: string }[] = [
  { key: "modern", label: "Modern" },
  { key: "minimalist", label: "Minimalist" },
  { key: "industrial", label: "Industrial" },
  { key: "classic", label: "Classic" },
  { key: "coastal", label: "Coastal" },
];

const PRESET_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop",
    label: "Luxury Villa",
  },
  {
    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80&auto=format&fit=crop",
    label: "Modern Home",
  },
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop",
    label: "Evening Villa",
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format&fit=crop",
    label: "Pool Villa",
  },
  {
    url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80&auto=format&fit=crop",
    label: "Living Room",
  },
  {
    url: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&q=80&auto=format&fit=crop",
    label: "Classic House",
  },
  {
    url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop",
    label: "Bungalow",
  },
  {
    url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80&auto=format&fit=crop",
    label: "White Home",
  },
];

interface InputPanelProps {
  data: PropertyData;
  onChange: (data: PropertyData) => void;
  image?: string;
  onImageChange?: (url: string) => void;
  onDownload?: () => void;
  isDownloading?: boolean;
  interior?: InteriorDesign;
  onInteriorChange?: (d: InteriorDesign) => void;
}

export default function InputPanel({
  data,
  onChange,
  image,
  onImageChange,
  onDownload,
  isDownloading = false,
  interior = "modern",
  onInteriorChange,
}: InputPanelProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      [name]: value,
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageChange) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onImageChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const fields = [
    {
      name: "title",
      label: "Property & Type",
      placeholder: "e.g. 4 BHK Luxury Villa, Ansal Golf City",
      icon: Building2,
      rows: undefined as number | undefined,
    },
    {
      name: "location",
      label: "Location",
      placeholder: "e.g. Sushant Golf City, Lucknow",
      icon: MapPin,
      rows: undefined as number | undefined,
    },
    {
      name: "price",
      label: "Price",
      placeholder: "e.g. ₹2.5 Cr onwards",
      icon: Tag,
      rows: undefined as number | undefined,
    },
  ];

  return (
    <div className="bg-white border border-stone-200 shadow-xl shadow-estate-900/5 rounded-3xl overflow-hidden flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-estate-700 via-estate-600 to-estate-500 p-5">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-amber-300" />
          </span>
          Create Your Property Post
        </h2>
        <p className="text-xs text-estate-100 mt-1.5">
          Fill the 4 details — logo, branding aur contact automatically add honge
        </p>
      </div>

      {/* Form Fields */}
      <div className="p-5 space-y-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              {f.label}
            </label>
            <div className="relative">
              <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-estate-500" />
              <input
                type="text"
                name={f.name}
                value={data[f.name as keyof PropertyData]}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20 focus:bg-white transition"
              />
            </div>
          </div>
        ))}

        {/* House Image Picker */}
        {/* Interior Design Type */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1">
              <Wand2 className="w-3.5 h-3.5 text-estate-500" /> Interior Design
            </span>
            <span className="uppercase text-[9px] font-semibold text-stone-400">
              Style choose karo
            </span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {INTERIOR_LIST.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => {
                  onInteriorChange?.(d.key);
                  onImageChange?.(INTERIOR_IMAGES[d.key]);
                }}
                className={`relative rounded-xl overflow-hidden border-2 aspect-[3/4] transition-all ${
                  interior === d.key
                    ? "border-amber-500 ring-2 ring-amber-500/40"
                    : "border-stone-200 hover:border-estate-400"
                }`}
              >
                <img
                  src={INTERIOR_IMAGES[d.key]}
                  alt={d.label}
                  className="w-full h-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] font-bold py-1 text-center">
                  {d.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-estate-500" /> House Image
            </span>
            <span className="uppercase text-[9px] font-semibold text-stone-400">
              Photo choose karo
            </span>
          </label>

          {/* Preset Gallery */}
          <div className="grid grid-cols-4 gap-2">
            {PRESET_IMAGES.map((p) => (
              <button
                key={p.url}
                type="button"
                onClick={() => onImageChange?.(p.url)}
                title={p.label}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                  image === p.url
                    ? "border-amber-500 ring-2 ring-amber-500/40"
                    : "border-stone-200 hover:border-estate-400"
                }`}
              >
                <img
                  src={p.url}
                  alt={p.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {image === p.url && (
                  <span className="absolute inset-0 bg-amber-500/25 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-white drop-shadow" />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="url"
                defaultValue={image && !image.startsWith("data:") ? image : ""}
                placeholder="Image URL paste karo..."
                onChange={(e) =>
                  e.target.value.trim() && onImageChange?.(e.target.value.trim())
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 pl-9 pr-3 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20 transition"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-estate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" /> Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Field 4: Highlights */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
            4. Highlights
          </label>
          <div className="relative">
            <Sparkles className="absolute left-3.5 top-3 w-4 h-4 text-estate-500" />
            <textarea
              name="highlights"
              rows={3}
              value={data.highlights}
              onChange={handleChange}
              placeholder="e.g. 3000 sq.ft · Corner plot · Ready to move"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-estate-500 focus:ring-2 focus:ring-estate-500/20 focus:bg-white transition resize-none"
            />
          </div>
          <p className="text-[10px] text-stone-400 mt-1">
            Dots (·) se separate karein — har dot ek tag/chip banega
          </p>
        </div>
      </div>

      {/* Download Button */}
      {onDownload && (
        <div className="p-5 pt-0">
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 font-extrabold text-stone-900 py-3.5 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="relative flex items-center justify-center gap-2">
              <Wand2
                className={`w-5 h-5 transition-transform duration-300 group-hover:rotate-12 ${
                  isDownloading ? "animate-spin" : ""
                }`}
              />
              {isDownloading
                ? "Generating High-Res PNG..."
                : "Download Ready-to-Share Post (PNG)"}
            </span>
          </button>
          <p className="text-center text-[10px] text-stone-400 mt-2">
            1080 × 1080 · High Resolution · Apex Estates branding included
          </p>
        </div>
      )}
    </div>
  );
}