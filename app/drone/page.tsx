"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Plane, Video, Wrench, Route, ArrowLeft, ArrowRight, Camera, Smartphone,
  MonitorSmartphone, Wifi, Bluetooth, Download, Play, Square, BatteryCharging,
  Signal, MapPin, Zap, Check, Loader2, Satellite, RefreshCw, Crosshair, X,
} from "lucide-react";

const TAB_NAV = [
  { id: "pair", label: "Connect", icon: Wifi },
  { id: "fly", label: "Live View", icon: Video },
  { id: "mission", label: "Mission", icon: Route },
  { id: "make", label: "Make", icon: Wrench },
];

const BUILD_PARTS = [
  { name: "Flight Controller", qty: 1, rs: 1250, spec: "Betaflight F4 / F7 with barometer & GPS" },
  { name: "Brushless Motors", qty: 4, rs: 2400, spec: "2212 920kV + 1045 propellers" },
  { name: "ESC Speed Controllers", qty: 4, rs: 1800, spec: "30A BLHeli_S, 2-4S support" },
  { name: "Camera & FPV", qty: 1, rs: 2200, spec: "1080p HD with analog/HD FPV transmitter" },
  { name: "LiPo Battery", qty: 1, rs: 1800, spec: "3S 5200mAh, 12-18 min flight" },
  { name: "Frame & Landing Gear", qty: 1, rs: 950, spec: "450mm quad, foldable arms" },
  { name: "GPS + Compass", qty: 1, rs: 850, spec: "Ublox NEO-M8N, heading lock" },
  { name: "Radio Receiver", qty: 1, rs: 700, spec: "2.4GHz, 6-channel SBUS" },
];

const BUILD_STEPS = [
  { title: "Mount motors & ESCs", desc: "Screw the 4 motors onto the arms, solder ESCs and mount them under the motor plates with heatshrink." },
  { title: "Install flight controller", desc: "Fix the FC on the top plate using silicone pads (absorbs vibration), connect the 4 ESC signal wires to motor outputs 1-4." },
  { title: "Attach GPS & compass", desc: "Mount GPS on a pole away from the FC for clean signals. Compass faces front; trim yaw to exact alignment." },
  { title: "Wire camera & FPV", desc: "Power the camera from the battery lead through a BEC. Connect video signal to the FPV transmitter, antenna pointed up." },
  { title: "Connect receiver", desc: "Bind the 2.4GHz receiver to the transmitter first, then plug SBUS wire into the FC receiver port." },
  { title: "Battery & pre-flight", desc: "Balance-charge the LiPo (3S 11.1V). Do an ESC/motor test in Betaflight. Check GPS lock (>8 sats) before takeoff." },
];

const MISSION_PRESETS = [
  { label: "Grid survey", rows: 3, cols: 4, spacingM: 30, altM: 60 },
  { label: "Field sweep", rows: 2, cols: 3, spacingM: 25, altM: 50 },
  { label: "Tree scan", rows: 2, cols: 2, spacingM: 20, altM: 40 },
];

function useMemoGrid(c: number, r: number) {
  const pts: { x: number; y: number }[] = [];
  for (let j = 0; j < r; j++) {
    if (j % 2 === 0) for (let i = 0; i < c; i++) pts.push({ x: i, y: j });
    else for (let i = c - 1; i >= 0; i--) pts.push({ x: i, y: j });
  }
  return pts;
}

export default function DronePage() {
  const [tab, setTab] = useState("pair");

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <section className="bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,255,255,.6) 0 1.5px, transparent 1.6px), radial-gradient(circle at 80% 70%, rgba(255,255,255,.4) 0 1.5px, transparent 1.6px)", backgroundSize: "26px 26px" }} />
        <div className="absolute -right-14 -top-14 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 relative">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <Plane className="w-4 h-4 text-sky-300" /> Farm Drone Command
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-2xl">
            Drone survey, live capture & DIY build
          </h1>
          <p className="mt-3 text-slate-300 md:text-lg max-w-xl">
            Pair your drone with a laptop or phone, watch the live camera, plan survey missions over your
            land and learn to build the drone yourself.
          </p>
        </div>
      </section>

      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TAB_NAV.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? "border-sky-600 text-sky-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 pt-8">
        {tab === "pair" && <PairTab />}
        {tab === "fly" && <FlyTab />}
        {tab === "mission" && <MissionTab />}
        {tab === "make" && <MakeTab />}
      </section>
    </main>
  );
}

