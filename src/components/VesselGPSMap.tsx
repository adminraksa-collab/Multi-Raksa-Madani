import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Anchor, Navigation, ShieldCheck, 
  Wifi, HelpCircle, RefreshCw, Play, Pause, AlertCircle, ChevronRight
} from 'lucide-react';
import { ExportShipment } from '../types';

interface VesselGPSProps {
  shipment: ExportShipment;
}

// Defining geodesic route coordinate points for the SVG drawing (scaled from width 500, height 250)
interface RoutePoint {
  x: number;
  y: number;
  name: string;
  lat: string;
  lng: string;
}

export default function VesselGPSMap({ shipment }: VesselGPSProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0.42); // starts at 42% along the ocean path
  const [lat, setLat] = useState('-2.1892');
  const [lng, setLng] = useState('98.2415');
  const [vesselSpeed, setVesselSpeed] = useState(14.5);
  const [cargoTemp, setCargoTemp] = useState(24.2);
  const [vesselHeading, setVesselHeading] = useState('312° NW');
  const [wifiPing, setWifiPing] = useState(48);

  const requestRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);

  // Determine route based on destination
  const isJapan = shipment.portOfDischarge.toLowerCase().includes('japan') || shipment.portOfDischarge.toLowerCase().includes('tokyo') || shipment.portOfDischarge.toLowerCase().includes('yokohama');
  const isUSA = shipment.portOfDischarge.toLowerCase().includes('usa') || shipment.portOfDischarge.toLowerCase().includes('new york');

  // Define route points
  const points: RoutePoint[] = isJapan ? [
    { x: 120, y: 190, name: 'Tanjung Priok, Jakarta', lat: '-6.1023', lng: '106.8821' },
    { x: 180, y: 140, name: 'Selat Sunda', lat: '-5.8234', lng: '105.9182' },
    { x: 250, y: 100, name: 'Laut China Selatan', lat: '5.2012', lng: '112.4412' },
    { x: 330, y: 70, name: 'Selat Filipina', lat: '14.1202', lng: '122.9015' },
    { x: 440, y: 45, name: 'Port of Tokyo, Japan', lat: '35.6124', lng: '139.7785' },
  ] : isUSA ? [
    { x: 40, y: 180, name: 'Tanjung Priok, Jakarta', lat: '-6.1023', lng: '106.8821' },
    { x: 140, y: 150, name: 'Samudra Pasifik Barat', lat: '1.2045', lng: '128.4512' },
    { x: 260, y: 120, name: 'Satelit Mariana', lat: '15.9102', lng: '145.2411' },
    { x: 370, y: 100, name: 'Transit Hawaii', lat: '19.8968', lng: '-155.5828' },
    { x: 460, y: 60, name: 'Port of New York, USA', lat: '40.7128', lng: '-74.0060' },
  ] : [
    // Default Europe Route
    { x: 440, y: 190, name: 'Tanjung Priok, Jakarta', lat: '-6.1023', lng: '106.8821' },
    { x: 370, y: 160, name: 'Selat Malaka', lat: '2.1456', lng: '102.2411' },
    { x: 280, y: 130, name: 'Samudra Hindia Tengah', lat: '5.2918', lng: '80.2015' },
    { x: 190, y: 90, name: 'Teluk Aden', lat: '12.4215', lng: '48.9102' },
    { x: 120, y: 70, name: 'Terusan Suez, Egypt', lat: '29.9752', lng: '32.5312' },
    { x: 50, y: 45, name: 'Port of Hamburg, Germany', lat: '53.5352', lng: '9.9872' },
  ];

  // Map progress to route points
  useEffect(() => {
    if (progress < 0) setProgress(0);
    if (progress > 1) setProgress(1);

    const stepCount = points.length - 1;
    const rawIndex = progress * stepCount;
    const index = Math.floor(rawIndex);
    const fraction = rawIndex - index;

    if (index >= stepCount) {
      const lastPoint = points[points.length - 1];
      setLat(lastPoint.lat);
      setLng(lastPoint.lng);
      return;
    }

    const startPoint = points[index];
    const endPoint = points[index + 1];

    const latNum = parseFloat(startPoint.lat) + (parseFloat(endPoint.lat) - parseFloat(startPoint.lat)) * fraction;
    const lngNum = parseFloat(startPoint.lng) + (parseFloat(endPoint.lng) - parseFloat(startPoint.lng)) * fraction;

    setLat(latNum.toFixed(4));
    setLng(lngNum.toFixed(4));

    // Simulate micro variabilities
    const hNo = Math.round(300 + (index * 12) + (fraction * 15)) % 360;
    setVesselHeading(`${hNo}° ${hNo > 315 || hNo < 45 ? 'N' : hNo >= 45 && hNo < 135 ? 'E' : hNo >= 135 && hNo < 225 ? 'S' : 'W'}${hNo > 270 && hNo < 360 ? 'NW' : ''}`);
    setCargoTemp(parseFloat((23.8 + Math.sin(progress * 15) * 0.9).toFixed(1)));
    setWifiPing(Math.floor(40 + Math.random() * 15));
  }, [progress, isJapan, isUSA]);

  // Tick the sail animation
  const animateSail = (time: number) => {
    if (prevTimeRef.current !== null) {
      const deltaTime = time - prevTimeRef.current;
      if (isPlaying) {
        setProgress(prev => {
          if (prev >= 1.0) {
            return 0.0; // loops back for continuous simulation
          }
          return prev + (deltaTime * 0.00002 * (vesselSpeed / 14.5));
        });
      }
    }
    prevTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animateSail);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateSail);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, vesselSpeed]);

  const toggleAutoplay = () => setIsPlaying(!isPlaying);
  
  const handleReset = () => {
    setProgress(0.0);
    setIsPlaying(true);
  };

  const handleStep = (target: number) => {
    setProgress(target);
    setIsPlaying(false);
  };

  // Convert points to SVG polyline format
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Get current boat pixel position
  const getVesselPixelPos = () => {
    const stepCount = points.length - 1;
    const rawIndex = progress * stepCount;
    const index = Math.floor(rawIndex);
    const fraction = rawIndex - index;

    if (index >= stepCount) return points[points.length - 1];

    const start = points[index];
    const end = points[index + 1];

    return {
      x: start.x + (end.x - start.x) * fraction,
      y: start.y + (end.y - start.y) * fraction
    };
  };

  const boatPos = getVesselPixelPos();

  return (
    <div className="bg-slate-950 border-2 border-indigo-950 rounded-2xl p-5 shadow-2xl text-left overflow-hidden relative">
      
      {/* Decorative cyber grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40"></div>

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-indigo-900/50 pb-3 mb-4 gap-2 relative z-10">
        <div>
          <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest block font-mono bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/30 w-fit">
            &bull; TELEMETRI SATELIT GPS AKTIF (REAL-TIME)
          </span>
          <h3 className="text-sm font-black font-sans text-slate-100 flex items-center gap-1.5 mt-1">
            <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
            Live Vessel Tracker: {shipment.vesselName || 'MV Samudera Pasifik'}
          </h3>
        </div>
        
        {/* Signal Status Pill */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-emerald-950 px-2.5 py-1 rounded-full text-[10px]">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute"></span>
          <span className="text-emerald-400 font-mono font-bold">IoT SECURE: L-BAND LINK</span>
          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
        </div>
      </div>

      {/* Grid Layout: Visual Map Column 2/3 & Digital Dashboard telemetry Column 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
        
        {/* Visual Map Canvas Container */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-xl border border-indigo-900/40 p-3 h-[280px] relative overflow-hidden flex items-center justify-center">
          
          {/* Radial radar ring sweeps in the background */}
          <div className="absolute w-[400px] h-[400px] rounded-full border border-indigo-950/20 animate-spin-slow pointer-events-none"></div>
          
          <svg className="w-full h-full min-w-[450px]" viewBox="0 0 500 250" xmlns="http://www.w3.org/2000/svg">
            
            {/* Outline drawing of simplified continents as backgrounds */}
            {/* Southeast Asia block */}
            <path d="M 280 180 Q 290 200 320 220 T 380 230 T 400 200 T 360 170 T 300 160 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" opacity="0.6" />
            <path d="M 80 140 Q 120 180 160 210 T 210 220 Z" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 3" opacity="0.3" />
            
            {/* Europe / Middle East Lands */}
            <path d="M 10 20 Q 50 30 100 40 T 140 30 T 120 70 T 90 90 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" opacity="0.6" />
            <path d="M 170 60 Q 190 70 210 50 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" opacity="0.6" />
            
            {/* Japan Arc Lands if appropriate */}
            {isJapan && (
              <path d="M 400 40 Q 420 30 450 50 T 480 80" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
            )}

            {/* Geodesic Track Dotted Line Waypoints */}
            <path 
              d={pathD} 
              fill="none" 
              stroke="rgba(99, 102, 241, 0.25)" 
              strokeWidth="2.5" 
              strokeDasharray="4 4"
            />

            {/* Completed path track overlay (colored green) */}
            <path 
              d={pathD} 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="2" 
              strokeDasharray="6 4"
              strokeDashoffset="0"
              style={{
                strokeDasharray: '350',
                strokeDashoffset: (350 - 350 * progress).toString()
              }}
              opacity="0.8"
            />

            {/* Render Waypoint Pins */}
            {points.map((pt, i) => {
              const isStart = i === 0;
              const isEnd = i === points.length - 1;
              const isPassed = progress >= i / (points.length - 1);
              
              return (
                <g key={pt.name} transform={`translate(${pt.x}, ${pt.y})`}>
                  <circle 
                    r={isStart || isEnd ? "4.5" : "3"} 
                    fill={isEnd ? "#ef4444" : isPassed ? "#10b981" : "#1e1b4b"} 
                    stroke={isEnd ? "#fca5a5" : isPassed ? "#34d399" : "#312e81"}
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onClick={() => handleStep(i / (points.length - 1))}
                  />
                  
                  {/* Waypoint Text Label */}
                  <text 
                    y="-9" 
                    textAnchor="middle" 
                    className="font-mono text-[7.5px] fill-slate-400 font-extrabold tracking-tight pointer-events-none select-none select-none"
                  >
                    {pt.name}
                  </text>
                </g>
              );
            })}

            {/* Animated Vessel Icon mapping dynamically the progress state */}
            <g transform={`translate(${boatPos.x}, ${boatPos.y})`}>
              {/* Pulsing beacon radar echo */}
              <circle r="14" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="0.5" className="animate-ping" />
              <circle r="7" fill="rgba(52, 211, 153, 0.2)" />
              
              {/* Ship shape pointer directional */}
              <polygon 
                points="0,-6 4,4 0,2 -4,4" 
                fill="#10b981" 
                stroke="#d1fae5" 
                strokeWidth="1"
                transform={isJapan ? "rotate(60)" : "rotate(-75)"}
              />
            </g>

          </svg>

          {/* Current geographic focus caption overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-indigo-900/60 rounded px-2.5 py-1 text-[9px] font-mono select-none">
            <span className="text-slate-400">Kapal Pengangkut: </span>
            <span className="text-indigo-300 font-black">{shipment.productName} ({shipment.quantity} {shipment.unit})</span>
          </div>

          {/* Controls Bar nested bottom right */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20">
            <button
              onClick={toggleAutoplay}
              title={isPlaying ? 'Pause Transit Simulation' : 'Start Auto Sail'}
              className="p-1 px-2.5 rounded bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-[9px] font-black uppercase text-indigo-200 transition-colors flex items-center gap-1 active:scale-95 shadow-3xs"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-amber-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  <span>Simulate</span>
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              title="Reset Ship to Jakarta Port"
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors active:scale-95 shadow-3xs border border-slate-700"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

        </div>

        {/* Diagnostic Dashboard Telemetry Panel */}
        <div className="bg-slate-900 rounded-xl border border-indigo-950 p-4 font-mono text-xs text-indigo-200/90 space-y-3.5 flex flex-col justify-between">
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] text-indigo-400 border-b border-indigo-950 pb-1.5">
              <span>SATELLITE DOWNLINK</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                ONLINE
              </span>
            </div>

            {/* Position coordinate metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/80 p-2 rounded border border-indigo-950">
                <span className="text-[8px] text-indigo-400 block tracking-wider uppercase">LINTANG (LAT)</span>
                <span className="text-[11px] font-black text-slate-200 block mt-0.5">{lat}°</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded border border-indigo-950">
                <span className="text-[8px] text-indigo-400 block tracking-wider uppercase">BUJUR (LNG)</span>
                <span className="text-[11px] font-black text-slate-200 block mt-0.5">{lng}°</span>
              </div>
            </div>

            {/* Micro Telemetry table */}
            <div className="space-y-2 text-[10px]">
              
              <div className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-400">Haluan Kapal (Heading) :</span>
                <span className="text-slate-100 font-extrabold">{vesselHeading}</span>
              </div>

              <div className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-400">Kecepatan Log (Speed) :</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-400 font-extrabold font-mono">{vesselSpeed.toFixed(1)} Knot</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    value={vesselSpeed} 
                    onChange={(e) => setVesselSpeed(parseFloat(e.target.value))}
                    className="w-14 accent-indigo-500 h-1"
                  />
                </div>
              </div>

              <div className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-400">Suhu Cold Container :</span>
                <span className={`font-extrabold font-mono ${cargoTemp > 24.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {cargoTemp}°C
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-400">Ping Satelit (Iridium) :</span>
                <span className="text-slate-350">{wifiPing} ms</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Progres Pelayaran :</span>
                <span className="text-indigo-300 font-black">{Math.round(progress * 100)}% Selesai</span>
              </div>

            </div>
          </div>

          {/* Quick-simulate buttons */}
          <div className="space-y-1.5 pt-3 border-t border-indigo-950">
            <span className="text-[8px] text-indigo-400 font-bold uppercase tracking-wider block">LOMPAT RUTE SIMULASI</span>
            <div className="grid grid-cols-3 gap-1">
              <button 
                onClick={() => handleStep(0.0)}
                className={`p-1 rounded text-[8px] font-bold uppercase border hover:-translate-y-0.2 transition-all transition-transform active:scale-95 ${progress < 0.2 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-indigo-300 border-indigo-900/40'}`}
              >
                Jakarta (0%)
              </button>
              <button 
                onClick={() => handleStep(0.5)}
                className={`p-1 rounded text-[8px] font-bold uppercase border hover:-translate-y-0.2 transition-all transition-transform active:scale-95 ${progress >= 0.4 && progress < 0.7 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-indigo-300 border-indigo-900/40'}`}
              >
                Tengah (50%)
              </button>
              <button 
                onClick={() => handleStep(1.0)}
                className={`p-1 rounded text-[8px] font-bold uppercase border hover:-translate-y-0.2 transition-all transition-transform active:scale-95 ${progress > 0.8 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-indigo-300 border-indigo-900/40'}`}
              >
                Tujuan (100%)
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
