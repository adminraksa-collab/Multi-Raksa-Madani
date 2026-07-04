import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Check,
  Send,
  ArrowRight,
  Lock,
  Coffee,
  Globe,
  Building,
  PenTool,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Download,
  X,
  Upload,
  Trash2,
  Paperclip,
  User,
  Mail,
  Phone,
  CreditCard,
  Sliders,
  Minus,
  Maximize2,
  ChevronDown
} from "lucide-react";
import { translations } from "../translations";
export default function CommercialNegotiationGateway({
  shipment,
  currentUser,
  currentLanguage = "id",
  onUpdateShipmentFromDeal,
  onSelectUser,
  isArchiveMode = false
}) {
  const t = translations[currentLanguage] || translations.id;
  const [subStage, setSubStage] = useState(() => {
    try {
      const saved = localStorage.getItem(`commercial_nego_subStage_${shipment.id}`);
      if (saved) return saved;
    } catch (e) {
    }
    return "buyer-sending";
  });
  const [activeArchiveTab, setActiveArchiveTab] = useState("summary");
  const [portalTarget, setPortalTarget] = useState(null);
  useEffect(() => {
    const el = document.getElementById("nego-header-addon");
    if (el) {
      setPortalTarget(el);
    }
  }, []);
  const [officialProposal, setOfficialProposal] = useState(() => {
    try {
      const saved = localStorage.getItem(`commercial_nego_official_proposal_${shipment.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
    }
    return {
      quantity: shipment.quantity || 20,
      price: 1450,
      incoterm: "FOB Belawan Port (Incoterms 2020)",
      payment: "Letter of Credit (L/C) at Sight",
      notes: "Kadar air biji kopi tervalidasi maksimal 12%, pengemasan menggunakan karung goni berlapis GrainPro.",
      proposer: "Trader",
      buyerAgreed: false,
      traderAgreed: false,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  const activeSimulatedRole = currentUser?.role === "Buyer" ? "Buyer" : currentUser?.role === "Trader" || currentUser?.role === "Superadmin" ? "Trader" : "Viewer";
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [negotiatedQty, setNegotiatedQty] = useState(() => {
    try {
      const key = activeSimulatedRole === "Buyer" ? `commercial_nego_buyer_draft_qty_${shipment.id}` : `commercial_nego_trader_draft_qty_${shipment.id}`;
      const saved = localStorage.getItem(key);
      if (saved) return Number(saved);
    } catch (e) {
    }
    return officialProposal.quantity;
  });
  const [negotiatedPrice, setNegotiatedPrice] = useState(() => {
    try {
      const key = activeSimulatedRole === "Buyer" ? `commercial_nego_buyer_draft_price_${shipment.id}` : `commercial_nego_trader_draft_price_${shipment.id}`;
      const saved = localStorage.getItem(key);
      if (saved) return Number(saved);
    } catch (e) {
    }
    return officialProposal.price;
  });
  const [selectedIncoterm, setSelectedIncoterm] = useState(() => {
    try {
      const key = activeSimulatedRole === "Buyer" ? `commercial_nego_buyer_draft_incoterm_${shipment.id}` : `commercial_nego_trader_draft_incoterm_${shipment.id}`;
      const saved = localStorage.getItem(key);
      if (saved) return saved;
    } catch (e) {
    }
    return officialProposal.incoterm;
  });
  const [selectedPayment, setSelectedPayment] = useState(() => {
    try {
      const key = activeSimulatedRole === "Buyer" ? `commercial_nego_buyer_draft_payment_${shipment.id}` : `commercial_nego_trader_draft_payment_${shipment.id}`;
      const saved = localStorage.getItem(key);
      if (saved) return saved;
    } catch (e) {
    }
    return officialProposal.payment;
  });
  const [negotiationNotes, setNegotiationNotes] = useState(() => {
    try {
      const key = activeSimulatedRole === "Buyer" ? `commercial_nego_buyer_draft_notes_${shipment.id}` : `commercial_nego_trader_draft_notes_${shipment.id}`;
      const saved = localStorage.getItem(key);
      if (saved) return saved;
    } catch (e) {
    }
    return officialProposal.notes;
  });
  const [attachedFile, setAttachedFile] = useState(() => {
    try {
      const saved = localStorage.getItem(`commercial_nego_attachedFile_${shipment.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
    }
    return null;
  });
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [printBlockedError, setPrintBlockedError] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const [isLoiDetailOpen, setIsLoiDetailOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(`commercial_nego_chat_${shipment.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
    }
    return [
      {
        id: "1",
        sender: "Buyer",
        senderName: "Hans Mueller (Buyer)",
        avatar: "\u{1F1E9}\u{1F1EA}",
        message: `Halo Pak Hendry. Kami dari EuroFoods Import GmbH sangat tertarik untuk mengimpor ${shipment.productName || "Kopi Gayo Organik"} berkualitas premium dari Anda.`,
        timestamp: "10:15"
      },
      {
        id: "2",
        sender: "Trader",
        senderName: "Hendry Kurniawan (Trader)",
        avatar: "\u{1F1EE}\u{1F1E9}",
        message: "Selamat pagi Pak Hans! Senang mendengar ketertarikan Anda. Kami siap menyuplai biji kopi pilihan dengan standardisasi ekspor terbaik dan sertifikasi lengkap.",
        timestamp: "10:20"
      },
      {
        id: "3",
        sender: "Buyer",
        senderName: "Hans Mueller (Buyer)",
        avatar: "\u{1F1E9}\u{1F1EA}",
        message: "Keluaran LOI kami ajukan dengan spesifikasi Premium Grade. Kami ingin mendiskusikan harga terbaik serta metode pengiriman yang paling efisien.",
        timestamp: "10:25"
      }
    ];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const chatContainerRef = useRef(null);
  useEffect(() => {
    try {
      localStorage.setItem(`commercial_nego_chat_${shipment.id}`, JSON.stringify(chatMessages));
    } catch (e) {
    }
  }, [chatMessages, shipment.id]);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === "PRINT_BLOCKED") {
        setPrintBlockedError(true);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  const [buyerSigned, setBuyerSigned] = useState(() => {
    try {
      const saved = localStorage.getItem(`commercial_nego_buyerSigned_${shipment.id}`);
      if (saved) return saved === "true";
    } catch (e) {
    }
    return false;
  });
  const [traderSigned, setTraderSigned] = useState(() => {
    try {
      const saved = localStorage.getItem(`commercial_nego_traderSigned_${shipment.id}`);
      if (saved) return saved === "true";
    } catch (e) {
    }
    return false;
  });
  const buyerAgreed = officialProposal.buyerAgreed;
  const traderAgreed = officialProposal.traderAgreed;
  useEffect(() => {
    localStorage.setItem(`commercial_nego_subStage_${shipment.id}`, subStage);
  }, [subStage, shipment.id]);
  useEffect(() => {
    localStorage.setItem(`commercial_nego_official_proposal_${shipment.id}`, JSON.stringify(officialProposal));
  }, [officialProposal, shipment.id]);
  useEffect(() => {
    if (activeSimulatedRole === "Buyer") {
      localStorage.setItem(`commercial_nego_buyer_draft_qty_${shipment.id}`, String(negotiatedQty));
    } else if (activeSimulatedRole === "Trader") {
      localStorage.setItem(`commercial_nego_trader_draft_qty_${shipment.id}`, String(negotiatedQty));
    }
  }, [negotiatedQty, activeSimulatedRole, shipment.id]);
  useEffect(() => {
    if (activeSimulatedRole === "Buyer") {
      localStorage.setItem(`commercial_nego_buyer_draft_price_${shipment.id}`, String(negotiatedPrice));
    } else if (activeSimulatedRole === "Trader") {
      localStorage.setItem(`commercial_nego_trader_draft_price_${shipment.id}`, String(negotiatedPrice));
    }
  }, [negotiatedPrice, activeSimulatedRole, shipment.id]);
  useEffect(() => {
    if (activeSimulatedRole === "Buyer") {
      localStorage.setItem(`commercial_nego_buyer_draft_incoterm_${shipment.id}`, selectedIncoterm);
    } else if (activeSimulatedRole === "Trader") {
      localStorage.setItem(`commercial_nego_trader_draft_incoterm_${shipment.id}`, selectedIncoterm);
    }
  }, [selectedIncoterm, activeSimulatedRole, shipment.id]);
  useEffect(() => {
    if (activeSimulatedRole === "Buyer") {
      localStorage.setItem(`commercial_nego_buyer_draft_payment_${shipment.id}`, selectedPayment);
    } else if (activeSimulatedRole === "Trader") {
      localStorage.setItem(`commercial_nego_trader_draft_payment_${shipment.id}`, selectedPayment);
    }
  }, [selectedPayment, activeSimulatedRole, shipment.id]);
  useEffect(() => {
    if (activeSimulatedRole === "Buyer") {
      localStorage.setItem(`commercial_nego_buyer_draft_notes_${shipment.id}`, negotiationNotes);
    } else if (activeSimulatedRole === "Trader") {
      localStorage.setItem(`commercial_nego_trader_draft_notes_${shipment.id}`, negotiationNotes);
    }
  }, [negotiationNotes, activeSimulatedRole, shipment.id]);
  useEffect(() => {
    localStorage.setItem(`commercial_nego_buyerSigned_${shipment.id}`, String(buyerSigned));
  }, [buyerSigned, shipment.id]);
  useEffect(() => {
    localStorage.setItem(`commercial_nego_traderSigned_${shipment.id}`, String(traderSigned));
  }, [traderSigned, shipment.id]);
  useEffect(() => {
    if (attachedFile) {
      localStorage.setItem(`commercial_nego_attachedFile_${shipment.id}`, JSON.stringify(attachedFile));
    } else {
      localStorage.removeItem(`commercial_nego_attachedFile_${shipment.id}`);
    }
  }, [attachedFile, shipment.id]);
  useEffect(() => {
    const isContractSigned = shipment.documents.some((d) => d.type === "Sales Contract" && d.status === "Approved");
    if (isArchiveMode || shipment.currentStep !== "Draft" || isContractSigned) {
      setSubStage("signed");
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
  const totalContractValue = negotiatedQty * negotiatedPrice;
  const handleSendLoi = () => {
    setSubStage("negotiating");
    setNegotiatedQty(shipment.quantity || 20);
    const initialLoiProposal = {
      quantity: shipment.quantity || 20,
      price: negotiatedPrice || 1450,
      incoterm: selectedIncoterm || "FOB Belawan Port (Incoterms 2020)",
      payment: selectedPayment || "Letter of Credit (L/C) at Sight",
      notes: negotiationNotes || "Kadar air biji kopi tervalidasi maksimal 12%, pengemasan menggunakan karung goni berlapis GrainPro.",
      proposer: "Buyer",
      buyerAgreed: false,
      traderAgreed: false,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    setOfficialProposal(initialLoiProposal);
    localStorage.setItem(`commercial_nego_official_proposal_${shipment.id}`, JSON.stringify(initialLoiProposal));
    const logMsg = {
      id: Date.now().toString(),
      sender: "System",
      senderName: "Sistem Portal",
      avatar: "\u2699\uFE0F",
      message: "\u{1F4E2} Buyer (EuroFoods) mengajukan minat impor resmi (LOI) dan membuka forum negosiasi bilateral.",
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages([logMsg]);
  };
  const handleSendMessage = (textToSend) => {
    const msgText = textToSend || typedMessage.trim();
    if (!msgText) return;
    const senderRole = activeSimulatedRole === "Viewer" ? "Buyer" : activeSimulatedRole;
    const senderName = senderRole === "Buyer" ? "Hans Mueller (Buyer)" : "Hendry Kurniawan (Trader)";
    const avatar = senderRole === "Buyer" ? "\u{1F1E9}\u{1F1EA}" : "\u{1F1EE}\u{1F1E9}";
    const newMsg = {
      id: Date.now().toString(),
      sender: senderRole,
      senderName,
      avatar,
      message: msgText,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, newMsg]);
    if (!textToSend) {
      setTypedMessage("");
    }
  };
  const handleSubmitCounterOffer = (overrides) => {
    const updatedQty = overrides?.quantity ?? negotiatedQty;
    const updatedPrice = overrides?.price ?? negotiatedPrice;
    const updatedIncoterm = overrides?.incoterm ?? selectedIncoterm;
    const updatedPayment = overrides?.payment ?? selectedPayment;
    const updatedNotes = overrides?.notes ?? negotiationNotes;
    const updated = {
      quantity: updatedQty,
      price: updatedPrice,
      incoterm: updatedIncoterm,
      payment: updatedPayment,
      notes: updatedNotes,
      proposer: activeSimulatedRole === "Viewer" ? "Trader" : activeSimulatedRole,
      buyerAgreed: false,
      traderAgreed: false,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    setOfficialProposal(updated);
    localStorage.setItem(`commercial_nego_official_proposal_${shipment.id}`, JSON.stringify(updated));
    const logMsg = {
      id: Date.now().toString(),
      sender: "System",
      senderName: "Sistem Portal",
      avatar: "\u2699\uFE0F",
      message: `\u{1F4E2} ${activeSimulatedRole === "Buyer" ? "Buyer" : "Trader"} mengajukan proposal draf baru: ${updatedQty} MT @ $${updatedPrice}/MT via ${updatedIncoterm.split(" ")[0]} & ${updatedPayment.split(" ")[0]}.`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, logMsg]);
  };
  const handleAcceptProposal = () => {
    const updated = {
      ...officialProposal,
      buyerAgreed: activeSimulatedRole === "Buyer" ? true : officialProposal.buyerAgreed,
      traderAgreed: activeSimulatedRole === "Trader" ? true : officialProposal.traderAgreed
    };
    setOfficialProposal(updated);
    localStorage.setItem(`commercial_nego_official_proposal_${shipment.id}`, JSON.stringify(updated));
    const logMsg = {
      id: Date.now().toString(),
      sender: "System",
      senderName: "Sistem Portal",
      avatar: "\u2699\uFE0F",
      message: `\u2713 ${activeSimulatedRole === "Buyer" ? "Buyer" : "Trader"} menyetujui draf proposal resmi! Parameter komersial kini terkunci dan draf Proforma Invoice bilateral siap ditandatangani.`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, logMsg]);
  };
  const handleRejectProposal = () => {
    const updated = {
      ...officialProposal,
      buyerAgreed: activeSimulatedRole === "Buyer" ? false : officialProposal.buyerAgreed,
      traderAgreed: activeSimulatedRole === "Trader" ? false : officialProposal.traderAgreed
    };
    setOfficialProposal(updated);
    localStorage.setItem(`commercial_nego_official_proposal_${shipment.id}`, JSON.stringify(updated));
    const logMsg = {
      id: Date.now().toString(),
      sender: "System",
      senderName: "Sistem Portal",
      avatar: "\u2699\uFE0F",
      message: `\u274C ${activeSimulatedRole === "Buyer" ? "Buyer" : "Trader"} menolak draf proposal. Silakan sesuaikan kembali kalkulator untuk mengajukan penawaran baru.`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, logMsg]);
  };
  const handleProposeDeal = () => {
    setNegotiatedQty(officialProposal.quantity);
    setNegotiatedPrice(officialProposal.price);
    setSelectedIncoterm(officialProposal.incoterm);
    setSelectedPayment(officialProposal.payment);
    setNegotiationNotes(officialProposal.notes);
  };
  const handleSignAsBuyer = () => {
    setBuyerSigned(true);
    const logMsg = {
      id: Date.now().toString(),
      sender: "System",
      senderName: "Sistem Portal",
      avatar: "\u2699\uFE0F",
      message: "\u270D\uFE0F Buyer (Hans Mueller) telah membubuhkan tanda tangan resmi pada draf Proforma Invoice!",
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, logMsg]);
  };
  const handleSignAsTrader = () => {
    setTraderSigned(true);
    const logMsg = {
      id: Date.now().toString(),
      sender: "System",
      senderName: "Sistem Portal",
      avatar: "\u2699\uFE0F",
      message: "\u270D\uFE0F Trader (Hendry Kurniawan) telah membubuhkan tanda tangan resmi pada draf Proforma Invoice!",
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, logMsg]);
  };
  const handleTransitionToLogistics = () => {
    if (onUpdateShipmentFromDeal) {
      onUpdateShipmentFromDeal(shipment.id, {
        quantity: officialProposal.quantity,
        pricePerUnit: officialProposal.price,
        paymentTerms: officialProposal.payment,
        incoterms: officialProposal.incoterm,
        portOfDischarge: shipment.portOfDischarge || "Port of Hamburg, Germany",
        buyerCompany: shipment.buyerCompany || "EuroFoods Import GmbH",
        nextStep: "Shipping",
        comments: `Fase I Komersial Selesai: LOI telah dibaca, klausul disepakati melalui negosiasi asinkron nyata, dan Proforma Invoice (PI) telah ditandatangani secara bilateral oleh ${shipment.buyerCompany} dan PT Multi Raksa Madani.`
      });
    }
  };
  const handleResetDemo = () => {
    setSubStage("buyer-sending");
    setBuyerSigned(false);
    setTraderSigned(false);
    const defaultProposal = {
      quantity: shipment.quantity || 20,
      price: 1450,
      incoterm: "FOB Belawan Port (Incoterms 2020)",
      payment: "Letter of Credit (L/C) at Sight",
      notes: "Kadar air biji kopi tervalidasi maksimal 12%, pengemasan menggunakan karung goni berlapis GrainPro.",
      proposer: "Trader",
      buyerAgreed: false,
      traderAgreed: false,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    setOfficialProposal(defaultProposal);
    setNegotiatedQty(20);
    setNegotiatedPrice(1450);
    setSelectedIncoterm("FOB Belawan Port (Incoterms 2020)");
    setSelectedPayment("Letter of Credit (L/C) at Sight");
    setNegotiationNotes("Kadar air biji kopi tervalidasi maksimal 12%, pengemasan menggunakan karung goni berlapis GrainPro.");
    const initialMsg = {
      id: "1",
      sender: "Buyer",
      senderName: "Hans Mueller (Buyer)",
      avatar: "\u{1F1E9}\u{1F1EA}",
      message: `Halo Pak Hendry. Kami dari EuroFoods Import GmbH sangat tertarik untuk mengimpor ${shipment.productName || "Kopi Gayo Organik"} berkualitas premium dari Anda.`,
      timestamp: "10:15"
    };
    setChatMessages([initialMsg]);
    if (attachedFile?.url) {
      URL.revokeObjectURL(attachedFile.url);
    }
    setAttachedFile(null);
    setUploadError(null);
    try {
      localStorage.removeItem(`commercial_nego_subStage_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_official_proposal_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_buyer_draft_qty_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_buyer_draft_price_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_buyer_draft_incoterm_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_buyer_draft_payment_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_buyer_draft_notes_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_trader_draft_qty_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_trader_draft_price_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_trader_draft_incoterm_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_trader_draft_payment_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_trader_draft_notes_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_buyerSigned_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_traderSigned_${shipment.id}`);
      localStorage.removeItem(`commercial_nego_attachedFile_${shipment.id}`);
    } catch (e) {
    }
  };
  const handleFileDropOrSelect = (file) => {
    setUploadError(null);
    const maxSizeBytes = 2 * 1024 * 1024;
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
      url
    });
  };
  const handlePrint = (type) => {
    setPrintBlockedError(false);
    const elementId = type === "loi" ? "commercial-loi-paper" : "commercial-pi-paper";
    const paperElement = document.getElementById(elementId);
    if (!paperElement) return;
    const docClone = paperElement.cloneNode(true);
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${type === "loi" ? "Letter of Intent (LOI)" : "Proforma Invoice (PI)"} - PT MULTI RAKSA MADANI</title>
            <script src="https://cdn.tailwindcss.com"><\/script>
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
            <\/script>
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
                background-color: ${type === "loi" ? "#090d16" : "#f8fafc"};
                color: ${type === "loi" ? "#f8fafc" : "#1e293b"};
                line-height: 1.5;
              }

              @media print {
                body { margin: 1.2cm !important; padding: 0 !important; background-color: ${type === "loi" ? "#090d16" : "#ffffff"} !important; color: ${type === "loi" ? "#f8fafc" : "#1e293b"} !important; }
              }
            </style>
          </head>
          <body class="${type === "loi" ? "bg-[#090d16] text-slate-100" : "bg-slate-50 text-slate-900"}">
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
            <\/script>
          </body>
        </html>
      `);
      doc.close();
    }
    setTimeout(() => {
      setPrintBlockedError(true);
    }, 100);
  };
  const handleDownload = (type) => {
    const elementId = type === "loi" ? "commercial-loi-paper" : "commercial-pi-paper";
    const paperElement = document.getElementById(elementId);
    if (!paperElement) return;
    const docClone = paperElement.cloneNode(true);
    const docTitle = type === "loi" ? "Letter_of_Intent_LOI" : "Proforma_Invoice_PI";
    const cleanHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle.replace(/_/g, " ")}</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
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
  <\/script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap');
    
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box !important;
    }

    body { 
      padding: 40px; 
      background: ${type === "loi" ? "#090d16" : "#f1f5f9"}; 
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
<body class="${type === "loi" ? "bg-[#090d16]" : "bg-slate-100"}">
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
  <\/script>
</body>
</html>`;
    const blob = new Blob([cleanHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docTitle}_2026.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxs("div", { id: "commercial-gateway-container", className: "bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 relative", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-3xl overflow-hidden pointer-events-none -z-10", children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#fff_70%,transparent_100%)] opacity-30" }) }),
    portalTarget && createPortal(
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1 border-r border-slate-200 pr-2 mr-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase font-mono tracking-wider text-slate-500 font-black hidden lg:inline", children: "Profil:" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSelectedProfile("buyer"),
              className: `px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border cursor-pointer shadow-sm ${activeSimulatedRole === "Trader" ? "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"}`,
              children: [
                /* @__PURE__ */ jsx("span", { children: "\u{1F1E9}\u{1F1EA} Importir" }),
                activeSimulatedRole === "Trader" && /* @__PURE__ */ jsx("span", { className: "text-[8px] bg-indigo-100 text-indigo-700 px-1 py-0.1 rounded-full font-mono font-black uppercase tracking-tight", children: "Lawan" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSelectedProfile("trader"),
              className: `px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border cursor-pointer shadow-sm ${activeSimulatedRole === "Buyer" ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"}`,
              children: [
                /* @__PURE__ */ jsx("span", { children: "\u{1F1EE}\u{1F1E9} Eksportir" }),
                activeSimulatedRole === "Buyer" && /* @__PURE__ */ jsx("span", { className: "text-[8px] bg-emerald-100 text-emerald-700 px-1 py-0.1 rounded-full font-mono font-black uppercase tracking-tight", children: "Lawan" })
              ]
            }
          )
        ] }),
        isArchiveMode || shipment.currentStep !== "Draft" ? /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 border border-emerald-150 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1 shadow-sm text-emerald-700 font-mono text-[9px] font-black uppercase tracking-wider", children: [
          /* @__PURE__ */ jsx("span", { className: "w-1 h-1 rounded-full bg-emerald-500 animate-pulse" }),
          /* @__PURE__ */ jsx("span", { children: "Selesai" })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-150 p-1 px-1.5 sm:px-2.5 rounded-lg flex items-center gap-1.5 shadow-inner max-w-xs", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-[9px] border border-indigo-200 shrink-0", children: currentUser?.name ? currentUser.name.charAt(0) : "T" }),
          /* @__PURE__ */ jsxs("div", { className: "text-left hidden sm:block", children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-400 font-mono text-[7px] font-black leading-none block uppercase", children: "Aktor Aktif:" }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] font-extrabold text-slate-800 leading-none mt-0.5", children: currentUser?.name || "Tamu" })
          ] })
        ] })
      ] }),
      portalTarget
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 border-b border-slate-200 pb-3", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-150 rounded-full uppercase animate-pulse", children: "Fase I: Komersial & Kontrak" }),
        /* @__PURE__ */ jsx("span", { className: "text-slate-400 font-mono text-xs", children: "\u2022" }),
        /* @__PURE__ */ jsxs("span", { className: "text-slate-500 text-[10px] sm:text-xs flex items-center gap-1 font-mono", children: [
          /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3 text-amber-500" }),
          " Gerbang Pabean Terkunci"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-1.5", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Coffee, { className: "w-5 h-5 text-indigo-500 shrink-0" }),
          /* @__PURE__ */ jsx("span", { children: "Gerbang Negosiasi Komersial & Pengesahan PI" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] sm:text-xs text-slate-500 max-w-md text-right hidden md:block", children: "Sebelum memulai logistik maritim, importir & eksportir merundingkan legalitas komersial demi draf PI yang sah." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 border-b border-slate-200 py-2", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setIsLoiDetailOpen(!isLoiDetailOpen),
          className: "w-full flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg transition-colors cursor-pointer",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(FileText, { className: "w-3.5 h-3.5 text-indigo-600" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-slate-800 uppercase tracking-tight", children: "Data Referensi Permintaan/LOI" })
            ] }),
            /* @__PURE__ */ jsx(ChevronDown, { className: `w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${isLoiDetailOpen ? "rotate-180" : ""}` })
          ]
        }
      ),
      /* @__PURE__ */ jsx(AnimatePresence, { children: isLoiDetailOpen && /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { height: 0, opacity: 0 },
          animate: { height: "auto", opacity: 1 },
          exit: { height: 0, opacity: 0 },
          className: "overflow-hidden",
          children: /* @__PURE__ */ jsxs("div", { className: "p-4 mt-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Nomor Kontrak" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-800", children: shipment.contractNumber })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Komoditas" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-800", children: shipment.productName })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Kode HS" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-mono font-semibold text-slate-800", children: shipment.hsCode })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Kuantitas Permintaan" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold text-slate-800", children: [
                  shipment.quantity,
                  " ",
                  shipment.unit
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Eksportir" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-800", children: shipment.supplierName }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500", children: shipment.supplierCompany })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Importir" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-800", children: shipment.buyerName }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500", children: shipment.buyerCompany })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Pelabuhan Muat" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-800", children: shipment.portOfLoading })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Pelabuhan Bongkar" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-800", children: shipment.portOfDischarge })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Ketentuan Penyerahan" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-800", children: officialProposal.incoterm })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Metode Pembayaran" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-800", children: officialProposal.payment })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Harga Satuan (FOB)" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold text-slate-800", children: [
                  "$",
                  officialProposal.price,
                  " / Ton"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Total Nilai (FOB)" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold text-slate-800", children: [
                  "$",
                  (officialProposal.quantity * officialProposal.price).toLocaleString("en-US")
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 lg:col-span-4", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Catatan Tambahan" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-800 leading-relaxed", children: officialProposal.notes })
              ] })
            ] })
          ] })
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "relative z-10 py-3", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 relative", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute left-[16%] right-[16%] top-[14px] h-0.5 bg-slate-100 -z-10", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700",
          style: {
            width: subStage === "buyer-sending" ? "0%" : subStage === "negotiating" ? "50%" : "100%"
          }
        }
      ) }),
      [
        { id: "buyer-sending", label: "1. Kirim LOI", icon: FileText, desc: "Buyer mengirim minat" },
        { id: "negotiating", label: "2. Negosiasi", icon: MessageSquare, desc: "Bilateral chat & draf" },
        { id: "signed", label: "Selesai", icon: CheckCircle2, desc: "PI Disahkan" }
      ].map((st, idx) => {
        const isCompleted = subStage === "negotiating" && idx < 1 || subStage === "signed" && idx < 2 || subStage === "signed";
        const isActive = subStage === st.id;
        return /* @__PURE__ */ jsxs("div", { className: "text-center flex flex-col items-center", children: [
          /* @__PURE__ */ jsx("div", { className: `w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 border ${isCompleted ? "bg-emerald-600 border-emerald-500 text-white shadow-xs shadow-emerald-100" : isActive ? "bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-50 scale-105 shadow-xs shadow-indigo-100 font-bold" : "bg-slate-50 border-slate-200 text-slate-400"}`, children: isCompleted ? /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsx(st.icon, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: `text-[10px] sm:text-xs font-black uppercase tracking-tight mt-1.5 transition-colors ${isActive ? "text-indigo-600 font-extrabold" : isCompleted ? "text-emerald-600 font-bold" : "text-slate-400"}`, children: st.label }),
          /* @__PURE__ */ jsx("span", { className: "text-[9px] sm:text-[10px] text-slate-500 font-sans hidden sm:block mt-0.5 max-w-[130px] mx-auto leading-tight", children: st.desc })
        ] }, st.id);
      })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "relative z-10 pt-4", children: /* @__PURE__ */ jsx("div", { className: `w-full rounded-2xl p-5 sm:p-6 flex flex-col justify-between ${subStage === "buyer-sending" ? "bg-slate-900/60 border border-slate-800/80" : "bg-transparent"}`, children: /* @__PURE__ */ jsxs(AnimatePresence, { mode: "wait", children: [
      subStage === "buyer-sending" && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
          className: "space-y-4 text-left flex-1",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20", children: /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 animate-pulse" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "font-extrabold text-base tracking-tight text-white", children: "Langkah 1: Pengajuan Surat Minat Impor Resmi (Letter of Intent)" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-slate-400 font-mono mt-0.5", children: "Pengirim: EuroFoods Import GmbH \u2022 Penerima: PT Multi Raksa Madani" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start", children: [
              /* @__PURE__ */ jsx("div", { className: "lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed max-w-full overflow-x-auto shadow-inner h-full lg:min-h-[460px] flex flex-col justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "border-b border-slate-800 pb-3 mb-3 flex items-start justify-between text-slate-400 text-xs sm:text-sm", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "font-bold text-white uppercase text-xs tracking-wide", children: "EUROFOODS IMPORT GMBH" }),
                    /* @__PURE__ */ jsx("p", { children: "Hafenstrasse 12, 20457 Hamburg, Germany" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                    /* @__PURE__ */ jsx("p", { children: "DOKUMEN: LETTER OF INTENT (LOI)" }),
                    /* @__PURE__ */ jsx("p", { children: "TANGGAL: 24 JUNI 2026" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "font-black text-white text-center text-xs tracking-wider uppercase py-2", children: "SURAT MINAT PEMBELIAN RESMI (LETTER OF INTENT)" }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2 mt-2", children: [
                  /* @__PURE__ */ jsxs("p", { children: [
                    "Kepada Yth,",
                    /* @__PURE__ */ jsx("br", {}),
                    /* @__PURE__ */ jsx("strong", { children: "PT Multi Raksa Madani (Direksi Komersial Ekspor)" }),
                    /* @__PURE__ */ jsx("br", {}),
                    "Jakarta, Indonesia"
                  ] }),
                  /* @__PURE__ */ jsx("p", { children: "Dengan surat ini, kami menyatakan ketertarikan resmi (Letter of Intent) untuk mengimpor komoditas perkebunan premium bernilai tinggi dari Indonesia dengan rincian draf niaga awal sebagai berikut:" }),
                  /* @__PURE__ */ jsx("table", { className: "w-full border-t border-b border-slate-800 py-1.5 my-3 text-left", children: /* @__PURE__ */ jsxs("tbody", { children: [
                    /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "py-1 text-slate-400 font-bold w-1/3", children: "Komoditas:" }),
                      /* @__PURE__ */ jsx("td", { className: "py-1 text-indigo-400 font-extrabold", children: shipment.productName || "Biji Kopi Gayo Organik Arabika (Green Beans)" })
                    ] }),
                    /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "py-1 text-slate-400 font-bold", children: "Volume Target:" }),
                      /* @__PURE__ */ jsxs("td", { className: "py-1 text-white font-extrabold", children: [
                        negotiatedQty,
                        " Metrik Ton (MT)"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "py-1 text-slate-400 font-bold", children: "Harga Target:" }),
                      /* @__PURE__ */ jsxs("td", { className: "py-1 text-white font-extrabold", children: [
                        "$",
                        negotiatedPrice,
                        " USD / Ton (Perkiraan Nilai Kontrak: $",
                        (negotiatedQty * negotiatedPrice).toLocaleString("en-US"),
                        " USD)"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "py-1 text-slate-400 font-bold", children: "Ketentuan Kirim:" }),
                      /* @__PURE__ */ jsx("td", { className: "py-1 text-slate-300", children: selectedIncoterm })
                    ] }),
                    /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "py-1 text-slate-400 font-bold", children: "Ketentuan Bayar:" }),
                      /* @__PURE__ */ jsx("td", { className: "py-1 text-slate-300", children: selectedPayment })
                    ] })
                  ] }) }),
                  /* @__PURE__ */ jsx("p", { children: "Kami sangat menantikan tanggapan resmi berupa lembar penawaran harga (Quotation Sheet) dan draf Proforma Invoice untuk divalidasi dan ditandatangani bilateral." })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 flex flex-col gap-4", children: [
                activeSimulatedRole !== "Buyer" && /* @__PURE__ */ jsxs("div", { className: "bg-amber-950/40 border border-amber-900/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-300 leading-normal w-full", children: [
                  /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 shrink-0 text-amber-500 mt-0.5 animate-pulse" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Aksi ini hanya dapat dilakukan oleh peran ",
                    /* @__PURE__ */ jsx("strong", { children: "Buyer (Jerman)" }),
                    "."
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("span", { className: "text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsx(Paperclip, { className: "w-3.5 h-3.5 text-indigo-400" }),
                      "Lampiran Dokumen Pendukung LOI (Opsional, Maks 2 MB)"
                    ] }),
                    attachedFile && /* @__PURE__ */ jsx("span", { className: "text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold", children: "Siap Kirim" })
                  ] }),
                  activeSimulatedRole === "Buyer" ? /* @__PURE__ */ jsx(
                    "div",
                    {
                      onDragOver: (e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      },
                      onDragLeave: () => setIsDragging(false),
                      onDrop: (e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileDropOrSelect(file);
                      },
                      className: `border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex flex-col justify-center min-h-[110px] ${isDragging ? "border-indigo-500 bg-indigo-950/10" : attachedFile ? "border-emerald-500/50 bg-emerald-950/5" : "border-slate-800 hover:border-slate-750 bg-slate-950/30"}`,
                      onClick: () => {
                        if (attachedFile) return;
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg";
                        input.onchange = (e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileDropOrSelect(file);
                        };
                        input.click();
                      },
                      children: !attachedFile ? /* @__PURE__ */ jsxs("div", { className: "space-y-1 py-2", children: [
                        /* @__PURE__ */ jsx(Upload, { className: "w-5 h-5 mx-auto text-slate-400 animate-bounce" }),
                        /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold text-slate-200", children: [
                          "Seret & letakkan file di sini, atau ",
                          /* @__PURE__ */ jsx("span", { className: "text-indigo-400 underline", children: "pilih file" })
                        ] }),
                        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "Format yang didukung: PDF, Word, atau Gambar (Maks. 2 MB)" })
                      ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 w-full animate-fade-in", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 text-left min-w-0", children: [
                          /* @__PURE__ */ jsx("div", { className: "p-1.5 bg-emerald-500/15 text-emerald-400 rounded", children: /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }) }),
                          /* @__PURE__ */ jsxs("div", { className: "truncate", children: [
                            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[200px]", children: attachedFile.name }),
                            /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-300 font-mono", children: [
                              (attachedFile.size / 1024).toFixed(1),
                              " KB"
                            ] })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "button",
                            onClick: (e) => {
                              e.stopPropagation();
                              setAttachedFile(null);
                              setUploadError(null);
                            },
                            className: "p-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer",
                            children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
                          }
                        )
                      ] })
                    }
                  ) : /* @__PURE__ */ jsx("div", { className: "border border-dashed border-slate-800 rounded-xl py-6 px-4 text-center bg-slate-950/10 text-slate-500 text-xs flex items-center justify-center", children: attachedFile ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 w-full", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 text-left", children: [
                      /* @__PURE__ */ jsx(Paperclip, { className: "w-4 h-4 text-slate-400" }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-300", children: attachedFile.name }),
                        /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-400", children: [
                          (attachedFile.size / 1024).toFixed(1),
                          " KB"
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      attachedFile.url && /* @__PURE__ */ jsxs(
                        "a",
                        {
                          href: attachedFile.url,
                          download: attachedFile.name,
                          className: "px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded flex items-center gap-1 transition-colors cursor-pointer",
                          children: [
                            /* @__PURE__ */ jsx(Download, { className: "w-3 h-3" }),
                            " Unduh"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: "text-xs text-emerald-400 font-bold", children: "Terlampir" })
                    ] })
                  ] }) : "Belum ada dokumen pendukung terlampir" }),
                  uploadError && /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-rose-400 font-semibold bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-lg flex items-start gap-1.5 animate-pulse", children: [
                    /* @__PURE__ */ jsx(AlertCircle, { className: "w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-500" }),
                    /* @__PURE__ */ jsx("span", { children: uploadError })
                  ] })
                ] }),
                activeSimulatedRole === "Buyer" && /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-800/80", children: /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: handleSendLoi,
                    className: "w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-950/50 hover:-translate-y-0.5",
                    children: [
                      /* @__PURE__ */ jsx("span", { children: "Kirim LOI Resmi ke Eksportir" }),
                      /* @__PURE__ */ jsx(Send, { className: "w-3.5 h-3.5" })
                    ]
                  }
                ) })
              ] })
            ] })
          ]
        },
        "buyer-sending"
      ),
      subStage === "negotiating" && /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
          className: "space-y-6 text-left flex-1",
          children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start", children: [
            /* @__PURE__ */ jsxs("div", { className: "lg:col-span-7 space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-xs space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-slate-200 pb-2", children: [
                  /* @__PURE__ */ jsxs("h4", { className: "text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(Sliders, { className: "w-3.5 h-3.5 text-indigo-500" }),
                    "WORKSPACE USULAN DRAF KOMERSIAL (",
                    activeSimulatedRole,
                    ")"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-slate-400 font-mono", children: [
                    "Live Editor \u2022 ",
                    activeSimulatedRole === "Buyer" ? "EuroFoods GmbH" : "PT Multi Raksa Madani"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "space-y-0.5 relative pb-4", children: [
                    /* @__PURE__ */ jsxs("label", { className: "text-xs font-bold text-slate-600 flex justify-between items-center", children: [
                      /* @__PURE__ */ jsxs("span", { children: [
                        t.volumeCargo,
                        ":"
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 font-mono text-indigo-600", children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "number",
                            min: "1",
                            max: "10000",
                            value: negotiatedQty,
                            onChange: (e) => {
                              setNegotiatedQty(Number(e.target.value));
                            },
                            onBlur: () => {
                              let val = negotiatedQty;
                              if (val < 1) val = 1;
                              if (val > 1e4) val = 1e4;
                              setNegotiatedQty(val);
                              handleSubmitCounterOffer({ quantity: val });
                            },
                            onKeyDown: (e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                            },
                            className: "w-14 bg-slate-100 hover:bg-slate-200 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 text-right font-black text-indigo-700 text-xs focus:outline-none transition-all"
                          }
                        ),
                        /* @__PURE__ */ jsx("span", { className: "text-xs font-bold", children: "MT" })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "range",
                        min: "10",
                        max: "300",
                        value: negotiatedQty > 300 ? 300 : negotiatedQty,
                        onChange: (e) => {
                          setNegotiatedQty(Number(e.target.value));
                        },
                        onMouseUp: () => handleSubmitCounterOffer(),
                        onTouchEnd: () => handleSubmitCounterOffer(),
                        className: "w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      }
                    ),
                    /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-slate-500 absolute bottom-0 left-0 font-medium", children: [
                      "Permintaan Awal: ",
                      shipment.quantity || 20,
                      " MT"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-0.5 relative pb-4", children: [
                    /* @__PURE__ */ jsxs("label", { className: "text-xs font-bold text-slate-600 flex justify-between items-center", children: [
                      /* @__PURE__ */ jsxs("span", { children: [
                        t.unitPrice,
                        ":"
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 font-mono text-emerald-600", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-xs font-bold", children: "$" }),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "number",
                            min: "100",
                            max: "50000",
                            value: negotiatedPrice,
                            onChange: (e) => {
                              setNegotiatedPrice(Number(e.target.value));
                            },
                            onBlur: () => {
                              let val = negotiatedPrice;
                              if (val < 100) val = 100;
                              if (val > 5e4) val = 5e4;
                              setNegotiatedPrice(val);
                              handleSubmitCounterOffer({ price: val });
                            },
                            onKeyDown: (e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                            },
                            className: "w-16 bg-slate-100 hover:bg-slate-200 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded px-1.5 py-0.5 text-right font-black text-emerald-700 text-xs focus:outline-none transition-all"
                          }
                        ),
                        /* @__PURE__ */ jsx("span", { className: "text-xs font-bold", children: "USD" })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "range",
                        min: "1000",
                        max: "2500",
                        value: negotiatedPrice > 2500 ? 2500 : negotiatedPrice < 1e3 ? 1e3 : negotiatedPrice,
                        onChange: (e) => {
                          setNegotiatedPrice(Number(e.target.value));
                        },
                        onMouseUp: () => handleSubmitCounterOffer(),
                        onTouchEnd: () => handleSubmitCounterOffer(),
                        className: "w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      }
                    ),
                    /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-500 absolute bottom-0 left-0 font-medium", children: "Permintaan Awal: $1450 / Ton" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
                    /* @__PURE__ */ jsxs("label", { className: "text-xs font-bold text-slate-600 block", children: [
                      t.deliveryTerms,
                      ":"
                    ] }),
                    /* @__PURE__ */ jsxs(
                      "select",
                      {
                        value: selectedIncoterm,
                        onChange: (e) => {
                          setSelectedIncoterm(e.target.value);
                          handleSubmitCounterOffer({ incoterm: e.target.value });
                        },
                        className: "w-full bg-white border border-slate-250 text-xs text-slate-800 rounded-lg p-1.5 focus:outline-none focus:border-indigo-500",
                        children: [
                          /* @__PURE__ */ jsx("option", { value: "FOB Belawan Port (Incoterms 2020)", children: "FOB Belawan Port, Sumatra (Incoterms 2020)" }),
                          /* @__PURE__ */ jsx("option", { value: "CIF Hamburg Port (Incoterms 2020)", children: "CIF Hamburg Port, Germany (Incoterms 2020)" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-500 font-medium mt-0.5 mb-1 block", children: "Permintaan Awal: FOB Belawan Port (Incoterms 2020)" }),
                    (currentUser?.role === "Trader" || currentUser?.role === "Superadmin") && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 italic mt-1 leading-tight", children: selectedIncoterm.includes("FOB") ? "FOB (Free on Board): Penjual (Eksportir) hanya bertanggung jawab sampai barang naik ke kapal. Biaya asuransi dan pengiriman laut (freight) ditanggung pembeli." : "CIF (Cost, Insurance, and Freight): Penjual (Eksportir) menanggung biaya barang, asuransi, dan pengiriman laut sampai pelabuhan tujuan." })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
                    /* @__PURE__ */ jsxs("label", { className: "text-xs font-bold text-slate-600 block", children: [
                      t.paymentMethod,
                      ":"
                    ] }),
                    /* @__PURE__ */ jsxs(
                      "select",
                      {
                        value: selectedPayment,
                        onChange: (e) => {
                          setSelectedPayment(e.target.value);
                          handleSubmitCounterOffer({ payment: e.target.value });
                        },
                        className: "w-full bg-white border border-slate-250 text-xs text-slate-800 rounded-lg p-1.5 focus:outline-none focus:border-indigo-500",
                        children: [
                          /* @__PURE__ */ jsx("option", { value: "Letter of Credit (L/C) at Sight", children: "Irrevocable Letter of Credit (L/C) at Sight" }),
                          /* @__PURE__ */ jsx("option", { value: "30% Down Payment, 70% L/C Sight", children: "30% Down Payment, 70% L/C" }),
                          /* @__PURE__ */ jsx("option", { value: "Telegraphic Transfer (T/T) 100%", children: "Telegraphic Transfer (T/T) 100%" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-500 font-medium mt-0.5 mb-1 block", children: "Permintaan Awal: Letter of Credit (L/C) at Sight" }),
                    (currentUser?.role === "Trader" || currentUser?.role === "Superadmin") && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 italic mt-1 leading-tight", children: selectedPayment.includes("Letter of Credit") || selectedPayment === "Letter of Credit (L/C) at Sight" ? "L/C at Sight: Bank importir menjamin pembayaran ke eksportir segera setelah menyerahkan dokumen pengiriman yang valid." : selectedPayment.includes("30% Down Payment") ? "30% DP, 70% L/C: Pembeli membayar deposit tunai 30% di awal (untuk modal produksi), sisanya 70% dijamin dengan L/C." : "T/T 100%: Pembayaran tunai transfer bank 100%. Risiko tinggi bagi pembeli jika barang belum dikirim." })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col py-2 px-3 bg-slate-100/50 rounded-lg border border-slate-200 mt-2 mb-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-700", children: "Estimasi Total Nilai (FOB):" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-sm font-black text-emerald-700 font-mono tracking-tight", children: [
                      "$",
                      (negotiatedQty * negotiatedPrice).toLocaleString("en-US"),
                      " USD"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-slate-500 font-medium mt-1", children: [
                    "Permintaan Awal: $",
                    ((shipment.quantity || 20) * 1450).toLocaleString("en-US"),
                    " USD"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-0.5 pt-1 relative pb-6", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-600 block", children: "Catatan / Spesifikasi Teknis Tambahan:" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      rows: 2,
                      value: negotiationNotes,
                      onChange: (e) => {
                        setNegotiationNotes(e.target.value);
                        handleSubmitCounterOffer({ notes: e.target.value });
                      },
                      placeholder: "Spesifikasi kopi Gayo premium, kadar air maks 12%...",
                      className: "w-full bg-white border border-slate-250 text-xs text-slate-800 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 font-sans leading-normal"
                    }
                  ),
                  /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-500 absolute bottom-0 left-0 font-medium leading-tight", children: "Permintaan Awal: Kadar air biji kopi tervalidasi maksimal 12%, pengemasan menggunakan karung goni berlapis GrainPro." })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "w-full bg-white text-slate-900 border border-slate-250 rounded-xl p-4 font-mono text-[10px] sm:text-[11px] leading-relaxed relative shadow-md", children: [
                /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono", children: "DRAFT PI" }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start border-b border-slate-200 pb-2 mb-2 text-[9px] text-slate-500", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "font-extrabold text-slate-900 text-[10px] tracking-wide", children: "PT MULTI RAKSA MADANI" }),
                    /* @__PURE__ */ jsx("p", { children: "Komp. Ruko Harmoni Mas, Jakarta, Indonesia" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-right font-bold", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-slate-900 text-[10px]", children: "PROFORMA INVOICE (PI)" }),
                    /* @__PURE__ */ jsx("p", { children: "NOMOR: PI/MRM-DEUTSCH/2026/419" }),
                    /* @__PURE__ */ jsx("p", { children: "TANGGAL: 25 JUNI 2026" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-center font-black text-slate-950 text-xs tracking-wider border-b border-slate-100 py-0.5 mb-2", children: "DRAFT PROFORMA INVOICE / EKSPOR KOPI" }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 text-[9px] mb-2 leading-tight", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-400 uppercase tracking-wider block text-[8px] font-bold", children: "IMPORTIR (BUYER):" }),
                    /* @__PURE__ */ jsx("strong", { className: "text-slate-900", children: shipment.buyerCompany || "EuroFoods Import GmbH" }),
                    /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "Hafenstrasse 12, Hamburg, Germany" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-400 uppercase tracking-wider block text-[8px] font-bold", children: "EKSPORTIR (SELLER):" }),
                    /* @__PURE__ */ jsx("strong", { className: "text-slate-900", children: "PT Multi Raksa Madani" }),
                    /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "Komp. Ruko Harmoni Mas, Jakarta, Indonesia" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("table", { className: "w-full border-t border-b border-slate-200 text-left mb-2 text-[10px]", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-slate-50 text-slate-500 font-bold border-b border-slate-200", children: [
                    /* @__PURE__ */ jsx("th", { className: "py-0.5 px-1", children: "Komoditas & Spesifikasi" }),
                    /* @__PURE__ */ jsx("th", { className: "py-0.5 px-1 text-right", children: "Volume" }),
                    /* @__PURE__ */ jsx("th", { className: "py-0.5 px-1 text-right", children: "Harga" }),
                    /* @__PURE__ */ jsx("th", { className: "py-0.5 px-1 text-right", children: "Subtotal" })
                  ] }) }),
                  /* @__PURE__ */ jsx("tbody", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-100", children: [
                    /* @__PURE__ */ jsxs("td", { className: "py-0.5 px-1 leading-tight", children: [
                      /* @__PURE__ */ jsx("strong", { className: "text-slate-950", children: shipment.productName || "Biji Kopi Gayo Organik" }),
                      /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-400", children: "Premium Arabika, Moisture Max 12%" })
                    ] }),
                    /* @__PURE__ */ jsxs("td", { className: "py-0.5 px-1 text-right font-bold", children: [
                      negotiatedQty,
                      " MT"
                    ] }),
                    /* @__PURE__ */ jsxs("td", { className: "py-0.5 px-1 text-right font-bold", children: [
                      "$",
                      negotiatedPrice
                    ] }),
                    /* @__PURE__ */ jsxs("td", { className: "py-0.5 px-1 text-right font-extrabold text-slate-950", children: [
                      "$",
                      (negotiatedQty * negotiatedPrice).toLocaleString("en-US"),
                      " USD"
                    ] })
                  ] }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-1 text-[10px] text-slate-600 border-b border-slate-100 pb-1.5 mb-1.5", children: [
                  /* @__PURE__ */ jsxs("p", { children: [
                    /* @__PURE__ */ jsx("strong", { children: "Ketentuan Kirim:" }),
                    " ",
                    selectedIncoterm.split(" ")[0]
                  ] }),
                  /* @__PURE__ */ jsxs("p", { children: [
                    /* @__PURE__ */ jsx("strong", { children: "Ketentuan Bayar:" }),
                    " ",
                    selectedPayment.split(" ")[0]
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 pt-1 border-t border-slate-100", children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-center flex flex-col items-center", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[8px] text-slate-400 uppercase font-bold", children: "Buyer Jerman:" }),
                    /* @__PURE__ */ jsx("div", { className: "w-full h-8 border border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 relative mt-0.5", children: buyerSigned ? /* @__PURE__ */ jsx("span", { className: "font-serif italic text-sm text-blue-700 font-bold tracking-tighter select-none rotate-2", children: "Hans Mueller" }) : /* @__PURE__ */ jsx("span", { className: "text-slate-400 text-[9px] animate-pulse", children: "Belum TTD" }) }),
                    /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-600 mt-0.5 font-bold", children: "EuroFoods Import GmbH" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-center flex flex-col items-center", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[8px] text-slate-400 uppercase font-bold", children: "Eksportir Indo:" }),
                    /* @__PURE__ */ jsx("div", { className: "w-full h-8 border border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 relative mt-0.5", children: traderSigned ? /* @__PURE__ */ jsx("span", { className: "font-serif italic text-sm text-indigo-700 font-bold tracking-tighter select-none -rotate-2", children: "Hendry Kurniawan" }) : /* @__PURE__ */ jsx("span", { className: "text-slate-400 text-[9px] animate-pulse", children: "Belum TTD" }) }),
                    /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-600 mt-0.5 font-bold", children: "PT Multi Raksa Madani" })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "lg:col-span-5 space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-xs space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-xs border-b border-slate-200 pb-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "font-extrabold text-slate-700 uppercase tracking-wider text-[10px] sm:text-xs", children: "Persetujuan Bilateral:" }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
                  /* @__PURE__ */ jsxs("span", { className: `px-1.5 py-0.5 rounded text-[10px] font-bold ${officialProposal.buyerAgreed ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"}`, children: [
                    "BUYER: ",
                    officialProposal.buyerAgreed ? "SEPAKAT" : "BELUM"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: `px-1.5 py-0.5 rounded text-[10px] font-bold ${officialProposal.traderAgreed ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"}`, children: [
                    "TRADER: ",
                    officialProposal.traderAgreed ? "SEPAKAT" : "BELUM"
                  ] })
                ] })
              ] }),
              !officialProposal.buyerAgreed || !officialProposal.traderAgreed ? /* @__PURE__ */ jsxs("div", { className: "p-3 bg-indigo-50 border border-indigo-100 rounded-lg space-y-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-indigo-700 leading-normal font-sans font-medium", children: "Silakan setujui draf komersial saat ini agar lembar tanda tangan Proforma Invoice dapat dibuka." }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: handleAcceptProposal,
                      className: "flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] uppercase rounded-lg transition-all cursor-pointer shadow-xs shadow-emerald-100",
                      children: "Sepakati Draf"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: handleRejectProposal,
                      className: "px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] uppercase rounded-lg border border-rose-200 transition-colors cursor-pointer",
                      children: "Tolak"
                    }
                  )
                ] })
              ] }) : (
                /* Signing buttons */
                /* @__PURE__ */ jsx("div", { className: "space-y-2", children: !buyerSigned || !traderSigned ? /* @__PURE__ */ jsxs("div", { className: "p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-emerald-800 leading-normal font-sans font-medium", children: "\u2713 Draf telah disepakati bilateral! Silakan bubuhkan tanda tangan di bawah sesuai peran aktif Anda." }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
                    activeSimulatedRole === "Buyer" && !buyerSigned && /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: handleSignAsBuyer,
                        className: "w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs shadow-blue-100",
                        children: [
                          /* @__PURE__ */ jsx(PenTool, { className: "w-3 h-3" }),
                          /* @__PURE__ */ jsx("span", { children: "Tanda Tangani sebagai Buyer" })
                        ]
                      }
                    ),
                    activeSimulatedRole === "Trader" && !traderSigned && /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: handleSignAsTrader,
                        className: "w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs shadow-indigo-100",
                        children: [
                          /* @__PURE__ */ jsx(PenTool, { className: "w-3 h-3" }),
                          /* @__PURE__ */ jsx("span", { children: "Tanda Tangani sebagai Trader" })
                        ]
                      }
                    ),
                    activeSimulatedRole === "Trader" && !buyerSigned && /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-slate-500 text-center leading-normal py-1 bg-white border border-slate-100 rounded p-1.5 font-medium", children: [
                      "Menunggu Tanda Tangan Buyer. Ubah peran ke ",
                      /* @__PURE__ */ jsx("strong", { children: "\u{1F1E9}\u{1F1EA} Importir" }),
                      "."
                    ] }),
                    activeSimulatedRole === "Buyer" && !traderSigned && /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-slate-500 text-center leading-normal py-1 bg-white border border-slate-100 rounded p-1.5 font-medium", children: [
                      "Menunggu Tanda Tangan Trader. Ubah peran ke ",
                      /* @__PURE__ */ jsx("strong", { children: "\u{1F1EE}\u{1F1E9} Eksportir" }),
                      "."
                    ] })
                  ] })
                ] }) : /* @__PURE__ */ jsxs("div", { className: "p-3 bg-emerald-600 text-white rounded-lg shadow-md shadow-emerald-100 border border-emerald-500 space-y-2 text-center", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-[11px] font-black leading-tight uppercase flex items-center justify-center gap-1", children: [
                    /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5 text-white shrink-0 animate-bounce" }),
                    "Proforma Invoice Disahkan!"
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[10px] opacity-90 leading-normal font-sans", children: [
                    "Kontrak kopi senilai $",
                    (negotiatedQty * negotiatedPrice).toLocaleString("en-US"),
                    " USD resmi dikunci bilateral."
                  ] }),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setSubStage("signed"),
                      className: "w-full mt-1 py-2 bg-white text-emerald-700 hover:bg-slate-50 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow shadow-emerald-700/20",
                      children: [
                        /* @__PURE__ */ jsx("span", { children: "Terbitkan Dokumen Kontrak" }),
                        /* @__PURE__ */ jsx(ArrowRight, { className: "w-3 h-3 animate-pulse" })
                      ]
                    }
                  )
                ] }) })
              ),
              /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-slate-400 font-mono border-t border-slate-150 pt-1.5 mt-2 flex justify-between items-center", children: [
                /* @__PURE__ */ jsx("span", { children: "Sistem Kontrak MRM Bilateral" }),
                /* @__PURE__ */ jsx("span", { children: "v1.2.0 \u2022 Secured" })
              ] })
            ] }) })
          ] })
        },
        "negotiating"
      ),
      subStage === "signed" && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
          className: "space-y-6 text-center w-full py-2 flex-1 flex flex-col justify-start",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-1 w-full max-w-md mx-auto", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setActiveArchiveTab("summary"),
                  className: `flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeArchiveTab === "summary" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900"}`,
                  children: "Ringkasan Kontrak"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setActiveArchiveTab("loi"),
                  className: `flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeArchiveTab === "loi" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900"}`,
                  children: "Surat Minat (LOI)"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setActiveArchiveTab("pi"),
                  className: `flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeArchiveTab === "pi" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900"}`,
                  children: "Proforma Invoice (PI)"
                }
              )
            ] }),
            printBlockedError && /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 rounded-xl text-xs font-medium flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg border border-amber-500 mb-4 animate-fadeIn text-left max-w-2xl mx-auto w-full leading-relaxed", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm mt-0.5", children: "\u26A0\uFE0F" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "Pemberitahuan Sistem Sandbox:" }),
                  " Browser memblokir printer popup karena sandbox keamanan AI Studio.",
                  /* @__PURE__ */ jsx("div", { className: "mt-1 text-slate-100 font-bold", children: '\u{1F4A1} SOLUSI: Klik tombol abu-abu "Unduh HTML" di kanan, file yang terunduh akan otomatis memicu dialog cetak PDF asli yang sangat rapi saat dibuka di komputer Anda! Atau klik "Buka Tab Baru" untuk cetak langsung.' })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: window.location.href,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "bg-white text-amber-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all shadow-sm shrink-0 flex items-center gap-1",
                    children: /* @__PURE__ */ jsx("span", { children: "Tab Baru \u2197\uFE0F" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setPrintBlockedError(false),
                    className: "p-1 hover:bg-amber-800 rounded text-center text-white cursor-pointer",
                    title: "Tutup pesan",
                    children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4 text-white" })
                  }
                )
              ] })
            ] }),
            activeArchiveTab === "summary" && /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-lg mx-auto py-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-lg shadow-emerald-100 animate-bounce", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-9 h-9 text-emerald-600" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900", children: "Fase I Berhasil Diselesaikan!" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600 mt-2 leading-relaxed", children: "Surat Minat Impor (LOI) telah berhasil ditinjau, dinegosiasikan, dan draf Proforma Invoice telah ditandatangani secara bilateral oleh kedua belah pihak secara legal." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200 p-6 rounded-2xl text-left text-sm text-slate-800 space-y-3 shadow-sm", children: [
                /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-250 pb-2 mb-2", children: "Kesimpulan Kontrak Perdagangan" }),
                /* @__PURE__ */ jsxs("p", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-semibold", children: "\u2022 Komoditas:" }),
                  /* @__PURE__ */ jsx("strong", { className: "text-slate-900 font-black", children: shipment.productName })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-semibold", children: "\u2022 Volume Akhir:" }),
                  /* @__PURE__ */ jsxs("strong", { className: "text-slate-900 font-black", children: [
                    negotiatedQty,
                    " Metric Tons"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-semibold", children: "\u2022 Tarif Kesepakatan:" }),
                  /* @__PURE__ */ jsxs("strong", { className: "text-slate-900 font-black", children: [
                    "$",
                    negotiatedPrice,
                    " USD/Ton"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "flex justify-between border-t border-slate-200 pt-2.5 mt-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-semibold", children: "\u2022 Total Nilai Deal:" }),
                  /* @__PURE__ */ jsxs("strong", { className: "text-emerald-700 font-black text-base", children: [
                    "$",
                    (negotiatedQty * negotiatedPrice).toLocaleString("en-US"),
                    " USD"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-semibold", children: "\u2022 Incoterms / Bayar:" }),
                  /* @__PURE__ */ jsxs("strong", { className: "text-slate-900 font-bold", children: [
                    selectedIncoterm,
                    " / ",
                    selectedPayment
                  ] })
                ] })
              ] }),
              !(isArchiveMode || shipment.currentStep !== "Draft") && /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3 pt-2", children: activeSimulatedRole === "Trader" ? /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleTransitionToLogistics,
                  className: "w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95",
                  children: [
                    /* @__PURE__ */ jsx("span", { children: "Luncurkan Alur Logistik Ekspor" }),
                    /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 animate-bounce-right" })
                  ]
                }
              ) : /* @__PURE__ */ jsxs(
                "button",
                {
                  disabled: true,
                  className: "w-full sm:w-auto px-8 py-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-65 border border-slate-200",
                  title: "Hanya Trader / Superadmin (Eksportir) yang memiliki hak wewenang untuk meluncurkan alur logistik ekspor.",
                  children: [
                    /* @__PURE__ */ jsx("span", { children: "Luncurkan Alur Logistik Ekspor" }),
                    /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 text-rose-500" })
                  ]
                }
              ) })
            ] }),
            activeArchiveTab === "loi" && /* @__PURE__ */ jsxs("div", { className: "text-left py-2 max-w-2xl mx-auto w-full space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-700 uppercase tracking-wider", children: "Arsip Dokumen LOI" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => handleDownload("loi"),
                    className: "px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm",
                    title: "Unduh draf asli format HTML mandiri",
                    children: [
                      /* @__PURE__ */ jsx(Download, { className: "w-3 h-3" }),
                      /* @__PURE__ */ jsx("span", { children: "Unduh HTML" })
                    ]
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-150 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "p-3 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100 shrink-0", children: /* @__PURE__ */ jsx(Paperclip, { className: "w-5 h-5" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h4", { className: "font-extrabold text-sm text-slate-900", children: "Lampiran Dokumen LOI Asli dari Buyer" }),
                    attachedFile ? /* @__PURE__ */ jsxs("div", { className: "mt-1", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-700", children: attachedFile.name }),
                      /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500 font-mono ml-2", children: [
                        "(",
                        (attachedFile.size / 1024).toFixed(1),
                        " KB)"
                      ] })
                    ] }) : /* @__PURE__ */ jsxs("div", { className: "mt-1", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-700", children: "LOI_EuroFoods_Germany_Gayo_Green_Beans.pdf" }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-mono ml-2", children: "(421.5 KB)" })
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-indigo-700 font-medium mt-0.5", children: "Dokumen ini dilampirkan langsung oleh EuroFoods Import GmbH dan terkunci secara permanen di sistem." })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "shrink-0 flex items-center gap-2", children: [
                  attachedFile && attachedFile.url ? /* @__PURE__ */ jsxs(
                    "a",
                    {
                      href: attachedFile.url,
                      download: attachedFile.name,
                      className: "w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow active:scale-95",
                      children: [
                        /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" }),
                        " Unduh Lampiran"
                      ]
                    }
                  ) : /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => {
                        const text = `EUROFOODS IMPORT GMBH
Hafenstrasse 12, 20457 Hamburg, Germany

OFFICIAL LETTER OF INTENT (LOI)

Commodity: ${shipment.productName || "Biji Kopi Gayo Organik Arabika (Green Beans)"}
Target Quantity: ${negotiatedQty} Metric Tons
Target Price: $${negotiatedPrice} USD / MT

Signed off bilaterally. Verified & Authenticated under MRM Portal.`;
                        const blob = new Blob([text], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "LOI_EuroFoods_Germany_Gayo_Green_Beans.pdf";
                        a.click();
                        URL.revokeObjectURL(url);
                      },
                      className: "w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow active:scale-95",
                      children: [
                        /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" }),
                        " Unduh Lampiran"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "hidden sm:inline-flex text-[10px] text-emerald-600 font-extrabold bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg", children: "Terverifikasi" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { id: "commercial-loi-paper", className: "bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 font-mono text-xs text-slate-800 leading-relaxed max-w-full overflow-x-auto shadow-md space-y-5", children: [
                /* @__PURE__ */ jsxs("div", { className: "border-b border-slate-200 pb-4 mb-4 flex items-start justify-between text-slate-500 text-xs", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "font-extrabold text-slate-900 uppercase text-sm tracking-wide", children: "EUROFOODS IMPORT GMBH" }),
                    /* @__PURE__ */ jsx("p", { children: "Hafenstrasse 12, 20457 Hamburg, Germany" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-bold text-slate-900", children: "DOKUMEN: LETTER OF INTENT (LOI)" }),
                    /* @__PURE__ */ jsx("p", { children: "TANGGAL: 24 JUNI 2026" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "font-black text-slate-950 text-center text-sm tracking-wider uppercase py-2 border-b border-slate-100", children: "SURAT MINAT PEMBELIAN RESMI (LETTER OF INTENT)" }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-3 mt-2 text-xs text-slate-700", children: [
                  /* @__PURE__ */ jsxs("p", { children: [
                    "Kepada Yth,",
                    /* @__PURE__ */ jsx("br", {}),
                    /* @__PURE__ */ jsx("strong", { children: "PT Multi Raksa Madani (Direksi Komersial Ekspor)" }),
                    /* @__PURE__ */ jsx("br", {}),
                    "Jakarta, Indonesia"
                  ] }),
                  /* @__PURE__ */ jsx("p", { children: "Dengan surat ini, kami menyatakan ketertarikan resmi (Letter of Intent) untuk mengimpor komoditas perkebunan premium bernilai tinggi dari Indonesia dengan rincian draf niaga awal sebagai berikut:" }),
                  /* @__PURE__ */ jsx("table", { className: "w-full border-t border-b border-slate-200 py-2 my-4 text-left", children: /* @__PURE__ */ jsxs("tbody", { children: [
                    /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "py-2 text-slate-500 font-bold w-1/3", children: "Komoditas:" }),
                      /* @__PURE__ */ jsx("td", { className: "py-2 text-indigo-700 font-extrabold text-sm", children: shipment.productName || "Biji Kopi Gayo Organik Arabika (Green Beans)" })
                    ] }),
                    /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "py-2 text-slate-500 font-bold", children: "Volume Target:" }),
                      /* @__PURE__ */ jsxs("td", { className: "py-2 text-slate-900 font-extrabold text-sm", children: [
                        negotiatedQty,
                        " Metrik Ton (MT)"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "py-2 text-slate-500 font-bold", children: "Harga Target:" }),
                      /* @__PURE__ */ jsxs("td", { className: "py-2 text-slate-900 font-extrabold text-sm", children: [
                        "$",
                        negotiatedPrice,
                        " USD / Ton (Perkiraan Nilai Kontrak: $",
                        (negotiatedQty * negotiatedPrice).toLocaleString("en-US"),
                        " USD)"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "py-2 text-slate-500 font-bold", children: "Ketentuan Kirim:" }),
                      /* @__PURE__ */ jsx("td", { className: "py-2 text-slate-800 font-semibold", children: selectedIncoterm })
                    ] }),
                    /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "py-2 text-slate-500 font-bold", children: "Ketentuan Bayar:" }),
                      /* @__PURE__ */ jsx("td", { className: "py-2 text-slate-800 font-semibold", children: selectedPayment })
                    ] })
                  ] }) }),
                  /* @__PURE__ */ jsx("p", { className: "leading-relaxed", children: "Kami sangat menantikan tanggapan resmi berupa lembar penawaran harga (Quotation Sheet) dan draf Proforma Invoice untuk divalidasi dan ditandatangani bilateral." })
                ] })
              ] })
            ] }),
            activeArchiveTab === "pi" && /* @__PURE__ */ jsxs("div", { className: "text-left py-2 max-w-2xl mx-auto w-full space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-700 uppercase tracking-wider", children: "Arsip Dokumen PI" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => handleDownload("pi"),
                    className: "px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm",
                    title: "Unduh draf asli format HTML mandiri",
                    children: [
                      /* @__PURE__ */ jsx(Download, { className: "w-3 h-3" }),
                      /* @__PURE__ */ jsx("span", { children: "Unduh HTML" })
                    ]
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxs("div", { id: "commercial-pi-paper", className: "bg-white text-slate-900 border border-slate-200 rounded-2xl p-5 sm:p-6 font-mono text-xs leading-relaxed relative shadow-lg overflow-x-auto", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start border-b border-slate-200 pb-3 mb-3 text-xs text-slate-500", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "font-extrabold text-slate-900 text-sm tracking-wide", children: "PT MULTI RAKSA MADANI" }),
                    /* @__PURE__ */ jsx("p", { children: "Komp. Ruko Harmoni Mas, Jakarta, Indonesia" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-extrabold text-slate-900 text-sm", children: "PROFORMA INVOICE (PI)" }),
                    /* @__PURE__ */ jsx("p", { children: "NOMOR: PI/MRM-DEUTSCH/2026/419" }),
                    /* @__PURE__ */ jsx("p", { children: "TANGGAL: 25 JUNI 2026" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-center font-black text-slate-950 text-sm tracking-wider border-b border-slate-100 py-1 mb-3 uppercase", children: "PROFORMA INVOICE FINAL / EKSPOR KOMODITAS" }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-xs mb-4", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-400 uppercase tracking-wider block font-bold text-[11px]", children: "IMPORTIR (BUYER):" }),
                    /* @__PURE__ */ jsx("strong", { className: "text-slate-900", children: shipment.buyerCompany || "EuroFoods Import GmbH" }),
                    /* @__PURE__ */ jsx("p", { className: "text-slate-600", children: "Hafenstrasse 12, Hamburg, Germany" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-400 uppercase tracking-wider block font-bold text-[11px]", children: "EKSPORTIR (SELLER):" }),
                    /* @__PURE__ */ jsx("strong", { className: "text-slate-900", children: "PT Multi Raksa Madani" }),
                    /* @__PURE__ */ jsx("p", { className: "text-slate-600", children: "Komp. Ruko Harmoni Mas, Jakarta, Indonesia" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("table", { className: "w-full border-t border-b border-slate-200 text-left mb-4 text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-slate-50 text-slate-550 font-extrabold border-b border-slate-200", children: [
                    /* @__PURE__ */ jsx("th", { className: "py-1.5 px-2", children: "Komoditas & Spesifikasi" }),
                    /* @__PURE__ */ jsx("th", { className: "py-1.5 px-2 text-right", children: "Volume" }),
                    /* @__PURE__ */ jsx("th", { className: "py-1.5 px-2 text-right", children: "Harga (USD)" }),
                    /* @__PURE__ */ jsx("th", { className: "py-1.5 px-2 text-right", children: "Subtotal" })
                  ] }) }),
                  /* @__PURE__ */ jsx("tbody", { children: /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsxs("td", { className: "py-1.5 px-2", children: [
                      /* @__PURE__ */ jsx("strong", { className: "text-slate-950", children: shipment.productName || "Biji Kopi Gayo Organik (Green Beans)" }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-450", children: "Premium Grade, Moisture Max 12%, Free of mold" })
                    ] }),
                    /* @__PURE__ */ jsxs("td", { className: "py-1.5 px-2 text-right", children: [
                      negotiatedQty,
                      " MT"
                    ] }),
                    /* @__PURE__ */ jsxs("td", { className: "py-1.5 px-2 text-right", children: [
                      "$",
                      negotiatedPrice
                    ] }),
                    /* @__PURE__ */ jsxs("td", { className: "py-1.5 px-2 text-right font-extrabold text-slate-950", children: [
                      "$",
                      (negotiatedQty * negotiatedPrice).toLocaleString("en-US"),
                      " USD"
                    ] })
                  ] }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-xs text-slate-600 border-b border-slate-100 pb-3 mb-3", children: [
                  /* @__PURE__ */ jsxs("p", { children: [
                    /* @__PURE__ */ jsx("strong", { children: "Ketentuan Kirim:" }),
                    " ",
                    selectedIncoterm
                  ] }),
                  /* @__PURE__ */ jsxs("p", { children: [
                    /* @__PURE__ */ jsx("strong", { children: "Ketentuan Bayar:" }),
                    " ",
                    selectedPayment
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 pt-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-center flex flex-col items-center", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400 uppercase font-semibold", children: "Disahkan oleh Buyer Jerman:" }),
                    /* @__PURE__ */ jsx("div", { className: "w-full h-11 border border-slate-100 rounded-lg flex items-center justify-center bg-slate-50 relative mt-1", children: /* @__PURE__ */ jsx("span", { className: "font-serif italic text-base text-blue-700 font-bold tracking-tighter select-none", children: "Hans Mueller" }) }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-1 font-bold", children: "EuroFoods Import GmbH" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-center flex flex-col items-center", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400 uppercase font-semibold", children: "Disahkan oleh Eksportir Indonesia:" }),
                    /* @__PURE__ */ jsx("div", { className: "w-full h-11 border border-slate-100 rounded-lg flex items-center justify-center bg-slate-50 relative mt-1", children: /* @__PURE__ */ jsx("span", { className: "font-serif italic text-base text-emerald-700 font-bold tracking-tighter select-none", children: "Prasetyo Adi" }) }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-1 font-bold", children: "PT Multi Raksa Madani" })
                  ] })
                ] })
              ] })
            ] })
          ]
        },
        "signed"
      )
    ] }) }) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: selectedProfile && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95, y: 15 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 15 },
        transition: { duration: 0.2, ease: "easeOut" },
        className: "w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto",
        children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectedProfile(null),
              className: "absolute top-4 right-4 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors cursor-pointer",
              children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
            }
          ),
          selectedProfile === "buyer" ? /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 border-b border-slate-200 pb-4 mb-5", children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500 font-bold text-lg font-mono shrink-0", children: "HM" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-base font-black text-slate-900", children: "Hans Mueller" }),
                  /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 text-[8.5px] bg-indigo-50 text-indigo-700 font-mono font-black rounded-full uppercase tracking-wider", children: "\u{1F1E9}\u{1F1EA} Buyer" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-indigo-600 font-semibold mt-0.5", children: "EuroFoods Import GmbH" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ jsx(Building, { className: "w-4 h-4 text-indigo-500 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1", children: "Perusahaan / Kantor" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-800 font-bold", children: "EuroFoods Import GmbH" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-600 block mt-1 leading-relaxed text-[11px]", children: "Kaiserstra\xDFe 12, 60311 Frankfurt am Main, Germany" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 pt-2 border-t border-slate-200", children: [
                  /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-indigo-500 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1", children: "Perwakilan Hukum / Jabatan" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-800 font-bold", children: "Hans Mueller" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-600 block text-[11px] mt-0.5", children: "Chief Purchasing Officer / Importir Utama" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "bg-slate-50 border border-slate-200 p-3.5 rounded-2xl", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4 text-indigo-500 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1", children: "Email Resmi" }),
                    /* @__PURE__ */ jsx("a", { href: "mailto:hans.m@eurofoods-import.de", className: "text-indigo-600 hover:underline font-medium break-all text-[11px]", children: "hans.m@eurofoods-import.de" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ jsx(Phone, { className: "w-4 h-4 text-indigo-500 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1", children: "Nomor Telepon" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-800 font-medium text-[11px]", children: "+49 170 1234567" })
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ jsx(CreditCard, { className: "w-4 h-4 text-indigo-500 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1", children: "Informasi Bank Pembayaran" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-800 font-bold", children: "Deutsche Bank AG, Frankfurt" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-600 block font-mono mt-1 text-[10.5px]", children: "IBAN: DE89 5007 0010 0123 4567 89" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 pt-2.5 border-t border-slate-200", children: [
                  /* @__PURE__ */ jsx(Globe, { className: "w-4 h-4 text-indigo-500 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1", children: "Registrasi Bea Cukai (EORI)" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-800 font-mono font-medium", children: "DE12345678901234" })
                  ] })
                ] })
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 border-b border-slate-200 pb-4 mb-5", children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 font-bold text-lg font-mono shrink-0", children: "HK" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-base font-black text-slate-900", children: "Hendry Kurniawan" }),
                  /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 text-[8.5px] bg-emerald-50 text-emerald-700 font-mono font-black rounded-full uppercase tracking-wider", children: "\u{1F1EE}\u{1F1E9} Trader" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-emerald-700 font-semibold mt-0.5", children: "PT Multi Raksa Madani" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ jsx(Building, { className: "w-4 h-4 text-emerald-500 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1", children: "Perusahaan / Kantor" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-800 font-bold", children: "PT Multi Raksa Madani" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-600 block mt-1 leading-relaxed text-[11px]", children: "Menara Sudirman, Lt. 18, CBD Jl. Jend. Sudirman Kav 60, Jakarta" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 pt-2 border-t border-slate-200", children: [
                  /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-emerald-500 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1", children: "Perwakilan Hukum / Jabatan" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-800 font-bold", children: "Hendry Kurniawan" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-600 block text-[11px] mt-0.5", children: "Senior Export-Import Specialist" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "bg-slate-50 border border-slate-200 p-3.5 rounded-2xl", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4 text-emerald-500 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1", children: "Email Resmi" }),
                    /* @__PURE__ */ jsx("a", { href: "mailto:hendry@nusantara-traders.com", className: "text-emerald-600 hover:underline font-medium break-all text-[11px]", children: "hendry@nusantara-traders.com" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ jsx(Phone, { className: "w-4 h-4 text-emerald-500 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1", children: "Nomor Telepon" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-800 font-medium text-[11px]", children: "+62 811-2233-4455" })
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ jsx(CreditCard, { className: "w-4 h-4 text-emerald-500 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1", children: "Informasi Bank Penerima" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-800 font-bold", children: "Bank Mandiri (Persero) Tbk, Cabang SBD Jakarta" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-600 block font-mono mt-1 text-[10.5px]", children: "No. Rekening: 124-00-998877-6" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 pt-2.5 border-t border-slate-200", children: [
                  /* @__PURE__ */ jsx(Globe, { className: "w-4 h-4 text-emerald-500 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1", children: "Nomor Induk Berusaha (NIB)" }),
                    /* @__PURE__ */ jsx("span", { className: "text-slate-800 font-mono font-medium", children: "912010998877" })
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 flex justify-end", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectedProfile(null),
              className: "px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer w-full text-center",
              children: "Tutup Profil"
            }
          ) })
        ]
      }
    ) }) }),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        drag: true,
        dragMomentum: false,
        className: `fixed z-50 bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isChatMinimized ? "w-[300px] h-12 bottom-6 right-6" : "w-[350px] h-[450px] bottom-6 right-6"}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-emerald-600 text-white px-4 py-3 flex items-center justify-between cursor-move shrink-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4 text-emerald-100" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "text-xs font-black uppercase tracking-wider leading-none mb-0.5", children: "Live Chat" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-bold text-emerald-200 flex items-center gap-1 animate-pulse leading-none", children: [
                  /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-300" }),
                  "Terkoneksi"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setIsChatMinimized(!isChatMinimized),
                className: "p-1 hover:bg-emerald-500 rounded transition-colors cursor-pointer",
                children: isChatMinimized ? /* @__PURE__ */ jsx(Maximize2, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsx(Minus, { className: "w-3.5 h-3.5" })
              }
            ) })
          ] }),
          !isChatMinimized && /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-1 overflow-hidden bg-slate-50", children: [
            /* @__PURE__ */ jsxs("div", { ref: chatContainerRef, className: "flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin", children: [
              chatMessages.map((msg) => {
                const isSystem = msg.sender === "System";
                const isMe = msg.sender === activeSimulatedRole;
                if (isSystem) {
                  return /* @__PURE__ */ jsx("div", { className: "flex justify-center my-1", children: /* @__PURE__ */ jsx("div", { className: "bg-slate-200/80 border border-slate-300 rounded px-2 py-0.5 text-[10px] text-slate-600 font-mono text-center max-w-[90%]", children: msg.message }) }, msg.id);
                }
                return /* @__PURE__ */ jsxs("div", { className: `flex gap-2 max-w-[90%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`, children: [
                  /* @__PURE__ */ jsx("span", { className: "text-base select-none mt-1 shrink-0", children: msg.avatar }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("div", { className: `px-3 py-2 rounded-xl text-xs shadow-xs leading-relaxed ${isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"}`, children: [
                      /* @__PURE__ */ jsx("p", { className: "font-bold text-[10px] opacity-80 mb-0.5", children: msg.senderName }),
                      /* @__PURE__ */ jsx("p", { className: "font-sans whitespace-pre-line", children: msg.message })
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: `text-[9px] text-slate-400 font-mono mt-1 ${isMe ? "text-right" : "text-left"}`, children: msg.timestamp })
                  ] })
                ] }, msg.id);
              }),
              isTyping && /* @__PURE__ */ jsx("div", { className: "flex gap-2 mr-auto items-center animate-pulse", children: /* @__PURE__ */ jsx("span", { className: "text-[11px] bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-400 font-bold flex items-center gap-1 font-mono", children: "Sedang mengetik..." }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "p-3 bg-white border-t border-slate-200 shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Kirim pesan...",
                  value: typedMessage,
                  onChange: (e) => setTypedMessage(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter") handleSendMessage();
                  },
                  className: "flex-1 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleSendMessage(),
                  className: "px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shadow-emerald-100 shrink-0",
                  children: /* @__PURE__ */ jsx(Send, { className: "w-3.5 h-3.5" })
                }
              )
            ] }) })
          ] })
        ]
      }
    )
  ] });
}
