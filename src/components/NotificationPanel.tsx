import React from 'react';
import { RealTimeAlert, UserProfile } from '../types';
import { Bell, Info, CheckCircle, AlertTriangle, AlertOctagon, Check, Play, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationPanelProps {
  alerts: RealTimeAlert[];
  currentUser: UserProfile | null;
  onMarkAsRead: (alertId: string) => void;
  onClearAll: () => void;
  onSimulateEvent: (type: 'ship-movement' | 'customs-approved' | 'phytosanitary-issued' | 'supplier-ready') => void;
}

export default function NotificationPanel({ 
  alerts, 
  currentUser, 
  onMarkAsRead, 
  onClearAll, 
  onSimulateEvent 
}: NotificationPanelProps) {

  const getAlertIcon = (type: RealTimeAlert['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'alert':
        return <AlertOctagon className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertBg = (type: RealTimeAlert['type'], isRead: boolean) => {
    if (isRead) return 'bg-white opacity-80';
    switch (type) {
      case 'success': return 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50';
      case 'warning': return 'bg-amber-50/50 border-amber-100 hover:bg-amber-50';
      case 'alert': return 'bg-red-50/50 border-red-100 hover:bg-red-50';
      default: return 'bg-blue-50/50 border-blue-100 hover:bg-blue-50';
    }
  };

  const unreadAlerts = alerts.filter(a => !currentUser || !a.readBy.includes(currentUser.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Simulation triggers panel */}
      <div className="lg:col-span-1 p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 text-white space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
          <Zap className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-bold text-base">Simulator Real-Time IoT</h3>
            <p className="text-[11px] text-gray-400">Trigger sinyal pengiriman & karantina fisik</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          Gunakan tombol di bawah ini untuk mensimulasikan integrasi sensor satelit kapal, sistem karantina otomatis, serta respon pabean bea cukai secara instan:
        </p>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => onSimulateEvent('ship-movement')}
            className="w-full flex items-center justify-between p-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition-colors text-left"
          >
            <div className="space-y-0.5">
              <p className="text-gray-200">Sinyal Peta Kapal (Pelayaran)</p>
              <p className="text-[10px] text-gray-400 font-normal">Kapal terdeteksi melewati Samudera Hindia</p>
            </div>
            <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400 shrink-0" />
          </button>

          <button
            onClick={() => onSimulateEvent('customs-approved')}
            className="w-full flex items-center justify-between p-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition-colors text-left"
          >
            <div className="space-y-0.5">
              <p className="text-gray-200">Sistem NPE Cukai RI (Sistem pabean)</p>
              <p className="text-[10px] text-gray-400 font-normal">Bea Cukai menyetujui PEB & terbitkan NPE</p>
            </div>
            <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400 shrink-0" />
          </button>

          <button
            onClick={() => onSimulateEvent('phytosanitary-issued')}
            className="w-full flex items-center justify-between p-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition-colors text-left"
          >
            <div className="space-y-0.5">
              <p className="text-gray-200">Karantina Tumbuhan (Agraria)</p>
              <p className="text-[10px] text-gray-400 font-normal">Sertifikasi Phytosanitary divalidasi karantina</p>
            </div>
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 shrink-0" />
          </button>

          <button
            onClick={() => onSimulateEvent('supplier-ready')}
            className="w-full flex items-center justify-between p-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition-colors text-left"
          >
            <div className="space-y-0.5">
              <p className="text-gray-200">Kesiapan Sourcing Supplier</p>
              <p className="text-[10px] text-gray-400 font-normal">Koperasi menyetujui PO & selesai re-packing</p>
            </div>
            <Play className="w-3.5 h-3.5 text-teal-400 fill-teal-400 shrink-0" />
          </button>
        </div>

        <div className="bg-slate-850 p-2.5 rounded-lg border border-slate-750">
          <p className="text-[10px] text-slate-400 leading-normal">
            *Setiap tombol akan memperbarui basis data lokal simulasi di browser dan mendaftarkan peringatan penting di sebelah kanan secara instan.
          </p>
        </div>
      </div>

      {/* Real-time notification list Dashboard */}
      <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-gray-150 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Log Notifikasi Status Ekspor {unreadAlerts.length > 0 && `(${unreadAlerts.length} Baru)`}
              </h3>
              <p className="text-xs text-gray-400">Arus log operasional pelayaran, karantina, bea cukai dan logistik</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearAll}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 hover:bg-gray-50 rounded"
            >
              Hapus Semua
            </button>
          </div>
        </div>

        {/* Log list list */}
        <div className="space-y-2.5 max-h-[385px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {alerts.length > 0 ? (
              alerts.map((alert) => {
                const isRead = currentUser ? alert.readBy.includes(currentUser.id) : true;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, width: 0 }}
                    className={`flex items-start p-3.5 rounded-lg border text-xs transition-all ${getAlertBg(alert.type, isRead)}`}
                  >
                    <div className="p-1.5 bg-white rounded-lg border border-gray-100 shrink-0 mr-3 shadow-xs">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="font-bold text-gray-900">{alert.title}</span>
                        <span className="font-mono text-[9px] text-gray-400">
                          {new Date(alert.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-600 font-medium leading-relaxed">{alert.message}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          No. Kontrak: {alert.contractNumber}
                        </span>
                        {!isRead && currentUser && (
                          <button
                            onClick={() => onMarkAsRead(alert.id)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Tandai dibaca
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <Bell className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs font-semibold">Tidak ada log notifikasi aktif</p>
                <p className="text-[11px] text-gray-400">Gunakan Simulator IoT di kiri untuk memicu notifikasi baru.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