function PairTab() {
  const [device, setDevice] = useState<"laptop" | "mobile">("laptop");
  const [connected, setConnected] = useState(false);
  const [bat, setBat] = useState(86);
  const [qr, setQr] = useState<string | null>(null);

  const pairingPayload =
    device === "laptop"
      ? "kisan-drone://pair?v=1&mode=wifi&ssid=FarmLink-2.4G&psk=KisanCarbon2026&chan=6"
      : "kisan-drone://pair?v=1&mode=hotspot&ssid=KISAN-DRONE-5G&code=4837&chan=149";

  useEffect(() => {
    let live = true;
    setQr(null);
    QRCode.toDataURL(pairingPayload, { width: 440, margin: 1, errorCorrectionLevel: "M" })
      .then((u) => { if (live) setQr(u); })
      .catch(() => { if (live) setQr(null); });
    const t = setInterval(() => setBat((b) => (b > 5 ? b - 1 : 86)), 20000);
    setConnected(false);
    return () => { live = false; clearInterval(t); };
  }, [device]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-sky-600" /> Pair your drone
        </h2>
        <p className="text-sm text-gray-500 mt-1 mb-5">Choose the device that will control the drone, then scan the QR with the drone's camera or controller app.</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => setDevice("laptop")}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${device === "laptop" ? "border-sky-600 bg-sky-50 text-sky-700" : "border-gray-200 hover:border-gray-300 text-gray-500"}`}
          >
            <MonitorSmartphone className="w-6 h-6" />
            <span className="text-sm font-bold">Laptop</span>
            <span className="text-xs text-gray-400">Wi-Fi mode 2.4GHz</span>
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${device === "mobile" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-200 hover:border-gray-300 text-gray-500"}`}
          >
            <Smartphone className="w-6 h-6" />
            <span className="text-sm font-bold">Mobile</span>
            <span className="text-xs text-gray-400">Hotspot mode 5GHz</span>
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
          {qr ? <img src={qr} alt="Pairing QR" width={220} height={220} className="bg-white rounded-lg" /> : (
            <div className="w-[220px] h-[220px] bg-gray-100 rounded-lg flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
            </div>
          )}
          <div className="text-xs text-gray-500 mt-3 font-mono break-all text-center">
            {pairingPayload}
          </div>
        </div>

        <button
          onClick={() => setConnected(true)}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-3 rounded-xl transition-colors"
        >
          {connected ? <Check className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {connected ? "Connected — starting link" : "Simulate pairing"}
        </button>
        {connected && (
          <p className="mt-3 text-sm text-emerald-600 font-semibold flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Link established. Open the Live View tab to watch the camera.
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Drone telemetry</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-2"><Signal className="w-4 h-4 text-emerald-500" /> Link quality</span>
            <span className="text-sm font-bold text-emerald-600">96%</span>
          </div>
          <div className="h-2 rounded bg-gray-100"><div className="h-2 rounded bg-emerald-500" style={{ width: "96%" }} /></div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-2"><BatteryCharging className="w-4 h-4 text-sky-500" /> Battery</span>
            <span className="text-sm font-bold text-gray-800">{bat}%</span>
          </div>
          <div className="h-2 rounded bg-gray-100"><div className={`h-2 rounded ${bat > 30 ? "bg-sky-500" : "bg-red-500"}`} style={{ width: `${bat}%` }} /></div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-2"><Signal className="w-4 h-4 text-sky-500" /> GPS satellites</span>
            <span className="text-sm font-bold text-gray-800">11</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4 text-red-500" /> Position</span>
            <span className="text-sm font-bold text-gray-800">26.9124° N, 80.9639° E</span>
          </div>
        </div>
        <div className="mt-5 rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-slate-800 p-3 font-mono text-xs text-green-400 space-y-1">
            <div>&gt; drone: link ok ({device})</div>
            <div>&gt; fpv: 1080p @30fps</div>
            <div>&gt; gps: 11 sats, hdop 0.8</div>
            <div>&gt; throttle: armed</div>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(pairingPayload)}`} download="drone-pair.qr.txt" className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Save QR
          </a>
          <button onClick={() => setConnected(false)} className="flex-1 inline-flex items-center justify-center gap-2 border border-red-200 text-red-600 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors">
            <X className="w-4 h-4" /> Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}

function FlyTab() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<"camera" | "sim">("camera");
  const [live, setLive] = useState(false);
  const [camErr, setCamErr] = useState<string | null>(null);
  const [shots, setShots] = useState<string[]>([]);
  const [simSway, setSimSway] = useState(0);

  const startCamera = useCallback(async () => {
    setCamErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setLive(true);
    } catch {
      setCamErr("Camera blocked or unavailable. Use the simulated feed below.");
      setLive(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
  }, []);

  useEffect(() => {
    if (mode === "camera") startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  useEffect(() => {
    if (mode !== "sim") return;
    const t = setInterval(() => setSimSway((s) => (s + 1) % 360), 60);
    return () => clearInterval(t);
  }, [mode]);

  const capture = () => {
    const canvas = document.createElement("canvas");
    if (mode === "camera" && videoRef.current) {
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    } else {
      canvas.width = 640;
      canvas.height = 480;
      const c = canvas.getContext("2d")!;
      const grad = c.createLinearGradient(0, 0, 0, 480);
      grad.addColorStop(0, "#a7d98c");
      grad.addColorStop(1, "#5b8f3f");
      c.fillStyle = grad;
      c.fillRect(0, 0, 640, 480);
      for (let i = 0; i < 24; i++) {
        const x = ((i * 97 + simSway * 2) % 640 + 640) % 640;
        const y = 60 + ((i * 53) % 360);
        c.beginPath();
        c.arc(x, y, 12 + (i % 3) * 5, 0, Math.PI * 2);
        c.fillStyle = `rgba(36, 94, 38, ${0.5 + (i % 4) * 0.1})`;
        c.fill();
      }
      c.strokeStyle = "rgba(255,255,255,0.35)";
      c.lineWidth = 2;
      for (let i = 1; i < 6; i++) {
        const w = i * Math.min(8, 60 / (i * 2));
        c.beginPath();
        c.arc(320, 240, w + 2, 0, Math.PI * 2);
        c.stroke();
      }
      c.fillStyle = "rgba(255,255,255,0.85)";
      c.font = "bold 14px monospace";
      c.fillText("250m", 466, 238);
      c.fillText("DRONE-FPV 1080p", 14, 26);
      const ts = new Date().toLocaleTimeString();
      c.fillText(`REC ${ts}`, 14, 456);
      c.fillStyle = "#22c55e";
      c.fillRect(318, 238, 4, 4);
    }
    const url = canvas.toDataURL("image/jpeg", 0.85);
    setShots((s) => [url, ...s].slice(0, 24));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-black rounded-2xl overflow-hidden shadow-lg relative">
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-red-400">
            <span className={`w-2 h-2 rounded-full ${live ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
            {live ? "REC" : "OFFLINE"}
          </div>
          <div className="bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold text-white">
            {mode === "camera" ? "Phone camera (drone POV)" : "Simulated FPV"}
          </div>
        </div>
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            onClick={() => setMode("camera")}
            className={`text-xs font-bold px-3 py-1.5 rounded-full ${mode === "camera" ? "bg-sky-500 text-white" : "bg-black/50 text-white border border-white/20"}`}
          >
            Camera
          </button>
          <button
            onClick={() => setMode("sim")}
            className={`text-xs font-bold px-3 py-1.5 rounded-full ${mode === "sim" ? "bg-emerald-500 text-white" : "bg-black/50 text-white border border-white/20"}`}
          >
            Simulate
          </button>
        </div>

        <div className="relative aspect-video w-full">
          <video ref={videoRef} muted playsInline className={`w-full h-full object-cover ${mode === "camera" && live ? "block" : "hidden"}`} />
          {mode === "sim" && (
            <canvas
              width={640}
              height={480}
              className="w-full h-full object-cover"
              ref={(el) => {
                if (!el) return;
                const c = el.getContext("2d")!;
                const grad = c.createLinearGradient(0, 0, 0, 480);
                grad.addColorStop(0, "#a7d98c");
                grad.addColorStop(1, "#5b8f3f");
                c.fillStyle = grad;
                c.fillRect(0, 0, 640, 480);
                for (let i = 0; i < 24; i++) {
                  const x = ((i * 97 + simSway * 2) % 640 + 640) % 640;
                  const y = 60 + ((i * 53) % 360);
                  c.beginPath();
                  c.arc(x, y, 12 + (i % 3) * 5, 0, Math.PI * 2);
                  c.fillStyle = `rgba(36, 94, 38, ${0.5 + (i % 4) * 0.1})`;
                  c.fill();
                }
                c.strokeStyle = "rgba(255,255,255,0.35)";
                c.lineWidth = 2;
                for (let i = 1; i < 6; i++) {
                  const w = i * 6;
                  c.beginPath();
                  c.arc(320, 240, w + 2, 0, Math.PI * 2);
                  c.stroke();
                }
                c.fillStyle = "rgba(255,255,255,0.85)";
                c.font = "bold 14px monospace";
                c.fillText("250m", 466, 238);
                c.fillText("DRONE-FPV 1080p", 14, 26);
                c.fillText(`REC ${new Date().toLocaleTimeString()}`, 14, 456);
                c.fillStyle = "#22c55e";
                c.fillRect(318, 238, 4, 4);
              }}
            />
          )}
          {mode === "camera" && !live && (
            <div className="absolute inset-0 flex items-center justify-center">
              {camErr ? (
                <div className="text-center px-6">
                  <Camera className="w-10 h-10 text-white/50 mx-auto mb-3" />
                  <p className="text-sm text-white/80">{camErr}</p>
                  <p className="text-xs text-white/50 mt-1">Switch to "Simulate" to preview a mission feed.</p>
                </div>
              ) : (
                <Loader2 className="w-10 h-10 animate-spin text-white/60" />
              )}
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(transparent 55%, rgba(0,0,0,.4))" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-70">
            <Crosshair className="w-9 h-9 text-white/70" />
          </div>
        </div>

        <div className="bg-black/80 backdrop-blur px-4 py-3 flex items-center justify-between">
          <div className="text-xs font-mono text-green-400 space-y-0.5">
            <div>ALT 58m · SPD 4.2 m/s · HRT {Math.round(Math.sin(simSway / 18) * 30)}°</div>
            <div>LAT 26.9124 · LON 80.9639</div>
          </div>
          <button
            onClick={capture}
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Camera className="w-4 h-4" /> Capture
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Camera className="w-5 h-5 text-sky-600" /> Captured images ({shots.length})
        </h3>
        {shots.length === 0 ? (
          <div className="text-sm text-gray-400 bg-gray-50 rounded-xl p-6 text-center">
            No captures yet. Hit <b>Capture</b> to save a frame — images download to this device.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 mb-4 max-h-80 overflow-y-auto pr-1">
              {shots.map((s, i) => (
                <a key={i} href={s} download={`drone-shot-${Date.now()}-${i}.jpg`} className="block rounded-lg overflow-hidden border border-gray-200 hover:opacity-90">
                  <img src={s} alt={`Capture ${i + 1}`} className="w-full aspect-video object-cover" />
                </a>
              ))}
            </div>
            <a
              href={shots[0]}
              download={`drone-shot-${Date.now()}.jpg`}
              className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-800"
            >
              <Download className="w-4 h-4" /> Download latest
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function MissionTab() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [spacing, setSpacing] = useState(30);
  const [alt, setAlt] = useState(60);
  const [wp, setWp] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => setWp(useMemoGrid(cols, rows)), [rows, cols]);

  const coverageArea = rows * cols * (spacing * spacing) / 10000;
  const flightM = wp.length * Math.max(spacing, 20) + rows * 40;
  const flightMin = Math.round(flightM / 380);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
          <Route className="w-5 h-5 text-sky-600" /> Mission planner
        </h2>
        <div className="flex flex-wrap gap-2 mb-5">
          {MISSION_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setRows(p.rows); setCols(p.cols); setSpacing(p.spacingM); setAlt(p.altM); }}
              className={`text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${rows === p.rows && cols === p.cols ? "bg-sky-600 border-sky-600 text-white" : "border-gray-300 text-gray-600 hover:border-sky-400"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-4 gap-3 mb-5">
          <Field label="Rows" value={rows} onChange={setRows} min={1} max={8} />
          <Field label="Columns" value={cols} onChange={setCols} min={1} max={8} />
          <Field label="Spacing (m)" value={spacing} onChange={setSpacing} min={10} max={80} step={5} />
          <Field label="Altitude (m)" value={alt} onChange={setAlt} min={20} max={120} step={5} />
        </div>

        <div className="relative bg-green-50 rounded-xl p-4 border border-green-100" style={{ aspectRatio: "4/3" }}>
          <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(22,163,74,.08) 40px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(22,163,74,.08) 50px)" }} />
          {wp.map((p, i) => (
            <div
              key={i}
              className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full bg-sky-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow"
              style={{ left: `${((p.x + 0.5) / (cols)) * 100}%`, top: `${((p.y + 0.5) / rows) * 100}%` }}
            >
              {i + 1}
            </div>
          ))}
          {wp.slice(1).map((p, i) => (
            <svg key={`l${i}`} className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1={`${((wp[i].x + 0.5) / cols) * 100}%`}
                y1={`${((wp[i].y + 0.5) / rows) * 100}%`}
                x2={`${((p.x + 0.5) / cols) * 100}%`}
                y2={`${((p.y + 0.5) / rows) * 100}%`}
                stroke="#0ea5e9"
                strokeDasharray="5 4"
                strokeWidth="1.5"
              />
            </svg>
          ))}
          <div className="absolute bottom-2 left-2 bg-white/90 rounded-lg px-2.5 py-1 text-[10px] font-mono text-gray-600">
            {wp.length} waypoints
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Mission summary</h3>
          <div className="space-y-3 text-sm">
            {[
              { l: "Waypoints", v: wp.length },
              { l: "Coverage", v: `${coverageArea.toFixed(1)} ha` },
              { l: "Track length", v: `${Math.round(flightM)} m` },
              { l: "Estimated time", v: `~${flightMin} min` },
              { l: "Survey altitude", v: `${alt} m` },
              { l: "Overlap (front)", v: "70%" },
            ].map((r) => (
              <div key={r.l} className="flex items-center justify-between">
                <span className="text-gray-500">{r.l}</span>
                <span className="font-bold text-gray-800">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-3">Pre-flight checklist</h3>
          {["GPS lock ≥ 8 sats", "Battery ≥ 40%", "Propellers secured", "No people near takeoff", "Home point recorded"].map((s, i) => (
            <div key={s} className="flex items-center gap-2 text-sm text-gray-600 py-1.5">
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${i < 3 ? "border-emerald-500 text-emerald-600" : "border-gray-300 text-gray-400"}`}>
                {i < 3 ? <Check className="w-3 h-3" /> : ""}
              </span>
              {s}
            </div>
          ))}
          <button className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-3 rounded-xl transition-colors">
            <Play className="w-4 h-4" /> Start mission
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
      />
    </label>
  );
}

function MakeTab() {
  const [stepIdx, setStepIdx] = useState(0);
  const totalParts = BUILD_PARTS.reduce((s, p) => s + p.qty * p.rs, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-sky-600" /> DIY drone build guide
        </h2>
        <p className="text-sm text-gray-500 mt-1">Build a quadcopter that can carry the survey camera and stream live video to your laptop or phone.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Parts & cost (₹ {totalParts.toLocaleString("en-IN")})</h3>
          <div className="space-y-3">
            {BUILD_PARTS.map((p) => (
              <div key={p.name} className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{p.name} <span className="text-gray-400">×{p.qty}</span></div>
                  <div className="text-xs text-gray-500">{p.spec}</div>
                </div>
                <div className="text-sm font-bold text-green-700 whitespace-nowrap">₹ {(p.qty * p.rs).toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Assembly steps</h3>
          <div className="space-y-2 mb-4">
            {BUILD_STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => setStepIdx(i)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${stepIdx === i ? "bg-sky-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
              >
                <span className="text-xs font-bold">{i + 1}.</span> {s.title}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-800 mb-1">{stepIdx + 1}. {BUILD_STEPS[stepIdx].title}</div>
            <p className="text-sm text-gray-500">{BUILD_STEPS[stepIdx].desc}</p>
          </div>
          <div className="mt-4 rounded-xl bg-slate-800 p-4 text-xs text-green-400 font-mono space-y-1">
            <div>&gt; wiring: ESC1-4 → FC motors 1-4 (CW/CCW pairs)</div>
            <div>&gt; power: XT60 → PDB → FC & VTX</div>
            <div>&gt; cam: 5V BEC → camera, video → VTX in</div>
            <div>&gt; rc: SBUS → FC RX1, GPS → FC UART2</div>
          </div>
        </div>
      </div>
    </div>
  );
}