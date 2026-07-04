import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { 
  FileText, Check, Send, UserCheck, ArrowRight, Lock, Unlock, Coffee, 
  DollarSign, Globe, Building, Award, PenTool, CheckCircle2, 
  MessageSquare, Eye, RefreshCw, AlertCircle, FileSignature,
  Printer, Download, X, Upload, Trash2, Paperclip,
  User, Mail, Phone, MapPin, CreditCard, Sliders, Minus, Maximize2, Move, ChevronDown
} from 'lucide-react';
import { ExportShipment, UserProfile, ShipmentStep } from '../types';
import { translations } from '../translations';

interface CommercialNegotiationGatewayProps {
  key?: string;
  shipment: ExportShipment;
  currentUser: UserProfile | null;
  currentLanguage?: string;
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

interface ChatMessage {
  id: string;
  sender: 'Buyer' | 'Trader' | 'System';
  senderName: string;
  avatar: string;
  message: string;
  timestamp: string;
}

type NegoSubStage = 'buyer-sending' | 'negotiating' | 'signed';

export default function CommercialNegotiationGateway({
  shipment,
  currentUser,
  currentLanguage = 'id',
  onUpdateShipmentFromDeal,
  onSelectUser,
  isArchiveMode = false
}: CommercialNegotiationGatewayProps) {
  const t = translations[currentLanguage] || translations.id;

  // Local sub-stage tracking for the interactive Phase 1
  const [subStage, setSubStage] = useState<NegoSubStage>(() => {
    try {
      const saved = localStorage.getItem(`commercial_nego_subStage_${shipment.id}`);
      if (saved) return saved as NegoSubStage;
    } catch (e) {}
    return 'buyer-sending';
  });
  
  // Tab within the final "signed" state
  const [activeArchiveTab, setActiveArchiveTab] = useState<'summary' | 'loi' | 'pi'>('summary');

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById('nego-header-addon');
    if (el) {
      setPortalTarget(el);
    }
  }, []);
  
  // Official/Latest Submitted Proposal
  interface OfficialProposal {
    quantity: number;
    price: number;
    incoterm: string;
    payment: string;
    notes: string;
    proposer: 'Buyer' | 'Trader';
    buyerAgreed: boolean;
    traderAgreed: boolean;
    timestamp: string;
  }

  const [officialProposal, setOfficialProposal] = useState<OfficialProposal>(() => {
    try {
      const saved = localStorage.getItem(`commercial_nego_official_proposal_${shipment.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      quantity: shipment.quantity || 20,
      price: 1450,
      incoterm: 'FOB Belawan Port (Incoterms 2020)',
      payment: 'Letter of Credit (L/C) at Sight',
      notes: 'Kadar air biji kopi tervalidasi maksimal 12%, pengemasan menggunakan karung goni berlapis GrainPro.',
      proposer: 'Trader',
      buyerAgreed: false,
      traderAgreed: false,
      timestamp: new Date().toISOString()
    };
  });

  // Derived or override active simulated role based strictly on actual logged-in user
  const activeSimulatedRole: 'Buyer' | 'Trader' | 'Viewer' = 
    currentUser?.role === 'Buyer' ? 'Buyer' : 
    (currentUser?.role === 'Trader' || currentUser?.role === 'Superadmin') ? 'Trader' : 
    'Viewer';

  const [selectedProfile, setSelectedProfile] = useState<'buyer' | 'trader' | null>(null);

  // State variables representing the Working Draft of the logged-in user
  const [negotiatedQty, setNegotiatedQty] = useState<number>(() => {
    try {
      const key = activeSimulatedRole === 'Buyer' 
        ? `commercial_nego_buyer_draft_qty_${shipment.id}` 
        : `commercial_nego_trader_draft_qty_${shipment.id}`;
      const saved = localStorage.getItem(key);
      if (saved) return Number(saved);
    } catch (e) {}
    return officialProposal.quantity;
  });

  const [negotiatedPrice, setNegotiatedPrice] = useState<number>(() => {
    try {
      const key = activeSimulatedRole === 'Buyer' 
        ? `commercial_nego_buyer_draft_price_${shipment.id}` 
        : `commercial_nego_trader_draft_price_${shipment.id}`;
      const saved = localStorage.getItem(key);
      if (saved) return Number(saved);
    } catch (e) {}
    return officialProposal.price;
  });

  const [selectedIncoterm, setSelectedIncoterm] = useState<string>(() => {
    try {
      const key = activeSimulatedRole === 'Buyer' 
        ? `commercial_nego_buyer_draft_incoterm_${shipment.id}` 
        : `commercial_nego_trader_draft_incoterm_${shipment.id}`;
      const saved = localStorage.getItem(key);
      if (saved) return saved;
    } catch (e) {}
    return officialProposal.incoterm;
  });

  const [selectedPayment, setSelectedPayment] = useState<string>(() => {
    try {
      const key = activeSimulatedRole === 'Buyer' 
        ? `commercial_nego_buyer_draft_payment_${shipment.id}` 
        : `commercial_nego_trader_draft_payment_${shipment.id}`;
      const saved = localStorage.getItem(key);
      if (saved) return saved;
    } catch (e) {}
    return officialProposal.payment;
  });

  const [negotiationNotes, setNegotiationNotes] = useState<string>(() => {
    try {
      const key = activeSimulatedRole === 'Buyer' 
        ? `commercial_nego_buyer_draft_notes_${shipment.id}` 
        : `commercial_nego_trader_draft_notes_${shipment.id}`;
      const saved = localStorage.getItem(key);
      if (saved) return saved;
    } catch (e) {}
    return officialProposal.notes;
  });
  
  // File upload state for LOI attachment with 2MB limit
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number; url?: string } | null>(() => {
    try {
      const saved = localStorage.getItem(`commercial_nego_attachedFile_${shipment.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Print blocked warning banner state
  const [printBlockedError, setPrintBlockedError] = useState<boolean>(false);

  const [isChatMinimized, setIsChatMinimized] = useState<boolean>(true);
  
  const [isLoiDetailOpen, setIsLoiDetailOpen] = useState<boolean>(false);

  // Chat Bilateral states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`commercial_nego_chat_${shipment.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    
    // Fallback default conversation starter messages
    return [
      {
        id: '1',
        sender: 'Buyer',
        senderName: 'Kenji Sato (Importir)',
        avatar: '🇯🇵',
        message: `Halo Pak Hendry. Kami dari Tokyo Coffee Trading Co. sangat tertarik untuk mengimpor ${shipment.productName || 'Kopi Gayo Organik'} berkualitas premium dari Anda.`,
        timestamp: '10:15'
      },
      {
        id: '2',
        sender: 'Trader',
        senderName: 'Hendry Kurniawan (Eksportir)',
        avatar: '🇮🇩',
        message: 'Selamat pagi Sato-san! Senang mendengar ketertarikan Anda. Kami siap menyuplai biji kopi pilihan dengan standardisasi ekspor terbaik dan sertifikasi lengkap.',
        timestamp: '10:20'
      },
      {
        id: '3',
        sender: 'Buyer',
        senderName: 'Kenji Sato (Importir)',
        avatar: '🇯🇵',
        message: 'Keluaran LOI kami ajukan dengan spesifikasi Premium Grade. Kami ingin mendiskusikan harga terbaik serta metode pengiriman yang paling efisien.',
        timestamp: '10:25'
      }
    ];
  });

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typedMessage, setTypedMessage] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(`commercial_nego_chat_${shipment.id}`, JSON.stringify(chatMessages));
    } catch (e) {}
  }, [chatMessages, shipment.id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

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
  const [buyerSigned, setBuyerSigned] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`commercial_nego_buyerSigned_${shipment.id}`);
      if (saved) return saved === 'true';
    } catch (e) {}
    return false;
  });

  const [traderSigned, setTraderSigned] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`commercial_nego_traderSigned_${shipment.id}`);
      if (saved) return saved === 'true';
    } catch (e) {}
    return false;
  });

  // Agreement values are directly mapped to current official proposal agreement flags
  const buyerAgreed = officialProposal.buyerAgreed;
  const traderAgreed = officialProposal.traderAgreed;

  // Persist states to localStorage
  useEffect(() => {
    localStorage.setItem(`commercial_nego_subStage_${shipment.id}`, subStage);
  }, [subStage, shipment.id]);

  useEffect(() => {
    localStorage.setItem(`commercial_nego_official_proposal_${shipment.id}`, JSON.stringify(officialProposal));
  }, [officialProposal, shipment.id]);

  useEffect(() => {
    if (activeSimulatedRole === 'Buyer') {
      localStorage.setItem(`commercial_nego_buyer_draft_qty_${shipment.id}`, String(negotiatedQty));
    } else if (activeSimulatedRole === 'Trader') {
      localStorage.setItem(`commercial_nego_trader_draft_qty_${shipment.id}`, String(negotiatedQty));
    }
  }, [negotiatedQty, activeSimulatedRole, shipment.id]);

  useEffect(() => {
    if (activeSimulatedRole === 'Buyer') {
      localStorage.setItem(`commercial_nego_buyer_draft_price_${shipment.id}`, String(negotiatedPrice));
    } else if (activeSimulatedRole === 'Trader') {
      localStorage.setItem(`commercial_nego_trader_draft_price_${shipment.id}`, String(negotiatedPrice));
    }
  }, [negotiatedPrice, activeSimulatedRole, shipment.id]);

  useEffect(() => {
    if (activeSimulatedRole === 'Buyer') {
      localStorage.setItem(`commercial_nego_buyer_draft_incoterm_${shipment.id}`, selectedIncoterm);
    } else if (activeSimulatedRole === 'Trader') {
      localStorage.setItem(`commercial_nego_trader_draft_incoterm_${shipment.id}`, selectedIncoterm);
    }
  }, [selectedIncoterm, activeSimulatedRole, shipment.id]);

  useEffect(() => {
    if (activeSimulatedRole === 'Buyer') {
      localStorage.setItem(`commercial_nego_buyer_draft_payment_${shipment.id}`, selectedPayment);
    } else if (activeSimulatedRole === 'Trader') {
      localStorage.setItem(`commercial_nego_trader_draft_payment_${shipment.id}`, selectedPayment);
    }
  }, [selectedPayment, activeSimulatedRole, shipment.id]);

  useEffect(() => {
    if (activeSimulatedRole === 'Buyer') {
      localStorage.setItem(`commercial_nego_buyer_draft_notes_${shipment.id}`, negotiationNotes);
    } else if (activeSimulatedRole === 'Trader') {
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



  // Recalculate Contract Value
  const totalContractValue = negotiatedQty * negotiatedPrice;

  // Simulate automatic state transitions for a fluid demo
  const handleSendLoi = () => {
    setSubStage('signed');
    setNegotiatedQty(shipment.quantity || 20);
    setNegotiatedPrice(1450);
    
    // Set officialProposal to reflect that the Buyer initiated/sent this LOI proposal
    const initialLoiProposal: OfficialProposal = {
      quantity: shipment.quantity || 20,
      price: 1450,
      incoterm: 'FOB Belawan Port (Incoterms 2020)',
      payment: 'Letter of Credit (L/C) at Sight',
      notes: 'Kadar air biji kopi tervalidasi maksimal 12%, pengemasan menggunakan karung goni berlapis GrainPro.',
      proposer: 'Trader',
      buyerAgreed: true,
      traderAgreed: true,
      timestamp: new Date().toISOString()
    };
    setOfficialProposal(initialLoiProposal);
    localStorage.setItem(`commercial_nego_official_proposal_${shipment.id}`, JSON.stringify(initialLoiProposal));
    
    // Add a system log to chat
    const logMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'System',
      senderName: 'Sistem Portal',
      avatar: '⚙️',
      message: '✓ Pesanan diterima dan disetujui. Proforma Invoice diterbitkan.',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([logMsg]);
  };

  const handleSendMessage = (textToSend?: string) => {
    const msgText = textToSend || typedMessage.trim();
    if (!msgText) return;

    const senderRole = activeSimulatedRole === 'Viewer' ? 'Buyer' : activeSimulatedRole;
    const senderName = senderRole === 'Buyer' ? 'Kenji Sato (Importir)' : 'Hendry Kurniawan (Eksportir)';
    const avatar = senderRole === 'Buyer' ? '🇯🇵' : '🇮🇩';

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: senderRole,
      senderName,
      avatar,
      message: msgText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    if (!textToSend) {
      setTypedMessage('');
    }
  };

  const handleSubmitCounterOffer = (overrides?: {
    quantity?: number;
    price?: number;
    incoterm?: string;
    payment?: string;
    notes?: string;
  }) => {
    const updatedQty = overrides?.quantity ?? negotiatedQty;
    const updatedPrice = overrides?.price ?? negotiatedPrice;
    const updatedIncoterm = overrides?.incoterm ?? selectedIncoterm;
    const updatedPayment = overrides?.payment ?? selectedPayment;
    const updatedNotes = overrides?.notes ?? negotiationNotes;

    const updated: OfficialProposal = {
      quantity: updatedQty,
      price: updatedPrice,
      incoterm: updatedIncoterm,
      payment: updatedPayment,
      notes: updatedNotes,
      proposer: activeSimulatedRole === 'Viewer' ? 'Trader' : activeSimulatedRole,
      buyerAgreed: false,
      traderAgreed: true, // Auto agree since it's the Trader who proposed it
      timestamp: new Date().toISOString()
    };
    setOfficialProposal(updated);
    localStorage.setItem(`commercial_nego_official_proposal_${shipment.id}`, JSON.stringify(updated));

    // Append log message to the chat
    const logMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'System',
      senderName: 'Sistem Portal',
      avatar: '⚙️',
      message: `📢 Eksportir mengajukan proposal draf baru: ${updatedQty} MT @ $${updatedPrice}/MT via ${updatedIncoterm.split(' ')[0]} & ${updatedPayment.split(' ')[0]}. Menunggu respons Importir...`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, logMsg]);

    // Simulate Buyer Bot Response
    setTimeout(() => {
      let buyerReplyMsg = "";
      let buyerAccepts = false;

      // Simple negotiation logic
      if (updatedPrice > 1600) {
        buyerReplyMsg = `Harga $${updatedPrice}/MT terlalu tinggi untuk pasar kami saat ini. Bisakah Anda memberikan diskon di bawah $1600/MT?`;
      } else if (updatedQty < 15) {
        buyerReplyMsg = `Kuantitas ${updatedQty} MT terlalu sedikit, minimum efisiensi logistik kami adalah 15 MT. Mohon tingkatkan kuantitas.`;
      } else if (updatedPayment.includes("100%")) {
        buyerReplyMsg = `Kami tidak bisa menggunakan metode pembayaran T/T 100% di muka. Mohon gunakan L/C atau skema DP 30%.`;
      } else {
        buyerReplyMsg = `Kami sepakat dengan penawaran ini (${updatedQty} MT @ $${updatedPrice}/MT, ${updatedIncoterm.split(' ')[0]}, ${updatedPayment.split(' ')[0]}). Draf Proforma Invoice disetujui.`;
        buyerAccepts = true;
      }

      // Buyer Chat Response
      const buyerChat: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'Buyer',
        senderName: 'Kenji Sato (Importir)',
        avatar: '🇯🇵',
        message: buyerReplyMsg,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, buyerChat]);

      // If accepted, update the proposal status
      if (buyerAccepts) {
        setTimeout(() => {
          setOfficialProposal(prev => {
            const acceptedProposal = {
              ...prev,
              buyerAgreed: true,
              traderAgreed: true
            };
            localStorage.setItem(`commercial_nego_official_proposal_${shipment.id}`, JSON.stringify(acceptedProposal));
            return acceptedProposal;
          });

          const acceptLogMsg: ChatMessage = {
            id: (Date.now() + 2).toString(),
            sender: 'System',
            senderName: 'Sistem Portal',
            avatar: '⚙️',
            message: `✓ Importir menyetujui draf proposal resmi! Parameter komersial kini terkunci dan draf Proforma Invoice bilateral siap ditandatangani.`,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages(prev => [...prev, acceptLogMsg]);
        }, 1500);
      }
    }, 2500); // 2.5 seconds delay for buyer bot thinking
  };

  const handleAcceptProposal = () => {
    const updated: OfficialProposal = {
      ...officialProposal,
      buyerAgreed: true,
      traderAgreed: true
    };
    setOfficialProposal(updated);
    localStorage.setItem(`commercial_nego_official_proposal_${shipment.id}`, JSON.stringify(updated));

    const logMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'System',
      senderName: 'Sistem Portal',
      avatar: '⚙️',
      message: `✓ Draf proposal resmi disetujui! Parameter komersial kini terkunci dan draf Proforma Invoice bilateral siap ditandatangani.`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, logMsg]);
  };

  const handleRejectProposal = () => {
    const updated: OfficialProposal = {
      ...officialProposal,
      buyerAgreed: false,
      traderAgreed: false
    };
    setOfficialProposal(updated);
    localStorage.setItem(`commercial_nego_official_proposal_${shipment.id}`, JSON.stringify(updated));

    const logMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'System',
      senderName: 'Sistem Portal',
      avatar: '⚙️',
      message: `❌ Draf proposal ditolak. Silakan sesuaikan kembali kalkulator untuk mengajukan penawaran baru.`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, logMsg]);
  };

  const handleProposeDeal = () => {
    // When transitioning, freeze the negotiation values to the official agreed ones
    setNegotiatedQty(officialProposal.quantity);
    setNegotiatedPrice(officialProposal.price);
    setSelectedIncoterm(officialProposal.incoterm);
    setSelectedPayment(officialProposal.payment);
    setNegotiationNotes(officialProposal.notes);
  };

  const handleSignAsBuyer = () => {
    setBuyerSigned(true);
    
    const logMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'System',
      senderName: 'Sistem Portal',
      avatar: '⚙️',
      message: '✍️ Importir (Kenji Sato) telah membubuhkan tanda tangan resmi pada draf Proforma Invoice!',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, logMsg]);
  };

  const handleSignAsTrader = () => {
    setTraderSigned(true);

    const logMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'System',
      senderName: 'Sistem Portal',
      avatar: '⚙️',
      message: '✍️ Eksportir (Hendry Kurniawan) telah membubuhkan tanda tangan resmi pada draf Proforma Invoice!',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, logMsg]);
  };

  // Sync complete deal with App state (which changes currentStep to 'Shipping')
  const handleTransitionToLogistics = () => {
    if (onUpdateShipmentFromDeal) {
      onUpdateShipmentFromDeal(shipment.id, {
        quantity: officialProposal.quantity,
        pricePerUnit: officialProposal.price,
        paymentTerms: officialProposal.payment,
        incoterms: officialProposal.incoterm,
        portOfDischarge: shipment.portOfDischarge || 'Port of Tokyo, Japan',
        buyerCompany: shipment.buyerCompany || 'Tokyo Coffee Trading Co.',
        nextStep: 'Shipping',
        comments: `Fase I Komersial Selesai: LOI telah dibaca, klausul disepakati melalui negosiasi asinkron nyata, dan Proforma Invoice (PI) telah ditandatangani secara bilateral oleh ${shipment.buyerCompany} dan PT Multi Raksa Madani.`
      });
    }
  };

  // Reset demo
  const handleResetDemo = () => {
    setSubStage('buyer-sending');
    setBuyerSigned(false);
    setTraderSigned(false);
    
    const defaultProposal: OfficialProposal = {
      quantity: shipment.quantity || 20,
      price: 1450,
      incoterm: 'FOB Belawan Port (Incoterms 2020)',
      payment: 'Letter of Credit (L/C) at Sight',
      notes: 'Kadar air biji kopi tervalidasi maksimal 12%, pengemasan menggunakan karung goni berlapis GrainPro.',
      proposer: 'Trader',
      buyerAgreed: false,
      traderAgreed: false,
      timestamp: new Date().toISOString()
    };
    setOfficialProposal(defaultProposal);
    setNegotiatedQty(20);
    setNegotiatedPrice(1450);
    setSelectedIncoterm('FOB Belawan Port (Incoterms 2020)');
    setSelectedPayment('Letter of Credit (L/C) at Sight');
    setNegotiationNotes('Kadar air biji kopi tervalidasi maksimal 12%, pengemasan menggunakan karung goni berlapis GrainPro.');

    // Reset Chat Messages
    const initialMsg: ChatMessage = {
      id: '1',
      sender: 'Buyer',
      senderName: 'Kenji Sato (Importir)',
      avatar: '🇯🇵',
      message: `Halo Pak Hendry. Kami dari Tokyo Coffee Trading Co. sangat tertarik untuk mengimpor ${shipment.productName || 'Kopi Gayo Organik'} berkualitas premium dari Anda.`,
      timestamp: '10:15'
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
    } catch (e) {}
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
    <div id="commercial-gateway-container" className="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 relative">
      {/* Abstract Grid Decoration Wrapper with overflow-hidden */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#fff_70%,transparent_100%)] opacity-30" />
      </div>

      {portalTarget && createPortal(
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Profil Pihak Negosiasi (Red circle) */}
          <div className="flex flex-wrap items-center gap-1 border-r border-slate-200 pr-2 mr-1">
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-black hidden lg:inline">
              Profil:
            </span>
            <button
              onClick={() => setSelectedProfile('buyer')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border cursor-pointer shadow-sm ${
                activeSimulatedRole === 'Trader'
                  ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <span>🇯🇵 Importir {activeSimulatedRole === 'Buyer' && '(Anda)'}</span>
              {activeSimulatedRole === 'Trader' && (
                <span className="text-[8px] bg-indigo-100 text-indigo-700 px-1 py-0.1 rounded-full font-mono font-black uppercase tracking-tight">Lawan</span>
              )}
            </button>
            <button
              onClick={() => setSelectedProfile('trader')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border cursor-pointer shadow-sm ${
                activeSimulatedRole === 'Buyer'
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <span>🇮🇩 Eksportir {activeSimulatedRole === 'Trader' && '(Anda)'}</span>
              {activeSimulatedRole === 'Buyer' && (
                <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 py-0.1 rounded-full font-mono font-black uppercase tracking-tight">Lawan</span>
              )}
            </button>
          </div>

          {/* Active Actor Badge (Green circle) */}
          {(isArchiveMode || shipment.currentStep !== 'Draft') ? (
            <div className="bg-emerald-50 border border-emerald-150 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1 shadow-sm text-emerald-700 font-mono text-[9px] font-black uppercase tracking-wider">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span>Selesai</span>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-150 p-1 px-1.5 sm:px-2.5 rounded-lg flex items-center gap-1.5 shadow-inner max-w-xs">
              <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-[9px] border border-indigo-200 shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0) : 'T'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-slate-400 font-mono text-[7px] font-black leading-none block uppercase">
                  Aktor Aktif:
                </span>
                <p className="text-[9px] font-extrabold text-slate-800 leading-none mt-0.5">{currentUser?.name || 'Tamu'}</p>
              </div>
            </div>
          )}
        </div>,
        portalTarget
      )}

      {/* Top Banner & Title */}
      <div className="relative z-10 border-b border-slate-200 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-150 rounded-full uppercase animate-pulse">
              Fase I: Komersial &amp; Kontrak
            </span>
            <span className="text-slate-400 font-mono text-xs">•</span>
            <span className="text-slate-500 text-[10px] sm:text-xs flex items-center gap-1 font-mono">
              <Lock className="w-3 h-3 text-amber-500" /> Gerbang Pabean Terkunci
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>Gerbang Negosiasi Komersial &amp; Pengesahan PI</span>
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 max-w-md text-right hidden md:block">
            Sebelum memulai logistik maritim, importir &amp; eksportir merundingkan legalitas komersial demi draf PI yang sah.
          </p>
        </div>
      </div>

      {/* LOI Details Accordion */}
      <div className="relative z-10 border-b border-slate-200 py-2">
        <button
          onClick={() => setIsLoiDetailOpen(!isLoiDetailOpen)}
          className="w-full flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Data Referensi Permintaan/LOI</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${isLoiDetailOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isLoiDetailOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 mt-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Kontrak</p>
                    <p className="text-xs font-semibold text-slate-800">{shipment.contractNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Komoditas</p>
                    <p className="text-xs font-semibold text-slate-800">{shipment.productName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kode HS</p>
                    <p className="text-xs font-mono font-semibold text-slate-800">{shipment.hsCode}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kuantitas Permintaan</p>
                    <p className="text-xs font-semibold text-slate-800">{shipment.quantity} {shipment.unit}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Eksportir</p>
                    <p className="text-xs font-semibold text-slate-800">{shipment.supplierName}</p>
                    <p className="text-[10px] text-slate-500">{shipment.supplierCompany}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Importir</p>
                    <p className="text-xs font-semibold text-slate-800">{shipment.buyerName}</p>
                    <p className="text-[10px] text-slate-500">{shipment.buyerCompany}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pelabuhan Muat</p>
                    <p className="text-xs font-semibold text-slate-800">{shipment.portOfLoading}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pelabuhan Bongkar</p>
                    <p className="text-xs font-semibold text-slate-800">{shipment.portOfDischarge}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ketentuan Penyerahan</p>
                    <p className="text-xs font-semibold text-slate-800">{officialProposal.incoterm}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Metode Pembayaran</p>
                    <p className="text-xs font-semibold text-slate-800">{officialProposal.payment}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Harga Satuan (FOB)</p>
                    <p className="text-xs font-semibold text-slate-800">${officialProposal.price} / Ton</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Nilai (FOB)</p>
                    <p className="text-xs font-semibold text-slate-800">${(officialProposal.quantity * officialProposal.price).toLocaleString('en-US')}</p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Catatan Tambahan</p>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">{officialProposal.notes}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
      </div>

      {/* Interactive Sub-Stage Stepper Track */}
      <div className="relative z-10 py-3">
        <div className="grid grid-cols-3 gap-2 relative">
          {/* Progress bar background line */}
          <div className="absolute left-[16%] right-[16%] top-[14px] h-0.5 bg-slate-100 -z-10">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
              style={{
                width: 
                  subStage === 'buyer-sending' ? '0%' : '100%'
              }}
            />
          </div>

          {/* Stepper items */}
          {[
            { id: 'buyer-sending', label: '1. Detail Pesanan', icon: FileText, desc: 'Tinjauan Order' },
            { id: 'signed', label: '2. Proforma Invoice', icon: CheckCircle2, desc: 'PI Disahkan' }
          ].map((st, idx) => {
            const isCompleted = 
              (subStage === 'signed');

            const isActive = subStage === st.id;

            return (
              <div key={st.id} className="text-center flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 border ${
                  isCompleted 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs shadow-emerald-100' 
                    : isActive
                      ? 'bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-50 scale-105 shadow-xs shadow-indigo-100 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <st.icon className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-tight mt-1.5 transition-colors ${
                  isActive ? 'text-indigo-600 font-extrabold' : isCompleted ? 'text-emerald-600 font-bold' : 'text-slate-400'
                }`}>
                  {st.label}
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-sans hidden sm:block mt-0.5 max-w-[130px] mx-auto leading-tight">
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
        <div className={`w-full rounded-2xl p-5 sm:p-6 flex flex-col justify-between ${
          subStage === 'buyer-sending'
            ? 'bg-slate-900/60 border border-slate-800/80'
            : 'bg-transparent'
        }`}>
          
            {subStage === 'buyer-sending' ? (
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
                    <h3 className="font-extrabold text-base tracking-tight text-white">Langkah 1: Tinjauan Pesanan (Purchase Order / LOI)</h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">Pengirim: Tokyo Coffee Trading Co. • Penerima: PT Multi Raksa Madani</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Simulated LOI Document Paper Specimen */}
                  <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed max-w-full overflow-x-auto shadow-inner h-full lg:min-h-[460px] flex flex-col justify-between">
                    <div>
                      <div className="border-b border-slate-800 pb-3 mb-3 flex items-start justify-between text-slate-400 text-xs sm:text-sm">
                        <div>
                          <p className="font-bold text-white uppercase text-xs tracking-wide">TOKYO COFFEE TRADING CO.</p>
                          <p>Shibuya, 150-0002 Tokyo, Japan</p>
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

                  {/* Right Column: File Attachment Upload Area + Action */}
                  <div className="lg:col-span-4 flex flex-col gap-4">

                    {/* File Attachment Upload Area (Limit 2 MB) */}
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                          Lampiran Dokumen Pendukung LOI (Opsional, Maks 2 MB)
                        </span>
                        {attachedFile && (
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                            Siap Kirim
                          </span>
                        )}
                      </div>

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
                          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex flex-col justify-center min-h-[110px] ${
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
                            <div className="space-y-1 py-2">
                              <Upload className="w-5 h-5 mx-auto text-slate-400 animate-bounce" />
                              <p className="text-xs font-semibold text-slate-200">
                                Seret &amp; letakkan file di sini, atau <span className="text-indigo-400 underline">pilih file</span>
                              </p>
                              <p className="text-xs text-slate-400">
                                Format yang didukung: PDF, Word, atau Gambar (Maks. 2 MB)
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 w-full animate-fade-in">
                              <div className="flex items-center gap-2.5 text-left min-w-0">
                                <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                  <p className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[200px]">
                                    {attachedFile.name}
                                  </p>
                                  <p className="text-xs text-slate-300 font-mono">
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

                      {uploadError && (
                        <div className="text-[11px] text-rose-400 font-semibold bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-lg flex items-start gap-1.5 animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-500" />
                          <span>{uploadError}</span>
                        </div>
                      )}
                    </div>

                    {/* Contextual Action */}
                    <div className="flex flex-col items-stretch gap-3 pt-4 border-t border-slate-800/80 mt-4">
                      <button
                        onClick={handleSendLoi}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-950/50 hover:-translate-y-0.5"
                      >
                        <span>Setujui Pesanan & Terbitkan Proforma Invoice</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : subStage === 'negotiating' ? (
              <motion.div
                key="negotiating"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left flex-1"
              >


                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* COLUMN 1: WORKSPACE & DOCUMENT (lg:col-span-7) */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Active Draft Customization */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                          WORKSPACE USULAN DRAF KOMERSIAL
                        </h4>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Live Editor • PT Multi Raksa Madani
                        </div>
                      </div>

                      {/* Sliders Grid - Spacious 2 columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Cargo Volume */}
                        <div className="space-y-0.5 relative pb-4">
                          <label className="text-xs font-bold text-slate-600 flex justify-between items-center">
                            <span>{t.volumeCargo}:</span>
                            <div className="flex items-center gap-1 font-mono text-indigo-600">
                              <input
                                type="number"
                                min="1"
                                max="10000"
                                value={negotiatedQty}
                                onChange={(e) => {
                                  setNegotiatedQty(Number(e.target.value));
                                }}
                                onBlur={() => {
                                  let val = negotiatedQty;
                                  if (val < 1) val = 1;
                                  if (val > 10000) val = 10000;
                                  setNegotiatedQty(val);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                  }
                                }}
                                className="w-14 bg-slate-100 hover:bg-slate-200 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 text-right font-black text-indigo-700 text-xs focus:outline-none transition-all"
                              />
                              <span className="text-xs font-bold">MT</span>
                            </div>
                          </label>
                          <input 
                            type="range" 
                            min="10" 
                            max="300" 
                            value={negotiatedQty > 300 ? 300 : negotiatedQty}
                            onChange={(e) => {
                              setNegotiatedQty(Number(e.target.value));
                            }}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <p className="text-[9px] text-slate-500 absolute bottom-0 left-0 font-medium">Permintaan Awal: {shipment.quantity || 20} MT</p>
                        </div>

                        {/* Unit Price */}
                        <div className="space-y-0.5 relative pb-4">
                          <label className="text-xs font-bold text-slate-600 flex justify-between items-center">
                            <span>{t.unitPrice}:</span>
                            <div className="flex items-center gap-1 font-mono text-emerald-600">
                              <span className="text-xs font-bold">$</span>
                              <input
                                type="number"
                                min="100"
                                max="50000"
                                value={negotiatedPrice}
                                onChange={(e) => {
                                  setNegotiatedPrice(Number(e.target.value));
                                }}
                                onBlur={() => {
                                  let val = negotiatedPrice;
                                  if (val < 100) val = 100;
                                  if (val > 50000) val = 50000;
                                  setNegotiatedPrice(val);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                  }
                                }}
                                className="w-16 bg-slate-100 hover:bg-slate-200 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded px-1.5 py-0.5 text-right font-black text-emerald-700 text-xs focus:outline-none transition-all"
                              />
                              <span className="text-xs font-bold">USD</span>
                            </div>
                          </label>
                          <input 
                            type="range" 
                            min="1000" 
                            max="2500" 
                            value={negotiatedPrice > 2500 ? 2500 : (negotiatedPrice < 1000 ? 1000 : negotiatedPrice)}
                            onChange={(e) => {
                              setNegotiatedPrice(Number(e.target.value));
                            }}
                            onMouseUp={() => handleSubmitCounterOffer()}
                            onTouchEnd={() => handleSubmitCounterOffer()}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <p className="text-[9px] text-slate-500 absolute bottom-0 left-0 font-medium">Permintaan Awal: $1450 / Ton</p>
                        </div>

                        {/* Incoterms Select */}
                        <div className="space-y-0.5">
                          <label className="text-xs font-bold text-slate-600 block">{t.deliveryTerms}:</label>
                          <select
                            value={selectedIncoterm}
                            onChange={(e) => {
                              setSelectedIncoterm(e.target.value);
                            }}
                            className="w-full bg-white border border-slate-250 text-xs text-slate-800 rounded-lg p-1.5 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="FOB Belawan Port (Incoterms 2020)">FOB Belawan Port, Sumatra (Incoterms 2020)</option>
                            <option value="CIF Tokyo Port (Incoterms 2020)">CIF Tokyo Port, Japan (Incoterms 2020)</option>
                          </select>
                          <p className="text-[9px] text-slate-500 font-medium mt-0.5 mb-1 block">Permintaan Awal: FOB Belawan Port (Incoterms 2020)</p>
                          {(currentUser?.role === 'Trader' || currentUser?.role === 'Superadmin') && (
                            <p className="text-[10px] text-slate-500 italic mt-1 leading-tight">
                              {selectedIncoterm.includes('FOB') 
                                ? "FOB (Free on Board): Penjual (Eksportir) hanya bertanggung jawab sampai barang naik ke kapal. Biaya asuransi dan pengiriman laut (freight) ditanggung pembeli."
                                : "CIF (Cost, Insurance, and Freight): Penjual (Eksportir) menanggung biaya barang, asuransi, dan pengiriman laut sampai pelabuhan tujuan."}
                            </p>
                          )}
                        </div>

                        {/* Payment Select */}
                        <div className="space-y-0.5">
                          <label className="text-xs font-bold text-slate-600 block">{t.paymentMethod}:</label>
                          <select
                            value={selectedPayment}
                            onChange={(e) => {
                              setSelectedPayment(e.target.value);
                            }}
                            className="w-full bg-white border border-slate-250 text-xs text-slate-800 rounded-lg p-1.5 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Letter of Credit (L/C) at Sight">Irrevocable Letter of Credit (L/C) at Sight</option>
                            <option value="30% Down Payment, 70% L/C Sight">30% Down Payment, 70% L/C</option>
                            <option value="Telegraphic Transfer (T/T) 100%">Telegraphic Transfer (T/T) 100%</option>
                          </select>
                          <p className="text-[9px] text-slate-500 font-medium mt-0.5 mb-1 block">Permintaan Awal: Letter of Credit (L/C) at Sight</p>
                          {(currentUser?.role === 'Trader' || currentUser?.role === 'Superadmin') && (
                            <p className="text-[10px] text-slate-500 italic mt-1 leading-tight">
                              {selectedPayment.includes('Letter of Credit') || selectedPayment === 'Letter of Credit (L/C) at Sight'
                                ? "L/C at Sight: Bank importir menjamin pembayaran ke eksportir segera setelah menyerahkan dokumen pengiriman yang valid."
                                : selectedPayment.includes('30% Down Payment')
                                ? "30% DP, 70% L/C: Pembeli membayar deposit tunai 30% di awal (untuk modal produksi), sisanya 70% dijamin dengan L/C."
                                : "T/T 100%: Pembayaran tunai transfer bank 100%. Risiko tinggi bagi pembeli jika barang belum dikirim."}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col py-2 px-3 bg-slate-100/50 rounded-lg border border-slate-200 mt-2 mb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700">Estimasi Total Nilai (FOB):</span>
                          <span className="text-sm font-black text-emerald-700 font-mono tracking-tight">
                            ${(negotiatedQty * negotiatedPrice).toLocaleString('en-US')} USD
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-medium mt-1">
                          Permintaan Awal: ${((shipment.quantity || 20) * 1450).toLocaleString('en-US')} USD
                        </p>
                      </div>

                      <div className="space-y-0.5 pt-1 relative pb-6">
                        <label className="text-xs font-bold text-slate-600 block">Catatan / Spesifikasi Teknis Tambahan:</label>
                        <textarea
                          rows={2}
                          value={negotiationNotes}
                          onChange={(e) => {
                            setNegotiationNotes(e.target.value);
                          }}
                          placeholder="Spesifikasi kopi Gayo premium, kadar air maks 12%..."
                          className="w-full bg-white border border-slate-250 text-xs text-slate-800 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 font-sans leading-normal"
                        />
                        <p className="text-[9px] text-slate-500 absolute bottom-0 left-0 font-medium leading-tight">Permintaan Awal: Kadar air biji kopi tervalidasi maksimal 12%, pengemasan menggunakan karung goni berlapis GrainPro.</p>
                      </div>
                      
                      {/* Submit Button */}
                      <div className="pt-2 border-t border-slate-200 mt-3">
                        <button
                          onClick={() => handleSubmitCounterOffer()}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-blue-200 hover:-translate-y-0.5 active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Draf Penawaran ke Importir</span>
                        </button>
                      </div>
                    </div>

                    {/* Real-time PI Specimen Document */}
                    <div className="w-full bg-white text-slate-900 border border-slate-250 rounded-xl p-4 font-mono text-[10px] sm:text-[11px] leading-relaxed relative shadow-md">
                      <div className="absolute top-2 right-2 bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono">
                        DRAFT PI
                      </div>

                      <div className="flex justify-between items-start border-b border-slate-200 pb-2 mb-2 text-[9px] text-slate-500">
                        <div>
                          <p className="font-extrabold text-slate-900 text-[10px] tracking-wide">PT MULTI RAKSA MADANI</p>
                          <p>Komp. Ruko Harmoni Mas, Jakarta, Indonesia</p>
                        </div>
                        <div className="text-right font-bold">
                          <p className="text-slate-900 text-[10px]">PROFORMA INVOICE (PI)</p>
                          <p>NOMOR: PI/MRM-DEUTSCH/2026/419</p>
                          <p>TANGGAL: 25 JUNI 2026</p>
                        </div>
                      </div>

                      <p className="text-center font-black text-slate-950 text-xs tracking-wider border-b border-slate-100 py-0.5 mb-2">
                        DRAFT PROFORMA INVOICE / EKSPOR KOPI
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[9px] mb-2 leading-tight">
                        <div>
                          <span className="text-slate-400 uppercase tracking-wider block text-[8px] font-bold">IMPORTIR (BUYER):</span>
                          <strong className="text-slate-900">{shipment.buyerCompany || 'Tokyo Coffee Trading Co.'}</strong>
                          <p className="text-slate-500">Shibuya, Tokyo, Japan</p>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase tracking-wider block text-[8px] font-bold">EKSPORTIR (SELLER):</span>
                          <strong className="text-slate-900">PT Multi Raksa Madani</strong>
                          <p className="text-slate-500">Komp. Ruko Harmoni Mas, Jakarta, Indonesia</p>
                        </div>
                      </div>

                      <table className="w-full border-t border-b border-slate-200 text-left mb-2 text-[10px]">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <th className="py-0.5 px-1">Komoditas &amp; Spesifikasi</th>
                            <th className="py-0.5 px-1 text-right">Volume</th>
                            <th className="py-0.5 px-1 text-right">Harga</th>
                            <th className="py-0.5 px-1 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-100">
                            <td className="py-0.5 px-1 leading-tight">
                              <strong className="text-slate-950">{shipment.productName || 'Biji Kopi Gayo Organik'}</strong>
                              <p className="text-[9px] text-slate-400">Premium Arabika, Moisture Max 12%</p>
                            </td>
                            <td className="py-0.5 px-1 text-right font-bold">{negotiatedQty} MT</td>
                            <td className="py-0.5 px-1 text-right font-bold">${negotiatedPrice}</td>
                            <td className="py-0.5 px-1 text-right font-extrabold text-slate-950">${(negotiatedQty * negotiatedPrice).toLocaleString('en-US')} USD</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 border-b border-slate-100 pb-1.5 mb-1.5">
                        <p><strong>Ketentuan Kirim:</strong> {selectedIncoterm.split(' ')[0]}</p>
                        <p><strong>Ketentuan Bayar:</strong> {selectedPayment.split(' ')[0]}</p>
                      </div>

                      {/* Signatures Specimen Fields */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                        <div className="text-center flex flex-col items-center">
                          <span className="text-[8px] text-slate-400 uppercase font-bold">Importir Jepang:</span>
                          <div className="w-full h-8 border border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 relative mt-0.5">
                            {buyerSigned ? (
                              <span className="font-serif italic text-sm text-blue-700 font-bold tracking-tighter select-none rotate-2">
                                Kenji Sato
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[9px] animate-pulse">Belum TTD</span>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-600 mt-0.5 font-bold">Tokyo Coffee Trading Co.</p>
                        </div>

                        <div className="text-center flex flex-col items-center">
                          <span className="text-[8px] text-slate-400 uppercase font-bold">Eksportir Indo:</span>
                          <div className="w-full h-8 border border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 relative mt-0.5">
                            {traderSigned ? (
                              <span className="font-serif italic text-sm text-indigo-700 font-bold tracking-tighter select-none -rotate-2">
                                Hendry Kurniawan
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[9px] animate-pulse">Belum TTD</span>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-600 mt-0.5 font-bold">PT Multi Raksa Madani</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2: LIVE CHAT & AGREEMENT BOARD (lg:col-span-5) */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Bilateral Agreement & Signature Board */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-xs space-y-3">
                      <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-1.5">
                        <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px] sm:text-xs">Persetujuan Bilateral:</span>
                        <div className="flex gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            officialProposal.buyerAgreed 
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-100 text-rose-700 border border-rose-200'
                          }`}>
                            BUYER: {officialProposal.buyerAgreed ? 'SEPAKAT' : 'BELUM'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            officialProposal.traderAgreed 
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-100 text-rose-700 border border-rose-200'
                          }`}>
                            TRADER: {officialProposal.traderAgreed ? 'SEPAKAT' : 'BELUM'}
                          </span>
                        </div>
                      </div>

                      {/* Accept / Reject actions */}
                      {!officialProposal.buyerAgreed || !officialProposal.traderAgreed ? (
                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg space-y-2">
                          <p className="text-xs text-indigo-700 leading-normal font-sans font-medium">
                            Silakan setujui draf komersial saat ini agar lembar tanda tangan Proforma Invoice dapat dibuka.
                          </p>
                          <div className="flex gap-1.5">
                            <button
                              onClick={handleAcceptProposal}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] uppercase rounded-lg transition-all cursor-pointer shadow-xs shadow-emerald-100"
                            >
                              Sepakati Draf
                            </button>
                            <button
                              onClick={handleRejectProposal}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] uppercase rounded-lg border border-rose-200 transition-colors cursor-pointer"
                            >
                              Tolak
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Signing buttons */
                        <div className="space-y-2">
                          {(!buyerSigned || !traderSigned) ? (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                              <p className="text-xs text-emerald-800 leading-normal font-sans font-medium">
                                ✓ Draf telah disepakati bilateral! Silakan bubuhkan tanda tangan di bawah sesuai peran aktif Anda.
                              </p>
                              
                              <div className="flex flex-col gap-1.5">
                                {!traderSigned && (
                                  <button
                                    onClick={() => {
                                      handleSignAsTrader();
                                      handleSignAsBuyer(); // Auto-sign buyer for demo simplicity
                                    }}
                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs shadow-indigo-100"
                                  >
                                    <PenTool className="w-3 h-3" />
                                    <span>Tanda Tangani Proforma Invoice</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-emerald-600 text-white rounded-lg shadow-md shadow-emerald-100 border border-emerald-500 space-y-2 text-center">
                              <p className="text-[11px] font-black leading-tight uppercase flex items-center justify-center gap-1">
                                <Check className="w-3.5 h-3.5 text-white shrink-0 animate-bounce" />
                                Proforma Invoice Disahkan!
                              </p>
                              <p className="text-[10px] opacity-90 leading-normal font-sans">
                                Kontrak kopi senilai ${(negotiatedQty * negotiatedPrice).toLocaleString('en-US')} USD resmi dikunci bilateral.
                              </p>
                              <button
                                onClick={() => setSubStage('signed')}
                                className="w-full mt-1 py-2 bg-white text-emerald-700 hover:bg-slate-50 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow shadow-emerald-700/20"
                              >
                                <span>Terbitkan Dokumen Kontrak</span>
                                <ArrowRight className="w-3 h-3 animate-pulse" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Info Footer */}
                      <div className="text-[9px] text-slate-400 font-mono border-t border-slate-150 pt-1.5 mt-2 flex justify-between items-center">
                        <span>Sistem Kontrak MRM Bilateral</span>
                        <span>v1.2.0 • Secured</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : subStage === 'signed' ? (
              <motion.div
                key="signed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 text-center w-full py-2 flex-1 flex flex-col justify-start"
              >
                {/* Inner Tab bar for Document Viewers inside the Signed view */}
                <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-1 w-full max-w-md mx-auto">
                  <button
                    onClick={() => setActiveArchiveTab('summary')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeArchiveTab === 'summary'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Ringkasan Kontrak
                  </button>
                  <button
                    onClick={() => setActiveArchiveTab('loi')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeArchiveTab === 'loi'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Surat Minat (LOI)
                  </button>
                  <button
                    onClick={() => setActiveArchiveTab('pi')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeArchiveTab === 'pi'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Proforma Invoice (PI)
                  </button>
                </div>

                {/* Print/Blocked Popup Warning Banner */}
                {printBlockedError && (
                  <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 rounded-xl text-xs font-medium flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg border border-amber-500 mb-4 animate-fadeIn text-left max-w-2xl mx-auto w-full leading-relaxed">
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
                        className="bg-white text-amber-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all shadow-sm shrink-0 flex items-center gap-1"
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
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-lg shadow-emerald-100 animate-bounce">
                      <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900">Fase I Berhasil Diselesaikan!</h3>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                        Surat Minat Impor (LOI) telah berhasil ditinjau dan disetujui, dan draf Proforma Invoice resmi (PI) telah diterbitkan.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-left text-sm text-slate-800 space-y-3 shadow-sm">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-250 pb-2 mb-2">Kesimpulan Kontrak Perdagangan</p>
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-semibold">• Komoditas:</span>
                        <strong className="text-slate-900 font-black">{shipment.productName}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-semibold">• Volume Akhir:</span>
                        <strong className="text-slate-900 font-black">{negotiatedQty} Metric Tons</strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-semibold">• Tarif Kesepakatan:</span>
                        <strong className="text-slate-900 font-black">${negotiatedPrice} USD/Ton</strong>
                      </p>
                      <p className="flex justify-between border-t border-slate-200 pt-2.5 mt-2">
                        <span className="text-slate-500 font-semibold">• Total Nilai Deal:</span>
                        <strong className="text-emerald-700 font-black text-base">${(negotiatedQty * negotiatedPrice).toLocaleString('en-US')} USD</strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-semibold">• Incoterms / Bayar:</span>
                        <strong className="text-slate-900 font-bold">{selectedIncoterm} / {selectedPayment}</strong>
                      </p>
                    </div>

                    {/* Final Progression Button to start Sourcing */}
                    {!(isArchiveMode || shipment.currentStep !== 'Draft') && (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        {activeSimulatedRole === 'Trader' ? (
                          <button
                            onClick={handleTransitionToLogistics}
                            className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
                          >
                            <span>Luncurkan Alur Logistik Ekspor</span>
                            <ArrowRight className="w-4 h-4 animate-bounce-right" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full sm:w-auto px-8 py-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-65 border border-slate-200"
                            title="Hanya Trader / Superadmin (Eksportir) yang memiliki hak wewenang untuk meluncurkan alur logistik ekspor."
                          >
                            <span>Luncurkan Alur Logistik Ekspor</span>
                            <Lock className="w-4 h-4 text-rose-500" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeArchiveTab === 'loi' && (
                  <div className="text-left py-2 max-w-2xl mx-auto w-full space-y-4">
                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Arsip Dokumen LOI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload('loi')}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                          title="Unduh draf asli format HTML mandiri"
                        >
                          <Download className="w-3 h-3" />
                          <span>Unduh HTML</span>
                        </button>
                      </div>
                    </div>

                    {/* Buyer Attachment Access Card */}
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-150 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100 shrink-0">
                          <Paperclip className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">Lampiran Dokumen LOI Asli dari Importir</h4>
                          {attachedFile ? (
                            <div className="mt-1">
                              <span className="text-xs font-bold text-slate-700">{attachedFile.name}</span>
                              <span className="text-xs text-slate-500 font-mono ml-2">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <span className="text-xs font-bold text-slate-700">LOI_TokyoCoffee_Japan_Gayo_Green_Beans.pdf</span>
                              <span className="text-xs text-slate-500 font-mono ml-2">(421.5 KB)</span>
                            </div>
                          )}
                          <p className="text-[10px] text-indigo-700 font-medium mt-0.5">Dokumen ini dilampirkan langsung oleh Tokyo Coffee Trading Co. dan terkunci secara permanen di sistem.</p>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {attachedFile && attachedFile.url ? (
                          <a
                            href={attachedFile.url}
                            download={attachedFile.name}
                            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" /> Unduh Lampiran
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              const text = `TOKYO COFFEE TRADING CO.\nShibuya, 150-0002 Tokyo, Japan\n\nOFFICIAL LETTER OF INTENT (LOI)\n\nCommodity: ${shipment.productName || 'Biji Kopi Gayo Organik Arabika (Green Beans)'}\nTarget Quantity: ${negotiatedQty} Metric Tons\nTarget Price: $${negotiatedPrice} USD / MT\n\nSigned off bilaterally. Verified & Authenticated under MRM Portal.`;
                              const blob = new Blob([text], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'LOI_TokyoCoffee_Japan_Gayo_Green_Beans.pdf';
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" /> Unduh Lampiran
                          </button>
                        )}
                        <span className="hidden sm:inline-flex text-[10px] text-emerald-600 font-extrabold bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          Terverifikasi
                        </span>
                      </div>
                    </div>

                    <div id="commercial-loi-paper" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 font-mono text-xs text-slate-800 leading-relaxed max-w-full overflow-x-auto shadow-md space-y-5">
                      <div className="border-b border-slate-200 pb-4 mb-4 flex items-start justify-between text-slate-500 text-xs">
                        <div>
                          <p className="font-extrabold text-slate-900 uppercase text-sm tracking-wide">TOKYO COFFEE TRADING CO.</p>
                          <p>Shibuya, 150-0002 Tokyo, Japan</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">DOKUMEN: LETTER OF INTENT (LOI)</p>
                          <p>TANGGAL: 24 JUNI 2026</p>
                        </div>
                      </div>

                      <p className="font-black text-slate-950 text-center text-sm tracking-wider uppercase py-2 border-b border-slate-100">SURAT MINAT PEMBELIAN RESMI (LETTER OF INTENT)</p>
                      
                      <div className="space-y-3 mt-2 text-xs text-slate-700">
                        <p>Kepada Yth,<br /><strong>PT Multi Raksa Madani (Direksi Komersial Ekspor)</strong><br />Jakarta, Indonesia</p>
                        <p>Dengan surat ini, kami menyatakan ketertarikan resmi (Letter of Intent) untuk mengimpor komoditas perkebunan premium bernilai tinggi dari Indonesia dengan rincian draf niaga awal sebagai berikut:</p>
                        
                        <table className="w-full border-t border-b border-slate-200 py-2 my-4 text-left">
                          <tbody>
                            <tr>
                              <td className="py-2 text-slate-500 font-bold w-1/3">Komoditas:</td>
                              <td className="py-2 text-indigo-700 font-extrabold text-sm">{shipment.productName || 'Biji Kopi Gayo Organik Arabika (Green Beans)'}</td>
                            </tr>
                            <tr>
                              <td className="py-2 text-slate-500 font-bold">Volume Target:</td>
                              <td className="py-2 text-slate-900 font-extrabold text-sm">{negotiatedQty} Metrik Ton (MT)</td>
                            </tr>
                            <tr>
                              <td className="py-2 text-slate-500 font-bold">Harga Target:</td>
                              <td className="py-2 text-slate-900 font-extrabold text-sm">${negotiatedPrice} USD / Ton (Perkiraan Nilai Kontrak: ${(negotiatedQty * negotiatedPrice).toLocaleString('en-US')} USD)</td>
                            </tr>
                            <tr>
                              <td className="py-2 text-slate-500 font-bold">Ketentuan Kirim:</td>
                              <td className="py-2 text-slate-800 font-semibold">{selectedIncoterm}</td>
                            </tr>
                            <tr>
                              <td className="py-2 text-slate-500 font-bold">Ketentuan Bayar:</td>
                              <td className="py-2 text-slate-800 font-semibold">{selectedPayment}</td>
                            </tr>
                          </tbody>
                        </table>

                        <p className="leading-relaxed">Kami sangat menantikan tanggapan resmi berupa lembar penawaran harga (Quotation Sheet) dan draf Proforma Invoice untuk divalidasi dan ditandatangani bilateral.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeArchiveTab === 'pi' && (
                  <div className="text-left py-2 max-w-2xl mx-auto w-full space-y-3">
                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Arsip Dokumen PI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload('pi')}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                          title="Unduh draf asli format HTML mandiri"
                        >
                          <Download className="w-3 h-3" />
                          <span>Unduh HTML</span>
                        </button>
                      </div>
                    </div>

                    <div id="commercial-pi-paper" className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-5 sm:p-6 font-mono text-xs leading-relaxed relative shadow-lg overflow-x-auto">
                      <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3 text-xs text-slate-500">
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm tracking-wide">PT MULTI RAKSA MADANI</p>
                          <p>Komp. Ruko Harmoni Mas, Jakarta, Indonesia</p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-slate-900 text-sm">PROFORMA INVOICE (PI)</p>
                          <p>NOMOR: PI/MRM-DEUTSCH/2026/419</p>
                          <p>TANGGAL: 25 JUNI 2026</p>
                        </div>
                      </div>

                      <p className="text-center font-black text-slate-950 text-sm tracking-wider border-b border-slate-100 py-1 mb-3 uppercase">PROFORMA INVOICE FINAL / EKSPOR KOMODITAS</p>

                      <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                        <div>
                          <span className="text-slate-400 uppercase tracking-wider block font-bold text-[11px]">IMPORTIR (BUYER):</span>
                          <strong className="text-slate-900">{shipment.buyerCompany || 'Tokyo Coffee Trading Co.'}</strong>
                          <p className="text-slate-600">Shibuya, Tokyo, Japan</p>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase tracking-wider block font-bold text-[11px]">EKSPORTIR (SELLER):</span>
                          <strong className="text-slate-900">PT Multi Raksa Madani</strong>
                          <p className="text-slate-600">Komp. Ruko Harmoni Mas, Jakarta, Indonesia</p>
                        </div>
                      </div>

                      <table className="w-full border-t border-b border-slate-200 text-left mb-4 text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-550 font-extrabold border-b border-slate-200">
                            <th className="py-1.5 px-2">Komoditas &amp; Spesifikasi</th>
                            <th className="py-1.5 px-2 text-right">Volume</th>
                            <th className="py-1.5 px-2 text-right">Harga (USD)</th>
                            <th className="py-1.5 px-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-1.5 px-2">
                              <strong className="text-slate-950">{shipment.productName || 'Biji Kopi Gayo Organik (Green Beans)'}</strong>
                              <p className="text-xs text-slate-450">Premium Grade, Moisture Max 12%, Free of mold</p>
                            </td>
                            <td className="py-1.5 px-2 text-right">{negotiatedQty} MT</td>
                            <td className="py-1.5 px-2 text-right">${negotiatedPrice}</td>
                            <td className="py-1.5 px-2 text-right font-extrabold text-slate-950">${(negotiatedQty * negotiatedPrice).toLocaleString('en-US')} USD</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 border-b border-slate-100 pb-3 mb-3">
                        <p><strong>Ketentuan Kirim:</strong> {selectedIncoterm}</p>
                        <p><strong>Ketentuan Bayar:</strong> {selectedPayment}</p>
                      </div>

                      {/* Signatures Specimen Fields */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center flex flex-col items-center">
                          <span className="text-xs text-slate-400 uppercase font-semibold">Disahkan oleh Importir Jepang:</span>
                          <div className="w-full h-11 border border-slate-100 rounded-lg flex items-center justify-center bg-slate-50 relative mt-1">
                            <span className="font-serif italic text-base text-blue-700 font-bold tracking-tighter select-none">
                              Kenji Sato
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-bold">Tokyo Coffee Trading Co.</p>
                        </div>

                        <div className="text-center flex flex-col items-center">
                          <span className="text-xs text-slate-400 uppercase font-semibold">Disahkan oleh Eksportir Indonesia:</span>
                          <div className="w-full h-11 border border-slate-100 rounded-lg flex items-center justify-center bg-slate-50 relative mt-1">
                            <span className="font-serif italic text-base text-emerald-700 font-bold tracking-tighter select-none">
                              Prasetyo Adi
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-bold">PT Multi Raksa Madani</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : null}
        </div>

      </div>

      {/* Profile Counterpart Modal */}
        {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedProfile(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {selectedProfile === 'buyer' ? (
                <div>
                  <div className="flex items-center gap-4 border-b border-slate-200 pb-4 mb-5">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500 font-bold text-lg font-mono shrink-0">
                      HM
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-black text-slate-900">Kenji Sato</h3>
                        <span className="px-2 py-0.5 text-[8.5px] bg-indigo-50 text-indigo-700 font-mono font-black rounded-full uppercase tracking-wider">🇯🇵 Importir</span>
                      </div>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">Tokyo Coffee Trading Co.</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-3">
                      <div className="flex items-start gap-2.5">
                        <Building className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1">Perusahaan / Kantor</span>
                          <span className="text-slate-800 font-bold">Tokyo Coffee Trading Co.</span>
                          <span className="text-slate-600 block mt-1 leading-relaxed text-[11px]">Kaiserstraße 12, 60311 Frankfurt am Main, Japan</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200">
                        <User className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1">Perwakilan Hukum / Jabatan</span>
                          <span className="text-slate-800 font-bold">Kenji Sato</span>
                          <span className="text-slate-600 block text-[11px] mt-0.5">Chief Purchasing Officer / Importir Utama</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2.5">
                          <Mail className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1">Email Resmi</span>
                            <a href="mailto:kenji.s@tokyocoffee.co.jp" className="text-indigo-600 hover:underline font-medium break-all text-[11px]">kenji.s@tokyocoffee.co.jp</a>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <Phone className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1">Nomor Telepon</span>
                            <span className="text-slate-800 font-medium text-[11px]">+49 170 1234567</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-3">
                      <div className="flex items-start gap-2.5">
                        <CreditCard className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1">Informasi Bank Pembayaran</span>
                          <span className="text-slate-800 font-bold">Deutsche Bank AG, Frankfurt</span>
                          <span className="text-slate-600 block font-mono mt-1 text-[10.5px]">IBAN: DE89 5007 0010 0123 4567 89</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 pt-2.5 border-t border-slate-200">
                        <Globe className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1">Registrasi Bea Cukai (EORI)</span>
                          <span className="text-slate-800 font-mono font-medium">DE12345678901234</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 border-b border-slate-200 pb-4 mb-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 font-bold text-lg font-mono shrink-0">
                      HK
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-black text-slate-900">Hendry Kurniawan</h3>
                        <span className="px-2 py-0.5 text-[8.5px] bg-emerald-50 text-emerald-700 font-mono font-black rounded-full uppercase tracking-wider">🇮🇩 Eksportir</span>
                      </div>
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5">PT Multi Raksa Madani</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-3">
                      <div className="flex items-start gap-2.5">
                        <Building className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1">Perusahaan / Kantor</span>
                          <span className="text-slate-800 font-bold">PT Multi Raksa Madani</span>
                          <span className="text-slate-600 block mt-1 leading-relaxed text-[11px]">Menara Sudirman, Lt. 18, CBD Jl. Jend. Sudirman Kav 60, Jakarta</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200">
                        <User className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1">Perwakilan Hukum / Jabatan</span>
                          <span className="text-slate-800 font-bold">Hendry Kurniawan</span>
                          <span className="text-slate-600 block text-[11px] mt-0.5">Senior Export-Import Specialist</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2.5">
                          <Mail className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1">Email Resmi</span>
                            <a href="mailto:hendry@nusantara-traders.com" className="text-emerald-600 hover:underline font-medium break-all text-[11px]">hendry@nusantara-traders.com</a>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <Phone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1">Nomor Telepon</span>
                            <span className="text-slate-800 font-medium text-[11px]">+62 811-2233-4455</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-3">
                      <div className="flex items-start gap-2.5">
                        <CreditCard className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1">Informasi Bank Penerima</span>
                          <span className="text-slate-800 font-bold">Bank Mandiri (Persero) Tbk, Cabang SBD Jakarta</span>
                          <span className="text-slate-600 block font-mono mt-1 text-[10.5px]">No. Rekening: 124-00-998877-6</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 pt-2.5 border-t border-slate-200">
                        <Globe className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-500 font-mono text-[9px] block uppercase font-bold leading-none mb-1">Nomor Induk Berusaha (NIB)</span>
                          <span className="text-slate-800 font-mono font-medium">912010998877</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer w-full text-center"
                >
                  Tutup Profil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      {/* Floating Live Chat Widget */}
      <motion.div 
        drag
        dragMomentum={false}
        className={`fixed z-50 bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isChatMinimized ? 'w-[300px] h-12 bottom-6 right-6' : 'w-[350px] h-[450px] bottom-6 right-6'}`}
      >
        {/* Chat Header (Draggable Handle) */}
        <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between cursor-move shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-100" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider leading-none mb-0.5">
                Live Chat
              </h4>
              <span className="text-[9px] font-bold text-emerald-200 flex items-center gap-1 animate-pulse leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                Terkoneksi
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsChatMinimized(!isChatMinimized)}
              className="p-1 hover:bg-emerald-500 rounded transition-colors cursor-pointer"
            >
              {isChatMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Chat Body */}
        {!isChatMinimized && (
          <div className="flex flex-col flex-1 overflow-hidden bg-slate-50">
            {/* Messages Container */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
              {chatMessages.map((msg) => {
                const isSystem = msg.sender === 'System';
                const isMe = msg.sender === activeSimulatedRole;

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-1">
                      <div className="bg-slate-200/80 border border-slate-300 rounded px-2 py-0.5 text-[10px] text-slate-600 font-mono text-center max-w-[90%]">
                        {msg.message}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex gap-2 max-w-[90%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    <span className="text-base select-none mt-1 shrink-0">{msg.avatar}</span>
                    <div>
                      <div className={`px-3 py-2 rounded-xl text-xs shadow-xs leading-relaxed ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}>
                        <p className="font-bold text-[10px] opacity-80 mb-0.5">{msg.senderName}</p>
                        <p className="font-sans whitespace-pre-line">{msg.message}</p>
                      </div>
                      <p className={`text-[9px] text-slate-400 font-mono mt-1 ${isMe ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex gap-2 mr-auto items-center animate-pulse">
                  <span className="text-[11px] bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-400 font-bold flex items-center gap-1 font-mono">
                    Sedang mengetik...
                  </span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kirim pesan..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shadow-emerald-100 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
