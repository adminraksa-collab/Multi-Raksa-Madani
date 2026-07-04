import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, CheckCircle, AlertCircle, Clock, ArrowRight, 
  ShieldAlert, Check, FileSignature, Trash2, Info, 
  FileText, Shield, AlertTriangle, Sparkles, ChevronDown,
  CircleAlert, Calendar, DollarSign, Archive, X
} from 'lucide-react';
import { UserProfile, ExportShipment, RealTimeAlert } from '../types';

export interface UserTask {
  id: string;
  shipmentId: string;
  contractNumber: string;
  productName: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
  category: 'contract' | 'logistics' | 'document' | 'payment';
  targetStepIndex?: number;
  targetSubStepIndex?: number;
}

export function getPendingTasks(currentUser: UserProfile | null, shipments: ExportShipment[]): UserTask[] {
  if (!currentUser) return [];

  const tasks: UserTask[] = [];

  shipments.forEach(s => {
    // 1. If fully Completed, check if Buyer has import/clearance tasks
    if (s.currentStep === 'Completed') {
      if (currentUser.role === 'Buyer') {
        tasks.push({
          id: `task-import-${s.id}`,
          shipmentId: s.id,
          contractNumber: s.contractNumber,
          productName: s.productName,
          title: 'Urus Bea Masuk & Rilis Impor Tokyo',
          description: `Kargo tuntas dikirim! Selesaikan bea pabean impor clearance lokal di Pelabuhan Tokyo, Jerman untuk melepas barang.`,
          priority: 'medium',
          actionLabel: 'Tinjau Arsip Transaksi',
          category: 'logistics',
          targetStepIndex: 2
        });
      }
      return;
    }

    // 2. Draft / Commercial Negotiation Stage
    if (s.currentStep === 'Draft') {
      const salesContractDoc = s.documents.find(d => d.type === 'Sales Contract' || (d.type as string) === 'Proforma Invoice');
      const docStatus = salesContractDoc?.status || 'Draft';

      if (docStatus === 'Draft') {
        if (currentUser.role === 'Trader' || currentUser.role === 'Superadmin') {
          tasks.push({
            id: `task-sc-draft-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: 'Kirim Draf Kontrak/PI Bilateral',
            description: `Draf Sales Contract masih berstatus draf. Lengkapi isian harga FOB/CIF dan rincian kargo, lalu ajukan ke Buyer.`,
            priority: 'high',
            actionLabel: 'Lengkapi & Ajukan',
            category: 'contract',
            targetStepIndex: 0
          });
        } else if (currentUser.role === 'Buyer') {
          tasks.push({
            id: `task-sc-review-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: 'Tinjau & Rumuskan Proposal Balasan',
            description: `Negosiasi harga dan spesifikasi kargo untuk ${s.productName} sedang berlangsung. Kirim proposal balasan atau setujui draf.`,
            priority: 'high',
            actionLabel: 'Masuk Negosiasi',
            category: 'contract',
            targetStepIndex: 0
          });
        }
      } else if (docStatus === 'Issued') {
        if (currentUser.role === 'Buyer') {
          tasks.push({
            id: `task-sc-sign-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: 'Tanda Tangani Sales Contract Resmi',
            description: `Draf resmi telah diajukan oleh eksportir. Segera setujui dan tanda tangani draf agar alur pengapalan dapat dimulai.`,
            priority: 'high',
            actionLabel: 'Tandatangani Kontrak',
            category: 'contract',
            targetStepIndex: 0
          });
        } else if (currentUser.role === 'Trader' || currentUser.role === 'Superadmin') {
          tasks.push({
            id: `task-sc-wait-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: 'Menunggu Tanda Tangan Buyer',
            description: `Draf final kontrak telah Anda ajukan kepada Buyer Jerman. Menunggu validasi bilateral.`,
            priority: 'medium',
            actionLabel: 'Pantau Transaksi',
            category: 'contract',
            targetStepIndex: 0
          });
        }
      }
    }

    // 3. Shipping / Logistics & Operational Stage
    if (s.currentStep === 'Shipping') {
      let completedSubs: number[] = [];
      try {
        const stored = localStorage.getItem(`exportflow_completed_substeps_${s.id}`);
        if (stored) {
          completedSubs = JSON.parse(stored);
        }
      } catch (e) {}

      const completedCount = completedSubs.length;

      if (completedCount === 0) {
        // Substep 0: Sourcing Komoditas
        if (currentUser.role === 'Supplier') {
          tasks.push({
            id: `task-source-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: 'Sortir & Kirim Komoditas Organik',
            description: `Segera lakukan pemilihan grade kualitas prima (Grade A), lakukan packing, dan mobilisasi kargo menuju Gudang Transit Utama.`,
            priority: 'high',
            actionLabel: 'Kirim Komoditi',
            category: 'logistics',
            targetStepIndex: 1,
            targetSubStepIndex: 0
          });
        } else if (currentUser.role === 'Trader' || currentUser.role === 'Superadmin') {
          tasks.push({
            id: `task-source-trader-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: 'Awasi Sourcing Komoditas Bahan Baku',
            description: `Pastikan Supplier petani lokal menyortir komoditas sesuai kadar air ekspor (max 12%) dan mengirimkannya tepat waktu ke gudang transit.`,
            priority: 'medium',
            actionLabel: 'Kelola Sourcing',
            category: 'logistics',
            targetStepIndex: 1,
            targetSubStepIndex: 0
          });
        }
      } else if (completedCount === 1) {
        // Substep 1: Karantina & Bea Cukai
        if (currentUser.role === 'Trader') {
          tasks.push({
            id: `task-customs-trader-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: 'Ajukan Pemberitahuan Ekspor Barang (PEB)',
            description: `Susun formulir pabean ekspor, bayar pungutan ekspor, dan ajukan berkas PEB ke sistem Bea Cukai RI.`,
            priority: 'high',
            actionLabel: 'Isi PEB Cukai',
            category: 'document',
            targetStepIndex: 1,
            targetSubStepIndex: 1
          });
        } else if (currentUser.role === 'Superadmin') {
          tasks.push({
            id: `task-customs-officer-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: 'Verifikasi Berkas PEB & Terbitkan NPE',
            description: `Lakukan verifikasi kelengkapan berkas PEB eksportir dan terbitkan Nota Pelayanan Ekspor (NPE) hijau untuk melepaskan kontainer.`,
            priority: 'high',
            actionLabel: 'Verifikasi PEB',
            category: 'document',
            targetStepIndex: 1,
            targetSubStepIndex: 1
          });
        }
      } else if (completedCount === 2) {
        // Substep 2: Pelayaran Kargo
        if (currentUser.role === 'Forwarder') {
          tasks.push({
            id: `task-shipping-forwarder-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: 'Selesaikan Stuffing Kontainer & Rilis B/L',
            description: `Ambil muatan dari Gudang Transit, selesaikan stuffing kargo ke kontainer ekspor, urus customs pelabuhan, dan rilis Bill of Lading (B/L) resmi.`,
            priority: 'high',
            actionLabel: 'Proses Logistik',
            category: 'logistics',
            targetStepIndex: 1,
            targetSubStepIndex: 2
          });
        } else if (currentUser.role === 'Trader' || currentUser.role === 'Superadmin') {
          tasks.push({
            id: `task-shipping-trader-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: 'Kirim Instruksi Pengapalan (SI)',
            description: `Segera lengkapi parameter pengirim & penerima kargo untuk dikirimkan sebagai Shipping Instruction (SI) ke Forwarder Samudera Logistik.`,
            priority: 'medium',
            actionLabel: 'Buka Live Editor',
            category: 'document',
            targetStepIndex: 1,
            targetSubStepIndex: 2
          });
        }
      } else if (completedCount === 3) {
        // Substep 3: Pencairan L/C
        if (currentUser.role === 'Trader' || currentUser.role === 'Superadmin') {
          tasks.push({
            id: `task-lc-trader-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: 'Serahkan Dokumen Kargo Bersih ke Bank',
            description: `Ajukan draf salinan Bill of Lading, Invoice, Packing List, Phytosanitary, dan COO ke Bank Mandiri sebagai syarat pencairan dana L/C.`,
            priority: 'high',
            actionLabel: 'Presentasi Dokumen',
            category: 'payment',
            targetStepIndex: 1,
            targetSubStepIndex: 3
          });
        } else if (currentUser.role === 'Buyer') {
          tasks.push({
            id: `task-lc-buyer-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: 'Verifikasi Berkas Bersih & Cairkan Dana L/C',
            description: `Bank pembeli (Deutsche Bank) telah menerima salinan dokumen kargo bersih. Validasi berkas fisik dan cairkan dana Letter of Credit ke eksportir.`,
            priority: 'high',
            actionLabel: 'Verifikasi L/C',
            category: 'payment',
            targetStepIndex: 1,
            targetSubStepIndex: 3
          });
        }
      }
    }
  });

  return tasks;
}

