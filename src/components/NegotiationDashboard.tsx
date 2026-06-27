import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExportProduct, UserProfile, ExportShipment, ShipmentStep } from '../types';
import { 
  FileText, Calendar, Check, Send, AlertTriangle, UserCheck, 
  HelpCircle, ChevronRight, CheckCircle2, RefreshCw, FileSignature, 
  Download, ArrowRight, User, Building2, Landmark, ShieldAlert, BadgeInfo,
  ZoomIn, ZoomOut, Printer, Lock, Eye, X
} from 'lucide-react';
import { mockProducts, mockUsers } from '../mockData';

interface NegotiationStep {
  id: number;
  title: string;
  badge: string;
  actor: string;
  sender: string;
  receiver: string;
  description: string;
  importance: string;
  isCompleted: boolean;
}

interface NegotiationDashboardProps {
  initialProduct?: ExportProduct;
  currentUser?: UserProfile | null;
  onDealCreated?: (dealData: {
    product: ExportProduct;
    quantity: number;
    pricePerUnit: number;
    paymentTerms: string;
    incoterms: string;
    portOfDischarge: string;
    buyerCompany: string;
  }) => void;
  shipment?: ExportShipment;
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
  forcedStepId?: number;
  onStepIdChange?: (stepId: number) => void;
  autoOpenLoi?: boolean;
  onResetAutoOpenLoi?: () => void;
  onSelectUser?: (user: UserProfile) => void;
}

