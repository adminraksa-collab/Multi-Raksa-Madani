import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Check, Send, UserCheck, ArrowRight, Lock, Coffee, 
  DollarSign, Globe, Building, Award, PenTool, CheckCircle2, 
  MessageSquare, Eye, RefreshCw, AlertCircle, FileSignature,
  Printer, Download, X, Upload, Trash2, Paperclip
} from 'lucide-react';
import { ExportShipment, UserProfile, ShipmentStep } from '../types';

interface CommercialNegotiationGatewayProps {
  shipment: ExportShipment;
  currentUser: UserProfile | null;
  onUpdateShipmentFromDeal?: (shipmentId: string, updatedData: {
    quantity: number;
    pricePerUnit: number;
    paymentTerms: string;
    incoterms: string;
    portOfDischarge: string;
    buyerCompany: string;
    nextStep: ShipmentStep;
    comments: string;
  }) => void;
  onSelectUser?: (user: UserProfile) => void;
  isArchiveMode?: boolean;
}

type NegoSubStage = 'buyer-sending' | 'trader-reading' | 'negotiating' | 'signing' | 'signed';

export default function CommercialNegotiationGateway({
  shipment,
  currentUser,
  onUpdateShipmentFromDeal,
  onSelectUser,
  isArchiveMode = false
}: CommercialNegotiationGatewayProps) {
  // Local sub-stage tracking for the interactive Phase 1
  const [subStage, setSubStage] = useState<NegoSubStage>('buyer-sending');
  
  // Tab within the final "signed" state
  const [activeArchiveTab, setActiveArchiveTab] = useState<'summary' | 'loi' | 'pi'>('summary');
  
  // Interactive Negotiation parameters
  const [negotiatedQty, setNegotiatedQty] = useState<number>(shipment.quantity || 20); // Metric Tons
  const [negotiatedPrice, setNegotiatedPrice] = useState<number>(1450); // USD per ton
  const [selectedIncoterm, setSelectedIncoterm] = useState<string>('FOB Belawan Port (Incoterms 2020)');
  const [selectedPayment, setSelectedPayment] = useState<string>('Letter of Credit (L/C) at Sight');
  const [negotiationNotes, setNegotiationNotes] = useState<string>('Kadar air biji kopi tervalidasi maksimal 12%, pengemasan menggunakan karung goni berlapis GrainPro.');
  
  // File upload state for LOI attachment with 2MB limit
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number; url?: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Simulation Active Role (allows rapid role-switching for local testing)
  const [activeSimulatedRole, setActiveSimulatedRole] = useState<'Buyer' | 'Trader'>('Buyer');

  // Print blocked warning banner state
  const [printBlockedError, setPrintBlockedError] = useState<boolean>(false);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PRINT_BLOCKED') {
        setPrintBlockedError(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Signatures tracking
  const [buyerSigned, setBuyerSigned] = useState<boolean>(false);
  const [traderSigned, setTraderSigned] = useState<boolean>(false);

  // Sync state if in archive mode or shipment contract is signed
  useEffect(() => {
    const isContractSigned = shipment.documents.some(d => d.type === 'Sales Contract' && d.status === 'Approved');
    if (isArchiveMode || shipment.currentStep !== 'Draft' || isContractSigned) {
      setSubStage('signed');
      setBuyerSigned(true);
      setTraderSigned(true);
      if (shipment.quantity) setNegotiatedQty(shipment.quantity);
      if (shipment.totalValue && shipment.quantity) {
        setNegotiatedPrice(Math.round(shipment.totalValue / shipment.quantity));
      }
      if (shipment.incoterms) setSelectedIncoterm(shipment.incoterms);
      if (shipment.paymentTerms) setSelectedPayment(shipment.paymentTerms);
    }
  }, [isArchiveMode, shipment]);

  // Auto-align simulated role with current user's actual role if they have one
  useEffect(() => {
    if (currentUser && !isArchiveMode && shipment.currentStep === 'Draft') {
      if (currentUser.role === 'Buyer') {
        setActiveSimulatedRole('Buyer');
      } else if (currentUser.role === 'Trader' || currentUser.role === 'Owner/Direktur') {
        setActiveSimulatedRole('Trader');
      }
    }
  }, [currentUser, isArchiveMode, shipment]);

  // Recalculate Contract Value
  const totalContractValue = negotiatedQty * negotiatedPrice;

  // Simulate automatic state transitions for a fluid demo
  const handleSendLoi = () => {
    setSubStage('trader-reading');
  };

  const handleReadLoi = () => {
    setSubStage('negotiating');
    // Pre-fill parameters based on current shipment details
    setNegotiatedQty(shipment.quantity || 20);
  };

  const handleProposeDeal = () => {
    setSubStage('signing');
  };

  const handleSignAsBuyer = () => {
    setBuyerSigned(true);
  };

  const handleSignAsTrader = () => {
    setTraderSigned(true);
  };

  // Sync complete deal with App state (which changes currentStep to 'Shipping')
  const handleTransitionToLogistics = () => {
    if (onUpdateShipmentFromDeal) {
      onUpdateShipmentFromDeal(shipment.id, {
        quantity: negotiatedQty,
        pricePerUnit: negotiatedPrice,
        paymentTerms: selectedPayment,
        incoterms: selectedIncoterm,
        portOfDischarge: shipment.portOfDischarge || 'Port of Hamburg, Germany',
        buyerCompany: shipment.buyerCompany || 'EuroFoods Import GmbH',
        nextStep: 'Shipping',
        comments: `Fase I Komersial Selesai: LOI telah dibaca, klausul disepakati melalui negosiasi interaktif, dan Proforma Invoice (PI) telah ditandatangani secara bilateral oleh ${shipment.buyerCompany} dan PT Multi Raksa Madani.`
      });
    }
  };

  // Reset demo
  const handleResetDemo = () => {
    setSubStage('buyer-sending');
    setBuyerSigned(false);
    setTraderSigned(false);
    setNegotiatedQty(20);
    setNegotiatedPrice(1450);
    if (attachedFile?.url) {
      URL.revokeObjectURL(attachedFile.url);
    }
    setAttachedFile(null);
    setUploadError(null);
  };

  const handleFileDropOrSelect = (file: File) => {
    setUploadError(null);
    const maxSizeBytes = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSizeBytes) {
      setUploadError(`File "${file.name}" terlalu besar! Batas maksimal adalah 2 MB (Ukuran file Anda: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
      return;
    }
    if (attachedFile?.url) {
      URL.revokeObjectURL(attachedFile.url);
    }
    const url = URL.createObjectURL(file);
    setAttachedFile({
      name: file.name,
      size: file.size,
      url: url
    });
  };

  const handlePrint = (type: 'loi' | 'pi') => {
    setPrintBlockedError(false);
    const elementId = type === 'loi' ? 'commercial-loi-paper' : 'commercial-pi-paper';
    const paperElement = document.getElementById(elementId);
    if (!paperElement) return;

    const docClone = paperElement.cloneNode(true) as HTMLElement;
    
    // Create iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${type === 'loi' ? 'Letter of Intent (LOI)' : 'Proforma Invoice (PI)'} - PT MULTI RAKSA MADANI</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      slate: {
                        150: '#e2e8f0',
                        850: '#1e293b',
                      }
                    }
                  }
                }
              }
            </script>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap');
              
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                box-sizing: border-box !important;
              }

              body { 
                padding: 30px; 
                font-family: 'JetBrains Mono', monospace; 
                font-size: 11px; 
                background-color: ${type === 'loi' ? '#090d16' : '#f8fafc'};
                color: ${type === 'loi' ? '#f8fafc' : '#1e293b'};
                line-height: 1.5;
              }

              @media print {
                body { margin: 1.2cm !important; padding: 0 !important; background-color: ${type === 'loi' ? '#090d16' : '#ffffff'} !important; color: ${type === 'loi' ? '#f8fafc' : '#1e293b'} !important; }
              }
            </style>
          </head>
          <body class="${type === 'loi' ? 'bg-[#090d16] text-slate-100' : 'bg-slate-50 text-slate-900'}">
            <div style="max-w: 800px; margin: 0 auto;" class="p-4">
              ${docClone.outerHTML}
            </div>
            <script>
              window.onload = function() {
                setTimeout(() => {
                  try {
                    window.print();
                  } catch (e) {
                    console.error("Print blocked:", e);
                    window.parent.postMessage({ type: 'PRINT_BLOCKED' }, '*');
                  }
                  setTimeout(() => {
                    window.parent.document.body.removeChild(window.frameElement);
                  }, 800);
                }, 800);
              };
            </script>
          </body>
        </html>
      `);
      doc.close();
    }

    // Proactively show print notice since iframe print is blocked in AI Studio sandboxes
    setTimeout(() => {
      setPrintBlockedError(true);
    }, 100);
  };

  const handleDownload = (type: 'loi' | 'pi') => {
    const elementId = type === 'loi' ? 'commercial-loi-paper' : 'commercial-pi-paper';
    const paperElement = document.getElementById(elementId);
    if (!paperElement) return;

    const docClone = paperElement.cloneNode(true) as HTMLElement;
    const docTitle = type === 'loi' ? 'Letter_of_Intent_LOI' : 'Proforma_Invoice_PI';

    const cleanHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle.replace(/_/g, ' ')}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            slate: {
              150: '#e2e8f0',
              850: '#1e293b',
            }
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap');
    
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box !important;
    }

    body { 
      padding: 40px; 
      background: ${type === 'loi' ? '#090d16' : '#f1f5f9'}; 
      font-family: 'JetBrains Mono', monospace; 
      display: flex; 
      justify-content: center; 
      align-items: center;
      min-height: 100vh;
    }

    .container {
      width: 100%;
      max-width: 800px;
    }

    @media print {
      body { background: white !important; padding: 0 !important; }
      .container { max-width: 100% !important; }
      .print-btn { display: none !important; }
    }

    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4f46e5;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      font-family: sans-serif;
      font-size: 13px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      transition: background 0.2s;
      z-index: 9999;
    }
    .print-btn:hover { background: #4338ca; }
  </style>
</head>
<body class="${type === 'loi' ? 'bg-[#090d16]' : 'bg-slate-100'}">
  <button class="print-btn" onclick="window.print()">Cetak / Simpan PDF</button>
  <div class="container animate-fadeIn">
    ${docClone.outerHTML}
  </div>
  <script>
    window.onload = function() {
      setTimeout(() => {
        window.print();
      }, 800);
    };
  </script>
</body>
</html>`;

    const blob = new Blob([cleanHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle}_2026.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="commercial-gateway-container" className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
      {/* Abstract Grid Decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Top Banner & Title */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-black tracking-widest text-indigo-400 bg-indigo-950 border border-indigo-900 rounded-full uppercase animate-pulse">
              Fase I: Komersial &amp; Kontrak
            </span>
            <span className="text-slate-400 font-mono text-[10px]">•</span>
            <span className="text-slate-400 text-xs flex items-center gap-1 font-mono">
              <Lock className="w-3 h-3 text-amber-500" /> Gerbang Pabean Terkunci
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2.5">
            <Coffee className="w-6 h-6 text-indigo-400 shrink-0" />
            <span>Gerbang Negosiasi Komersial &amp; Pengesahan PI</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
            Sebelum memulai alur logistik maritim, importir Jerman dan eksportir Indonesia wajib melakukan perundingan legalitas komersial demi menerbitkan draf Proforma Invoice (PI) yang sah.
          </p>
        </div>

        {/* Rapid Role Swapper for Simulation */}
        {isArchiveMode || shipment.currentStep !== 'Draft' ? (
          <div className="bg-emerald-950/80 border border-emerald-800/80 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-inner shrink-0 text-emerald-400 font-mono text-[10px] font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Arsip Fase I: Disahkan Bilateral</span>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-1 shrink-0 shadow-inner">
            <span className="text-[10px] font-black uppercase text-slate-500 px-2 tracking-wider font-mono hidden lg:inline">Simulasi Peran:</span>
            <button
              onClick={() => setActiveSimulatedRole('Buyer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSimulatedRole === 'Buyer'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Buyer (Jerman)</span>
            </button>
            <button
              onClick={() => setActiveSimulatedRole('Trader')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSimulatedRole === 'Trader'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Trader (Indo)</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Sub-Stage Stepper Track */}
      <div className="relative z-10 py-6">
        <div className="grid grid-cols-5 gap-2 relative">
          {/* Progress bar background line */}
          <div className="absolute left-[10%] right-[10%] top-[18px] h-0.5 bg-slate-800 -z-10" />
          <div 
            className="absolute left-[10%] top-[18px] h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 -z-10"
            style={{
              width: 
                subStage === 'buyer-sending' ? '0%' :
                subStage === 'trader-reading' ? '25%' :
                subStage === 'negotiating' ? '50%' :
                subStage === 'signing' ? '75%' : '80%'
            }}
          />

          {/* Stepper items */}
          {[
            { id: 'buyer-sending', label: '1. Kirim LOI', icon: FileText, desc: 'Buyer mengirim minat impor' },
            { id: 'trader-reading', label: '2. Tinjau LOI', icon: Eye, desc: 'Trader membaca berkas' },
            { id: 'negotiating', label: '3. Kalkulasi & Nego', icon: DollarSign, desc: 'Sepakati tarif & spek' },
            { id: 'signing', label: '4. Tanda Tangan PI', icon: PenTool, desc: 'Sahkan draf bilateral' },
            { id: 'signed', label: '5. PI Disahkan', icon: CheckCircle2, desc: 'Siap eksekusi logistik' }
          ].map((st, idx) => {
            const isCompleted = 
              (subStage === 'trader-reading' && idx < 1) ||
              (subStage === 'negotiating' && idx < 2) ||
              (subStage === 'signing' && idx < 3) ||
              (subStage === 'signed' && idx < 4) ||
              subStage === 'signed';

            const isActive = subStage === st.id;

            return (
              <div key={st.id} className="text-center flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                  isCompleted 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/40' 
                    : isActive
                      ? 'bg-indigo-600 border-indigo-400 text-white ring-4 ring-indigo-950 scale-110 shadow-lg shadow-indigo-950/40 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <st.icon className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tight mt-2.5 transition-colors ${
                  isActive ? 'text-indigo-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {st.label}
                </span>
                <span className="text-[8.5px] text-slate-500 font-sans hidden sm:block mt-0.5 max-w-[120px] mx-auto leading-tight">
                  {st.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Panel */}
      <div className="relative z-10 pt-4">
        
        {/* Main Workspace Column */}
        <div className="w-full bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 sm:p-6 flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            
            {/* SUB-STAGE 1: BUYER SENDING LOI */}
            {subStage === 'buyer-sending' && (
              <motion.div
                key="buyer-sending"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left flex-1"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
                    <FileText className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight text-white">Langkah 1: Pengajuan Surat Minat Impor Resmi (Letter of Intent)</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">Pengirim: EuroFoods Import GmbH • Penerima: PT Multi Raksa Madani</p>
                  </div>
                </div>

                {/* Simulated LOI Document Paper Specimen */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-[10.5px] text-slate-300 leading-relaxed max-w-full overflow-x-auto shadow-inner">
                  <div className="border-b border-slate-800 pb-3 mb-3 flex items-start justify-between text-slate-400 text-[9px]">
                    <div>
                      <p className="font-bold text-white uppercase text-xs tracking-wide">EUROFOODS IMPORT GMBH</p>
                      <p>Hafenstrasse 12, 20457 Hamburg, Germany</p>
                    </div>
                    <div className="text-right">
                      <p>DOKUMEN: LETTER OF INTENT (LOI)</p>
                      <p>TANGGAL: 24 JUNI 2026</p>
                    </div>
                  </div>

                  <p className="font-black text-white text-center text-xs tracking-wider uppercase py-2">SURAT MINAT PEMBELIAN RESMI (LETTER OF INTENT)</p>
                  
                  <div className="space-y-2 mt-2">
                    <p>Kepada Yth,<br /><strong>PT Multi Raksa Madani (Direksi Komersial Ekspor)</strong><br />Jakarta, Indonesia</p>
                    <p>Dengan surat ini, kami menyatakan ketertarikan resmi (Letter of Intent) untuk mengimpor komoditas perkebunan premium bernilai tinggi dari Indonesia dengan rincian draf niaga awal sebagai berikut:</p>
                    
                    <table className="w-full border-t border-b border-slate-800 py-1.5 my-3 text-left">
                      <tbody>
                        <tr>
                          <td className="py-1 text-slate-400 font-bold w-1/3">Komoditas:</td>
                          <td className="py-1 text-indigo-400 font-extrabold">{shipment.productName || 'Biji Kopi Gayo Organik Arabika (Green Beans)'}</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-slate-400 font-bold">Volume Target:</td>
                          <td className="py-1 text-white font-extrabold">{negotiatedQty} Metrik Ton (MT)</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-slate-400 font-bold">Harga Target:</td>
                          <td className="py-1 text-white font-extrabold">${negotiatedPrice} USD / Ton (Perkiraan Nilai Kontrak: ${(negotiatedQty * negotiatedPrice).toLocaleString('en-US')} USD)</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-slate-400 font-bold">Ketentuan Kirim:</td>
                          <td className="py-1 text-slate-300">{selectedIncoterm}</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-slate-400 font-bold">Ketentuan Bayar:</td>
                          <td className="py-1 text-slate-300">{selectedPayment}</td>
                        </tr>
                      </tbody>
                    </table>

                    <p>Kami sangat menantikan tanggapan resmi berupa lembar penawaran harga (Quotation Sheet) dan draf Proforma Invoice untuk divalidasi dan ditandatangani bilateral.</p>
                  </div>
                </div>

                {/* File Attachment Upload Area (Limit 2 MB) */}
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                      Lampiran Dokumen Pendukung LOI (Opsional, Maks 2 MB)
                    </span>
                    {attachedFile && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                        Siap Kirim
                      </span>
                    )}
                  </div>

                  {activeSimulatedRole === 'Buyer' ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileDropOrSelect(file);
                      }}
                      className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                        isDragging 
                          ? 'border-indigo-500 bg-indigo-950/10' 
                          : attachedFile 
                            ? 'border-emerald-500/50 bg-emerald-950/5' 
                            : 'border-slate-800 hover:border-slate-750 bg-slate-950/30'
                      }`}
                      onClick={() => {
                        if (attachedFile) return; // Prevent triggering file selection dialog if file is already attached
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleFileDropOrSelect(file);
                        };
                        input.click();
                      }}
                    >
                      {!attachedFile ? (
                        <div className="space-y-1.5 py-1">
                          <Upload className="w-5 h-5 mx-auto text-slate-400 animate-bounce" />
                          <p className="text-xs font-semibold text-slate-200">
                            Seret &amp; letakkan file di sini, atau <span className="text-indigo-400 underline">pilih file</span>
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Format yang didukung: PDF, Word, atau Gambar (Maks. 2 MB)
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <div className="flex items-center gap-2.5 text-left min-w-0">
                            <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-[300px]">
                                {attachedFile.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {(attachedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachedFile(null);
                              setUploadError(null);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center bg-slate-950/10 text-slate-500 text-xs">
                      {attachedFile ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <div className="flex items-center gap-2.5 text-left">
                            <Paperclip className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-xs font-bold text-slate-300">{attachedFile.name}</p>
                              <p className="text-[10px] text-slate-500">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {attachedFile.url && (
                              <a
                                href={attachedFile.url}
                                download={attachedFile.name}
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold rounded flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" /> Unduh
                              </a>
                            )}
                            <span className="text-[10px] text-emerald-400 font-bold">Terlampir</span>
                          </div>
                        </div>
                      ) : (
                        "Belum ada dokumen pendukung terlampir"
                      )}
                    </div>
                  )}

                  {uploadError && (
                    <div className="text-[11px] text-rose-400 font-semibold bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-lg flex items-start gap-1.5 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-500" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>

                {/* Contextual Action */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-800/80">
                  {activeSimulatedRole === 'Buyer' ? (
                    <button
                      onClick={handleSendLoi}
                      className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-950/50 hover:-translate-y-0.5"
                    >
                      <span>Kirim LOI Resmi ke Eksportir</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="bg-amber-950/40 border border-amber-900/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-300 leading-normal">
                      <AlertCircle className="w-4 h-4 shrink-0 animate-pulse mt-0.5" />
                      <span>Anda sedang menyimulasikan peran sebagai <strong>Trader Indonesia</strong>. Ganti peran simulasi ke <strong>Buyer (Jerman)</strong> di kanan atas untuk mengirimkan LOI ini terlebih dahulu!</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SUB-STAGE 2: TRADER READING LOI */}
            {subStage === 'trader-reading' && (
              <motion.div
                key="trader-reading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left flex-1"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <Eye className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight text-white">Langkah 2: Tinjau &amp; Terima Surat Minat Impor</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">LOI resmi telah tiba di sistem portal PT Multi Raksa Madani.</p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-4 py-12 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-800 shadow-lg">
                    <FileText className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Surat Minat (LOI) Masuk</h4>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[320px] mx-auto leading-relaxed">
                      Dokumen dari <strong>EuroFoods Import GmbH</strong> siap dibaca. Sebagai eksportir, Anda wajib meninjau spesifikasi, kuantitas, dan tarif yang diminta sebelum menyusun Proforma Invoice.
                    </p>
                  </div>
                </div>

                {attachedFile && (
                  <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl max-w-md mx-auto flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 bg-indigo-500/15 text-indigo-400 rounded shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-[11px] font-bold text-slate-200 truncate max-w-[150px] sm:max-w-[200px]">{attachedFile.name}</p>
                        <p className="text-[9px] text-slate-500 font-mono">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {attachedFile.url && (
                        <a
                          href={attachedFile.url}
                          download={attachedFile.name}
                          className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold rounded flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Unduh
                        </a>
                      )}
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Terlampir
                      </span>
                    </div>
                  </div>
                )}

                {/* Contextual Action */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 border-t border-slate-800/80">
                  {activeSimulatedRole === 'Trader' ? (
                    <button
                      onClick={handleReadLoi}
                      className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-950/50 hover:-translate-y-0.5"
                    >
                      <span>Buka &amp; Tinjau Minat Impor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="bg-amber-950/40 border border-amber-900/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-300 leading-normal">
                      <AlertCircle className="w-4 h-4 shrink-0 animate-pulse mt-0.5" />
                      <span>Sistem mendeteksi dokumen masuk. Silakan ganti peran simulasi ke <strong>Trader (Indo)</strong> di kanan atas untuk membuka dan meninjau isi LOI sebagai eksportir!</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SUB-STAGE 3: NEGOTIATING CLAUSES */}
            {subStage === 'negotiating' && (
              <motion.div
                key="negotiating"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left flex-1"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-600/20 text-amber-400 rounded-xl border border-amber-500/20">
                      <MessageSquare className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base tracking-tight text-white">Langkah 3: Kalkulasi Nilai &amp; Negosiasi Klausul PI</h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">Sesuaikan parameter kargo untuk menghitung total nilai kontrak perdagangan.</p>
                    </div>
                  </div>
                  <div className="bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-center">
                    <Coffee className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-300 font-bold block leading-none">Katalog Produk / Komoditas</span>
                      <span className="text-xs font-black text-white">{shipment.productName || 'Biji Kopi Gayo Arabika'}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Pricing Calculator */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl">
                  {/* Left Column: Volume and Price */}
                  <div className="space-y-4">
                    {/* Volume Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">Volume Cargo (Metric Tons):</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            value={negotiatedQty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setNegotiatedQty(isNaN(val) ? 0 : val);
                            }}
                            className="w-20 bg-slate-900 border border-slate-800 text-indigo-400 font-mono font-black text-right text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                          <span className="text-slate-400 font-bold font-mono">MT</span>
                        </div>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max={Math.max(500, negotiatedQty * 2)} 
                        step="1"
                        value={negotiatedQty}
                        onChange={(e) => setNegotiatedQty(parseInt(e.target.value) || 0)}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <span className="text-[9px] text-slate-500 block leading-none font-mono">Gunakan slider atau ketik langsung angka volume cargo di atas.</span>
                    </div>

                    {/* Price Input Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">Harga Satuan (USD / Ton FOB):</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-bold font-mono">$</span>
                          <input
                            type="number"
                            min="1"
                            value={negotiatedPrice}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setNegotiatedPrice(isNaN(val) ? 0 : val);
                            }}
                            className="w-24 bg-slate-900 border border-slate-800 text-indigo-400 font-mono font-black text-right text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                          <span className="text-slate-400 font-bold font-mono">USD</span>
                        </div>
                      </div>
                      <input 
                        type="range" 
                        min="100" 
                        max={Math.max(5000, negotiatedPrice * 2)} 
                        step="10"
                        value={negotiatedPrice}
                        onChange={(e) => setNegotiatedPrice(parseInt(e.target.value) || 0)}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <span className="text-[9px] text-slate-500 block leading-none font-mono">Gunakan slider atau ketik langsung nominal harga satuan di atas.</span>
                    </div>
                  </div>

                  {/* Right Column: Incoterms and Payment terms */}
                  <div className="space-y-4">
                    {/* Incoterms Select */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 block">Ketentuan Penyerahan (Incoterms):</label>
                      <select
                        value={selectedIncoterm}
                        onChange={(e) => setSelectedIncoterm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="FOB Belawan Port (Incoterms 2020)">FOB Belawan Port, Sumatra (Incoterms 2020)</option>
                        <option value="FOB Tanjung Priok (Incoterms 2020)">FOB Tanjung Priok, Jakarta (Incoterms 2020)</option>
                        <option value="CIF Hamburg Port (Incoterms 2020)">CIF Hamburg Port, Germany (Incoterms 2020)</option>
                      </select>
                      
                      {/* Contextual Incoterm explanation */}
                      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 text-[10px] leading-relaxed text-slate-400 transition-all duration-300">
                        {selectedIncoterm.includes("FOB") ? (
                          <p>
                            <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold font-mono mb-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                              FOB (Free On Board):
                            </span>
                            <br />
                            Penjual menanggung biaya &amp; risiko mengantar kargo hingga melewati pagar kapal di Pelabuhan Muat Indonesia. Setelah kargo naik di atas kapal, tanggung jawab penuh pengapalan, asuransi, serta biaya pengiriman laut resmi beralih ke <span className="text-white font-bold">Pembeli (Buyer)</span>.
                          </p>
                        ) : (
                          <p>
                            <span className="inline-flex items-center gap-1.5 text-indigo-400 font-bold font-mono mb-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                              CIF (Cost, Insurance &amp; Freight):
                            </span>
                            <br />
                            Penjual menanggung seluruh biaya logistik, ongkos kapal pengapalan internasional, hingga premi asuransi pengiriman laut sampai barang tiba di Pelabuhan Tujuan Pembeli (Hamburg). Risiko kerusakan barang di laut beralih ke pembeli sejak barang berada di atas kapal.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Payment Terms Select */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 block">Metode Pembayaran:</label>
                      <select
                        value={selectedPayment}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Letter of Credit (L/C) at Sight">Irrevocable Letter of Credit (L/C) at Sight (100%)</option>
                        <option value="30% Down Payment, 70% L/C Sight">30% Down Payment via T/T, 70% Irrevocable L/C</option>
                        <option value="Telegraphic Transfer (T/T) 100%">100% Telegraphic Transfer (T/T) Advance</option>
                      </select>

                      {/* Contextual Payment terms explanation */}
                      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 text-[10px] leading-relaxed text-slate-400 transition-all duration-300">
                        {selectedPayment === "Letter of Credit (L/C) at Sight" && (
                          <p>
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold font-mono mb-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              L/C at Sight (100%):
                            </span>
                            <br />
                            Metode pembayaran ekspor teraman. Dana 100% dijamin aman dalam penguncian bank koresponden buyer. Bank buyer akan mencairkan dana penuh ke Bank eksportir di Indonesia seketika setelah dokumen kepabeanan lengkap (B/L, COO, Phytosanitary) diserahkan ke bank.
                          </p>
                        )}
                        {selectedPayment === "30% Down Payment, 70% L/C Sight" && (
                          <p>
                            <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold font-mono mb-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                              Hybrid (30% DP, 70% L/C):
                            </span>
                            <br />
                            Buyer mentransfer uang muka 30% di awal via T/T (Prabayar) untuk mendanai modal produksi atau pembelian bahan baku Anda. Sisanya 70% diamankan menggunakan instrumen L/C bank penjamin yang akan dicairkan otomatis saat kargo berhasil dikapalkan.
                          </p>
                        )}
                        {selectedPayment === "Telegraphic Transfer (T/T) 100%" && (
                          <p>
                            <span className="inline-flex items-center gap-1.5 text-teal-400 font-bold font-mono mb-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                              100% T/T Advance (Full Prabayar):
                            </span>
                            <br />
                            Buyer membayar lunas 100% harga kontrak langsung ke rekening bank Anda sebelum proses produksi atau pemuatan barang ke kapal dimulai. Ini adalah transaksi tanpa risiko gagal bayar bagi Anda selaku Eksportir tanah air.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recalculation Results Banner */}
                <div className="bg-indigo-950/40 border border-indigo-900/50 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-indigo-400 font-mono">Estimasi Total Kontrak Niaga</p>
                    <p className="text-2xl font-black text-white tracking-tight mt-1">
                      ${(negotiatedQty * negotiatedPrice).toLocaleString('en-US')}{' '}
                      <span className="text-xs text-slate-400 font-sans font-bold">USD</span>
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-mono space-y-1">
                    <p>Fasilitas Ekspor: <strong className="text-slate-200">GSP Tariff Scheme Eligible</strong></p>
                    <p>Status Pabean: <strong className="text-indigo-400">Pajak Pertambahan Nilai 0% (Ekspor)</strong></p>
                  </div>
                </div>

                {/* Contextual Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-sans leading-normal max-w-md">
                    *Kalkulasi komersial ini akan secara otomatis disalin menjadi draf Proforma Invoice yang siap ditandatangani kedua belah pihak.
                  </span>
                  <button
                    onClick={handleProposeDeal}
                    className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-950/50 hover:-translate-y-0.5 shrink-0"
                  >
                    <span>Sepakati &amp; Buat Proforma Invoice</span>
                    <FileSignature className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* SUB-STAGE 4: SIGNING PI */}
            {subStage === 'signing' && (
              <motion.div
                key="signing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left flex-1"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-600/20 text-violet-400 rounded-xl border border-violet-500/20">
                    <PenTool className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight text-white">Langkah 4: Tanda Tangan Bilateral Proforma Invoice (PI)</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">Draf Proforma Invoice berhasil diterbitkan. Kedua belah pihak wajib menandatangani berkas ini secara resmi.</p>
                  </div>
                </div>

                {/* Document Display Panel */}
                <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-5 sm:p-6 font-mono text-[10px] leading-relaxed relative shadow-lg">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3 text-[8.5px] text-slate-500">
                    <div>
                      <p className="font-extrabold text-slate-900 text-[10px] tracking-wide">PT MULTI RAKSA MADANI</p>
                      <p>Komp. Ruko Harmoni Mas, Jakarta, Indonesia</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-900 text-[10px]">PROFORMA INVOICE (PI)</p>
                      <p>NOMOR: PI/MRM-DEUTSCH/2026/419</p>
                      <p>TANGGAL: 25 JUNI 2026</p>
                    </div>
                  </div>

                  <p className="text-center font-black text-slate-950 text-xs tracking-wider border-b border-slate-100 py-1 mb-3">DRAFT PROFORMA INVOICE / EKSPOR KOPI</p>

                  <div className="grid grid-cols-2 gap-4 text-[9px] mb-4">
                    <div>
                      <span className="text-slate-400 uppercase tracking-wider block">IMPORTIR (BUYER):</span>
                      <strong className="text-slate-900">{shipment.buyerCompany || 'EuroFoods Import GmbH'}</strong>
                      <p className="text-slate-500">Hafenstrasse 12, Hamburg, Germany</p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase tracking-wider block">EKSPORTIR (SELLER):</span>
                      <strong className="text-slate-900">PT Multi Raksa Madani</strong>
                      <p className="text-slate-500">Komp. Ruko Harmoni Mas, Jakarta, Indonesia</p>
                    </div>
                  </div>

                  <table className="w-full border-t border-b border-slate-200 text-left mb-4 text-[9px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                        <th className="py-1 px-2">Komoditas &amp; Spesifikasi</th>
                        <th className="py-1 px-2 text-right">Volume</th>
                        <th className="py-1 px-2 text-right">Harga (USD)</th>
                        <th className="py-1 px-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1.5 px-2">
                          <strong className="text-slate-950">{shipment.productName || 'Biji Kopi Gayo Organik (Green Beans)'}</strong>
                          <p className="text-[8px] text-slate-400">Premium Arabika, Moisture Max 12%, Free of mold</p>
                        </td>
                        <td className="py-1.5 px-2 text-right">{negotiatedQty} MT</td>
                        <td className="py-1.5 px-2 text-right">${negotiatedPrice}</td>
                        <td className="py-1.5 px-2 text-right font-extrabold text-slate-950">${(negotiatedQty * negotiatedPrice).toLocaleString('en-US')} USD</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="grid grid-cols-2 gap-4 text-[8px] text-slate-500 border-b border-slate-100 pb-3 mb-3">
                    <p><strong>Ketentuan Kirim:</strong> {selectedIncoterm}</p>
                    <p><strong>Ketentuan Bayar:</strong> {selectedPayment}</p>
                  </div>

                  {/* Signatures Specimen Fields */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center flex flex-col items-center">
                      <span className="text-[8px] text-slate-400 uppercase">Disahkan oleh Buyer Jerman:</span>
                      <div className="w-full h-12 border border-slate-100 rounded-lg flex items-center justify-center bg-slate-50 relative mt-1">
                        {buyerSigned ? (
                          <span className="font-serif italic text-lg text-blue-700 font-bold tracking-tighter select-none">
                            Hans Mueller
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[8px] animate-pulse">Menunggu tanda tangan...</span>
                        )}
                      </div>
                      <p className="text-[8px] text-slate-550 mt-1 font-bold">EuroFoods Import GmbH</p>
                    </div>

                    <div className="text-center flex flex-col items-center">
                      <span className="text-[8px] text-slate-400 uppercase">Disahkan oleh Eksportir Indonesia:</span>
                      <div className="w-full h-12 border border-slate-100 rounded-lg flex items-center justify-center bg-slate-50 relative mt-1">
                        {traderSigned ? (
                          <span className="font-serif italic text-lg text-indigo-700 font-bold tracking-tighter select-none">
                            Hendry Kurniawan
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[8px] animate-pulse">Menunggu tanda tangan...</span>
                        )}
                      </div>
                      <p className="text-[8px] text-slate-550 mt-1 font-bold">PT Multi Raksa Madani</p>
                    </div>
                  </div>
                </div>

                {/* Signature Trigger Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-800/80">
                  <div className="flex-1 text-[10px] text-slate-400 font-sans">
                    {(!buyerSigned || !traderSigned) ? (
                      <p>Silakan klik tombol tanda tangan di bawah sesuai peran simulasi aktif Anda guna menyelesaikan penandatanganan bilateral.</p>
                    ) : (
                      <p className="text-emerald-400 font-black">✓ Seluruh berkas Proforma Invoice telah selesai ditandatangani bilateral! Klik tombol Lanjutkan di sebelah kanan untuk memulai logistik ekspor.</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                    {!buyerSigned && activeSimulatedRole === 'Buyer' && (
                      <button
                        onClick={handleSignAsBuyer}
                        className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-blue-950/50 hover:-translate-y-0.5"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Tanda Tangan sebagai Buyer</span>
                      </button>
                    )}

                    {!traderSigned && activeSimulatedRole === 'Trader' && (
                      <button
                        onClick={handleSignAsTrader}
                        className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-950/50 hover:-translate-y-0.5"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Tanda Tangan sebagai Trader</span>
                      </button>
                    )}

                    {(!buyerSigned && activeSimulatedRole === 'Trader') && (
                      <span className="text-[10px] text-amber-500 bg-amber-950/40 px-2 py-1.5 rounded-lg border border-amber-900/50 block w-full text-center sm:text-left">
                        Ganti peran ke <strong>Buyer</strong> untuk menandatangani.
                      </span>
                    )}

                    {(!traderSigned && activeSimulatedRole === 'Buyer') && (
                      <span className="text-[10px] text-amber-500 bg-amber-950/40 px-2 py-1.5 rounded-lg border border-amber-900/50 block w-full text-center sm:text-left">
                        Ganti peran ke <strong>Trader</strong> untuk menandatangani.
                      </span>
                    )}

                    {buyerSigned && traderSigned && (
                      activeSimulatedRole === 'Trader' ? (
                        <button
                          onClick={() => setSubStage('signed')}
                          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-950/50 hover:-translate-y-0.5"
                        >
                          <span>Selesaikan Fase I</span>
                          <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                        </button>
                      ) : (
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            disabled
                            className="w-full sm:w-auto px-6 py-2.5 bg-slate-850 text-slate-500 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-800"
                          >
                            <span>Selesaikan Fase I</span>
                            <Lock className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                          <span className="text-[10px] text-amber-500 bg-amber-950/40 px-2 py-1 border border-amber-900/50 rounded-lg">
                            Ganti peran ke <strong>Trader (Indo)</strong> untuk menyelesaikan Fase I.
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUB-STAGE 5: SIGNED & READY FOR LOGISTICS */}
            {subStage === 'signed' && (
              <motion.div
                key="signed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 text-center w-full py-2 flex-1 flex flex-col justify-start"
              >
                {/* Inner Tab bar for Document Viewers inside the Signed view */}
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-850 flex items-center justify-between gap-1 w-full max-w-md mx-auto">
                  <button
                    onClick={() => setActiveArchiveTab('summary')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      activeArchiveTab === 'summary'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Ringkasan Kontrak
                  </button>
                  <button
                    onClick={() => setActiveArchiveTab('loi')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      activeArchiveTab === 'loi'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Surat Minat (LOI)
                  </button>
                  <button
                    onClick={() => setActiveArchiveTab('pi')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      activeArchiveTab === 'pi'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Proforma Invoice (PI)
                  </button>
                </div>

                {/* Print/Blocked Popup Warning Banner */}
                {printBlockedError && (
                  <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-3.5 rounded-xl text-[11px] font-medium flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg border border-amber-500 mb-4 animate-fadeIn text-left max-w-2xl mx-auto w-full leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">⚠️</span>
                      <div>
                        <strong>Pemberitahuan Sistem Sandbox:</strong> Browser memblokir printer popup karena sandbox keamanan AI Studio.
                        <div className="mt-1 text-slate-100 font-bold">💡 SOLUSI: Klik tombol abu-abu "Unduh HTML" di kanan, file yang terunduh akan otomatis memicu dialog cetak PDF asli yang sangat rapi saat dibuka di komputer Anda! Atau klik "Buka Tab Baru" untuk cetak langsung.</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={window.location.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-amber-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-sm shrink-0 flex items-center gap-1"
                      >
                        <span>Tab Baru ↗️</span>
                      </a>
                      <button
                        onClick={() => setPrintBlockedError(false)}
                        className="p-1 hover:bg-amber-800 rounded text-center text-white cursor-pointer"
                        title="Tutup pesan"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                )}

                {activeArchiveTab === 'summary' && (
                  <div className="space-y-6 max-w-lg mx-auto py-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-800 shadow-xl shadow-emerald-950/30">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white">Fase I Berhasil Diselesaikan!</h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Surat Minat Impor (LOI) telah berhasil ditinjau, dinegosiasikan, dan draf Proforma Invoice telah ditandatangani secara bilateral oleh kedua belah pihak secara legal.
                      </p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-left text-xs font-mono text-slate-300 space-y-2">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-800 pb-1.5">Kesimpulan Kontrak Perdagangan</p>
                      <p>• Komoditas: <strong className="text-white">{shipment.productName}</strong></p>
                      <p>• Volume Akhir: <strong className="text-white">{negotiatedQty} Metric Tons</strong></p>
                      <p>• Tarif Kesepakatan: <strong className="text-white">${negotiatedPrice} USD/Ton</strong></p>
                      <p>• Total Nilai Deal: <strong className="text-emerald-400">${(negotiatedQty * negotiatedPrice).toLocaleString('en-US')} USD</strong></p>
                      <p>• Incoterms / Bayar: <strong className="text-white">{selectedIncoterm} / {selectedPayment}</strong></p>
                    </div>

                    {/* Final Progression Button to start Sourcing */}
                    {!(isArchiveMode || shipment.currentStep !== 'Draft') && (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <button
                          onClick={handleResetDemo}
                          className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Ulangi Simulasi</span>
                        </button>

                        <button
                          onClick={handleTransitionToLogistics}
                          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-emerald-950/50 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
                        >
                          <span>Luncurkan Alur Logistik Ekspor</span>
                          <ArrowRight className="w-4 h-4 animate-bounce-right" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeArchiveTab === 'loi' && (
                  <div className="text-left py-2 max-w-2xl mx-auto w-full space-y-3">
                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-2 bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-850">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Arsip Dokumen LOI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload('loi')}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          title="Unduh draf asli format HTML mandiri"
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>Unduh HTML</span>
                        </button>
                      </div>
                    </div>

                    <div id="commercial-loi-paper" className="bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 font-mono text-[10px] text-slate-300 leading-relaxed max-w-full overflow-x-auto shadow-inner space-y-4">
                      <div className="border-b border-slate-800 pb-3 mb-3 flex items-start justify-between text-slate-400 text-[8.5px]">
                        <div>
                          <p className="font-bold text-white uppercase text-xs tracking-wide">EUROFOODS IMPORT GMBH</p>
                          <p>Hafenstrasse 12, 20457 Hamburg, Germany</p>
                        </div>
                        <div className="text-right">
                          <p>DOKUMEN: LETTER OF INTENT (LOI)</p>
                          <p>TANGGAL: 24 JUNI 2026</p>
                        </div>
                      </div>

                      <p className="font-black text-white text-center text-xs tracking-wider uppercase py-2">SURAT MINAT PEMBELIAN RESMI (LETTER OF INTENT)</p>
                      
                      <div className="space-y-2 mt-2">
                        <p>Kepada Yth,<br /><strong>PT Multi Raksa Madani (Direksi Komersial Ekspor)</strong><br />Jakarta, Indonesia</p>
                        <p>Dengan surat ini, kami menyatakan ketertarikan resmi (Letter of Intent) untuk mengimpor komoditas perkebunan premium bernilai tinggi dari Indonesia dengan rincian draf niaga awal sebagai berikut:</p>
                        
                        <table className="w-full border-t border-b border-slate-800 py-1.5 my-3 text-left">
                          <tbody>
                            <tr>
                              <td className="py-1 text-slate-400 font-bold w-1/3">Komoditas:</td>
                              <td className="py-1 text-indigo-400 font-extrabold">{shipment.productName || 'Biji Kopi Gayo Organik Arabika (Green Beans)'}</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-slate-400 font-bold">Volume Target:</td>
                              <td className="py-1 text-white font-extrabold">{negotiatedQty} Metrik Ton (MT)</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-slate-400 font-bold">Harga Target:</td>
                              <td className="py-1 text-white font-extrabold">${negotiatedPrice} USD / Ton (Perkiraan Nilai Kontrak: ${(negotiatedQty * negotiatedPrice).toLocaleString('en-US')} USD)</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-slate-400 font-bold">Ketentuan Kirim:</td>
                              <td className="py-1 text-slate-300">{selectedIncoterm}</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-slate-400 font-bold">Ketentuan Bayar:</td>
                              <td className="py-1 text-slate-300">{selectedPayment}</td>
                            </tr>
                          </tbody>
                        </table>

                        <p>Kami sangat menantikan tanggapan resmi berupa lembar penawaran harga (Quotation Sheet) dan draf Proforma Invoice untuk divalidasi dan ditandatangani bilateral.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeArchiveTab === 'pi' && (
                  <div className="text-left py-2 max-w-2xl mx-auto w-full space-y-3">
                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-2 bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-850">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Arsip Dokumen PI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload('pi')}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          title="Unduh draf asli format HTML mandiri"
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>Unduh HTML</span>
                        </button>
                      </div>
                    </div>

                    <div id="commercial-pi-paper" className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-5 sm:p-6 font-mono text-[9.5px] leading-relaxed relative shadow-lg overflow-x-auto">
                      <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3 text-[8px] text-slate-500">
                        <div>
                          <p className="font-extrabold text-slate-900 text-[9px] tracking-wide">PT MULTI RAKSA MADANI</p>
                          <p>Komp. Ruko Harmoni Mas, Jakarta, Indonesia</p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-slate-900 text-[9px]">PROFORMA INVOICE (PI)</p>
                          <p>NOMOR: PI/MRM-DEUTSCH/2026/419</p>
                          <p>TANGGAL: 25 JUNI 2026</p>
                        </div>
                      </div>

                      <p className="text-center font-black text-slate-950 text-xs tracking-wider border-b border-slate-100 py-1 mb-3 uppercase">PROFORMA INVOICE FINAL / EKSPOR KOMODITAS</p>

                      <div className="grid grid-cols-2 gap-4 text-[8.5px] mb-4">
                        <div>
                          <span className="text-slate-400 uppercase tracking-wider block">IMPORTIR (BUYER):</span>
                          <strong className="text-slate-900">{shipment.buyerCompany || 'EuroFoods Import GmbH'}</strong>
                          <p className="text-slate-550">Hafenstrasse 12, Hamburg, Germany</p>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase tracking-wider block">EKSPORTIR (SELLER):</span>
                          <strong className="text-slate-900">PT Multi Raksa Madani</strong>
                          <p className="text-slate-550">Komp. Ruko Harmoni Mas, Jakarta, Indonesia</p>
                        </div>
                      </div>

                      <table className="w-full border-t border-b border-slate-200 text-left mb-4 text-[8.5px]">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                            <th className="py-1 px-2">Komoditas &amp; Spesifikasi</th>
                            <th className="py-1 px-2 text-right">Volume</th>
                            <th className="py-1 px-2 text-right">Harga (USD)</th>
                            <th className="py-1 px-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-1.5 px-2">
                              <strong className="text-slate-950">{shipment.productName || 'Biji Kopi Gayo Organik (Green Beans)'}</strong>
                              <p className="text-[7.5px] text-slate-400">Premium Grade, Moisture Max 12%, Free of mold</p>
                            </td>
                            <td className="py-1.5 px-2 text-right">{negotiatedQty} MT</td>
                            <td className="py-1.5 px-2 text-right">${negotiatedPrice}</td>
                            <td className="py-1.5 px-2 text-right font-extrabold text-slate-950">${(negotiatedQty * negotiatedPrice).toLocaleString('en-US')} USD</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="grid grid-cols-2 gap-4 text-[8px] text-slate-500 border-b border-slate-100 pb-3 mb-3">
                        <p><strong>Ketentuan Kirim:</strong> {selectedIncoterm}</p>
                        <p><strong>Ketentuan Bayar:</strong> {selectedPayment}</p>
                      </div>

                      {/* Signatures Specimen Fields */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center flex flex-col items-center">
                          <span className="text-[7.5px] text-slate-400 uppercase">Disahkan oleh Buyer Jerman:</span>
                          <div className="w-full h-11 border border-slate-100 rounded-lg flex items-center justify-center bg-slate-50 relative mt-1">
                            <span className="font-serif italic text-base text-blue-700 font-bold tracking-tighter select-none">
                              Hans Mueller
                            </span>
                          </div>
                          <p className="text-[7.5px] text-slate-550 mt-1 font-bold">EuroFoods Import GmbH</p>
                        </div>

                        <div className="text-center flex flex-col items-center">
                          <span className="text-[7.5px] text-slate-400 uppercase">Disahkan oleh Eksportir Indonesia:</span>
                          <div className="w-full h-11 border border-slate-100 rounded-lg flex items-center justify-center bg-slate-50 relative mt-1">
                            <span className="font-serif italic text-base text-emerald-700 font-bold tracking-tighter select-none">
                              Prasetyo Adi
                            </span>
                          </div>
                          <p className="text-[7.5px] text-slate-550 mt-1 font-bold">PT Multi Raksa Madani</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