interface NotificationCenterProps {
  currentUser: UserProfile | null;
  shipments: ExportShipment[];
  onSelectShipment: (shipmentId: string, targetStepIndex?: number, targetSubStepIndex?: number) => void;
  onNavigateToTab: (tab: 'home' | 'workflow' | 'guide' | 'negotiation' | 'users', keepActiveShipment?: boolean) => void;
  alerts: RealTimeAlert[];
  onMarkAlertAsRead: (alertId: string) => void;
  onClearAlerts: () => void;
}

export default function NotificationCenter({
  currentUser,
  shipments,
  onSelectShipment,
  onNavigateToTab,
  alerts,
  onMarkAlertAsRead,
  onClearAlerts
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'logs'>('tasks');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic obligations tailored to user's active role
  const pendingTasks = getPendingTasks(currentUser, shipments);
  
  // Unread alerts count
  const unreadAlerts = alerts.filter(a => !currentUser || !a.readBy.includes(currentUser.id));
  const unreadAlertsCount = unreadAlerts.length;

  // Total active notifications
  const totalCount = pendingTasks.length + unreadAlertsCount;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTaskAction = (task: UserTask) => {
    setIsOpen(false);
    onSelectShipment(task.shipmentId, task.targetStepIndex, task.targetSubStepIndex);
    onNavigateToTab('workflow', true);
  };

  const handleReadAlert = (alertId: string) => {
    onMarkAlertAsRead(alertId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contract':
        return <FileSignature className="w-4 h-4 text-amber-500" />;
      case 'logistics':
        return <Clock className="w-4 h-4 text-indigo-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPriorityStyle = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Navbar trigger Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          isOpen 
            ? 'bg-slate-900 text-white border-slate-950 shadow-sm' 
            : 'bg-white hover:bg-slate-50 border-gray-200 text-slate-700 hover:text-slate-950 hover:border-gray-300 shadow-3xs'
        }`}
        id="notification-bell-trigger"
        title="Pusat Tugas & Notifikasi Kewajiban"
      >
        <Bell className={`w-4 h-4 ${totalCount > 0 && !isOpen ? 'animate-bounce' : ''}`} />
        
        {totalCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-extrabold text-[9px] h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm font-sans">
            {totalCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-[340px] sm:w-[380px] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 text-left"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">Pusat Notifikasi</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Tamu Umum (Guest)'}
                  </p>
                </div>
              </div>
              
              {/* Reset logs if showing logs */}
              {activeSubTab === 'logs' && alerts.length > 0 && (
                <button
                  onClick={onClearAlerts}
                  className="text-[9.5px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors uppercase cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Bersihkan</span>
                </button>
              )}
            </div>

            {/* Quick Multi-role Indicator */}
            {currentUser && (
              <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100/50 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Peran Aktif: <strong className="uppercase font-extrabold">{currentUser.role}</strong></span>
                </div>
                <span className="text-[9px] text-indigo-500 font-medium">Beralih akun jika ingin ganti tugas</span>
              </div>
            )}

            {/* Sub-Tabs Selector */}
            <div className="flex border-b border-gray-200 bg-slate-50/50">
              <button
                onClick={() => setActiveSubTab('tasks')}
                className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'tasks'
                    ? 'border-indigo-600 text-indigo-600 font-extrabold bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-slate-50'
                }`}
              >
                <FileSignature className="w-3.5 h-3.5" />
                <span>Kewajiban Tugas</span>
                {pendingTasks.length > 0 && (
                  <span className="text-[9px] bg-red-100 text-red-600 font-extrabold px-1.5 py-0.2 rounded-full">
                    {pendingTasks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveSubTab('logs')}
                className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'logs'
                    ? 'border-indigo-600 text-indigo-600 font-extrabold bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Log Aktivitas</span>
                {unreadAlertsCount > 0 && (
                  <span className="text-[9px] bg-indigo-100 text-indigo-600 font-extrabold px-1.5 py-0.2 rounded-full">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
            </div>

            {/* List Body */}
            <div className="max-h-[340px] overflow-y-auto p-3 space-y-3 bg-slate-50/30">
              
              {/* GUEST WARNING / EMPTY STATE IF NOT LOGGED IN */}
              {!currentUser && (
                <div className="p-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase">Sesi Terbatas</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                      Silakan login terlebih dahulu untuk mengakses kewajiban logistik, draf persetujuan PEB, penandatanganan Sales Contract, atau pelacakan kargo.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 1: USER OBLIGATIONS (PR) */}
              {currentUser && activeSubTab === 'tasks' && (
                <div className="space-y-2.5">
                  {pendingTasks.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-emerald-800 uppercase">Tugas Selesai Bersih!</h5>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1">
                          Semua kewajiban komersial dan operasional ekspor untuk peran <strong>{currentUser.role}</strong> telah diselesaikan. Tidak ada pekerjaan rumah aktif saat ini.
                        </p>
                      </div>
                    </div>
                  ) : (
                    pendingTasks.map(task => (
                      <div
                        key={task.id}
                        className="p-3 bg-white border border-gray-150 rounded-xl hover:border-indigo-300 hover:shadow-2xs transition-all text-left space-y-2 relative"
                      >
                        {/* Task Header info */}
                        <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            {getCategoryIcon(task.category)}
                            <span className="text-[9.5px] font-mono bg-slate-150 text-slate-600 font-extrabold px-1.5 py-0.5 rounded">
                              {task.contractNumber}
                            </span>
                          </div>
                          
                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${getPriorityStyle(task.priority)}`}>
                            {task.priority === 'high' ? 'PENTING' : task.priority === 'medium' ? 'SEDANG' : 'RENDAH'}
                          </span>
                        </div>

                        {/* Task Content */}
                        <div className="space-y-1">
                          <h5 className="text-[11.5px] font-black text-slate-900 leading-snug">
                            {task.title}
                          </h5>
                          <p className="text-[10.5px] text-slate-500 leading-relaxed">
                            {task.description}
                          </p>
                          <p className="text-[9.5px] text-slate-400 italic font-mono font-medium line-clamp-1">
                            Komoditi: {task.productName}
                          </p>
                        </div>

                        {/* Action Trigger */}
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => handleTaskAction(task)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9.5px] uppercase tracking-wider rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
                          >
                            <span>{task.actionLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: SYSTEM ALERT LOGS */}
              {currentUser && activeSubTab === 'logs' && (
                <div className="space-y-2">
                  {alerts.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center mx-auto text-slate-400">
                        <Info className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-700 uppercase">Tidak Ada Aktivitas</h5>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1">
                          Log aktivitas ekspor saat ini kosong. Sinyal IoT pabean & pelayaran kargo belum dipicu.
                        </p>
                      </div>
                    </div>
                  ) : (
                    alerts.map(alert => {
                      const isRead = alert.readBy.includes(currentUser.id);
                      return (
                        <div
                          key={alert.id}
                          onClick={() => handleReadAlert(alert.id)}
                          className={`p-3 rounded-xl border transition-all text-left space-y-1.5 cursor-pointer relative ${
                            isRead 
                              ? 'bg-slate-50/50 border-gray-150 opacity-75' 
                              : 'bg-white border-blue-150 hover:border-blue-300 hover:shadow-3xs'
                          }`}
                        >
                          {/* Alert Badge and Read dot */}
                          <div className="flex items-center justify-between gap-1 border-b border-dashed border-gray-100 pb-1">
                            <span className="text-[9px] font-black uppercase text-slate-400 font-mono">
                              {alert.contractNumber || 'LOG SISTEM'}
                            </span>
                            
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8.5px] text-slate-400 font-mono font-bold">
                                {new Date(alert.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {!isRead && (
                                <span className="h-2 w-2 rounded-full bg-blue-600 block shrink-0" title="Belum dibaca" />
                              )}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <h6 className="text-[11px] font-black text-slate-850 flex items-center gap-1">
                              {alert.type === 'success' && <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />}
                              {alert.type === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />}
                              {alert.type === 'alert' && <CircleAlert className="w-3 h-3 text-red-500 shrink-0" />}
                              {alert.type === 'info' && <Info className="w-3 h-3 text-indigo-500 shrink-0" />}
                              <span className="truncate leading-none">{alert.title}</span>
                            </h6>
                            <p className="text-[10.5px] text-slate-500 leading-relaxed">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>

            {/* Dropdown Footer */}
            <div className="p-3 bg-slate-50 border-t border-gray-150 text-center flex justify-between items-center text-[10px] text-slate-400 font-bold">
              <span>{pendingTasks.length} Kewajiban Tugas Aktif</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-indigo-600 hover:text-indigo-800 transition-colors uppercase cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
