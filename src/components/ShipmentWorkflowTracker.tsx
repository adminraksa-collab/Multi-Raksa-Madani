import React, { useState } from 'react';
import { ExportShipment, ShipmentStep, UserProfile, ExportDocument, Certification } from '../types';
import { WORKFLOW_STEPS } from '../mockData';
import { 
  FileText, Calendar, Compass, Anchor, ShieldCheck, 
  CheckCircle, ArrowRight, UserPlus, Info, PlusCircle, Award, 
  MapPin, Check, AlertCircle, FilePlus, ChevronRight 
} from 'lucide-react';
import { motion } from 'motion/react';
import VesselGPSMap from './VesselGPSMap';

interface ShipmentWorkflowTrackerProps {
  shipment: ExportShipment;
  currentUser: UserProfile | null;
  onUpdateStep: (shipmentId: string, nextStep: ShipmentStep, comments: string) => void;
  onOpenDocumentEditor: () => void;
  onViewDocument: (doc: ExportDocument) => void;
  onUploadCertification: (shipmentId: string, name: string, authority: string) => void;
}

export default function ShipmentWorkflowTracker({
  shipment,
  currentUser,
  onUpdateStep,
  onOpenDocumentEditor,
  onViewDocument,
  onUploadCertification,
}: ShipmentWorkflowTrackerProps) {
  const [overrideComments, setOverrideComments] = useState('');
  const [newCertName, setNewCertName] = useState('');
  const [newCertAuth, setNewCertAuth] = useState('');
  const [showAddCertForm, setShowAddCertForm] = useState(false);

  // Find step information
  const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.step === shipment.currentStep);
  const activeStepInfo = WORKFLOW_STEPS[currentStepIndex];

  // Check if current user is the required actor for this step
  const isAuthorizedRole = currentUser?.role === activeStepInfo.actor;

  const handleAdvanceStep = () => {
    if (currentStepIndex < WORKFLOW_STEPS.length - 1) {
      const nextStep = WORKFLOW_STEPS[currentStepIndex + 1].step;
      const defaultComment = `${activeStepInfo.actor} (${currentUser?.name || currentUser?.role}) menyetujui tahap ${activeStepInfo.label} dan beralih ke tahap berikutnya.`;
      onUpdateStep(shipment.id, nextStep, overrideComments || defaultComment);
      setOverrideComments('');
    }
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertName || !newCertAuth) return;
    onUploadCertification(shipment.id, newCertName, newCertAuth);
    setNewCertName('');
    setNewCertAuth('');
    setShowAddCertForm(false);
  };

  const getStepIcon = (step: ShipmentStep, status: 'completed' | 'active' | 'upcoming') => {
    const size = "w-4 h-4";
    switch (step) {
      case 'Draft': return <FileText className={size} />;
      case 'Sourcing': return <Calendar className={size} />;
      case 'Verification': return <Award className={size} />;
      case 'Documents': return <FilePlus className={size} />;
      case 'Customs': return <ShieldCheck className={size} />;
      case 'Loading': return <Anchor className={size} />;
      case 'Shipping': return <Compass className={size} />;
      case 'Completed': return <CheckCircle className={size} />;
    }
  };

  const getActorBadgeColor = (role: string) => {
    switch (role) {
      case 'Owner/Direktur': return 'border-purple-200 bg-purple-50 text-purple-705';
      case 'Trader': return 'border-blue-200 bg-blue-50 text-blue-705';
      case 'Buyer': return 'border-emerald-200 bg-emerald-50 text-emerald-705';
      case 'Forwarder': return 'border-amber-200 bg-amber-50 text-amber-705';
      case 'Supplier': return 'border-teal-200 bg-teal-50 text-teal-705';
      default: return 'border-gray-250 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* 1. Alur Tracker Pipiline - 2 Cols */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Active shipment banner summary */}
        <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded">
              No. Kontrak: {shipment.contractNumber}
            </span>
            <h2 className="text-lg font-bold text-gray-50 mt-1">{shipment.productName}</h2>
            <p className="text-xs text-gray-400">
              {shipment.quantity} {shipment.unit} &bull; Nilai FOB: <span className="font-mono text-orange-400">${shipment.totalValue.toLocaleString('id-ID')} {shipment.currency}</span>
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs font-sans md:text-right border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5 shrink-0">
            <div>
              <p className="text-gray-400 text-[10px] uppercase">Rute Ekspor</p>
              <p className="font-semibold text-gray-200 mt-0.5 max-w-[150px] md:max-w-[180px] truncate">{shipment.portOfDischarge.split(',')[1] || shipment.portOfDischarge}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase">Tracking Satelit</p>
              <p className="font-mono font-semibold text-gray-200 mt-0.5">{shipment.trackingNumber || 'Belum termotifikasi'}</p>
            </div>
          </div>
        </div>

        {/* Vessel GPS tracking map if step is Shipping */}
        {shipment.currentStep === 'Shipping' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <VesselGPSMap shipment={shipment} />
          </motion.div>
        )}

        {/* Workflow Timeline Cards */}
        <div className="bg-white rounded-xl border border-gray-150 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-950 text-base">Timeline Alur Kerja Ekspor Terpadu</h3>
              <p className="text-xs text-gray-400">Sembilan tahap pemantauan dari persiapan ladang tani hingga serah terima laut lepas</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
              Tahap Ke {currentStepIndex + 1} dari 8
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:left-3 before:bottom-2 before:w-0.5 before:bg-gray-150">
            {WORKFLOW_STEPS.map((stepInfo, index) => {
              const isCompleted = index < currentStepIndex;
              const isActive = index === currentStepIndex;
              const isUpcoming = index > currentStepIndex;

              let statusBg = 'bg-gray-100 text-gray-400 border-gray-200';
              let wrapperBg = 'bg-white opacity-60';
              let textTitleColor = 'text-gray-500 font-semibold';
              let nodeDotColor = 'border-gray-200 text-gray-400 bg-white';

              if (isCompleted) {
                statusBg = 'bg-emerald-500 border-emerald-500 text-white';
                wrapperBg = 'bg-white border-l-4 border-l-emerald-500 rounded-lg shadow-2xs opacity-90';
                textTitleColor = 'text-emerald-800 font-bold';
                nodeDotColor = 'bg-emerald-500 border-emerald-500 text-white';
              } else if (isActive) {
                statusBg = 'bg-blue-600 border-blue-600 text-white';
                wrapperBg = 'bg-blue-50/40 border-2 border-blue-150 rounded-xl shadow-xs';
                textTitleColor = 'text-slate-900 font-extrabold';
                nodeDotColor = 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100';
              }

              return (
                <div 
                  key={stepInfo.step}
                  className={`relative p-4 border border-gray-100/50 transition-all ${wrapperBg}`}
                >
                  {/* Step bubble icon positioned absolutely in the timeline track */}
                  <div className={`absolute -left-[24px] top-4.5 rounded-full border w-6.5 h-6.5 flex items-center justify-center text-xs transition-all ${nodeDotColor}`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : getStepIcon(stepInfo.step, isCompleted ? 'completed' : isActive ? 'active' : 'upcoming')}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-sm tracking-tight ${textTitleColor}`}>
                          {stepInfo.label}
                        </span>
                        {isActive && (
                          <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                            TAHAP AKTIF
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed font-sans">{stepInfo.description}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-1 sm:mt-0">
                      <span className={`px-2 py-0.5 border text-[10px] font-bold rounded ${getActorBadgeColor(stepInfo.actor)}`}>
                        Aktor: {stepInfo.actor}
                      </span>
                    </div>
                  </div>

                  {/* Comments from history if step is completed */}
                  {isCompleted && (
                    <div className="mt-2 text-[10.5px] italic text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 leading-normal">
                      &ldquo;{shipment.stepHistory.find(h => h.step === stepInfo.step)?.comments || 'Lolos verifikasi sukses.'}&rdquo;
                      <span className="font-mono text-[9px] text-gray-400 block mt-1">
                        Persetujuan via {shipment.stepHistory.find(h => h.step === stepInfo.step)?.updatedBy === 'usr-admin' ? 'Bea Cukai' : 'Sistem'} pada {new Date(shipment.stepHistory.find(h => h.step === stepInfo.step)?.timestamp || '').toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2. Interactive Role-play Action panel & Document Checklist List - 1 Col */}
      <div className="space-y-6">
        
        {/* User Role Reminder Dashboard widget */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200 p-5 rounded-xl space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            Kredensial Sesi Simulasi
          </p>
          <div className="flex items-center gap-3">
            <img 
              src={currentUser?.avatar} 
              alt={currentUser?.name} 
              className="w-10 h-10 rounded-full border border-gray-300 object-cover"
            />
            <div>
              <p className="font-bold text-sm text-gray-900">{currentUser?.name}</p>
              <span className={`inline-block text-[10px] font-extrabold tracking-wider border px-2 py-0.5 rounded uppercase mt-0.5 ${getActorBadgeColor(currentUser?.role || '')}`}>
                Peran: {currentUser?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic workflow control box */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Compass className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-gray-900">Ruang Kendali Tahap Transaksi</h3>
              <p className="text-[11px] text-gray-400">Kemajuan alur kerja dipandu aksi terverifikasi</p>
            </div>
          </div>

          {/* Prompt action block state */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-150">
            <p className="text-xs text-gray-400 uppercase font-black">Tahap Saat Ini :</p>
            <p className="text-base font-extrabold text-blue-900">{activeStepInfo.label}</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Otoritas Penyelesaian: <span className="font-bold text-gray-800">{activeStepInfo.actor}</span>
            </p>

            {isAuthorizedRole ? (
              <div className="space-y-3 pt-2 border-t border-gray-200">
                <span className="block text-[10px] font-bold text-green-600 uppercase tracking-wider">
                  &bull; Akun Anda Sesuai! Anda memiliki kendali
                </span>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Beri Catatan Prosedur (Opsional) :</label>
                  <input
                    type="text"
                    value={overrideComments}
                    onChange={(e) => setOverrideComments(e.target.value)}
                    placeholder="Contoh: Dokumen disahkan, kargo diangkut transit..."
                    className="w-full text-xs p-2 bg-white border border-gray-300 rounded focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleAdvanceStep}
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-xs"
                >
                  Beralih ke Tahap Berikutnya
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="pt-2.5 border-t border-gray-200 text-xs text-gray-500 space-y-2">
                <div className="flex gap-1.5 items-start">
                  <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Aktivasi tombol terkunci. Masuk sebagai <span className="font-extrabold text-gray-800">{activeStepInfo.actor}</span> melalui menu login popup di atas untuk memajukan alur kerja ini.
                  </p>
                </div>
                {/* Fallback button bypass for flawless testing experience */}
                <div className="pt-1">
                  <button
                    onClick={handleAdvanceStep}
                    className="w-full text-[10px] text-gray-400 hover:text-gray-600 text-center font-medium underline block transition-colors bg-white/70 border border-dashed border-gray-300 py-1 rounded"
                  >
                    Bypass / Lompati Tahap (Opsi Penguji)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Document Checklist & Statuses - Print Feature */}
        <div className="bg-white border border-gray-150 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div>
              <h4 className="font-bold text-sm text-gray-900">Uji Dokumen Ekspor Terbit</h4>
              <p className="text-[11px] text-gray-400">Pembuatan wajib sisi Trader & print-ready</p>
            </div>
            {currentUser?.role === 'Trader' && (
              <button
                onClick={onOpenDocumentEditor}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors text-xs font-semibold flex items-center gap-0.5"
                title="Buka form editor pembuatan dokumen baru"
              >
                <PlusCircle className="w-4 h-4" />
                Buat
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {shipment.documents.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-800 truncate">{doc.title}</p>
                  <p className="text-[10px] text-gray-400 font-mono truncate">{doc.code}</p>
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-sm ${
                    doc.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {doc.status === 'Approved' ? 'Validated Cukai' : 'Tertanda Trader'}
                  </span>
                </div>
                <button
                  onClick={() => onViewDocument(doc)}
                  className="ml-3 px-3 py-1 bg-gray-100 hover:bg-slate-900 hover:text-white rounded text-[11px] font-bold text-gray-600 transition-colors shrink-0"
                >
                  Buka & Print
                </button>
              </div>
            ))}

            {shipment.documents.length === 0 && (
              <div className="py-6 text-center text-gray-450 border border-dashed border-gray-200 rounded-lg">
                <p className="text-xs font-semibold">Dokumen belum terbit</p>
                <p className="text-[10px] text-gray-400 leading-normal px-2">
                  {currentUser?.role === 'Trader' 
                    ? 'Gunakan tombol "+ Buat" di kanan atas untuk melengkapi Commercial Invoice / Packing List.' 
                    : 'Masuk sebagai akun Trader untuk merilis manifes dokumen resmi.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Certifications required / fulfilled list */}
        <div className="bg-white border border-gray-150 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div>
              <h4 className="font-bold text-sm text-gray-900">Sertifikasi Komoditi Spesifik</h4>
              <p className="text-[11px] text-gray-400">Verifikasi standar mutu ekspor agraria</p>
            </div>
            {currentUser?.role === 'Trader' && (
              <button
                onClick={() => setShowAddCertForm(!showAddCertForm)}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                {showAddCertForm ? 'Batal' : '+ Ajukan'}
              </button>
            )}
          </div>

          {showAddCertForm && (
            <form onSubmit={handleAddCert} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2.5">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">Formulir Pengajuan Sertifikat Eksternal</span>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500">Nama Sertifikasi :</label>
                <input
                  type="text"
                  placeholder="Misal: Sertifikat Fumigasi (AQIS), HACCP..."
                  value={newCertName}
                  onChange={(e) => setNewCertName(e.target.value)}
                  className="w-full text-xs p-1.5 border border-gray-300 bg-white rounded focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500">Otoritas Penerbit :</label>
                <input
                  type="text"
                  placeholder="Misal: Barantin, Sucofindo..."
                  value={newCertAuth}
                  onChange={(e) => setNewCertAuth(e.target.value)}
                  className="w-full text-xs p-1.5 border border-gray-300 bg-white rounded focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-[11px] p-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
              >
                Ajukan & Validasi Sertifikat
              </button>
            </form>
          )}

          <div className="space-y-2.5">
            {shipment.certifications.map((cert) => (
              <div 
                key={cert.id}
                className="p-3 border border-gray-100 rounded-lg bg-gray-50/30 flex items-start justify-between text-xs"
              >
                <div className="space-y-1 flex-1 min-w-0 pr-2">
                  <p className="font-bold text-gray-800 line-clamp-2 leading-relaxed">{cert.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono truncate">ID: {cert.code}</p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] text-gray-500">
                    <span>Otoritas: {cert.authority}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 shadow-3xs uppercase ${
                  cert.status === 'Verified' ? 'bg-emerald-55 text-emerald-700 border border-emerald-100' :
                  cert.status === 'In Progress' ? 'bg-amber-55 text-amber-700 border border-amber-100' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {cert.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
