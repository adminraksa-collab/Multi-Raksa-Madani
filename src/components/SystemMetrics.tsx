import React, { useState, useEffect } from 'react';
import { Database, Activity, RefreshCw, HardDrive, Info } from 'lucide-react';
import { getUsageStats, getSystemDocumentStats, getHistoricalUsageStats } from '../lib/usageTracker';
import { translations } from '../translations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface SystemMetricsProps {
  lang: string;
}

const READ_QUOTA_FREE = 50000;
const WRITE_QUOTA_FREE = 20000;
const STORAGE_QUOTA_FREE_BYTES = 1024 * 1024 * 1024; // 1 GB

export default function SystemMetrics({ lang }: SystemMetricsProps) {
  const [usageStats, setUsageStats] = useState<{ totalReads: number; totalWrites: number; lastUpdated: string } | null>(null);
  const [docStats, setDocStats] = useState<Record<string, { count: number, sizeBytes: number }> | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const t = translations[lang as keyof typeof translations] || translations.id;

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const stats = await getUsageStats();
      const docs = await getSystemDocumentStats();
      const history = await getHistoricalUsageStats(7);
      
      setUsageStats(stats);
      setDocStats(docs);
      setHistoryData(history);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalReads = usageStats?.totalReads || 0;
  const totalWrites = usageStats?.totalWrites || 0;

  const getChartData = (used: number, limit: number, isWrites: boolean) => {
    const usedFree = Math.min(used, limit);
    const overQuota = Math.max(0, used - limit);
    const remaining = Math.max(0, limit - used);
    
    return [
      { name: lang === 'id' ? 'Gratis Terpakai' : 'Free Used', value: usedFree, color: isWrites ? '#6366f1' : '#3b82f6' },
      ...(overQuota > 0 ? [{ name: lang === 'id' ? 'Pemakaian Berbayar' : 'Paid Usage', value: overQuota, color: '#ef4444' }] : []),
      ...(remaining > 0 ? [{ name: lang === 'id' ? 'Sisa Gratis' : 'Free Remaining', value: remaining, color: '#e2e8f0' }] : []),
    ];
  };

  const readData = getChartData(totalReads, READ_QUOTA_FREE, false);
  const writeData = getChartData(totalWrites, WRITE_QUOTA_FREE, true);

  const RATE_USD_TO_IDR = 15500;
  const READ_COST_100K = 0.036;
  const WRITE_COST_100K = 0.108;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-slate-200 rounded shadow-sm text-[10px]">
          <p className="font-semibold text-slate-700">{payload[0].name}</p>
          <p className="text-slate-600">{payload[0].value.toLocaleString()} {lang === 'id' ? 'ops' : 'ops'}</p>
        </div>
      );
    }
    return null;
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  let totalSizeBytes = 0;
  let totalDocs = 0;
  let collectionSizeData: any[] = [];
  
  if (docStats) {
    Object.entries(docStats).forEach(([col, stats]: [string, any]) => {
      totalSizeBytes += stats.sizeBytes;
      totalDocs += stats.count;
      collectionSizeData.push({
        name: col.replace('_', ' '),
        value: stats.sizeBytes,
        count: stats.count
      });
    });
    collectionSizeData.sort((a, b) => b.value - a.value);
  }
  
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];
  const getCollectionColor = (index: number) => COLORS[index % COLORS.length];

  const CollectionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-slate-200 rounded shadow-sm text-[10px]">
          <p className="font-semibold text-slate-700 capitalize">{data.name}</p>
          <p className="text-slate-600">{formatBytes(data.value)} ({data.count} docs)</p>
        </div>
      );
    }
    return null;
  };

  const HistoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-slate-200 rounded shadow-sm text-[10px]">
          <p className="font-semibold text-slate-700 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-slate-600 capitalize">{entry.name}: {entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full p-4 md:p-6 overflow-y-auto bg-slate-200">
      <div className="max-w-6xl mx-auto">
        {/* Header Compact */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              {lang === 'id' ? 'Dashboard Sistem' : 'System Dashboard'}
            </h1>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {lang === 'id' ? 'Pemantauan kuota, volume, & riwayat (estimasi internal).' : 'Quota, volume, & history monitoring (internal estimates).'}
            </p>
          </div>
          <button
            onClick={fetchMetrics}
            disabled={isLoading}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1.5 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {lang === 'id' ? 'Segarkan' : 'Refresh'}
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Today's Quota */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col h-auto min-h-[14rem]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-800">{lang === 'id' ? 'Kuota Hari Ini' : 'Today\'s Quota'}</h2>
              </div>
              <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Free Tier</span>
            </div>
            
            <div className="flex-1 flex gap-3">
              {/* Reads Donut */}
              <div className="flex-1 bg-blue-50/80 border border-blue-100/50 rounded-lg p-2 flex flex-col items-center">
                <span className="text-[9px] font-bold text-blue-600 uppercase mb-1">Reads</span>
                <div className="flex-1 w-full relative min-h-[70px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={readData} cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" stroke="none" dataKey="value">
                        {readData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-slate-700">{Math.min(100, Math.round((totalReads/READ_QUOTA_FREE)*100))}%</span>
                  </div>
                </div>
                <div className="w-full mt-2">
                  <div className="flex justify-between items-center text-[9px] mb-1">
                    <span className="text-gray-500">{lang === 'id' ? 'Gratis:' : 'Free:'}</span>
                    <span className="font-bold text-slate-700">{Math.min(totalReads, READ_QUOTA_FREE).toLocaleString()} / 50K</span>
                  </div>
                  {totalReads > READ_QUOTA_FREE && (
                    <>
                      <div className="flex justify-between items-center text-[9px] mb-1">
                        <span className="text-red-500">{lang === 'id' ? 'Berbayar:' : 'Paid:'}</span>
                        <span className="font-bold text-red-600">{(totalReads - READ_QUOTA_FREE).toLocaleString()} ops</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] bg-red-50 px-1 py-0.5 rounded border border-red-100">
                        <span className="text-red-600 font-medium">Est:</span>
                        <span className="font-bold text-red-700">Rp {(((totalReads - READ_QUOTA_FREE) / 100000) * READ_COST_100K * RATE_USD_TO_IDR).toLocaleString('id-ID', {maximumFractionDigits:0})}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Writes Donut */}
              <div className="flex-1 bg-indigo-50/80 border border-indigo-100/50 rounded-lg p-2 flex flex-col items-center">
                <span className="text-[9px] font-bold text-indigo-600 uppercase mb-1">Writes</span>
                <div className="flex-1 w-full relative min-h-[70px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={writeData} cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" stroke="none" dataKey="value">
                        {writeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-slate-700">{Math.min(100, Math.round((totalWrites/WRITE_QUOTA_FREE)*100))}%</span>
                  </div>
                </div>
                <div className="w-full mt-2">
                  <div className="flex justify-between items-center text-[9px] mb-1">
                    <span className="text-gray-500">{lang === 'id' ? 'Gratis:' : 'Free:'}</span>
                    <span className="font-bold text-slate-700">{Math.min(totalWrites, WRITE_QUOTA_FREE).toLocaleString()} / 20K</span>
                  </div>
                  {totalWrites > WRITE_QUOTA_FREE && (
                    <>
                      <div className="flex justify-between items-center text-[9px] mb-1">
                        <span className="text-red-500">{lang === 'id' ? 'Berbayar:' : 'Paid:'}</span>
                        <span className="font-bold text-red-600">{(totalWrites - WRITE_QUOTA_FREE).toLocaleString()} ops</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] bg-red-50 px-1 py-0.5 rounded border border-red-100">
                        <span className="text-red-600 font-medium">Est:</span>
                        <span className="font-bold text-red-700">Rp {(((totalWrites - WRITE_QUOTA_FREE) / 100000) * WRITE_COST_100K * RATE_USD_TO_IDR).toLocaleString('id-ID', {maximumFractionDigits:0})}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: 7-Day History */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col h-auto min-h-[14rem]">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold text-slate-800">{lang === 'id' ? 'Riwayat 7 Hari' : '7-Day History'}</h2>
            </div>
            <div className="flex-1 w-full mt-2">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <RechartsTooltip content={<HistoryTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Legend verticalAlign="top" align="right" height={20} iconSize={6} wrapperStyle={{ fontSize: '9px' }} />
                    <Bar dataKey="reads" name="Reads" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={12} />
                    <Bar dataKey="writes" name="Writes" fill="#6366f1" radius={[2, 2, 0, 0]} maxBarSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Card 3: Storage */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col h-auto min-h-[14rem]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-bold text-slate-800">{lang === 'id' ? 'Penyimpanan' : 'Storage'}</h2>
              </div>
            </div>
            
            <div className="flex-1 flex items-center">
              <div className="w-1/2 h-full py-2">
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={collectionSizeData}
                        cx="50%"
                        cy="50%"
                        innerRadius="50%"
                        outerRadius="90%"
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {collectionSizeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getCollectionColor(index)} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CollectionTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="w-1/2 flex flex-col justify-center pl-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase mb-0.5">{lang === 'id' ? 'Total Data' : 'Total Data'}</span>
                <span className="text-2xl font-black text-emerald-600 leading-none">{formatBytes(totalSizeBytes)}</span>
                <span className="text-[10px] text-gray-400 mt-1">{totalDocs.toLocaleString()} docs</span>
                
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 mb-1">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(100, (totalSizeBytes / STORAGE_QUOTA_FREE_BYTES) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-gray-400">{((totalSizeBytes / STORAGE_QUOTA_FREE_BYTES) * 100).toFixed(4)}% {lang === 'id' ? 'dari 1 GB' : 'of 1 GB'}</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Small Breakdown Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
          {collectionSizeData.map((data, index) => (
            <div key={data.name} className="flex flex-col p-2.5 bg-white rounded-xl border border-slate-300 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCollectionColor(index) }}></div>
                <span className="text-[10px] font-bold text-gray-600 capitalize truncate">{data.name}</span>
              </div>
              <span className="text-sm font-black text-slate-800">{formatBytes(data.value)}</span>
              <span className="text-[9px] text-gray-400">{data.count} docs</span>
            </div>
          ))}
        </div>
        
        {/* Footer Note */}
        <div className="bg-slate-100/50 border border-slate-200/60 rounded-lg p-2.5 mt-4 flex items-start gap-2 text-[10px] text-slate-500">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
          <p className="leading-relaxed">
            <strong>{lang === 'id' ? 'Catatan:' : 'Note:'}</strong> {lang === 'id' ? 'Data yang ditampilkan adalah estimasi dari sisi klien aplikasi. Angka penagihan aktual Firebase Console mungkin sedikit berbeda karena format penyimpanan biner dan indeks.' : 'Data shown is a client-side estimate. Actual Firebase Console billing numbers may differ slightly due to binary storage formats and indexing.'}
          </p>
        </div>

      </div>
    </div>
  );
}
