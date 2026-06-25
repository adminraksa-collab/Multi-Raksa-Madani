import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExportProduct, UserProfile, ExportShipment } from '../types';
import { 
  FileText, Calendar, Check, Send, AlertTriangle, UserCheck, 
  HelpCircle, ChevronRight, CheckCircle2, RefreshCw, FileSignature, 
  Download, ArrowRight, User, Building2, Landmark, ShieldAlert, BadgeInfo,
  ZoomIn, ZoomOut, Printer, Lock
} from 'lucide-react';
import { mockProducts } from '../mockData';

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
    nextStep: 'Sourcing';
    comments: string;
  }) => void;
  forcedStepId?: number;
  onStepIdChange?: (stepId: number) => void;
}

export default function NegotiationDashboard({ 
  initialProduct, 
  currentUser, 
  onDealCreated,
  shipment,
  onUpdateShipmentFromDeal,
  forcedStepId,
  onStepIdChange
}: NegotiationDashboardProps) {
  // 1. Negotiation States
  const [currentStepId, setCurrentStepId] = useState<number>(1); // Default to Step 1: Letter of Intent (LOI) to experience the full flow!
  
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

  // Sync state if initialProduct changes
  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
      setCurrentStepId(1); // Begin from step 1
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
          setCurrentStepId(1);
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

  // Bubble up is now handled directly by the event handlers utilizing the `updateStepIdAndBubble` function.

  const isLocked = !!(shipment && shipment.currentStep !== 'Draft');

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
                body { margin: 1.2cm !important; padding: 0 !important; background: white; color: black; }
                .no-print { display: none !important; }
              }

              /* High-fidelity layout classes */
              .flex { display: flex !important; }
              .flex-col { flex-direction: column !important; }
              .justify-between { justify-content: space-between !important; }
              .justify-center { justify-content: center !important; }
              .items-center { align-items: center !important; }
              .items-start { align-items: flex-start !important; }
              .text-right { text-align: right !important; }
              .text-center { text-align: center !important; }
              .text-left { text-align: left !important; }

              /* Grid & columns mimicking Tailwind */
              .grid { display: grid !important; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
              .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
              .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)) !important; }
              .gap-1 { gap: 0.25rem !important; }
              .gap-2 { gap: 0.5rem !important; }
              .gap-3 { gap: 0.75rem !important; }
              .gap-4 { gap: 1rem !important; }

              .col-span-2 { grid-column: span 2 / span 2 !important; }
              .col-span-4 { grid-column: span 4 / span 4 !important; }
              .col-span-6 { grid-column: span 6 / span 6 !important; }
              .col-span-8 { grid-column: span 8 / span 8 !important; }
              .col-span-12 { grid-column: span 12 / span 12 !important; }

              /* Spacing & Margin */
              .space-y-4 > * + * { margin-top: 1rem !important; }
              .space-y-2 > * + * { margin-top: 0.5rem !important; }
              .space-y-1.5 > * + * { margin-top: 0.375rem !important; }
              .space-y-1 > * + * { margin-top: 0.25rem !important; }

              .p-2 { padding: 0.5rem !important; }
              .p-3 { padding: 0.75rem !important; }
              .p-4 { padding: 1rem !important; }
              .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
              .py-1.5 { padding-top: 0.375rem !important; padding-bottom: 0.375rem !important; }
              .pb-3 { padding-bottom: 0.75rem !important; }
              .pt-4 { padding-top: 1rem !important; }
              .pt-2 { padding-top: 0.5rem !important; }
              .pb-1 { padding-bottom: 0.25rem !important; }
              .pb-2 { padding-bottom: 0.5rem !important; }
              .mt-0.5 { margin-top: 0.125rem !important; }
              .mb-1 { margin-bottom: 0.25rem !important; }
              .mb-2 { margin-bottom: 0.5rem !important; }
              .ml-auto { margin-left: auto !important; }

              /* Colors */
              .bg-slate-50 { background-color: #f8fafc !important; }
              .bg-slate-100 { background-color: #f1f5f9 !important; }
              .bg-white { background-color: #ffffff !important; }
              .bg-slate-900 { background-color: #0f172a !important; }
              .text-indigo-900 { color: #312e81 !important; }
              .text-indigo-950 { color: #1e1b4b !important; }
              .text-indigo-600 { color: #4f46e5 !important; }
              .text-slate-900 { color: #0f172a !important; }
              .text-slate-800 { color: #1e293b !important; }
              .text-slate-705 { color: #334155 !important; }
              .text-slate-400 { color: #94a3b8 !important; }
              .text-slate-500 { color: #64748b !important; }

              /* Borders */
              .border { border: 1px solid #cbd5e1 !important; }
              .border-b { border-bottom: 1px solid #cbd5e1 !important; }
              .border-t { border-top: 1px solid #cbd5e1 !important; }
              .border-dashed { border-style: dashed !important; }
              .border-slate-150 { border-color: #e2e8f0 !important; }
              .border-slate-205 { border-color: #e2e8f0 !important; }
              .border-slate-200 { border-color: #cbd5e1 !important; }
              .border-slate-300 { border-color: #cbd5e1 !important; }
              .rounded { border-radius: 0.25rem !important; }
              .rounded-md { border-radius: 0.375rem !important; }
              .rounded-lg { border-radius: 0.5rem !important; }
              .rounded-xl { border-radius: 0.75rem !important; }

              /* Typography */
              .font-bold { font-weight: 700 !important; }
              .font-semibold { font-weight: 600 !important; }
              .font-black { font-weight: 800 !important; }
              .text-xs { font-size: 0.75rem !important; }
              .text-sm { font-size: 0.875rem !important; }
              .text-[9px] { font-size: 9px !important; }
              .text-[10px] { font-size: 10px !important; }
              .text-[11px] { font-size: 11px !important; }
              .text-[8px] { font-size: 8px !important; }
              .underline { text-decoration: underline !important; }
              .italic { font-style: italic !important; }
              .uppercase { text-transform: uppercase !important; }

              /* Sign Stamp */
              .transform { display: inline-block !important; }
              .-rotate-12 { transform: rotate(-12deg) !important; }
              .rotate-6 { transform: rotate(6deg) !important; }
              .border-2 { border-width: 2px !important; }
              .border-emerald-500 { border-color: #10b981 !important; }
              .border-indigo-500 { border-color: #6366f1 !important; }
              .text-emerald-600 { color: #059669 !important; }
            </style>
          </head>
          <body class="bg-white">
            <div class="max-w-2xl mx-auto p-4 bg-white">
              <div class="text-[11px] leading-relaxed">
                ${docClone.outerHTML}
              </div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                  setTimeout(() => {
                    window.parent.document.body.removeChild(window.frameElement);
                  }, 500);
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      doc.close();
    }
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
      max-w: 700px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    @media print {
      body { padding: 0; background: none; }
      .paper-container { max-w: 100%; border: none; box-shadow: none; padding: 0; }
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

    /* Layout, Spacing, and Colors mimicking custom Tailwind utility classes */
    .flex { display: flex !important; }
    .flex-col { flex-direction: column !important; }
    .justify-between { justify-content: space-between !important; }
    .justify-center { justify-content: center !important; }
    .items-center { align-items: center !important; }
    .items-start { align-items: flex-start !important; }
    .text-right { text-align: right !important; }
    .text-center { text-align: center !important; }
    .text-left { text-align: left !important; }

    .grid { display: grid !important; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)) !important; }
    .gap-1 { gap: 0.25rem !important; }
    .gap-2 { gap: 0.5rem !important; }
    .gap-4 { gap: 1rem !important; }

    .col-span-2 { grid-column: span 2 / span 2 !important; }
    .col-span-4 { grid-column: span 4 / span 4 !important; }
    .col-span-6 { grid-column: span 6 / span 6 !important; }
    .col-span-8 { grid-column: span 8 / span 8 !important; }
    .col-span-12 { grid-column: span 12 / span 12 !important; }

    .space-y-4 > * + * { margin-top: 1rem !important; }
    .space-y-2 > * + * { margin-top: 0.5rem !important; }
    .space-y-1.5 > * + * { margin-top: 0.375rem !important; }
    .space-y-1 > * + * { margin-top: 0.25rem !important; }

    .p-2 { padding: 0.5rem !important; }
    .p-3 { padding: 0.75rem !important; }
    .p-4 { padding: 1rem !important; }
    .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
    .py-1.5 { padding-top: 0.375rem !important; padding-bottom: 0.375rem !important; }
    .pb-3 { padding-bottom: 0.75rem !important; }
    .pt-4 { padding-top: 1rem !important; }
    .pt-2 { padding-top: 0.5rem !important; }
    .pb-1 { padding-bottom: 0.25rem !important; }
    .pb-2 { padding-bottom: 0.5rem !important; }
    .mt-0.5 { margin-top: 0.125rem !important; }
    .mb-1 { margin-bottom: 0.25rem !important; }
    .mb-2 { margin-bottom: 0.5rem !important; }
    .ml-auto { margin-left: auto !important; }

    .font-bold { font-weight: 700 !important; }
    .font-semibold { font-weight: 600 !important; }
    .font-black { font-weight: 800 !important; }
    .text-xs { font-size: 0.75rem !important; }
    .text-sm { font-size: 0.875rem !important; }
    .text-[9px] { font-size: 9px !important; }
    .text-[10px] { font-size: 10px !important; }
    .text-[11px] { font-size: 11px !important; }
    .text-[8px] { font-size: 8px !important; }
    .underline { text-decoration: underline !important; }
    .italic { font-style: italic !important; }
    .uppercase { text-transform: uppercase !important; }

    .bg-slate-50 { background-color: #f8fafc !important; }
    .bg-slate-100 { background-color: #f1f5f9 !important; }
    .bg-white { background-color: #ffffff !important; }
    .bg-slate-900 { background-color: #0f172a !important; }
    .text-indigo-900 { color: #312e81 !important; }
    .text-indigo-950 { color: #1e1b4b !important; }
    .text-slate-900 { color: #0f172a !important; }
    .text-slate-800 { color: #1e293b !important; }
    .text-slate-705 { color: #334155 !important; }
    .text-slate-400 { color: #94a3b8 !important; }
    .text-slate-500 { color: #64748b !important; }

    .border { border: 1px solid #cbd5e1 !important; }
    .border-b { border-bottom: 1px solid #cbd5e1 !important; }
    .border-t { border-top: 1px solid #cbd5e1 !important; }
    .border-dashed { border-style: dashed !important; }
    .border-slate-150 { border-color: #e2e8f0 !important; }
    .border-slate-205 { border-color: #e2e8f0 !important; }
    .border-slate-200 { border-color: #cbd5e1 !important; }
    .border-slate-300 { border-color: #cbd5e1 !important; }
    .rounded { border-radius: 0.25rem !important; }
    .rounded-md { border-radius: 0.375rem !important; }
    .rounded-lg { border-radius: 0.5rem !important; }
    .rounded-xl { border-radius: 0.75rem !important; }

    .transform { display: inline-block !important; }
    .-rotate-12 { transform: rotate(-12deg) !important; }
    .rotate-6 { transform: rotate(6deg) !important; }
    .border-2 { border-width: 2px !important; }
    .border-emerald-500 { border-color: #10b981 !important; }
    .border-indigo-500 { border-color: #6366f1 !important; }
    .text-emerald-600 { color: #059669 !important; }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Cetak / Simpan PDF</button>
  <div class="paper-container">
    ${docClone.outerHTML}
  </div>
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
    updateStepIdAndBubble(1);
    setIsExporterSigned(false);
    setIsBuyerSigned(false);
  };

  // 5 Negotiation Stages with Explanations
  const negotiationSteps: NegotiationStep[] = [
    {
      id: 1,
      title: "Inquiry (Permintaan Pembukaan)",
      badge: "Inisiasi Minat",
      actor: "Buyer (Importir)",
      sender: "YOSHIHIDE TRADING CO., Japan",
      receiver: "Exportir Indonesia",
      description: "Importir luar negeri mengirimkan Letter of Intent (LOI) atau Inquiry/Permintaan resmi mengenai komoditi Indonesia. Pembeli menanyakan ketersediaan, sertifikasi karantina, grade, dan estimasi harga per MT.",
      importance: "Langkah pembuka gerbang dagang. Berisi spesifikasi teknis mentah yang diinginkan pembeli.",
      isCompleted: currentStepId > 1
    },
    {
      id: 2,
      title: "Offer Sheet & Quotation (Brosur Penawaran)",
      badge: "Marketing Pitch",
      actor: "Exporter (Trader/Supplier)",
      sender: "Exportir Indonesia",
      receiver: "YOSHIHIDE TRADING CO., Japan",
      description: "Eksportir membalas dengan formal Quotation Sheet (Surat Penawaran Harga). Berisi paparan spesifikasi keunggulan komoditas, foto laboratorium, harga usulan awal, dan Pelabuhan Muat yang disiapkan.",
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

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Dynamic Success Agreement Banner - Goal! */}
      {isExporterSigned && isBuyerSigned && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2.5xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-emerald-500/50 relative overflow-hidden"
        >
          {/* Decorative background circle */}
          <div className="absolute -right-32 -top-32 w-80 h-80 rounded-full bg-emerald-700/10 animate-spin-slow pointer-events-none"></div>
          
          <div className="space-y-2 text-left relative z-10">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-950/40 text-emerald-200 border border-emerald-500/20 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                ✓ DEAL AGREEMENT GOAL!
              </span>
            </div>
            <h4 className="text-base font-black uppercase tracking-wide">
              Kesepakatan Dagang Selesai Ditandatangani!
            </h4>
            <p className="text-xs text-emerald-100/95 leading-relaxed max-w-2xl">
              Proforma Invoice (PI) telah resmi disahkan oleh eksportir PT Samudera &amp; buyer {buyerCompany} untuk komoditas <strong>{selectedProduct.name} ({quantity} {selectedProduct.unit})</strong>. 
              {shipment 
                ? "Klik tombol di samping untuk menyatakan kontrak penjualan sah dan resmi melaju ke tahap persiapan logistik & pengadaan barang oleh para petani!"
                : "Klik tombol peluncur sekarang untuk mengaktifkan bongkar muat kontainer dan melihat pelayaran kapal GPS aktif secara real-time di laut lepas!"}
            </p>
          </div>
          
          <button
            onClick={() => {
              if (shipment && onUpdateShipmentFromDeal) {
                onUpdateShipmentFromDeal(shipment.id, {
                  quantity,
                  pricePerUnit,
                  paymentTerms,
                  incoterms,
                  portOfDischarge,
                  buyerCompany,
                  nextStep: 'Sourcing',
                  comments: `Kontrak Penjualan & Proforma Invoice (PI) resmi disahkan secara bilateral. Transaksi disepakati dan dialirkan ke tahap penyediaan barang (Sourcing oleh Supplier).`
                });
              } else if (onDealCreated) {
                onDealCreated({
                  product: selectedProduct,
                  quantity,
                  pricePerUnit,
                  paymentTerms,
                  incoterms,
                  portOfDischarge,
                  buyerCompany
                });
              }
            }}
            className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-emerald-800 text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-2 shrink-0 hover:-translate-y-0.5 z-10 cursor-pointer"
          >
            <span>{shipment ? "Sahkan & Mulai Logistik (Sourcing) →" : "Luncurkan Kapal GPS Aktif →"}</span>
          </button>
        </motion.div>
      )}
      
      {/* Main Grid Layout for Interactive Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column 1: Interactive Workflow Pipeline Dashboard (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
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
                                  <button 
                                    onClick={() => setLoiAttachment(prev => prev.filter((_, i) => i !== idx))}
                                    className="text-red-500 hover:text-red-700 font-bold text-[9px] px-2 py-0.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step Controls to advance user through simulation */}
                    <div className="pt-2 flex justify-between items-center">
                      <button
                        onClick={() => currentStepId > 1 && updateStepIdAndBubble(currentStepId - 1)}
                        disabled={currentStepId === 1}
                        className="text-xs text-slate-550 hover:text-slate-800 disabled:opacity-40 select-none font-bold"
                      >
                        ← Tahap Sebelumnya
                      </button>
                      
                      {step.id < 5 ? (
                        <button
                          onClick={() => updateStepIdAndBubble(currentStepId + 1)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-all"
                        >
                          Lanjutkan Simulasi
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Tahap Final: Hubungkan Hub Tanda Tangan!
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

          </div>

          {/* Form Configurator: Let users change data on the fly and witness impact */}
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

        </div>

        {/* Column 2: Document Simulator Preview & Joint Signature Control (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
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
                </div>
                <button
                  disabled={isLocked}
                  onClick={() => !isLocked && setIsExporterSigned(!isExporterSigned)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-xs transition-all ${
                    isLocked 
                      ? 'bg-emerald-700/50 text-emerald-100 cursor-not-allowed border border-emerald-600/30 flex items-center gap-1'
                      : isExporterSigned 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Lock className="w-3 h-3 text-emerald-300" />
                      <span>Terverifikasi</span>
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
                </div>
                <button
                  disabled={isLocked}
                  onClick={() => !isLocked && setIsBuyerSigned(!isBuyerSigned)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-xs transition-all ${
                    isLocked 
                      ? 'bg-emerald-700/50 text-emerald-100 cursor-not-allowed border border-emerald-600/30 flex items-center gap-1'
                      : isBuyerSigned 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Lock className="w-3 h-3 text-emerald-300" />
                      <span>Terverifikasi</span>
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
                    className="p-1 px-2.5 rounded bg-white hover:bg-slate-50 border border-slate-250 font-black flex items-center justify-center gap-1 transition-colors hover:text-indigo-600 text-slate-705 active:scale-95 shadow-3xs"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                    <span>Zoom Out</span>
                  </button>
                  <button
                    type="button"
                    title="Zoom In"
                    onClick={() => setScale(prev => Math.min(2.5, prev + 0.1))}
                    className="p-1 px-2.5 rounded bg-white hover:bg-slate-50 border border-slate-250 font-black flex items-center justify-center gap-1 transition-colors hover:text-indigo-600 text-slate-705 active:scale-95 shadow-3xs"
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
                    className="p-1 px-2.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-black flex items-center justify-center gap-1 transition-colors active:scale-95 text-[11px]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset View</span>
                  </button>
                </div>
              </div>

              {/* Direct Print and Download buttons mapping the user intent */}
              <div className="flex items-center gap-1.5 self-end md:self-auto">
                <button
                  type="button"
                  title="Cetak Dokumen"
                  onClick={handlePrint}
                  className="p-1.5 px-3 rounded-lg bg-emerald-600 font-black uppercase text-white hover:bg-emerald-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95 text-[10.5px] shadow-3xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  type="button"
                  title="Unduh Dokumen HTML"
                  onClick={handleDownloadHTML}
                  className="p-1.5 px-3 rounded-lg bg-indigo-600 font-black uppercase text-white hover:bg-indigo-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95 text-[10.5px] shadow-3xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh (.HTML)</span>
                </button>
              </div>
            </div>

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
                  width: '100%',
                  minWidth: '550px',
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transformOrigin: 'top left',
                  transition: isDragging ? 'none' : 'transform 0.12s ease-out'
                }}
              >

                {/* Dynamic Simulated Sheet Paper */}
                <div id="negotiation-document-paper" className="bg-slate-50 p-4 rounded-xl border border-slate-150 font-mono text-[10px] text-slate-700 space-y-4 shadow-3xs">
                  
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
                        <p className="font-bold text-[11px] underline">SUBJECT: LETTER OF INTENT (LOI) & COMMODITY INQUIRY</p>
                        <p className="leading-relaxed">
                          Dear Multi Raksa Madani Exports Team,
                        </p>
                        <p className="leading-relaxed">
                          We herewith officially express our strong interest to purchase high-quality Indonesian commodities. Based on your repute, we would like to request a detailed specifications list and a price proposal for:
                        </p>
                        <div className="p-2 bg-white rounded border border-slate-205 font-bold text-indigo-950 text-[9.5px]">
                          • Commodity: {selectedProduct.name}<br />
                          • Target Volume: {quantity} MT (Metrik Ton)<br />
                          • Target Incoterms: FOB Jakarta Port<br />
                          • Price Guideline Needed: USD / Metric Ton
                        </div>
                        <p className="leading-relaxed">
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
                                  <span className="truncate max-w-[220px]">{file.name}</span> 
                                  <span className="text-slate-400">({file.size})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-slate-400 text-[8px] italic">Signed digitally by Kenji Yoshihide (Director)</span>
                        <button 
                          onClick={() => updateStepIdAndBubble(2)}
                          className="text-[9px] font-black uppercase tracking-wider text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Balas Dengan Quotation →
                        </button>
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
                        <p className="leading-relaxed">
                          Thank you for your LOI interest YT-LOI/2026/04. We are delighted to submit our best factory offering pricing & parameters below:
                        </p>
                        <div className="bg-white rounded border border-slate-205 overflow-hidden">
                          <div className="p-2 bg-slate-100 border-b border-slate-200 flex justify-between font-bold text-slate-800">
                            <span>ITEM / SPECIFICATION</span>
                            <span>OFFER PRICE</span>
                          </div>
                          <div className="p-2 text-[9px] space-y-1">
                            <p className="font-bold text-slate-900">{selectedProduct.name}</p>
                            <p className="text-slate-500 leading-snug">Specification: {selectedProduct.specification}</p>
                            <p className="text-slate-500 font-bold">Origin: {selectedProduct.origin} | HS CODE: {selectedProduct.hsCode}</p>
                            <div className="pt-1 flex justify-between border-t border-slate-100 font-bold text-indigo-950">
                              <span>Quantity: {quantity} MT</span>
                              <span>USD ${pricePerUnit.toLocaleString('en-US')} / MT</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[8px] text-slate-500">
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
                        <button 
                          onClick={() => updateStepIdAndBubble(3)}
                          className="text-[9px] font-black uppercase tracking-wider text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Naikkan Jadi Proforma Invoice →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STAGE 4: NEGOTIASI & COUNTER-OFFER (Interactive Negotiating Playground) */}
                  {currentStepId === 4 && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="border-b border-dashed border-slate-300 pb-2">
                        <h5 className="font-bold text-orange-950 text-xs flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-amber-550 rounded-full inline-block animate-pulse"></span>
                          TABEL MONITORING NEGOSIASI & COUNTER-OFFER
                        </h5>
                        <p className="text-[9px] text-slate-455">Tawar-menawar klausa dokumen sebelum L/C dibuka secara legal.</p>
                      </div>

                      <div className="space-y-2.5">
                        
                        {/* Live negotiation chat 1 */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex justify-between items-center text-[8px] font-bold text-indigo-800 mb-1">
                            <span>Sanggahan 1: Penurunan Harga Per Unit</span>
                            <span className="bg-amber-100 text-amber-800 px-1 py-0.2 rounded">Menunggu Keputusan</span>
                          </div>
                          <p className="text-[9px] text-slate-650 leading-relaxed mb-2">
                            &ldquo;Yoshihide Trading Co. meminta diskon khusus. Mereka menawar harga diturunkan ke <strong>USD ${Math.max(10, pricePerUnit - 100).toLocaleString('en-US')} / MT</strong> karena ini merupakan order perdana.&rdquo;
                          </p>
                          <button 
                            onClick={() => {
                              setPricePerUnit(Math.max(10, pricePerUnit - 100));
                            }}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded transition-colors"
                          >
                            ✓ Terima Diskon (Ganti Harga Real-time)
                          </button>
                        </div>

                        {/* Live negotiation chat 2 */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex justify-between items-center text-[8px] font-bold text-indigo-800 mb-1">
                            <span>Sanggahan 2: Modifikasi Syarat Pengiriman (Incoterms)</span>
                            <span className="bg-amber-100 text-amber-800 px-1 py-0.2 rounded">Menunggu Keputusan</span>
                          </div>
                          <p className="text-[9px] text-slate-655 leading-relaxed mb-2">
                            &ldquo;Pembeli lebih memilih penawaran <strong>CIF Tokyo Port</strong> agar mereka tidak perlu repot mencari kapal kontainer sendiri di Tanjung Priok.&rdquo;
                          </p>
                          <button 
                            onClick={() => {
                              setIncoterms('CIF Tokyo Port, Japan (Incoterms 2020)');
                              setPortOfDischarge('Port of Tokyo, Japan');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded transition-colors"
                          >
                            ✓ Setujui CIF Tokyo (Ubah Struktur Ongkos)
                          </button>
                        </div>

                        {/* Live negotiation chat 3 */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex justify-between items-center text-[8px] font-bold text-indigo-800 mb-1">
                            <span>Sanggahan 3: Pilihan Metode Pembayaran</span>
                            <span className="bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-black font-mono">✓ Direkomendasikan Bank</span>
                          </div>
                          <p className="text-[9px] text-slate-655 leading-relaxed mb-2">
                            &ldquo;Gunakan sistem prabayar/DP atau L/C term di dalam PI agar devisa terjamin otomatis sebelum proses logistik pengiriman.&rdquo;
                          </p>
                          <button 
                            onClick={() => {
                              setPaymentTerms('100% Sight Letter of Credit (L/C Irrevocable)');
                            }}
                            className="bg-slate-700 hover:bg-slate-850 text-white text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded transition-colors"
                          >
                            ✓ Gunakan 100% L/C Irrevocable
                          </button>
                        </div>

                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-[8px] text-slate-400 font-bold">Klausul di atas akan langsung meng-update draf PI ekspor Anda</span>
                        <button 
                          onClick={() => updateStepIdAndBubble(5)}
                          className="text-[9px] font-black uppercase tracking-wider text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Kunci & Ke Meja TTD Bilateral →
                        </button>
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
                          <p className="font-bold">No: PFI/EFI-2026/8892</p>
                          <p>Date: June 20, 2026</p>
                        </div>
                      </div>

                      {/* Parties Block */}
                      <div className="grid grid-cols-2 gap-2 text-[9px]">
                        <div className="bg-white p-2 rounded-md border border-slate-200">
                          <span className="font-bold uppercase text-indigo-800 block mb-0.5">1. SELLER / SHIPPER</span>
                          <p className="font-bold text-slate-900">PT MULTI RAKSA MADANI</p>
                          <p className="text-slate-500 mt-0.5 leading-tight">Gedung Devisa Ekspor Lantai 12, Jakarta, Indonesia</p>
                        </div>
                        <div className="bg-white p-2 rounded-md border border-slate-200">
                          <span className="font-bold uppercase text-indigo-800 block mb-0.5">2. BUYER / IMPORTER</span>
                          <p className="font-bold text-slate-900">{buyerCompany}</p>
                          <p className="text-slate-500 mt-0.5 leading-tight">{buyerAddress}</p>
                        </div>
                      </div>

                      {/* Cargo specs table */}
                      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                        <div className="bg-slate-100 px-2 py-1.5 font-bold grid grid-cols-12 border-b border-slate-200 text-slate-800">
                          <span className="col-span-6 animate-pulse">COMMODITY & SPECIFICATION</span>
                          <span className="col-span-2 text-right">QTY</span>
                          <span className="col-span-2 text-right">PRICE (USD)</span>
                          <span className="col-span-2 text-right">TOTAL</span>
                        </div>
                        
                        <div className="p-2 grid grid-cols-12 border-b border-slate-100 items-start text-slate-900 leading-tight">
                          <span className="col-span-6 animate-pulse">
                            <strong className="text-slate-955 block">{selectedProduct.name}</strong>
                            <span className="text-[8px] text-slate-400 block mt-0.5">H.S. CODE: {selectedProduct.hsCode}</span>
                            <span className="text-[8px] text-slate-400 block">Origin: {selectedProduct.origin}</span>
                          </span>
                          <span className="col-span-2 text-right font-semibold">{quantity} MT</span>
                          <span className="col-span-2 text-right font-semibold">${pricePerUnit.toLocaleString('en-US')}</span>
                          <span className="col-span-2 text-right font-black text-indigo-900">${totalPrice.toLocaleString('en-US')}</span>
                        </div>
                        
                        <div className="bg-slate-50 px-2 py-1 text-right font-bold text-slate-900">
                          TOTAL AMOUNT ({incoterms.split(' ')[0]}): <span className="text-indigo-900 text-xs font-black">${totalPrice.toLocaleString('en-US')}.00 USD</span>
                        </div>
                      </div>

                      {/* Commercial Terms & Banking Details (The absolute differentiator from Quotation) */}
                      <div className="bg-white p-2 rounded-md border border-slate-200 space-y-1.5 text-[8.5px]">
                        <h6 className="font-bold text-slate-850 uppercase text-indigo-800 tracking-wider">COMMERCIAL & BANKING CLAUSES :</h6>
                        
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

                        <div className="grid grid-cols-12 gap-1">
                          <span className="col-span-4 font-bold text-slate-500">BENEFICIARY BANK:</span>
                          <span className="col-span-8 text-slate-700 leading-tight">
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
                          <div className="border border-dashed border-slate-300 rounded-md p-2 text-center h-20 flex flex-col justify-between bg-white relative overflow-hidden">
                            <span className="text-[8px] font-black uppercase text-slate-400 block mb-1">APPROVED BY EXPORTER:</span>
                            
                            {isExporterSigned ? (
                              <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="my-auto flex flex-col items-center justify-center text-emerald-600"
                              >
                                <span className="font-mono text-[9px] tracking-wide font-black border-2 border-emerald-500 px-1 py-0.5 uppercase transform -rotate-12 bg-white/90">
                                  APPROVED - PT MULTI RAKSA MADANI
                                </span>
                                <span className="text-[7px] text-slate-400 mt-1">Eksportir Signed ✓</span>
                              </motion.div>
                            ) : (
                              <div className="my-auto text-[8px] text-slate-350 font-bold">
                                [Menunggu Tanda Tangan]
                              </div>
                            )}
                          </div>

                          {/* Buyer Sign Box */}
                          <div className="border border-dashed border-slate-300 rounded-md p-2 text-center h-20 flex flex-col justify-between bg-white relative overflow-hidden">
                            <span className="text-[8px] font-black uppercase text-slate-400 block mb-1">COUNTERSIGNED BY BUYER:</span>
                            
                            {isBuyerSigned ? (
                              <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="my-auto flex flex-col items-center justify-center text-indigo-600"
                              >
                                <span className="font-mono text-[9px] tracking-wide font-black border-2 border-indigo-500 px-1 py-0.5 uppercase transform rotate-6 bg-white/90">
                                  ACCEPTED & COUNTERSIGNED
                            </span>
                                <span className="text-[7px] text-slate-400 mt-1">Buyer Signed ✓</span>
                              </motion.div>
                            ) : (
                              <div className="my-auto text-[8px] text-slate-350 font-bold">
                                [Menunggu Countersign]
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    </>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