export default function NegotiationDashboard({ 
  initialProduct, 
  currentUser, 
  onDealCreated,
  shipment,
  onUpdateShipmentFromDeal,
  forcedStepId,
  onStepIdChange,
  autoOpenLoi,
  onResetAutoOpenLoi,
  onSelectUser
}: NegotiationDashboardProps) {
  // 1. Negotiation States
  const [currentStepId, setCurrentStepId] = useState<number>(2); // Default to Step 2: Offer Sheet & Quotation (LOI stage has been removed)
  
  // Helper to change step internally and bubble to parent safely during user action clicks
  const updateStepIdAndBubble = (newStep: number) => {
    setCurrentStepId(newStep);
    if (onStepIdChange) {
      onStepIdChange(newStep);
    }
  };
  const [selectedProduct, setSelectedProduct] = useState(initialProduct || mockProducts[0]);
  const [quantity, setQuantity] = useState<number>(20); // MT unit
  const [pricePerUnit, setPricePerUnit] = useState<number>(1450); // USD
  const [paymentTerms, setPaymentTerms] = useState<string>('50% DP T/T, 50% LC at Sight');
  const [incoterms, setIncoterms] = useState<string>('FOB Jakarta Port (Incoterms 2020)');
  const [portOfDischarge, setPortOfDischarge] = useState<string>('Port of Yokohama, Japan');
  const [buyerCompany, setBuyerCompany] = useState<string>('YOSHIHIDE TRADING CO., LTD.');
  const [buyerAddress, setBuyerAddress] = useState<string>('2-chome-4-1 Shibakoen, Minato City, Tokyo 105-0011, Japan');

  // Signatures State
  const [isExporterSigned, setIsExporterSigned] = useState<boolean>(false);
  const [isBuyerSigned, setIsBuyerSigned] = useState<boolean>(false);

  // Special LOI Attachment state for Buyer
  const [loiAttachment, setLoiAttachment] = useState<Array<{ name: string; size: string; date: string }>>([
    { name: 'Official_LOI_Yoshihide.pdf', size: '345 KB', date: '22-06-2026' }
  ]);
  const [dragOver, setDragOver] = useState(false);

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

  // Modal display states for LOI & Interactive Offer flow
  const [isLoiModalOpen, setIsLoiModalOpen] = useState<boolean>(false);
  const [isTawaranModalOpen, setIsTawaranModalOpen] = useState<boolean>(false);
  const [showPreviewInModal, setShowPreviewInModal] = useState<boolean>(true);

  // Specialized Print & Download for LOI Popup Modal
  const handlePrintLoi = () => {
    setPrintBlockedError(false);
    const paperElement = document.getElementById('loi-document-paper');
    if (!paperElement) return;

    const docClone = paperElement.cloneNode(true) as HTMLElement;
    const buttons = docClone.querySelectorAll('button');
    buttons.forEach(btn => btn.remove());

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
            <title>Letter of Intent - Yoshihide Trading Co.</title>
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
                background: white; 
                color: #1e293b; 
                line-height: 1.5;
              }

              @media print {
                body { margin: 1.2cm !important; padding: 0 !important; background: white !important; color: black !important; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body class="bg-white text-slate-900">
            <div class="max-w-2xl mx-auto p-4 bg-white">
              <div class="text-[11px] leading-relaxed">
                ${docClone.outerHTML}
              </div>
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

    // Proactively show print blocked notice
    setTimeout(() => {
      setPrintBlockedError(true);
    }, 100);
  };

  const handleDownloadLoiHTML = () => {
    const paperElement = document.getElementById('loi-document-paper');
    if (!paperElement) return;

    const docClone = paperElement.cloneNode(true) as HTMLElement;
    const buttons = docClone.querySelectorAll('button');
    buttons.forEach(btn => btn.remove());

    const cleanHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Letter of Intent - Yoshihide Trading Co.</title>
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
      background: #f1f5f9; 
      font-family: 'JetBrains Mono', monospace; 
      display: flex; 
      justify-content: center; 
      align-items: flex-start; 
      min-height: 100vh;
      color: #1e293b;
      line-height: 1.5;
    }

    .paper-container { 
      width: 100%; 
      max-width: 800px;
    }

    @media print {
      body { background: white !important; padding: 0 !important; }
      .paper-container { max-width: 100% !important; }
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
<body class="bg-slate-100">
  <button class="print-btn" onclick="window.print()">Cetak / Simpan PDF</button>
  <div class="paper-container">
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

    const blob = new Blob([cleanHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Letter_of_Intent_Yoshihide.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Sync state if initialProduct changes
  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
      setCurrentStepId(2); // Begin from step 2
      const priceVal = parseFloat(initialProduct.price.replace(/,/g, '')) || 1000;
      setPricePerUnit(priceVal);
      setIsExporterSigned(false);
      setIsBuyerSigned(false);
      
      // Auto prefill addresses depending on product origin
      if (initialProduct.origin.toLowerCase().includes('papua') || initialProduct.origin.toLowerCase().includes('ambon')) {
        setIncoterms('FOB Nabire Port (Incoterms 2020)');
      } else if (initialProduct.origin.toLowerCase().includes('halmahera') || initialProduct.origin.toLowerCase().includes('ternate')) {
        setIncoterms('FOB Tobelo Port (Incoterms 2020)');
      } else {
        setIncoterms('FOB Jakarta Port (Incoterms 2020)');
      }
    }
  }, [initialProduct]);

  // Sync state if active shipment changes (integrated layout)
  useEffect(() => {
    if (shipment) {
      const matchingProduct = mockProducts.find(p => p.name === shipment.productName) || mockProducts[0];
      setSelectedProduct(matchingProduct);
      setQuantity(shipment.quantity);
      
      const pUnit = shipment.totalValue / shipment.quantity || 1000;
      setPricePerUnit(pUnit);
      setPortOfDischarge(shipment.portOfDischarge);
      setBuyerCompany(shipment.buyerCompany);
      
      if (shipment.paymentTerms) {
        setPaymentTerms(shipment.paymentTerms);
      }
      if (shipment.incoterms) {
        setIncoterms(shipment.incoterms);
      } else {
        setIncoterms(`FOB ${shipment.portOfLoading.split(',')[0]} (Incoterms 2020)`);
      }

      if (shipment.currentStep !== 'Draft') {
        setCurrentStepId(5);
        setIsExporterSigned(true);
        setIsBuyerSigned(true);
      } else {
        // If draft, reset signature states to let them click through steps
        if (forcedStepId === undefined) {
          setCurrentStepId(2);
        }
        setIsExporterSigned(false);
        setIsBuyerSigned(false);
      }
    }
  }, [shipment]);

  // Synchronize externally selected steps (e.g. from the overarching interactive infographic conveyor belt)
  useEffect(() => {
    if (forcedStepId !== undefined && forcedStepId !== currentStepId) {
      setCurrentStepId(forcedStepId);
    }
  }, [forcedStepId]);

  // Auto open the Quotation modal if requested from parent (e.g. redirected from calculator)
  useEffect(() => {
    if (autoOpenLoi) {
      setIsTawaranModalOpen(true);
      if (onResetAutoOpenLoi) {
        onResetAutoOpenLoi();
      }
    }
  }, [autoOpenLoi, onResetAutoOpenLoi]);

  // Auto-progress shipment to Shipping once both parties have signed the contract/PI in the Draft step
  useEffect(() => {
    if (isExporterSigned && isBuyerSigned && shipment && shipment.currentStep === 'Draft') {
      if (onUpdateShipmentFromDeal) {
        onUpdateShipmentFromDeal(shipment.id, {
          quantity,
          pricePerUnit,
          paymentTerms,
          incoterms,
          portOfDischarge,
          buyerCompany,
          nextStep: 'Shipping',
          comments: 'Kontrak Penjualan & Proforma Invoice (PI) resmi disahkan secara bilateral karena tanda tangan lengkap dari kedua belah pihak.'
        });
      }
    }
  }, [isExporterSigned, isBuyerSigned, shipment, quantity, pricePerUnit, paymentTerms, incoterms, portOfDischarge, buyerCompany, onUpdateShipmentFromDeal]);

  // Bubble up is now handled directly by the event handlers utilizing the `updateStepIdAndBubble` function.

  const isContractSigned = shipment?.documents.some(d => d.type === 'Sales Contract' && d.status === 'Approved');
  const isLocked = !!(shipment && (shipment.currentStep !== 'Draft' || isContractSigned));
  const canSignExporter = currentUser?.role === 'Trader' || currentUser?.role === 'Owner/Direktur';
  const canSignBuyer = currentUser?.role === 'Buyer';

  // Zoom and Pan States for Interactive Document Viewport
  const [scale, setScale] = useState<number>(1.0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Event Handlers for Dragging (Pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking a button, do not start dragging
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('input')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('input')) {
      return;
    }
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom inside the live preview box via scroll wheel
    const zoomIntensity = 0.05;
    if (e.deltaY < 0) {
      setScale(prev => Math.min(2.0, prev + zoomIntensity));
    } else {
      setScale(prev => Math.max(0.6, prev - zoomIntensity));
    }
  };

  // Auto Calculations
  const totalPrice = quantity * pricePerUnit;

  // Print & Download Utilities
  const handlePrint = () => {
    setPrintBlockedError(false);
    const paperElement = document.getElementById('negotiation-document-paper');
    if (!paperElement) return;

    // Clone the element to safely remove interactive elements like CTA buttons
    const docClone = paperElement.cloneNode(true) as HTMLElement;
    const buttons = docClone.querySelectorAll('button');
    buttons.forEach(btn => btn.remove());

    // Create a fine-tuned print iframe to render identical styles
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
            <title>Dokumen Negosiasi - PT MULTI RAKSA MADANI</title>
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
                background: white; 
                color: #1e293b; 
                line-height: 1.5;
              }

              @media print {
                body { margin: 1.2cm !important; padding: 0 !important; background: white !important; color: black !important; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body class="bg-white text-slate-900">
            <div class="max-w-2xl mx-auto p-4 bg-white">
              <div class="text-[11px] leading-relaxed">
                ${docClone.outerHTML}
              </div>
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

    // Proactively show print blocked notice
    setTimeout(() => {
      setPrintBlockedError(true);
    }, 100);
  };

  const handleDownloadHTML = () => {
    const paperElement = document.getElementById('negotiation-document-paper');
    if (!paperElement) return;

    // Clone the element to safely remove buttons
    const docClone = paperElement.cloneNode(true) as HTMLElement;
    const buttons = docClone.querySelectorAll('button');
    buttons.forEach(btn => btn.remove());

    let docTitle = 'Dokumen_Negosiasi';
    if (currentStepId === 1) docTitle = 'Letter_of_Intent_Yoshihide';
    else if (currentStepId === 2) docTitle = 'Quotation_PT_Agri_Flow';
    else if (currentStepId === 3 || currentStepId === 5) docTitle = 'Proforma_Invoice_Agri_Flow';
    else docTitle = 'Log_Negosiasi_Eksportir';

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
      background: #f1f5f9; 
      font-family: 'JetBrains Mono', monospace; 
      display: flex; 
      justify-content: center; 
      align-items: flex-start; 
      min-height: 100vh;
      color: #1e293b;
      line-height: 1.5;
    }

    .paper-container { 
      width: 100%; 
      max-width: 800px;
    }

    @media print {
      body { background: white !important; padding: 0 !important; }
      .paper-container { max-width: 100% !important; }
      .print-btn { display: none !important; }
    }

    .print-btn {
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #4f46e5; 
      color: white; 
      padding: 10px 20px; 
      border-radius: 8px; 
      border: none; 
      font-weight: bold; 
      cursor: pointer; 
      font-family: sans-serif; 
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
      z-index: 9999;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .print-btn:hover { background: #4338ca; }
  </style>
</head>
<body class="bg-slate-100">
  <button class="print-btn" onclick="window.print()">Cetak / Simpan PDF</button>
  <div class="paper-container">
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

  // Handler to change product
  const handleProductSelect = (id: string) => {
    const prod = mockProducts.find(p => p.id === id);
    if (prod) {
      setSelectedProduct(prod);
      // Strip formatting to get numeric value
      const priceNum = parseFloat(prod.price.replace(/,/g, '')) || 1000;
      setPricePerUnit(priceNum);
      
      // Auto-adjust default qty based on product min order or unit
      if (prod.id === 'prod-2') {
        setQuantity(10);
      } else if (prod.id === 'prod-1') {
        setQuantity(20);
      } else {
        setQuantity(15);
      }
    }
  };

  // Reset all steps to test flow
  const handleResetFlow = () => {
    updateStepIdAndBubble(2);
    setIsExporterSigned(false);
    setIsBuyerSigned(false);
  };

  // 4 Negotiation Stages with Explanations (Stage 1 LOI removed)
  const negotiationSteps: NegotiationStep[] = [
    {
      id: 2,
      title: "Offer Sheet & Quotation (Brosur Penawaran)",
      badge: "Marketing Pitch",
      actor: "Exporter (Trader/Supplier)",
      sender: "Exportir Indonesia",
      receiver: "YOSHIHIDE TRADING CO., Japan",
      description: "Eksportir mengirimkan formal Quotation Sheet (Surat Penawaran Harga) sebagai inisiasi minat pembeli. Berisi paparan spesifikasi keunggulan komoditas, foto laboratorium, harga usulan awal, dan Pelabuhan Muat yang disiapkan.",
      importance: "Berstatus sebagai dokumen penawaran marketing/komersial awal. Belum berkekuatan hukum kontrak.",
      isCompleted: currentStepId > 2
    },
    {
      id: 3,
      title: "Drafting Proforma Invoice (Draf Penawaran Formal)",
      badge: "Penyusunan Pre-Kontrak",
      actor: "Exporter (Trader)",
      sender: "Exportir Indonesia",
      receiver: "YOSHIHIDE TRADING CO., Japan",
      description: "Eksportir menaikkan status penawaran menjadi Proforma Invoice (PI). Dokumen ini mengadopsi nomor seri invoice resmi, detail rekening devisa perbankan, rincian Incoterms, pelabuhan bongkar, dan rancangan metode pembayaran secara ketat.",
      importance: "Menjadi draf kontrak formal pertama. Masih bertuliskan 'PROFORMA' dan belum final sebelum ditandatangani kedua pihak.",
      isCompleted: currentStepId > 3
    },
    {
      id: 4,
      title: "Negosiasi & Counter-Offer (Saling Sanggah)",
      badge: "Tawar-Menawar Rincian",
      actor: "Dua Belah Pihak (Eksportir & Importir)",
      sender: "Bilateral",
      receiver: "Bilateral",
      description: "Kedua pihak berdiskusi intensif merevisi draf PI. Importir bisa menyanggah harga (minta diskon), menyesuaikan jumlah kontainer, merubah DP (payment terms), atau merubah Incoterms (misal dari FOB menjadi CIF).",
      importance: "Tahapan paling dinamis untuk mengunci win-win solution agar risiko kedua belah pihak terlindungi.",
      isCompleted: currentStepId > 4
    },
    {
      id: 5,
      title: "Bilateral Signed PI (Kontrak Sah Mengikat)",
      badge: "Kesepakatan Hukum",
      actor: "Dua Belah Pihak (Must Be Signed By Both)",
      sender: "Bilateral",
      receiver: "Bilateral",
      description: "Puncak alur! Proforma Invoice ditandatangani basah/digital dan dicap oleh Eksportir DAN Importir. Dokumen PI yang telah ditandatangani dua pihak ini sah menjadi kontrak dagang antara dan dipakai sebagai syarat mutlak membuka L/C di Bank Devisa asing.",
      importance: "PI yang telah di-countersign bertindak sebagai Sales Contract semenjana yg mengunci legalitas sebelum logistik dijalankan.",
      isCompleted: isExporterSigned && isBuyerSigned
    }
  ];

  const traderUser = mockUsers.find(u => u.role === 'Trader');
  const buyerUser = mockUsers.find(u => u.role === 'Buyer');

  const renderDocumentContent = (side: 'buyer' | 'trader') => {
    return (
      <div className="space-y-4">
        {/* STAGE 1: INQUIRY (Letter of Intent) */}
        {currentStepId === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-dashed border-slate-300 pb-3">
              <h5 className="font-bold text-slate-900 text-xs">YOSHIHIDE TRADING CO., LTD.</h5>
              <p className="text-[9px] text-slate-400">2-chome-4-1 Shibakoen, Minato City, Tokyo 105-0011, Japan</p>
              <p className="text-[9px] text-slate-400">Tel: +81-3-5401-XXXX | Email: import@yoshihide.co.jp</p>
            </div>
            <div className="text-right text-[9px] text-slate-500">
              <p className="font-bold">Doc Ref: YT-LOI/2026/04</p>
              <p>Date: June 15, 2026</p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-900">TO: PT MULTI RAKSA MADANI</p>
              <p className="font-bold text-[11px] underline text-indigo-900">SUBJECT: LETTER OF INTENT (LOI) & COMMODITY INQUIRY</p>
              <p className="leading-relaxed text-slate-600">
                Dear Multi Raksa Madani Exports Team,
              </p>
              <p className="leading-relaxed text-slate-600">
                We herewith officially express our strong interest to purchase high-quality Indonesian commodities. Based on your repute, we would like to request a detailed specifications list and a price proposal for:
              </p>
              <div className="p-2 bg-white rounded border border-slate-205 font-bold text-indigo-950 text-[9.5px]">
                • Commodity: {selectedProduct.name}<br />
                • Target Volume: {quantity} MT (Metrik Ton)<br />
                • Target Incoterms: FOB Jakarta Port<br />
                • Price Guideline Needed: USD / Metric Ton
              </div>
              <p className="leading-relaxed text-slate-600">
                Kindly send us your Official Quotation Sheet along with laboratory test certifications (COA) and cargo load-time estimates. We look forward to a sustainable mutual trade relationship.
              </p>

              {/* List attachments in document paper */}
              {loiAttachment.length > 0 && (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 mt-3 space-y-1.5 text-left">
                  <p className="font-bold text-[8.5px] uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    ATTACHED DOCUMENTS (CLIENT-SIDE UPLOADS):
                  </p>
                  <div className="space-y-1">
                    {loiAttachment.map((file, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-slate-700 text-[8.5px] font-bold">
                        <span className="text-[7.5px] bg-slate-250 text-slate-750 px-1 py-0.2 rounded font-black uppercase font-mono">{file.name.split('.').pop() || 'PDF'}</span>
                        <span className="truncate max-w-[180px]">{file.name}</span> 
                        <span className="text-slate-400">({file.size})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-400 text-[8px] italic">Signed digitally by Kenji Yoshihide (Director)</span>
              {side === 'trader' ? (
                <button 
                  onClick={() => updateStepIdAndBubble(2)}
                  className="text-[9px] font-black uppercase tracking-wider text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer active:scale-95"
                >
                  Balas Dengan Quotation →
                </button>
              ) : (
                <span className="text-indigo-600 text-[9px] font-bold uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded border border-indigo-150">LOI Terkirim ✓</span>
              )}
            </div>
          </div>
        )}

        {/* STAGE 2: OFFER SHEET & QUOTATION */}
        {currentStepId === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-dashed border-slate-300 pb-3">
              <h5 className="font-bold text-slate-900 text-xs">PT MULTI RAKSA MADANI</h5>
              <p className="text-[9px] text-slate-400">Gedung Devisa Ekspor Lantai 12, Jakarta, Indonesia</p>
              <p className="text-[9px] text-slate-400">Email: export@multiraksamaradani.co.id | Tax ID (NPWP): 01.993.44.22</p>
            </div>
            <div className="text-right text-[9px] text-slate-500">
              <p className="font-bold">Doc Ref: AQ-QTN/2026/102</p>
              <p>Date: June 17, 2026</p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-900">TO: YOSHIHIDE TRADING CO., LTD. (Tokyo, Japan)</p>
              <p className="font-bold text-[11px] underline text-indigo-900">OFFICIAL COMMERCIAL PRICE QUOTATION</p>
              <p className="leading-relaxed text-slate-650">
                Thank you for your LOI interest YT-LOI/2026/04. We are delighted to submit our best factory offering pricing & parameters below:
              </p>
              <div className="bg-white rounded border border-slate-205 overflow-hidden">
                <div className="p-2 bg-slate-100 border-b border-slate-200 flex justify-between font-bold text-slate-800">
                  <span>ITEM / SPECIFICATION</span>
                  <span>OFFER PRICE</span>
                </div>
                <div className="p-2 text-[9px] space-y-1 text-left">
                  <p className="font-bold text-slate-900">{selectedProduct.name}</p>
                  <p className="text-slate-500 leading-snug text-[8.5px]">Specification: {selectedProduct.specification}</p>
                  <p className="text-slate-500 font-bold text-[8.5px]">Origin: {selectedProduct.origin} | HS CODE: {selectedProduct.hsCode}</p>
                  <div className="pt-1 flex justify-between border-t border-slate-100 font-bold text-indigo-950">
                    <span>Quantity: {quantity} MT</span>
                    <span>USD ${pricePerUnit.toLocaleString('en-US')} / MT</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[8px] text-slate-500 text-left">
                <div>
                  <strong>• Port of Loading:</strong> Tanjung Priok Port, Jakarta<br />
                  <strong>• Delivery Lead time:</strong> 14 Days after Payment
                </div>
                <div>
                  <strong>• Packing Standards:</strong> PP Bags / Outer Carton box<br />
                  <strong>• Inspection:</strong> SGS or Sucofindo verified
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-400 text-[8px] italic">Issued by: Devisa Dagang Ekspor Indonesia</span>
              {side === 'buyer' ? (
                <button 
                  onClick={() => updateStepIdAndBubble(3)}
                  className="text-[9px] font-black uppercase tracking-wider text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer active:scale-95"
                >
                  Naikkan Jadi Proforma Invoice →
                </button>
              ) : (
                <span className="text-indigo-600 text-[9px] font-bold uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded border border-indigo-150">Quotation Dikirim ✓</span>
              )}
            </div>
          </div>
        )}

        {/* STAGE 4: NEGOTIASI & COUNTER-OFFER */}
        {currentStepId === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-dashed border-slate-300 pb-2">
              <h5 className="font-bold text-orange-955 text-xs flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block animate-pulse"></span>
                TABEL MONITORING NEGOSIASI & COUNTER-OFFER
              </h5>
              <p className="text-[9px] text-slate-500">Tawar-menawar klausa dokumen sebelum L/C dibuka secara legal.</p>
            </div>

            <div className="space-y-2.5 text-left">
              
              {/* Live negotiation chat 1 */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-3xs">
                <div className="flex justify-between items-center text-[8px] font-bold text-indigo-850 mb-1">
                  <span>Sanggahan 1: Penurunan Harga Per Unit</span>
                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-black uppercase text-[7px]">Menunggu Keputusan</span>
                </div>
                <p className="text-[9px] text-slate-600 leading-relaxed mb-2">
                  &ldquo;Yoshihide Trading Co. meminta diskon khusus. Mereka menawar harga diturunkan ke <strong>USD ${Math.max(10, pricePerUnit - 100).toLocaleString('en-US')} / MT</strong> karena ini merupakan order perdana.&rdquo;
                </p>
                <button 
                  onClick={() => {
                    setPricePerUnit(Math.max(10, pricePerUnit - 100));
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-[8px] font-black uppercase tracking-wide px-2 py-1 rounded transition-colors cursor-pointer active:scale-95"
                >
                  ✓ Terima Diskon (Ganti Harga Real-time)
                </button>
              </div>

              {/* Live negotiation chat 2 */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-3xs">
                <div className="flex justify-between items-center text-[8px] font-bold text-indigo-850 mb-1">
                  <span>Sanggahan 2: Syarat Pengiriman (Incoterms)</span>
                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-black uppercase text-[7px]">Menunggu Keputusan</span>
                </div>
                <p className="text-[9px] text-slate-600 leading-relaxed mb-2">
                  &ldquo;Pembeli lebih memilih penawaran <strong>CIF Tokyo Port</strong> agar mereka tidak perlu repot mencari kapal kontainer sendiri di Tanjung Priok.&rdquo;
                </p>
                <button 
                  onClick={() => {
                    setIncoterms('CIF Tokyo Port, Japan (Incoterms 2020)');
                    setPortOfDischarge('Port of Tokyo, Japan');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[8px] font-black uppercase tracking-wide px-2 py-1 rounded transition-colors cursor-pointer active:scale-95"
                >
                  ✓ Setujui CIF Tokyo (Ubah Struktur Ongkos)
                </button>
              </div>

              {/* Live negotiation chat 3 */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-3xs">
                <div className="flex justify-between items-center text-[8px] font-bold text-indigo-850 mb-1">
                  <span>Sanggahan 3: Pilihan Metode Pembayaran</span>
                  <span className="bg-emerald-100 text-emerald-850 px-1.5 py-0.2 rounded font-black font-mono text-[7px]">✓ Direkomendasikan Bank</span>
                </div>
                <p className="text-[9px] text-slate-600 leading-relaxed mb-2">
                  &ldquo;Gunakan sistem prabayar/DP atau L/C term di dalam PI agar devisa terjamin otomatis sebelum proses logistik pengiriman.&rdquo;
                </p>
                <button 
                  onClick={() => {
                    setPaymentTerms('100% Sight Letter of Credit (L/C Irrevocable)');
                  }}
                  className="bg-slate-700 hover:bg-slate-850 text-white text-[8px] font-black uppercase tracking-wide px-2 py-1 rounded transition-colors cursor-pointer active:scale-95"
                >
                  ✓ Gunakan 100% L/C Irrevocable
                </button>
              </div>

            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[8px] text-slate-400 font-bold">Klausul di atas akan langsung meng-update draf PI ekspor Anda</span>
              {side === 'trader' ? (
                <button 
                  onClick={() => updateStepIdAndBubble(5)}
                  className="text-[9px] font-black uppercase tracking-wider text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer active:scale-95"
                >
                  Kunci & Ke Meja TTD Bilateral →
                </button>
              ) : (
                <span className="text-orange-600 text-[9px] font-bold uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded border border-orange-150">Dalam Sesi Diskusi 💬</span>
              )}
            </div>
          </div>
        )}

        {/* STAGE 3 & 5: PROFORMA INVOICE FRAME */}
        {(currentStepId === 3 || currentStepId === 5) && (
          <>
            {/* Sheet Header */}
            <div className="flex justify-between items-start border-b border-dashed border-slate-300 pb-3">
              <div>
                <h5 className="font-bold text-slate-900 text-xs">PROFORMA INVOICE</h5>
                <p className="text-[9px] text-slate-400 mt-0.5">PT MULTI RAKSA MADANI</p>
                <p className="text-[9px] text-slate-400">Jakarta, Indonesia</p>
              </div>
              <div className="text-right col-span-4 ml-auto">
                <p className="font-bold text-slate-900">No: PFI/EFI-2026/8892</p>
                <p className="text-slate-500">Date: June 20, 2026</p>
              </div>
            </div>

            {/* Parties Block */}
            <div className="grid grid-cols-2 gap-2 text-[9px] text-left">
              <div className={`bg-white p-2 rounded-md border text-left ${side === 'trader' ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-200'}`}>
                <span className="font-black uppercase text-[8px] text-indigo-800 block mb-0.5">1. SELLER / SHIPPER</span>
                <p className="font-bold text-slate-900 text-[9px]">PT MULTI RAKSA MADANI</p>
                <p className="text-slate-500 mt-0.5 leading-tight text-[8px]">Gedung Devisa Ekspor Lantai 12, Jakarta, Indonesia</p>
              </div>
              <div className={`bg-white p-2 rounded-md border text-left ${side === 'buyer' ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'}`}>
                <span className="font-black uppercase text-[8px] text-amber-800 block mb-0.5">2. BUYER / IMPORTER</span>
                <p className="font-bold text-slate-900 text-[9px]">{buyerCompany}</p>
                <p className="text-slate-500 mt-0.5 leading-tight text-[8px]">{buyerAddress}</p>
              </div>
            </div>

            {/* Cargo specs table */}
            <div className="bg-white rounded-md border border-slate-200 overflow-hidden text-left">
              <div className="bg-slate-100 px-2 py-1.5 font-bold grid grid-cols-12 border-b border-slate-200 text-slate-800 text-[8px]">
                <span className="col-span-6 text-left">COMMODITY & SPECIFICATION</span>
                <span className="col-span-2 text-right font-bold">QTY</span>
                <span className="col-span-2 text-right font-bold">PRICE</span>
                <span className="col-span-2 text-right font-bold">TOTAL</span>
              </div>
              
              <div className="p-2 grid grid-cols-12 border-b border-slate-100 items-start text-slate-900 leading-tight">
                <span className="col-span-6">
                  <strong className="text-slate-955 block">{selectedProduct.name}</strong>
                  <span className="text-[8px] text-slate-400 block mt-0.5">H.S. CODE: {selectedProduct.hsCode}</span>
                  <span className="text-[8px] text-slate-400 block">Origin: {selectedProduct.origin}</span>
                </span>
                <span className="col-span-2 text-right font-semibold">{quantity} MT</span>
                <span className="col-span-2 text-right font-semibold">${pricePerUnit.toLocaleString('en-US')}</span>
                <span className="col-span-2 text-right font-black text-indigo-900">${totalPrice.toLocaleString('en-US')}</span>
              </div>
              
              <div className="bg-slate-50 px-2 py-1.5 text-right font-bold text-slate-900 text-[9px]">
                TOTAL AMOUNT ({incoterms.split(' ')[0]}): <span className="text-indigo-900 text-xs font-black">${totalPrice.toLocaleString('en-US')}.00 USD</span>
              </div>
            </div>

            {/* Commercial Terms & Banking Details */}
            <div className="bg-white p-2 rounded-md border border-slate-200 space-y-1.5 text-[8.5px] text-left">
              <h6 className="font-black text-slate-800 uppercase text-indigo-800 tracking-wider">COMMERCIAL & BANKING CLAUSES :</h6>
              
              <div className="grid grid-cols-12 gap-1 border-b border-slate-100 pb-1">
                <span className="col-span-4 font-bold text-slate-500">INCOTERMS:</span>
                <span className="col-span-8 text-slate-900 font-bold">{incoterms}</span>
              </div>

              <div className="grid grid-cols-12 gap-1 border-b border-slate-100 pb-1">
                <span className="col-span-4 font-bold text-slate-500">PAYMENT SYSTEM:</span>
                <span className="col-span-8 text-indigo-950 font-bold">{paymentTerms}</span>
              </div>

              <div className="grid grid-cols-12 gap-1 border-b border-slate-100 pb-1">
                <span className="col-span-4 font-bold text-slate-500">PORT OF DISCHARGE:</span>
                <span className="col-span-8 text-slate-900">{portOfDischarge}</span>
              </div>

              <div className="grid grid-cols-12 gap-1 text-[8px]">
                <span className="col-span-4 font-bold text-slate-500">BENEFICIARY BANK:</span>
                <span className="col-span-8 text-slate-750 leading-tight">
                  <strong>BANK NEGARA INDONESIA (BNIDEJAX)</strong><br />
                  ACC NO: 1100-2026-9918 USD DEV CORPORATE<br />
                  BENEFICIARY: PT MULTI RAKSA MADANI
                </span>
              </div>
            </div>

            {/* Bilateral Signature Boxes */}
            <div className="pt-2">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Seller Sign Box */}
                <div className={`border rounded-xl p-2 text-center h-[90px] flex flex-col justify-between bg-white relative overflow-hidden transition-all duration-300 ${
                  isExporterSigned 
                    ? 'border-emerald-300 bg-emerald-50/10' 
                    : side === 'trader'
                      ? 'border-dashed border-indigo-400 ring-2 ring-indigo-200 ring-offset-1'
                      : 'border-dashed border-slate-200'
                }`}>
                  <span className="text-[7.5px] font-black uppercase text-slate-400 block mb-1">APPROVED BY EXPORTER:</span>
                  
                  {isExporterSigned ? (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="my-auto flex flex-col items-center justify-center text-emerald-600"
                    >
                      <span className="font-mono text-[8px] tracking-wide font-black border border-emerald-500 px-1 py-0.5 uppercase transform -rotate-6 bg-white/95 text-center shadow-3xs leading-none">
                        APPROVED - RAKSA MADANI
                      </span>
                      <span className="text-[7px] text-slate-400 mt-1">Eksportir Signed ✓</span>
                    </motion.div>
                  ) : (
                    <div className="my-auto text-[8px] text-slate-350 font-bold animate-pulse">
                      {side === 'trader' ? '👉 [KLIK TTD DI BAWAH]' : '[Belum Ditandatangani]'}
                    </div>
                  )}
                </div>

                {/* Buyer Sign Box */}
                <div className={`border rounded-xl p-2 text-center h-[90px] flex flex-col justify-between bg-white relative overflow-hidden transition-all duration-300 ${
                  isBuyerSigned 
                    ? 'border-indigo-300 bg-indigo-50/10' 
                    : side === 'buyer'
                      ? 'border-dashed border-amber-400 ring-2 ring-amber-200 ring-offset-1'
                      : 'border-dashed border-slate-200'
                }`}>
                  <span className="text-[7.5px] font-black uppercase text-slate-400 block mb-1">COUNTERSIGNED BY BUYER:</span>
                  
                  {isBuyerSigned ? (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="my-auto flex flex-col items-center justify-center text-indigo-600"
                    >
                      <span className="font-mono text-[8px] tracking-wide font-black border border-indigo-500 px-1 py-0.5 uppercase transform rotate-6 bg-white/95 text-center shadow-3xs leading-none">
                        ACCEPTED - YOSHIHIDE CO.
                      </span>
                      <span className="text-[7px] text-slate-400 mt-1">Buyer Signed ✓</span>
                    </motion.div>
                  ) : (
                    <div className="my-auto text-[8px] text-slate-350 font-bold animate-pulse">
                      {side === 'buyer' ? '👉 [KLIK TTD DI BAWAH]' : '[Belum Ditandatangani]'}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* PANDUAN CARA NEGOSIASI DAN QUICK SWITCH AKUN */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 shadow-xs text-left">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200 text-amber-700 shrink-0 mt-0.5">
            <HelpCircle className="w-6 h-6 text-amber-600 animate-bounce" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <span>Bagaimana Cara Eksportir &amp; Importir Bernegosiasi di Sini?</span>
              <span className="text-[10px] bg-amber-200 text-amber-800 font-black px-2 py-0.5 rounded uppercase">Simulasi Bilateral</span>
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed font-sans font-medium">
              Aplikasi ini mensimulasikan perundingan ekspor riil yang bersifat <strong>Bilateral (Dua Arah)</strong>. 
              Beberapa aksi (seperti merubah harga penawaran balik, mengunggah berkas LOI, atau menandatangani draf Proforma Invoice/Sales Contract) membutuhkan peran akun yang sesuai. 
              Gunakan tombol di bawah ini untuk <strong>beralih peran secara instan</strong> guna menyelesaikan seluruh rangkaian negosiasi!
            </p>
            
            <div className="bg-white/80 backdrop-blur-3xs rounded-xl p-4 border border-amber-150 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-black tracking-wider text-slate-450 block">Akun Anda Saat Ini:</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs text-indigo-600 font-bold shrink-0">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{currentUser?.name || 'Belum Login'}</span>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      Peran: <strong className="text-indigo-600">{currentUser?.role || 'Umum'}</strong> • {currentUser?.companyName || 'Instansi Umum'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {traderUser && onSelectUser && (
                  <button
                    onClick={() => onSelectUser(traderUser)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                      currentUser?.id === traderUser.id
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-3xs'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${currentUser?.id === traderUser.id ? 'bg-emerald-300 animate-pulse' : 'bg-slate-400'}`} />
                    <span>Peran: Eksportir (Trader)</span>
                  </button>
                )}

                {buyerUser && onSelectUser && (
                  <button
                    onClick={() => onSelectUser(buyerUser)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                      currentUser?.id === buyerUser.id
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-3xs'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${currentUser?.id === buyerUser.id ? 'bg-emerald-300 animate-pulse' : 'bg-slate-400'}`} />
                    <span>Peran: Importir (Buyer)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Grid Layout for Interactive Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column 1: Interactive Workflow Pipeline Dashboard (6 Cols) */}
        <div className="lg:col-span-6 lg:order-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-left">
            
            {/* Active Step Panel Detail Card */}
            <AnimatePresence mode="wait">
              {negotiationSteps.map((step) => {
                if (step.id !== currentStepId) return null;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-3.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600">
                          Tahapan Aktif: {step.badge}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 mt-0.5">{step.title}</h4>
                      </div>
                      <div className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-indigo-200">
                        Inisiator: {step.actor}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                      {step.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/85">
                        <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Arah Aliran Berkas :</span>
                        <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800">
                          <span className="truncate max-w-[120px]">{step.sender}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{step.receiver}</span>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/85">
                        <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Bobot & Makna Hukum :</span>
                        <p className="text-[11px] font-semibold text-indigo-950 mt-1 leading-tight">
                          {step.importance}
                        </p>
                      </div>
                    </div>

                    {/* Buyer File Attachment Flow (Step 1 Special Interactive Feature) */}
                    {step.id === 1 && (
                      <div className="space-y-4 pt-1">
                        {/* Beautiful incoming LOI card */}
                        <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-4 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-indigo-950 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                              Letter of Intent (LOI) Masuk
                            </span>
                            <span className="text-[8px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Inquiry Aktif
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                            Importir luar negeri <strong>Yoshihide Trading Co., Ltd. (Japan)</strong> telah mengirimkan dokumen permintaan pembelian resmi untuk komoditi Anda.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsLoiModalOpen(true)}
                            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs rounded-xl tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                          >
                            <Eye className="w-4 h-4" />
                            Buka &amp; Tinjau LOI Resmi
                          </button>
                        </div>

                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-indigo-950 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                              Lampiran Dokumen Resmi Pembeli (LOI / Inquiry)
                            </span>
                            <span className="text-[8px] bg-indigo-50 text-indigo-600 border border-indigo-100 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Interactive Attachment
                            </span>
                          </div>
                          
                          <p className="text-[10.5px] text-slate-650 leading-relaxed font-semibold">
                            Sebagai Buyer, Anda dapat melampirkan file dokumen Letter of Intent resmi (misalkan hasil scan PDF berstempel) langsung di fase awal negosiasi ini untuk ditinjau oleh Trader:
                          </p>

                          {/* Interactive Dropzone */}
                          <div 
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragOver(false);
                              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                const file = e.dataTransfer.files[0];
                                const newFile = {
                                  name: file.name,
                                  size: `${(file.size / 1024).toFixed(0)} KB`,
                                  date: new Date().toLocaleDateString('id-ID')
                                };
                                setLoiAttachment(prev => [...prev, newFile]);
                              }
                            }}
                            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-250 ${
                              dragOver 
                                ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99] shadow-inner' 
                                : 'border-slate-200 hover:border-indigo-400 bg-slate-50/20 hover:bg-slate-50/60'
                            }`}
                          >
                            <input 
                              type="file" 
                              id="loi-file-upload-dashboard" 
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  const file = e.target.files[0];
                                  const newFile = {
                                    name: file.name,
                                    size: `${(file.size / 1024).toFixed(0)} KB`,
                                    date: new Date().toLocaleDateString('id-ID')
                                  };
                                  setLoiAttachment(prev => [...prev, newFile]);
                                }
                              }}
                            />
                            <label htmlFor="loi-file-upload-dashboard" className="cursor-pointer block space-y-1.5">
                              <div className="mx-auto w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                              </div>
                              <p className="text-[10.5px] font-bold text-slate-800">Klik / Seret file PDF atau gambar LOI ke sini</p>
                              <p className="text-[9px] text-slate-400">PDF, Word, JPG, atau PNG (Maks. 10 MB)</p>
                            </label>
                          </div>

                          {/* File Listing block */}
                          {loiAttachment.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Dokumen Lampiran Aktif ({loiAttachment.length}):</span>
                              <div className="space-y-1">
                                {loiAttachment.map((file, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/40 border border-emerald-100 text-slate-800 text-[10px]">
                                    <div className="flex items-center gap-1.5 truncate pr-3">
                                      <div className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[8px] font-black uppercase tracking-wider shrink-0">
                                        {file.name.split('.').pop() || 'PDF'}
                                      </div>
                                      <span className="truncate font-bold text-slate-800" title={file.name}>{file.name}</span>
                                      <span className="text-[8.5px] text-slate-400 font-bold shrink-0">({file.size})</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => setIsLoiModalOpen(true)}
                                        className="text-indigo-650 hover:text-indigo-800 font-extrabold text-[9.5px] px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                                      >
                                        Buka LOI
                                      </button>
                                      <button 
                                        onClick={() => setLoiAttachment(prev => prev.filter((_, i) => i !== idx))}
                                        className="text-red-500 hover:text-red-700 font-bold text-[9px] px-2 py-0.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                                      >
                                        Hapus
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step Controls to advance user through simulation */}
                    <div className="pt-2 flex flex-col gap-2.5 items-stretch">
                      {step.id >= 2 && step.id <= 4 && (
                        <button
                          type="button"
                          onClick={() => setIsTawaranModalOpen(true)}
                          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs rounded-xl tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <Building2 className="w-4 h-4" />
                          Sesuaikan Parameter / Kirim Penawaran Baru
                        </button>
                      )}
                      
                      {step.id >= 5 && (
                        <div className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-150 p-3 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Tahap Final: Hubungkan Hub Tanda Tangan Bilateral Di Bawah!
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

          </div>

          {/* Form Configurator: Let users change data on the fly and witness impact */}
          {currentStepId !== 1 && (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-left">
            <h3 className="text-sm font-black uppercase text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              Sesuaikan Parameter Transaksi (Interactive Negotiator)
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 mb-4">
              Ubah data di bawah ini untuk melihat bagaimana draf <strong>Proforma Invoice (PI)</strong> terisi otomatis serta menghitung nominal perbankan secara akurat.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
               {/* Product Select */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-500">Pilih Komoditas Ekspor</label>
                {shipment ? (
                  <div className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 select-none">
                    {selectedProduct.name} (Terkunci dari Transaksi)
                  </div>
                ) : (
                  <select
                    value={selectedProduct.id}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-full p-2 border border-slate-250 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                  >
                    {mockProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Volume / Quantity input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-500">Volume Kuantitas ({selectedProduct.unit})</label>
                <div className="flex gap-2">
                  <input
                    disabled={isLocked}
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`w-full p-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold ${isLocked ? 'bg-slate-100 border-slate-200 text-slate-450 cursor-not-allowed' : ''}`}
                  />
                  <span className="p-2 bg-slate-100 border border-slate-250 text-[11px] text-slate-500 font-bold rounded-lg shrink-0">
                    {selectedProduct.unit.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Price Per Unit */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-500">Harga Per Unit Proposal (USD / Unit)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">USD</span>
                  <input
                    disabled={isLocked}
                    type="number"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(Math.max(10, parseInt(e.target.value) || 10))}
                    className={`w-full pl-11 p-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold ${isLocked ? 'bg-slate-100 border-slate-200 text-slate-450 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              {/* Payment Terms */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-500">Syarat Pembayaran (Payment Terms)</label>
                <select
                  disabled={isLocked}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className={`w-full p-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800 ${isLocked ? 'bg-slate-100 border-slate-200 text-slate-450 cursor-not-allowed' : 'bg-slate-50'}`}
                >
                  <option value="50% DP T/T, 50% LC at Sight">50% Down Payment T/T, 50% L/C Confirmed</option>
                  <option value="30% Advanced Deposit, 70% Copy Bills of Lading">30% DP T/T, 70% Cadangan B/L</option>
                  <option value="100% Sight Letter of Credit (L/C Irrevocable)">100% L/C Irrevocable at Sight</option>
                  <option value="100% Advanced Telegraphic Transfer (T/T)">100% Advanced T/T (Full Prabayar)</option>
                </select>
              </div>

              {/* Incoterms Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-500">Syarat Pengiriman (Incoterms 2020)</label>
                <select
                  disabled={isLocked}
                  value={incoterms}
                  onChange={(e) => setIncoterms(e.target.value)}
                  className={`w-full p-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800 ${isLocked ? 'bg-slate-100 border-slate-200 text-slate-450 cursor-not-allowed' : 'bg-slate-50'}`}
                >
                  <option value="FOB Jakarta Port (Incoterms 2020)">FOB (Free on Board) - Pelabuhan Tanjung Priok, Jakarta</option>
                  <option value="CIF Tokyo Port, Japan (Incoterms 2020)">CIF (Cost, Insurance & Freight) - Tokyo Port</option>
                  <option value="CFR Los Angeles Port, USA (Incoterms 2020)">CFR (Cost & Freight) - Los Angeles Port</option>
                  <option value="EXW Origin Warehouse (Incoterms 2020)">EXW (Ex Works) - Gudang Supplier Produsen</option>
                </select>
              </div>

              {/* Port of Discharge */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-500">Pelabuhan Bongkar (Port of Discharge)</label>
                <input
                  disabled={isLocked}
                  type="text"
                  value={portOfDischarge}
                  onChange={(e) => setPortOfDischarge(e.target.value)}
                  className={`w-full p-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold ${isLocked ? 'bg-slate-100 border-slate-200 text-slate-450 cursor-not-allowed' : ''}`}
                />
              </div>

            </div>
          </div>

          {/* Kalkulator & Panduan Biaya Komersiil Buyer */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-5 space-y-4 text-left shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Landmark className="w-5 h-5 mb-0" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Kalkulator &amp; Panduan Pembayaran Buyer</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Panduan lengkap cara menghitung rincian pembayaran buyer berdasarkan kuantitas, harga, dan kesepakatan internasional.
                </p>
              </div>
            </div>

            {/* Live Calculation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Kargo Ekspor</span>
                <span className="text-xs font-black text-slate-800 block mt-1">{quantity} MT</span>
                <span className="text-[10px] text-slate-450 block">{selectedProduct.name}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Harga Satuan disepakati</span>
                <span className="text-xs font-black text-slate-800 block mt-1">${pricePerUnit.toLocaleString('en-US')} / MT</span>
                <span className="text-[10px] text-slate-450 block">Ex Works / FOB Pelabuhan</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-100 bg-indigo-50/20">
                <span className="text-[9px] uppercase font-bold text-indigo-500 block">Nilai FOB / EXW Dasar</span>
                <span className="text-sm font-black text-indigo-950 block mt-0.5">${totalPrice.toLocaleString('en-US')}.00 USD</span>
                <span className="text-[9px] text-slate-500 block">~ Rp {(totalPrice * 16200).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Formula Explainer */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Bagaimana Rumus Dasar Perhitungannya?</span>
              </div>
              <p className="text-[11px] text-slate-650 leading-relaxed">
                Total yang harus dibayar buyer dihitung dari kombinasi <strong>Harga Barang Dasar + Ongkos Kirim (tergantung Incoterms)</strong>, yang kemudian diselesaikan melalui metode cicilan <strong>Down Payment &amp; L/C (tergantung Syarat Pembayaran)</strong>.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg font-mono text-[10px] text-slate-700 space-y-1.5 border border-slate-150">
                <div className="text-slate-800 font-bold">1. Rumus Total Nilai Barang:</div>
                <div className="pl-3 text-indigo-700 text-xs font-semibold">
                  Kuantitas ({quantity} MT) × Harga Satuan (${pricePerUnit.toLocaleString('en-US')} USD) = <span className="font-bold">${totalPrice.toLocaleString('en-US')} USD</span>
                </div>
              </div>
            </div>

            {/* Dynamic Breakdown based on Payment Terms */}
            {(() => {
              type ExplType = { dp: number; balance: number; dpLabel: string; balanceLabel: string; desc: string; paymentType: string };
              let explanation: ExplType = { dp: 0, balance: 0, dpLabel: 'Down Payment', balanceLabel: 'Pelunasan', desc: '', paymentType: '' };
              if (paymentTerms.includes('50% DP')) {
                explanation = {
                  dp: totalPrice * 0.5,
                  balance: totalPrice * 0.5,
                  dpLabel: '50% Down Payment (DP) T/T',
                  balanceLabel: '50% Pelunasan menggunakan L/C at Sight',
                  paymentType: 'Combined',
                  desc: 'Sistem Pembayaran Campuran (DP 50% + L/C 50%): Buyer membayar DP 50% terlebih dahulu agar eksportir mulai memproduksi/menyiapkan komoditas kargo. Sisa 50% lagi diamankan menggunakan Letter of Credit di bank, yang akan dicairkan begitu dokumen kapal resmi terbit.'
                };
              } else if (paymentTerms.includes('30% Advanced')) {
                explanation = {
                  dp: totalPrice * 0.3,
                  balance: totalPrice * 0.7,
                  dpLabel: '30% Advanced Deposit T/T',
                  balanceLabel: '70% Pelunasan setelah Copy Bill of Lading (B/L)',
                  paymentType: 'TT_Split',
                  desc: 'Sistem Pembayaran Jaminan Salinan B/L (DP 30% + T/T 70%): Buyer membayar deposit 30% di awal. Ketika barang selesai dimuat ke kapal kargo, eksportir mengirim salinan (scan) Bill of Lading ke buyer sebagai bukti pengiriman fisik. Buyer wajib mentransfer sisa kepemilikan 70% barulah dokumen asli dikirim oleh eksportir lewat kurir internasional.'
                };
              } else if (paymentTerms.includes('100% Sight Letter of Credit')) {
                explanation = {
                  dp: 0,
                  balance: totalPrice,
                  dpLabel: '0% Down Payment (DP)',
                  balanceLabel: '100% Dibayar Penuh Menggunakan L/C at Sight',
                  paymentType: 'LC_Only',
                  desc: 'Letter of Credit 100%: Sangat aman bagi buyer karena tidak mengeluarkan uang cash di awal. Bank penjamin buyer mengunci dana penuh senilai 100%. Pembayaran penuh dicairkan secara otomatis ke Bank eksportir di Indonesia begitu eksportir menyerahkan bukti dokumen komoditas sudah sah naik di atas kapal.'
                };
              } else {
                explanation = {
                  dp: totalPrice,
                  balance: 0,
                  dpLabel: '100% Uang Muka di Awal via Telegraphic Transfer (T/T)',
                  balanceLabel: '0% Sisa Pembayaran',
                  paymentType: 'TT_Only',
                  desc: 'Full Prabayar 100%: Buyer membayar lunas 100% harga komoditas di muka sebelum proses produksi/pengapalan dimulai. Ini adalah metode transaksi yang memiliki risiko tertinggi bagi buyer asing, tetapi paling aman dan menguntungkan bagi eksportir lokal.'
                };
              }

              return (
                <div className="bg-indigo-950 text-indigo-50 p-4 rounded-xl border border-indigo-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">Simulasi Sesuai Syarat Pembayaran Anda</span>
                    <span className="px-2 py-0.5 bg-indigo-900 text-indigo-300 rounded text-[9px] font-bold">Live Breakdown</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                      <span className="text-[9px] text-indigo-300 block font-bold">{explanation.dpLabel}</span>
                      <span className="text-xs font-black block mt-0.5 text-white">${explanation.dp.toLocaleString('en-US')}.00 USD</span>
                      <span className="text-[9px] text-indigo-300 font-mono block">~ Rp {(explanation.dp * 16200).toLocaleString('id-ID')}</span>
                      <span className="text-[8px] text-indigo-400 block mt-1">Dibayar: Kirim Sebelum Mulai</span>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                      <span className="text-[9px] text-indigo-300 block font-bold">{explanation.balanceLabel}</span>
                      <span className="text-xs font-black block mt-0.5 text-white">${explanation.balance.toLocaleString('en-US')}.00 USD</span>
                      <span className="text-[9px] text-indigo-300 font-mono block">~ Rp {(explanation.balance * 16200).toLocaleString('id-ID')}</span>
                      <span className="text-[8px] text-indigo-400 block mt-1">Dibayar: Saat Dokumen Kapal Siap / Selesai Muat</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-indigo-200 leading-relaxed border-t border-indigo-900 pt-2.5">
                    <strong>Catatan Operasional:</strong> {explanation.desc}
                  </p>
                </div>
              );
            })()}

            {/* Dynamic Breakdown based on Incoterms Selected */}
            <div className="bg-emerald-50/50 border border-emerald-150 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                <BadgeInfo className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Analisis Syarat Pengapalan (Incoterms 2020)</span>
              </div>
              
              {(() => {
                const term = incoterms.toLowerCase();
                if (term.includes('fob')) {
                  return (
                    <div className="text-[11px] text-emerald-900 leading-relaxed space-y-2">
                      <p>
                        Anda memilih <strong>FOB (Free On Board)</strong>. Artinya, biaya yang harus dibayar buyer kepada Anda selaku eksportir <strong>HANYA sebatas harga barang di atas kapal (${totalPrice.toLocaleString('en-US')} USD)</strong>.
                      </p>
                      <div className="bg-white p-2.5 rounded-lg border border-emerald-100 text-[10px] text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-1">
                          <span className="font-semibold text-emerald-700 block">Dibayar ke Eksportir (Seller):</span>
                          <span>Harga kargo dasar pelabuhan muat di Indonesia.</span>
                        </div>
                        <div className="p-1 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-2">
                          <span className="font-semibold text-indigo-700 block text-slate-700">Dibayar Sendiri oleh Buyer:</span>
                          <span>Biaya kapal laut internasional (shipping freight) + rute laut dan asuransi dibayar langsung ke shipping agent.</span>
                        </div>
                      </div>
                    </div>
                  );
                } else if (term.includes('cif')) {
                  const simulatedFreight = totalPrice * 0.07;
                  const simulatedInsurance = totalPrice * 0.01;
                  const totalCIFValue = totalPrice + simulatedFreight + simulatedInsurance;
                  return (
                    <div className="text-[11px] text-emerald-900 leading-relaxed space-y-3">
                      <p>
                        Anda memilih <strong>CIF (Cost, Insurance &amp; Freight)</strong>. Pelunasan transaksi ekspor ini sudah mencakup komoditas dasar, premi perlindungan laut, dan biaya angkutan kapal laut kontainer internasional hingga Pelabuhan Bongkar buyer.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-emerald-100 text-[10px] text-slate-750 space-y-2 font-mono">
                        <div className="flex justify-between">
                          <span>1. Nilai Komoditas Dasar:</span>
                          <span className="font-bold text-slate-900">${totalPrice.toLocaleString('en-US')} USD</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1.5">
                          <span>2. Estimasi Freight Kapal (7%):</span>
                          <span className="font-semibold text-emerald-750">+${simulatedFreight.toLocaleString('en-US')} USD</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1.5">
                          <span>3. Estimasi Premi Asuransi (1%):</span>
                          <span className="font-semibold text-emerald-750">+${simulatedInsurance.toLocaleString('en-US')} USD</span>
                        </div>
                        <div className="flex justify-between border-t border-emerald-200 pt-2 font-black text-slate-950 bg-emerald-50 px-1.5 py-1">
                          <span>Estimasi Total CIF Invoice:</span>
                          <span>${totalCIFValue.toLocaleString('en-US')} USD</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-450 italic leading-snug">
                        *Catatan: Selisih tarif asuransi dan ocean freight resmi dibayarkan oleh Eksportir terlebih dahulu ke cargo agent, karena penawaran berstatus CIF pelabuhan tujuan buyer.
                      </p>
                    </div>
                  );
                } else if (term.includes('cfr')) {
                  const simulatedFreight = totalPrice * 0.07;
                  const totalCFRValue = totalPrice + simulatedFreight;
                  return (
                    <div className="text-[11px] text-emerald-900 leading-relaxed space-y-3">
                      <p>
                        Anda memilih <strong>CFR (Cost &amp; Freight)</strong>. Berarti tagihan ekspor yang dibayar buyer mencakup harga pokok barang ekspor beserta ongkos kapal kargo luar negeri ke Pelabuhan Bongkar buyer, namun TANPA premi asuransi (pengimpor menjamin asuransi secara berpisah).
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-emerald-100 text-[10px] text-slate-750 space-y-2 font-mono">
                        <div className="flex justify-between">
                          <span>1. Nilai Komoditas Dasar:</span>
                          <span className="font-bold text-slate-900">${totalPrice.toLocaleString('en-US')} USD</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1.5">
                          <span>2. Estimasi Freight Kapal (7%):</span>
                          <span className="font-semibold text-emerald-750">+${simulatedFreight.toLocaleString('en-US')} USD</span>
                        </div>
                        <div className="flex justify-between border-t border-emerald-200 pt-2 font-black text-slate-950 bg-emerald-50 px-1.5 py-1">
                          <span>Estimasi Total CFR Invoice:</span>
                          <span>${totalCFRValue.toLocaleString('en-US')} USD</span>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-[11px] text-emerald-900 leading-relaxed space-y-2">
                      <p>
                        Anda memilih <strong>EXW (Ex Works)</strong>. Artinya, pembeli asing (buyer) menjemput komoditas kargo Anda langsung di depan pintu gerbang gudang produsen asal di Indonesia.
                      </p>
                      <p className="text-[10px] text-slate-650 bg-white p-2.5 rounded-lg border border-emerald-100 leading-relaxed">
                        Pengimpor menanggung tiket pengapalan, truk kargo domestik, cukai bea ekspor RI, hingga bea impor negara Yokohama/LA. Jumlah tagihan murni adalah harga dasar barang senilai <strong>${totalPrice.toLocaleString('en-US')} USD</strong>.
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
            </>
          )}

        </div>

        {/* Column 2: Document Simulator Preview & Joint Signature Control (6 Cols) */}
        <div className="lg:col-span-6 lg:order-1 space-y-6">

          {/* Interactive Proforma Invoice Document Frame */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-left">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 mb-4">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Live Preview: {currentStepId === 1 ? 'Inquiry / Letter of Intent' : currentStepId === 2 ? 'Quotation / Offer Sheet' : currentStepId === 4 ? 'Counter-Offer Log' : 'Proforma Invoice'}
                </h4>
              </div>
              
              {/* Live Status Stamp */}
              <div className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md border ${
                currentStepId === 5 && isExporterSigned && isBuyerSigned
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : currentStepId === 4
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold'
                    : isExporterSigned || isBuyerSigned
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-500 border-slate-300'
              }`}>
                {currentStepId === 1 
                  ? 'INCOMING LOI' 
                  : currentStepId === 2 
                    ? 'COMMERCIAL OFFER' 
                    : currentStepId === 4 
                      ? 'NEGOTIATION LOG' 
                      : isExporterSigned && isBuyerSigned
                        ? 'BILATERALLY SIGNED'
                        : isExporterSigned || isBuyerSigned
                          ? 'PARTIALLY SIGNED (DRAFT)'
                          : 'UNRESTRICTED DRAFT'}
              </div>
            </div>

            {/* Zoom / Pan Toolbar Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-100 p-2.5 rounded-xl mb-3 border border-slate-200 text-xs shadow-3xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-slate-700 font-extrabold select-none">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                  <span>Zoom Level: {Math.round(scale * 100)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Zoom Out"
                    onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
                    className="p-1 px-2.5 rounded bg-white hover:bg-slate-50 border border-slate-250 font-black flex items-center justify-center gap-1 transition-colors hover:text-indigo-600 text-slate-705 active:scale-95 shadow-3xs cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                    <span>Zoom Out</span>
                  </button>
                  <button
                    type="button"
                    title="Zoom In"
                    onClick={() => setScale(prev => Math.min(2.5, prev + 0.1))}
                    className="p-1 px-2.5 rounded bg-white hover:bg-slate-50 border border-slate-250 font-black flex items-center justify-center gap-1 transition-colors hover:text-indigo-600 text-slate-705 active:scale-95 shadow-3xs cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Zoom In</span>
                  </button>
                  <button
                    type="button"
                    title="Reset Zoom & Pan"
                    onClick={() => {
                      setScale(1.0);
                      setPosition({ x: 0, y: 0 });
                    }}
                    className="p-1 px-2.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-black flex items-center justify-center gap-1 transition-colors active:scale-95 text-[11px] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset View</span>
                  </button>
                </div>
              </div>

              {/* Direct Print and Download buttons */}
              <div className="flex items-center gap-1.5 self-end md:self-auto">
                <button
                  type="button"
                  title="Cetak Dokumen"
                  onClick={handlePrint}
                  className="p-1.5 px-3 rounded-lg bg-emerald-600 font-black uppercase text-white hover:bg-emerald-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95 text-[10.5px] shadow-3xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  type="button"
                  title="Unduh (.HTML)"
                  onClick={handleDownloadHTML}
                  className="p-1.5 px-3 rounded-lg bg-indigo-600 font-black uppercase text-white hover:bg-indigo-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95 text-[10.5px] shadow-3xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh (.HTML)</span>
                </button>
              </div>
            </div>

            {/* Print/Blocked Popup Warning Banner */}
            {printBlockedError && (
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 text-amber-900 p-3.5 rounded-xl text-[11px] font-medium flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm border border-amber-250 mb-3 animate-fadeIn text-left leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">⚠️</span>
                  <div>
                    <strong>Pemberitahuan Sistem Sandbox:</strong> Browser memblokir printer popup karena sandbox keamanan AI Studio.
                    <div className="mt-1 text-amber-950 font-bold">💡 SOLUSI: Klik tombol abu-abu "Unduh (.HTML)" di kanan, file yang terunduh akan otomatis memicu dialog cetak PDF asli yang sangat rapi saat dibuka di komputer Anda! Atau klik "Buka Tab Baru" untuk cetak langsung.</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-xs shrink-0 flex items-center gap-1"
                  >
                    <span>Tab Baru ↗️</span>
                  </a>
                  <button
                    onClick={() => setPrintBlockedError(false)}
                    className="p-1 hover:bg-amber-200 rounded text-center text-amber-900 cursor-pointer"
                    title="Tutup pesan"
                  >
                    <X className="w-4 h-4 text-amber-900" />
                  </button>
                </div>
              </div>
            )}

            {/* Instruction Banner */}
            <div className="text-[10.5px] text-slate-600 pb-2 select-none flex items-center gap-1 bg-amber-50/50 border border-amber-200/60 rounded-lg p-2.5 mb-3.5">
              <span>💡 <strong>Sentuh/Klik &amp; Seret</strong> atau gunakan <strong>roda scroll mouse</strong> untuk menggeser (pan) &amp; memperbesar dokumen secara leluasa.</span>
            </div>

            {/* Viewport Frame with fixed height and overflow hidden */}
            <div 
              className="relative w-full h-[580px] overflow-hidden rounded-xl border border-slate-250 bg-slate-100 cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUpOrLeave}
              onWheel={handleWheel}
            >
              <div 
                className="absolute p-4"
                style={{
                  width: '650px',
                  minWidth: '650px',
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transformOrigin: 'top left',
                  transition: isDragging ? 'none' : 'transform 0.12s ease-out'
                }}
              >
                <div 
                  id="negotiation-document-paper" 
                  className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 font-mono text-[10px] text-slate-705 space-y-4 relative overflow-hidden min-h-[500px] shadow-xs text-left"
                >
                  {/* Subtle Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
                    <div className="text-4xl sm:text-5xl font-black uppercase tracking-widest transform -rotate-45">
                      {currentUser?.role === 'Buyer' ? 'YOSHIHIDE' : 'RAKSA MADANI'}
                    </div>
                  </div>
                  
                  {renderDocumentContent(currentUser?.role === 'Buyer' ? 'buyer' : 'trader')}
                </div>
              </div>
            </div>

          </div>

          {/* Dual Signature Controls Panel */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white border border-slate-850 shadow-md text-left">
            <div className="flex items-center gap-2 pb-2.5 border-b border-indigo-850">
              <FileSignature className="w-4.5 h-4.5 text-indigo-300" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-100">Hub Tanda Tangan Bilateral</h3>
                <p className="text-[10px] text-indigo-300">Harus ditandatangani 2 Pihak agar Proforma Invoice Sah!</p>
              </div>
            </div>

            <div className="space-y-4 py-4 text-xs font-medium">
              
              {/* Exporter Signature Button */}
              <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-indigo-950/50">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-indigo-400 block">Pihak 1: Eksportir</span>
                  <span className="font-bold text-slate-100 block">PT MULTI RAKSA MADANI</span>
                  <span className="text-[8.5px] text-slate-450 block">Wewenang: Trader / Owner</span>
                </div>
                <button
                  disabled={isLocked || !canSignExporter}
                  onClick={() => !isLocked && canSignExporter && setIsExporterSigned(!isExporterSigned)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-xs transition-all ${
                    isLocked 
                      ? 'bg-emerald-700/50 text-emerald-100 cursor-not-allowed border border-emerald-600/30 flex items-center gap-1'
                      : !canSignExporter
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 flex items-center gap-1'
                        : isExporterSigned 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 cursor-pointer' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 cursor-pointer'
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Lock className="w-3 h-3 text-emerald-300" />
                      <span>Terverifikasi</span>
                    </>
                  ) : !canSignExporter ? (
                    <>
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Hanya Trader</span>
                    </>
                  ) : (
                    isExporterSigned ? '✓ Sudah TTD' : 'Tanda Tangan'
                  )}
                </button>
              </div>

              {/* Buyer Signature Button */}
              <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-indigo-950/50">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-indigo-400 block">Pihak 2: Buyer</span>
                  <span className="font-bold text-slate-100 block">{buyerCompany}</span>
                  <span className="text-[8.5px] text-slate-450 block">Wewenang: Buyer</span>
                </div>
                <button
                  disabled={isLocked || !canSignBuyer}
                  onClick={() => !isLocked && canSignBuyer && setIsBuyerSigned(!isBuyerSigned)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-xs transition-all ${
                    isLocked 
                      ? 'bg-emerald-700/50 text-emerald-100 cursor-not-allowed border border-emerald-600/30 flex items-center gap-1'
                      : !canSignBuyer
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 flex items-center gap-1'
                        : isBuyerSigned 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 cursor-pointer' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 cursor-pointer'
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Lock className="w-3 h-3 text-emerald-300" />
                      <span>Terverifikasi</span>
                    </>
                  ) : !canSignBuyer ? (
                    <>
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Hanya Buyer</span>
                    </>
                  ) : (
                    isBuyerSigned ? '✓ Sudah TTD' : 'Tanda Tangan'
                  )}
                </button>
              </div>

              {/* Joint Signature Info Box */}
              <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-900 text-[11px] text-indigo-200 leading-relaxed">
                <div className="flex gap-2 font-black uppercase text-indigo-300 tracking-wider text-[10px] items-center mb-1">
                  <BadgeInfo className="w-4 h-4 text-indigo-455 shrink-0" />
                  Bagaimana Bilateral Berdampak?
                </div>
                Jika <strong>kedua pihak telah menandatangani</strong>, status Proforma Invoice berubah menjadi <span className="text-emerald-300 font-extrabold uppercase">BILATERALLY AGREED</span>. Lembaran ini sekarang sah diajukan ke Bank Devisa Luar Negeri untuk penerbitan dana pelindung L/C.
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* LOI READ-ONLY MODAL */}
      <AnimatePresence>
        {isLoiModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col text-left"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsLoiModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Review Letter of Intent (LOI)</h3>
                  <p className="text-[10px] text-slate-400">Dokumen Permintaan Pembukaan Resmi dari Pembeli</p>
                </div>
              </div>

              {/* Action Toolbar for LOI (Print & Download) */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-150 mb-4 text-xs">
                <span className="font-bold text-slate-505 select-none">
                  Mode Baca Saja (Read-Only)
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePrintLoi}
                    className="p-1.5 px-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold uppercase text-[9.5px] tracking-wider flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak Dokumen
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadLoiHTML}
                    className="p-1.5 px-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-extrabold uppercase text-[9.5px] tracking-wider flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh (.HTML)
                  </button>
                </div>
              </div>

              {/* LOI Paper Frame */}
              <div className="p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden mb-5">
                <div id="loi-document-paper" className="bg-slate-50 p-5 rounded-lg border border-slate-150 font-mono text-[10px] text-slate-705 space-y-4 shadow-inner">
                  <div className="border-b border-dashed border-slate-300 pb-3 text-left">
                    <h5 className="font-bold text-slate-900 text-xs">YOSHIHIDE TRADING CO., LTD.</h5>
                    <p className="text-[9px] text-slate-400">2-chome-4-1 Shibakoen, Minato City, Tokyo 105-0011, Japan</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Tel: +81-3-5401-XXXX | Email: import@yoshihide.co.jp</p>
                  </div>
                  <div className="text-right text-[9px] text-slate-500">
                    <p className="font-bold">Doc Ref: YT-LOI/2026/04</p>
                    <p>Date: June 15, 2026</p>
                  </div>
                  <div className="space-y-2 text-left">
                    <p className="font-bold text-slate-900">TO: PT MULTI RAKSA MADANI</p>
                    <p className="font-bold text-[11px] underline">SUBJECT: LETTER OF INTENT (LOI) & COMMODITY INQUIRY</p>
                    <p className="leading-relaxed">
                      Dear Multi Raksa Madani Exports Team,
                    </p>
                    <p className="leading-relaxed">
                      We herewith officially express our strong interest to purchase high-quality Indonesian commodities. Based on your repute, we would like to request a detailed specifications list and a price proposal for:
                    </p>
                    <div className="p-3 bg-white rounded border border-slate-205 font-bold text-indigo-950 text-[10px] space-y-1">
                      <div>• Commodity: <span className="text-indigo-600">{selectedProduct.name}</span></div>
                      <div>• Target Volume: <span className="text-indigo-600">{quantity} MT (Metrik Ton)</span></div>
                      <div>• Target Incoterms: <span className="text-indigo-600">FOB Jakarta Port</span></div>
                      <div>• Price Guideline Needed: <span className="text-indigo-600">USD / Metric Ton</span></div>
                    </div>
                    <p className="leading-relaxed">
                      Kindly send us your Official Quotation Sheet along with laboratory test certifications (COA) and cargo load-time estimates. We look forward to a sustainable mutual trade relationship.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[8.5px]">
                    <span className="text-slate-400 italic">Signed digitally by Kenji Yoshihide (Director)</span>
                    <span className="text-emerald-600 font-extrabold uppercase">OFFICIAL DOCUMENT</span>
                  </div>
                </div>
              </div>

              {/* LOI Footer - Tawaran Button */}
              <div className="flex gap-3 justify-end items-center border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsLoiModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoiModalOpen(false);
                    setIsTawaranModalOpen(true);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer animate-pulse"
                >
                  <Send className="w-4.5 h-4.5" />
                  Tawaran (Balas Penawaran)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TAWARAN POPUP MODAL (INTERACTIVE NEGOTIATOR & CALCULATOR) */}
      <AnimatePresence>
        {isTawaranModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-50 rounded-3xl border border-slate-200 max-w-6xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col text-left"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsTawaranModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 mb-5 gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-600 text-white rounded-lg">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Interactive Negotiator: Penyusunan Tawaran</h3>
                    <p className="text-[10px] text-slate-500">Sesuaikan rincian parameter komersial dan kalkulasi pembayaran untuk dikirim ke buyer</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreviewInModal(!showPreviewInModal)}
                    className={`px-3 py-1.5 rounded-xl border font-bold text-[10px] tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer ${
                      showPreviewInModal 
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                        : 'bg-white text-slate-600 border-slate-250 hover:bg-slate-50'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {showPreviewInModal ? 'Sembunyikan Preview' : 'Tampilkan Preview'}
                  </button>
                </div>
              </div>

              {/* Main Content Split Frame */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start overflow-y-auto pr-1">
                
                {/* Left Side: Negotiator Form & Calculator (Spans 12 or 7) */}
                <div className={`space-y-6 ${showPreviewInModal ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                  
                  {/* Form Configurator */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-left space-y-4">
                    <div className="pb-3 border-b border-slate-100">
                      <h4 className="text-xs font-black uppercase text-indigo-950 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        Sesuaikan Parameter Transaksi
                      </h4>
                      <p className="text-[10.5px] text-slate-400 mt-1">
                        Ubah data transaksi di bawah ini untuk melihat hasil estimasi perbankan dan memperbarui berkas penawaran.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Select */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black uppercase text-slate-500">Pilih Komoditas Ekspor</label>
                        {shipment ? (
                          <div className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 select-none">
                            {selectedProduct.name} (Terkunci dari Transaksi)
                          </div>
                        ) : (
                          <select
                            value={selectedProduct.id}
                            onChange={(e) => {
                              const matching = mockProducts.find(p => p.id === e.target.value);
                              if (matching) {
                                setSelectedProduct(matching);
                                const priceVal = parseFloat(matching.price.replace(/,/g, '')) || 1000;
                                setPricePerUnit(priceVal);
                              }
                            }}
                            className="w-full p-2 border border-slate-250 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800 cursor-pointer"
                          >
                            {mockProducts.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Volume / Quantity */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black uppercase text-slate-500">Volume Kuantitas ({selectedProduct.unit})</label>
                        <div className="flex gap-2">
                          <input
                            disabled={isLocked}
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full p-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                          />
                          <span className="p-2 bg-slate-100 border border-slate-250 text-[11px] text-slate-505 font-bold rounded-lg shrink-0">
                            {selectedProduct.unit.split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Price Per Unit */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black uppercase text-slate-500">Harga Per Unit Proposal (USD / Unit)</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">USD</span>
                          <input
                            disabled={isLocked}
                            type="number"
                            value={pricePerUnit}
                            onChange={(e) => setPricePerUnit(Math.max(10, parseInt(e.target.value) || 10))}
                            className="w-full pl-11 p-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                          />
                        </div>
                      </div>

                      {/* Payment Terms */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black uppercase text-slate-500">Syarat Pembayaran (Payment Terms)</label>
                        <select
                          disabled={isLocked}
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          className="w-full p-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800 bg-slate-50 cursor-pointer"
                        >
                          <option value="50% DP T/T, 50% LC at Sight">50% Down Payment T/T, 50% L/C Confirmed</option>
                          <option value="30% Advanced Deposit, 70% Copy Bills of Lading">30% DP T/T, 70% Cadangan B/L</option>
                          <option value="100% Sight Letter of Credit (L/C Irrevocable)">100% L/C Irrevocable at Sight</option>
                          <option value="100% Advanced Telegraphic Transfer (T/T)">100% Advanced T/T (Full Prabayar)</option>
                        </select>
                      </div>

                      {/* Incoterms Selector */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black uppercase text-slate-500">Syarat Pengiriman (Incoterms 2020)</label>
                        <select
                          disabled={isLocked}
                          value={incoterms}
                          onChange={(e) => setIncoterms(e.target.value)}
                          className="w-full p-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800 bg-slate-50 cursor-pointer"
                        >
                          <option value="FOB Jakarta Port (Incoterms 2020)">FOB (Free on Board) - Pelabuhan Tanjung Priok, Jakarta</option>
                          <option value="CIF Tokyo Port, Japan (Incoterms 2020)">CIF (Cost, Insurance & Freight) - Tokyo Port</option>
                          <option value="CFR Los Angeles Port, USA (Incoterms 2020)">CFR (Cost & Freight) - Los Angeles Port</option>
                          <option value="EXW Origin Warehouse (Incoterms 2020)">EXW (Ex Works) - Gudang Supplier Produsen</option>
                        </select>
                      </div>

                      {/* Port of Discharge */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black uppercase text-slate-505">Pelabuhan Bongkar (Port of Discharge)</label>
                        <input
                          disabled={isLocked}
                          type="text"
                          value={portOfDischarge}
                          onChange={(e) => setPortOfDischarge(e.target.value)}
                          className="w-full p-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculator and Guide */}
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wide">Kalkulator &amp; Panduan Pembayaran Buyer</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Estimasi rincian keuangan hasil pembagian termin perbankan devisa perdagangan internasional.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                        <span className="text-[8.5px] uppercase font-bold text-slate-400 block">Kargo</span>
                        <span className="text-xs font-black text-slate-800 block mt-0.5">{quantity} MT</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                        <span className="text-[8.5px] uppercase font-bold text-slate-400 block">Harga / Unit</span>
                        <span className="text-xs font-black text-slate-800 block mt-0.5">${pricePerUnit.toLocaleString('en-US')} USD</span>
                      </div>
                      <div className="bg-indigo-950 text-indigo-100 p-2.5 rounded-xl">
                        <span className="text-[8.5px] uppercase font-bold text-indigo-300 block">FOB Dasar</span>
                        <span className="text-xs font-black text-white block mt-0.5">${totalPrice.toLocaleString('en-US')} USD</span>
                      </div>
                    </div>

                    {/* Termin Pembayaran */}
                    {(() => {
                      let dpPercent = 0;
                      let dpLabel = "";
                      let lcLabel = "";
                      let desc = "";

                      if (paymentTerms.includes("50% DP")) {
                        dpPercent = 0.5;
                        dpLabel = "DP 50% via T/T Cable Transfer";
                        lcLabel = "L/C at Sight 50% di Bank Devisa";
                        desc = "Sistem Campuran: Buyer menyetor 50% deposit untuk modal produksi, sisanya dijamin bank lewat instrumen Letter of Credit yang cair otomatis begitu Bill of Lading terbit.";
                      } else if (paymentTerms.includes("30% Advanced")) {
                        dpPercent = 0.3;
                        dpLabel = "DP 30% Advanced T/T";
                        lcLabel = "Pelunasan 70% setelah Copy B/L";
                        desc = "Eksportir memuat barang ke kapal kargo, lalu mengirim pindaian Bill of Lading. Pembeli asing mentransfer 70% sisa dana barulah dokumen pelayaran asli dikirim.";
                      } else if (paymentTerms.includes("100% Sight Letter")) {
                        dpPercent = 0;
                        dpLabel = "Bebas DP di Muka";
                        lcLabel = "L/C 100% Irrevocable at Sight";
                        desc = "Dana 100% dijamin aman dalam custody bank penjamin pembeli. Dana dicairkan ke bank eksportir seketika setelah seluruh dokumen kepabeanan lolos verifikasi.";
                      } else {
                        dpPercent = 1.0;
                        dpLabel = "Full 100% Prabayar via T/T";
                        lcLabel = "Tidak Ada Termin Sisa";
                        desc = "Metode prabayar penuh sebelum produksi dimulai. Menguntungkan bagi eksportir, namun menuntut tingkat kepercayaan tinggi dari buyer asing.";
                      }

                      return (
                        <div className="p-3.5 bg-indigo-950 text-indigo-50 border border-indigo-900 rounded-xl space-y-2.5 text-xs text-left">
                          <span className="text-[9.5px] font-black uppercase text-indigo-300 tracking-wider block">Rincian Termin Devisa Aktif</span>
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                              <span className="text-[8.5px] text-indigo-300 block font-semibold">{dpLabel}</span>
                              <span className="text-xs font-black text-white block mt-0.5">${(totalPrice * dpPercent).toLocaleString('en-US')}.00 USD</span>
                            </div>
                            <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                              <span className="text-[8.5px] text-indigo-300 block font-semibold">{lcLabel}</span>
                              <span className="text-xs font-black text-white block mt-0.5">${(totalPrice * (1 - dpPercent)).toLocaleString('en-US')}.00 USD</span>
                            </div>
                          </div>
                          <p className="text-[9.5px] text-indigo-200 leading-relaxed pt-1.5 border-t border-indigo-900">
                            <strong>Aturan Main Termin:</strong> {desc}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Right Side: Document Preview Column (Spans 5) */}
                {showPreviewInModal && (
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-4 shadow-inner space-y-3 max-h-[75vh] flex flex-col overflow-hidden">
                    <span className="text-[10px] font-black text-slate-550 uppercase tracking-wider block border-b border-slate-100 pb-2">
                      Live Draft Preview: Penawaran Harga (Quotation)
                    </span>
                    <div className="flex-1 overflow-y-auto pr-1">
                      {/* Document Layout Paper */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 font-mono text-[9px] text-slate-705 space-y-4 shadow-3xs text-left">
                        <div className="border-b border-dashed border-slate-300 pb-2.5">
                          <h5 className="font-bold text-slate-900 text-[11px]">PT MULTI RAKSA MADANI</h5>
                          <p className="text-[8px] text-slate-400">Gedung Devisa Ekspor Lantai 12, Jakarta, Indonesia</p>
                          <p className="text-[8px] text-slate-400 font-bold mt-0.5">Email: export@multiraksamaradani.co.id</p>
                        </div>
                        <div className="text-right text-[8px] text-slate-400">
                          <p className="font-bold text-slate-550">Doc Ref: AQ-QTN/2026/102</p>
                          <p>Date: June 17, 2026</p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-bold text-slate-900">TO: YOSHIHIDE TRADING CO., LTD. (Tokyo, Japan)</p>
                          <p className="font-bold text-[10px] underline text-indigo-900">OFFICIAL COMMERCIAL PRICE QUOTATION</p>
                          <p className="leading-relaxed text-slate-500">
                            Thank you for your LOI interest YT-LOI/2026/04. We are delighted to submit our best factory offering pricing & parameters below:
                          </p>
                          
                          <div className="bg-white rounded border border-slate-205 overflow-hidden">
                            <div className="p-1.5 bg-slate-100 border-b border-slate-200 flex justify-between font-bold text-slate-800 text-[8px]">
                              <span>ITEM / SPECIFICATION</span>
                              <span>OFFER PRICE</span>
                            </div>
                            <div className="p-1.5 space-y-1">
                              <p className="font-bold text-slate-900 text-[8.5px]">{selectedProduct.name}</p>
                              <p className="text-slate-500 leading-snug">Specification: {selectedProduct.specification}</p>
                              <p className="text-slate-500 font-bold">Origin: {selectedProduct.origin} | HS CODE: {selectedProduct.hsCode}</p>
                              <div className="pt-1 flex justify-between border-t border-slate-100 font-bold text-indigo-950">
                                <span>Quantity: {quantity} MT</span>
                                <span>USD ${pricePerUnit.toLocaleString('en-US')} / MT</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-2 bg-indigo-50/40 border border-indigo-100 rounded-lg space-y-1 text-[8px] text-slate-650">
                            <div><strong>• Syarat Kirim (Incoterms):</strong> {incoterms}</div>
                            <div><strong>• Syarat Bayar (Payment):</strong> {paymentTerms}</div>
                            <div><strong>• Pelabuhan Bongkar:</strong> {portOfDischarge}</div>
                            <div className="pt-1 border-t border-indigo-100 font-black text-indigo-950 text-right mt-1">
                              Estimated FOB Cargo Value: USD ${totalPrice.toLocaleString('en-US')}.00
                            </div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[7.5px]">
                          <span className="text-slate-400 italic">Issued by: PT Multi Raksa Madani</span>
                          <span className="text-indigo-600 font-extrabold uppercase">DRAFT OFFER</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tawaran Footer Controls */}
              <div className="flex gap-3 justify-end items-center border-t border-slate-200 pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setIsTawaranModalOpen(false)}
                  className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Update state to stage 2: Offer Sheet & Quotation
                    updateStepIdAndBubble(2);
                    setIsTawaranModalOpen(false);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Kirim &amp; Balas Permintaan (Ke Tahap 2)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
