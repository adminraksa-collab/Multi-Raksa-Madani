import React, { useState, useEffect } from 'react';
import { ExportShipment, UserProfile, ShipmentStep, UserRole } from '../types';
import { WORKFLOW_STEPS, mockUsers } from '../mockData';
import { 
  Shield, Briefcase, ShoppingBag, Truck, Leaf, 
  CheckCircle, ArrowRight, Info, AlertCircle, 
  Award, FileText, Anchor, Compass, UserCheck, Play, 
  Layers, ChevronRight, Check, Sparkles, Send, FileDown,
  X, BookOpen, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, RefreshCw,
  Lock, Trash2, Paperclip, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// No VesselGPSMap import
import CommercialNegotiationGateway from './CommercialNegotiationGateway';

interface UnifiedStepInfo {
  stepId: string;
  step: ShipmentStep;
  label: string;
  description: string;
  actor: UserRole;
  expectedDuration: string;
  stepIcon: string;
  stage: 'negotiation' | 'logistics';
}

const UNIFIED_STEPS: UnifiedStepInfo[] = [
  {
    stepId: 'negotiation',
    step: 'Draft',
    label: 'Negosiasi & Kontrak',
    description: 'Penyusunan draf kontrak bilateral (LOI, MoU) & penandatanganan Proforma Invoice (PI) bersama.',
    actor: 'Trader',
    expectedDuration: '1-3 Hari',
    stepIcon: 'Draft',
    stage: 'negotiation'
  },
  {
    stepId: 'shipping',
    step: 'Shipping',
    label: 'Proses Logistik & L/C',
    description: 'Sourcing petani lokal, Bea Cukai (PEB/COO/Phyto), pengapalan samudra (B/L), dan pemenuhan dokumen L/C.',
    actor: 'Trader',
    expectedDuration: '20-30 Hari',
    stepIcon: 'Shipping',
    stage: 'logistics'
  },
  {
    stepId: 'completed',
    step: 'Completed',
    label: 'Selesai & Serah Terima',
    description: 'Bongkar muat kargo berhasil di pelabuhan Tokyo Jerman, serah terima kargo, dan penutupan transaksi.',
    actor: 'Buyer',
    expectedDuration: '1-2 Hari',
    stepIcon: 'Completed',
    stage: 'logistics'
  }
];

interface InteractiveInfographicProps {
  shipment: ExportShipment;
  currentUser: UserProfile | null;
  currentLanguage?: string;
  onSelectUser: (user: UserProfile) => void;
  onUpdateStep: (shipmentId: string, nextStep: ShipmentStep, comments: string) => void;
  onOpenDocumentEditor: () => void;
  onSimulateEvent: (type: 'ship-movement' | 'customs-approved' | 'phytosanitary-issued' | 'supplier-ready') => void;
  negoStepId?: number;
  onNegoStepIdChange?: (stepId: number) => void;
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
  autoOpenLoi?: boolean;
  onResetAutoOpenLoi?: () => void;
  targetStepIndex?: number;
  targetSubStepIndex?: number;
  onResetTargetStepIndices?: () => void;
}

export default function InteractiveInfographic({
  shipment,
  currentUser,
  currentLanguage,
  onSelectUser,
  onUpdateStep,
  onOpenDocumentEditor,
  onSimulateEvent,
  negoStepId,
  onNegoStepIdChange,
  onUpdateShipmentFromDeal,
  autoOpenLoi,
  onResetAutoOpenLoi,
  targetStepIndex,
  targetSubStepIndex,
  onResetTargetStepIndices
}: InteractiveInfographicProps) {
  
  // Index of the actual/real shipment progress step
  const getActualUnifiedIndex = () => {
    switch (shipment.currentStep) {
      case 'Draft': return 0;
      case 'Shipping': return 1;
      case 'Completed': return 2;
      default: return 0;
    }
  };

  const actualStepIndex = getActualUnifiedIndex();
  const isFullyCompleted = shipment.currentStep === 'Completed';

  // For Phase II: Logistics simulation tracking (0 = Sourcing, 1 = Customs, 2 = Shipping, 3 = L/C)
  const [activeLogisticsSubStep, setActiveLogisticsSubStep] = useState<number>(0);
  const [completedLogisticsSubSteps, setCompletedLogisticsSubSteps] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(`exportflow_completed_substeps_${shipment.id}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Calculate dynamic overall progress percentage
  const progressPercent = (() => {
    if (isFullyCompleted) return 100;
    if (actualStepIndex === 0) {
      const currentNegoId = negoStepId || 2;
      if (currentNegoId === 2) return 10;
      if (currentNegoId === 3) return 18;
      if (currentNegoId === 4) return 26;
      if (currentNegoId === 5) return 33;
      return 15;
    }
    if (actualStepIndex === 1) {
      const subCount = completedLogisticsSubSteps.length; // 0 to 4
      return Math.min(95, 33 + subCount * 15); // 33% to 93%
    }
    return 0;
  })();

  const [inspectedStepIndex, setInspectedStepIndex] = useState<number>(actualStepIndex);
  const activeStepActor = UNIFIED_STEPS[actualStepIndex]?.actor || 'Trader';
  const [selectedRole, setSelectedRole] = useState<UserRole>(activeStepActor);

  const [docFields, setDocFields] = useState<{[key: string]: string}>({});
  const [docSavedMessage, setDocSavedMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(`exportflow_completed_substeps_${shipment.id}`, JSON.stringify(completedLogisticsSubSteps));
  }, [completedLogisticsSubSteps, shipment.id]);

  interface SubStepFile {
    id: string;
    name: string;
    size: string;
    date: string;
    isDefault?: boolean;
    dataUrl?: string;
  }

  const INITIAL_SUBSTEP_FILES: {[key: number]: SubStepFile[]} = {
    0: [
      { id: 'def-0', name: 'Draf_Surat_Penyerahan_Bahan_Baku_Gayo.pdf', size: '284 KB', date: '26 Jun 2026', isDefault: true }
    ],
    1: [
      { id: 'def-1', name: 'Deklarasi_PEB_Bea_Cukai_Draft.pdf', size: '315 KB', date: '26 Jun 2026', isDefault: true }
    ],
    2: [
      { id: 'def-2', name: 'Draf_Bill_of_Lading_BL_Ocean_TJP.pdf', size: '412 KB', date: '26 Jun 2026', isDefault: true }
    ],
    3: [
      { id: 'def-3', name: 'Letter_of_Credit_Advising_Mandiri_Signed.pdf', size: '1.2 MB', date: '26 Jun 2026', isDefault: true }
    ]
  };

  const [uploadedSubStepFiles, setUploadedSubStepFiles] = useState<{[key: number]: SubStepFile[]}>(() => {
    try {
      const stored = localStorage.getItem(`exportflow_substep_files_${shipment.id}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SUBSTEP_FILES;
  });

  const [dragActive, setDragActive] = useState<{[key: number]: boolean}>({});
  const [subStepUploadError, setSubStepUploadError] = useState<{[key: number]: string | null}>({});

  useEffect(() => {
    localStorage.setItem(`exportflow_substep_files_${shipment.id}`, JSON.stringify(uploadedSubStepFiles));
  }, [uploadedSubStepFiles, shipment.id]);

  const handleUploadFile = (subStepIdx: number, file: File) => {
    setSubStepUploadError(prev => ({ ...prev, [subStepIdx]: null }));

    if (file.size > 2 * 1024 * 1024) {
      setSubStepUploadError(prev => ({ 
        ...prev, 
        [subStepIdx]: 'Gagal: Ukuran berkas melebihi batas maksimum 2MB.' 
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;
      
      const newFile: SubStepFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        size: sizeStr,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        dataUrl: reader.result as string
      };

      // Limit to exactly 1 file: replace any existing file
      setUploadedSubStepFiles(prev => ({
        ...prev,
        [subStepIdx]: [newFile]
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteFile = (subStepIdx: number, fileId: string) => {
    setSubStepUploadError(prev => ({ ...prev, [subStepIdx]: null }));
    setUploadedSubStepFiles(prev => ({
      ...prev,
      [subStepIdx]: (prev[subStepIdx] || []).filter(f => f.id !== fileId)
    }));
  };

  const downloadFile = (file: SubStepFile) => {
    if (file.dataUrl) {
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Create simulated download for default mock documents
      const content = `[DOKUMEN RESMI SIMULASI]\nNama Dokumen: ${file.name}\nUkuran: ${file.size}\nTanggal Validasi: ${file.date}\nStatus: Terverifikasi oleh Sistem Tata Kelola Ekspor`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.endsWith('.pdf') ? file.name : `${file.name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // On-page UI tab controls & configurations
  const [onPageTab, setOnPageTab] = useState<'details' | 'actions' | 'dictionary'>('actions');
  const [showEducation, setShowEducation] = useState<boolean>(true);
  const [dictionaryRole, setDictionaryRole] = useState<UserRole>('Trader');
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState<boolean>(true);
  const [isStepPopupOpen, setIsStepPopupOpen] = useState<boolean>(false);
  const [showCommercialArchive, setShowCommercialArchive] = useState<boolean>(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // Trigger auto-focus whenever the actual active step advances
  useEffect(() => {
    setInspectedStepIndex(actualStepIndex);
  }, [actualStepIndex]);

  useEffect(() => {
    // Synchronize selected sub-step with actual progress if needed, or default to 0
    if (actualStepIndex !== 1) {
      setActiveLogisticsSubStep(0);
    }
  }, [actualStepIndex]);

  // Automatically open the step details popup modal when autoOpenLoi is requested
  useEffect(() => {
    if (autoOpenLoi) {
      setInspectedStepIndex(0); // Draft is the first step (index 0)
      setIsStepPopupOpen(true);
    }
  }, [autoOpenLoi]);

  // Deep-linking target handling from Notification Center / Task List
  useEffect(() => {
    if (targetStepIndex !== undefined) {
      setInspectedStepIndex(targetStepIndex);
      if (targetSubStepIndex !== undefined) {
        setActiveLogisticsSubStep(targetSubStepIndex);
      }
      if (onResetTargetStepIndices) {
        onResetTargetStepIndices();
      }
    }
  }, [targetStepIndex, targetSubStepIndex, onResetTargetStepIndices]);

  useEffect(() => {
    // Generate default fields based on inspectedStepIndex & shipment
    const defaultFields: {[key: string]: string} = {};
    if (inspectedStepIndex === 0) {
      defaultFields.trxId = shipment.id;
    } else if (inspectedStepIndex === 1) {
      if (activeLogisticsSubStep === 0) {
        defaultFields.deliveryNo = 'DO/TRANSIT-GAYO/2026/889';
        defaultFields.supplier = shipment.supplierCompany || 'Koperasi Kopi Gayo Organik';
        defaultFields.receiver = 'Gudang Transit Utama PT Multi Raksa Madani';
        defaultFields.truckNo = 'B 9201 TXX';
        defaultFields.netMass = `${shipment.quantity * 1000} Kilogram (kg)`;
        defaultFields.condition = 'Kadar air tervalidasi 12% max, bebas jamur & hama parasit';
      } else if (activeLogisticsSubStep === 1) {
        defaultFields.pebNo = 'PEB-REG/BEACUKAI-TJP/2026/778';
        defaultFields.declarant = 'Hendry Kurniawan (PT Multi Raksa Madani)';
        defaultFields.hsCode = shipment.hsCode || '0901.11.10';
        defaultFields.fobValue = `$${shipment.totalValue.toLocaleString('id-ID')} USD`;
        defaultFields.currency = 'USD';
        defaultFields.loadingPort = shipment.portOfLoading;
      } else if (activeLogisticsSubStep === 2) {
        defaultFields.siNo = 'SI/SAMUDERA/2026/099';
        defaultFields.shipper = 'PT Multi Raksa Madani';
        defaultFields.consignee = shipment.buyerCompany || 'Tokyo Coffee Trading Co. (Kenji Sato)';
        defaultFields.vesselName = shipment.vesselName;
        defaultFields.destination = shipment.portOfDischarge;
        defaultFields.freightCharges = 'Freight Prepaid (Sistem CIF)';
      } else if (activeLogisticsSubStep === 3) {
        defaultFields.lcNo = 'LC-DEUTSCH/2026/9011';
        defaultFields.beneficiary = 'PT Multi Raksa Madani';
        defaultFields.advisingBank = 'Bank Mandiri (Persero) Tbk - Jakarta Cabang Thamrin';
        defaultFields.amount = `$${shipment.totalValue.toLocaleString('id-ID')} USD`;
        defaultFields.docRequiredList = 'Commercial Invoice, Packing List, Certificate of Origin, Bill of Lading, Phytosanitary Certificate';
      }
    } else if (inspectedStepIndex === 2) {
      defaultFields.lcNo = 'LC-DEUTSCH/2026/9011';
      defaultFields.beneficiary = 'PT Multi Raksa Madani';
      defaultFields.advisingBank = 'Bank Mandiri (Persero) Tbk - Jakarta Cabang Thamrin';
      defaultFields.amount = `$${shipment.totalValue.toLocaleString('id-ID')} USD`;
      defaultFields.docRequiredList = 'Commercial Invoice, Packing List, Certificate of Origin, Bill of Lading, Phytosanitary Certificate';
    } else {
      defaultFields.trxId = shipment.id;
    }
    
    setDocFields(defaultFields);
    setDocSavedMessage(null);
  }, [inspectedStepIndex, activeLogisticsSubStep, shipment]);

  const handleFieldChange = (key: string, val: string) => {
    setDocFields(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const getLetterheadData = (stepIdx: number, subStepIdx: number) => {
    switch (stepIdx) {
      case 0:
        return {
          name: 'PT MULTI RAKSA MADANI',
          address: 'Menara Karya Lt.12, Jalan HR. Rasuna Said Blok X-5 Kuningan, Jakarta Selatan • Telp: (021) 529-5000',
          subtitle: 'PORTAL TERPADU HUB PERDAGANGAN EKSPOR REPUBLIK INDONESIA'
        };
      case 1:
        if (subStepIdx === 0) {
          return {
            name: (shipment.supplierCompany || 'KOPERASI KOPI GAYO ORGANIK').toUpperCase(),
            address: 'Jalan Raya Takengon-Angkup, Pegasing, Aceh Tengah, Aceh • Telp: (0643) 21104',
            subtitle: 'SUPPLIER MITRA TANI & KOORDINATOR ALIANSI PERKEBUNAN RAKYAT'
          };
        } else if (subStepIdx === 1) {
          return {
            name: 'DIREKTORAT JENDERAL BEA DAN CUKAI - REPUBLIK INDONESIA',
            address: 'KPPBC Tipe Madya Pabean B Tanjung Priok, Jalan Nusantara No. 2, Jakarta Utara • Telp: (021) 439-0021',
            subtitle: 'SISTEM REKONSILIASI PABEAN ELEKTRONIK (CEISA - EKSPOR)'
          };
        } else if (subStepIdx === 2) {
          return {
            name: 'PT SAMUDERA LOGISTIK INDONESIA',
            address: 'Gedung Samudera Raya Lantai 3, Pelabuhan Belawan, Medan, Sumatera Utara • Telp: (061) 441-9000',
            subtitle: 'FORWARDING MULTINASIONAL & AGEN PELAYARAN LINTAS SAMUDRA'
          };
        } else {
          return {
            name: 'BANK MANDIRI (PERSERO) TBK',
            address: 'Plaza Mandiri, Jl. Jend. Gatot Subroto Kav. 36-38, Senayan, Jakarta Selatan • Telp: 14000',
            subtitle: 'ADVISING BANK - DIVISI PEMBIAYAAN PERDAGANGAN INTERNASIONAL (TRADE FINANCE)'
          };
        }
      case 2:
      default:
        return {
          name: (shipment.buyerCompany || 'TokyoCoffee IMPORT GMBH').toUpperCase(),
          address: 'Speicherstadt Sandtorkai 37, 20457 Tokyo, Germany • Telp: +49 40 3344-0',
          subtitle: 'IMPORTIR & DISTRIBUTOR RESMI KOMODITAS PANGAN EROPA'
        };
    }
  };

  const getDocMeta = (idx: number) => {
    switch (idx) {
      case 0:
        return {
          title: 'Kontrak Dagang & Surat Minat Pembelian',
          inputs: []
        };
      case 1:
        if (activeLogisticsSubStep === 0) {
          return {
            title: 'Surat Penyerahan Bahan Baku (Sourcing DO)',
            inputs: [
              { label: 'Nomor Delivery Order', key: 'deliveryNo' },
              { label: 'Supplier / Koperasi', key: 'supplier' },
              { label: 'Penerima Kargo', key: 'receiver' },
              { label: 'Nomor Armada Truk', key: 'truckNo' },
              { label: 'Massa Bersih Komoditas', key: 'netMass' },
              { label: 'Kondisi & Kualitas', key: 'condition' },
            ]
          };
        } else if (activeLogisticsSubStep === 1) {
          return {
            title: 'Pemberitahuan Ekspor Barang (PEB / Customs)',
            inputs: [
              { label: 'Nomor Registrasi PEB', key: 'pebNo' },
              { label: 'Eksportir Terdaftar', key: 'declarant' },
              { label: 'HS Code Komoditas', key: 'hsCode' },
              { label: 'Nilai Ekspor FOB (USD)', key: 'fobValue' },
              { label: 'Mata Uang Pembayaran', key: 'currency' },
              { label: 'Pelabuhan Muat Ekspor', key: 'loadingPort' },
            ]
          };
        } else if (activeLogisticsSubStep === 2) {
          return {
            title: 'Instruksi Pengapalan Pelayaran (Shipping Instruction)',
            inputs: [
              { label: 'Nomor SI Pelayaran', key: 'siNo' },
              { label: 'Pengirim Kargo', key: 'shipper' },
              { label: 'Penerima Kargo', key: 'consignee' },
              { label: 'Nama Kapal Pengangkut', key: 'vesselName' },
              { label: 'Pelabuhan Tujuan Bongkar', key: 'destination' },
              { label: 'Keterangan Ongkos', key: 'freightCharges' },
            ]
          };
        } else {
          return {
            title: 'Penyelesaian Letter of Credit (L/C Settlement)',
            inputs: [
              { label: 'Nomor L/C Kontrak', key: 'lcNo' },
              { label: 'Penerima Pembayaran (Beneficiary)', key: 'beneficiary' },
              { label: 'Bank Koresponden', key: 'advisingBank' },
              { label: 'Jumlah Nominal Pencairan', key: 'amount' },
              { label: 'Syarat Dokumen Bersih', key: 'docRequiredList' },
            ]
          };
        }
      case 2:
      default:
        return {
          title: 'Dokumen Serah Terima & Konfirmasi (Proof of Delivery)',
          inputs: [
            { label: 'Nomor L/C Kontrak', key: 'lcNo' },
            { label: 'Penerima Pembayaran (Beneficiary)', key: 'beneficiary' },
            { label: 'Bank Koresponden', key: 'advisingBank' },
            { label: 'Jumlah Nominal Pencairan', key: 'amount' },
            { label: 'Syarat Dokumen Bersih', key: 'docRequiredList' },
          ]
        };
    }
  };

  const getRoleTheme = (role: UserRole) => {
    switch (role) {
      case 'Superadmin': return {
        primary: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        badge: 'bg-purple-100 text-purple-800 border-purple-200',
        accentBg: 'bg-purple-600 hover:bg-purple-700',
        shadow: 'shadow-purple-100',
        gradient: 'from-purple-50 to-purple-100/40',
      };
      case 'Trader': return {
        primary: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        accentBg: 'bg-indigo-600 hover:bg-indigo-700',
        shadow: 'shadow-indigo-100',
        gradient: 'from-indigo-50 to-indigo-100/40',
      };
      case 'Buyer': return {
        primary: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        accentBg: 'bg-emerald-600 hover:bg-emerald-700',
        shadow: 'shadow-emerald-100',
        gradient: 'from-emerald-50 to-emerald-100/40',
      };
      case 'Forwarder': return {
        primary: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        accentBg: 'bg-amber-600 hover:bg-amber-700',
        shadow: 'shadow-amber-100',
        gradient: 'from-amber-50 to-amber-100/40',
      };
      case 'Supplier': return {
        primary: 'text-teal-600',
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        badge: 'bg-teal-100 text-teal-800 border-teal-200',
        accentBg: 'bg-teal-600 hover:bg-teal-700',
        shadow: 'shadow-teal-100',
        gradient: 'from-teal-50 to-teal-100/40',
      };
    }
  };

  const getRoleIcon = (role: UserRole, className: string = "w-4 h-4") => {
    switch (role) {
      case 'Superadmin': return <Shield className={className} />;
      case 'Trader': return <Briefcase className={className} />;
      case 'Buyer': return <ShoppingBag className={className} />;
      case 'Forwarder': return <Truck className={className} />;
      case 'Supplier': return <Leaf className={className} />;
    }
  };

  const getStepIcon = (step: string, className: string = "w-5 h-5") => {
    switch (step) {
      case 'Sparkles': return <Sparkles className={className} />;
      case 'UserCheck': return <UserCheck className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Anchor': return <Anchor className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'CheckCircle': return <CheckCircle className={className} />;
      case 'Draft': return <FileText className={className} />;
      case 'Sourcing': return <Layers className={className} />;
      case 'Verification': return <Award className={className} />;
      case 'Documents': return <FileText className={className} />;
      case 'Customs': return <Shield className={className} />;
      case 'Loading': return <Anchor className={className} />;
      case 'Shipping': return <Compass className={className} />;
      case 'Completed': return <CheckCircle className={className} />;
      default: return <FileText className={className} />;
    }
  };

  const getActorMeta = (role: UserRole) => {
    switch (role) {
      case 'Trader':
        return {
          title: 'Trader (Eksportir & Hub Dagang Utama)',
          company: 'PT Multi Raksa Madani',
          hak: [
            'Menerbitkan invoice komersial, packing list, serta pengisian lembar Certificate of Origin (COO) mandiri.',
            'Menunjuk logistik Forwarder & PPJK terpercaya pabean untuk mengatur stuffing kontainer pelabuhan.',
            'Menuntut verifikasi pencairan dana dari bank setelah menyerahkan berkas kargo bersih.'
          ],
          kewajiban: [
            'Menyusun Sales Contract komoditi yang tervalidasi harga FOB/CIF bersama Buyer Jerman.',
            'Melunasi biaya pabean kontainer & biaya administrasi pendaftaran Karantina Pertanian.',
            'Memastikan muatan yang disuplai oleh petani lokal memenuhi grade kadar kelembapan ekspor.'
          ],
          steps: ['Draft']
        };
      case 'Supplier':
        return {
          title: 'Supplier (Petani & Produsen Komoditi)',
          company: 'Kelompok Tani Gunung Gayo & Arang Nusantara',
          hak: [
            'Mendapatkan jaminan pembelian harga layak (Fairtrade pricing) & panjar dana awal operasional kebun.',
            'Memperoleh kuota kontainer ekspor berpendingin khusus dari Trader untuk pengiriman kargo basah.',
            'Mendapatkan bimbingan standardisasi kadar air agro-industri bebas pestisida kimia.'
          ],
          kewajiban: [
            'Merawat kualitas komoditi organik pasca-panen secara saksama.',
            'Melakukan sortir grade mutu kargo (Premium Grade A) bebas jamur.',
            'Mengirim komoditi hasil bumi menuju Gudang Transit Utama sesuai kesepakatan.'
          ],
          steps: ['Draft']
        };
      case 'Superadmin':
        return {
          title: 'Kepabeanan (Bea Cukai & Otoritas Pemerintah RI)',
          company: 'Direktorat Jenderal Bea dan Cukai Kemenkeu RI',
          hak: [
            'Melaksanakan karantina lab pabean acak & inspeksi fisik segel kontainer jalur merah ekspor.',
            'Menahan izin kargo kapal (Nota Pelayanan Ekspor / NPE) jika deklarasi HS Code salah tarif.',
            'Memblokir agen eksportir nakal jika melanggar kuota konservasi lingkungan hidup.'
          ],
          kewajiban: [
            'Memeriksa kesesuaian berkas PEB (Pemberitahuan Ekspor Barang) secara teliti.',
            'Menerbitkan sertifikasi NPE Hijau jika kargo klir pabean dalam 1x24 jam kerja.',
            'Memastikan produk ekspor yang dikapalkan bebas selundupan kargo mineral mentah ilegal.'
          ],
          steps: ['Draft']
        };
      case 'Forwarder':
        return {
          title: 'Forwarder (Logistik Multi-Moda & Syahbandar)',
          company: 'Samudera Kargo Internasional & PPJK Partner',
          hak: [
            'Menagih ongkos kirim kargo laut (Ocean Freight) sesuai kesepakatan kontainer (FCL/LCL).',
            'Menahan peluncuran kargo aseli jika tagihan operasional darat belum diselesaikan eksportir.',
            'Menyusun pengajuan waktu demorage dermaga kapal kontainer jika terjadi keterlambatan muat.'
          ],
          kewajiban: [
            'Menjemput logistik kargo dari gudang darat tuju dermaga pelabuhan asal Tanjung Priok.',
            'Melakukan pengemasan kargo laut (stuffing kargo kontainer) secara aman.',
            'Mengurus dokumen pabean pelayaran manifest & Bill of Lading (B/L) resmi kapal kargo.'
          ],
          steps: ['Shipping']
        };
      case 'Buyer':
        return {
          title: 'Buyer (Mitra Importir Internasional)',
          company: 'Tokyo Coffee Trading Co. & Co. KG (Munich, Germany)',
          hak: [
            'Meneri komoditas pangan/agro premium dalam kondisi prima tanpa cacat laut di pelabuhan tujuan.',
            'Meminta draf salinan berkas komersial ekspor asli guna tebus dokumen clearance pelabuhan eropa.',
            'Mengajukan tuntutan klaim asuransi laut jika terjadi kebocoran kontainer di atas dek samudera.'
          ],
          kewajiban: [
            'Melakukan pembayaran penuh secara aman.',
            'Membayar penuh sisa pelunasan barang setelah menerima draf konfirmasi manifest laut.',
            'Mengurus bea cukai impor clearance lokal di Pelabuhan Tokyo Jerman tepat waktu.'
          ],
          steps: ['Completed']
        };
    }
  };

  const executeStepProgression = (index: number) => {
    const targetStep = UNIFIED_STEPS[index];
    let nextStep: ShipmentStep = 'Draft';
    let defaultComments = '';
    
    switch (targetStep.step) {
      case 'Draft':
        nextStep = 'Shipping';
        defaultComments = 'Sales contract disahkan secara bilateral. Berlanjut ke proses logistik terpadu dan koordinasi pencairan L/C.';
        break;
      case 'Shipping':
        nextStep = 'Completed';
        defaultComments = 'Seluruh rangkaian logistik terpadu selesai, L/C dicairkan oleh Bank, dan kapal berlabuh di Tokyo Jerman.';
        break;
      case 'Completed':
        nextStep = 'Completed';
        defaultComments = 'Penerimaan kargo dikonfirmasi resmi oleh Buyer di pelabuhan Tokyo Jerman. Pembayaran ekspor tuntas sempurna!';
        break;
    }
    
    onUpdateStep(shipment.id, nextStep, defaultComments);
    
    // Auto-inspect the next step in UI
    const nextInspectIndex = index === UNIFIED_STEPS.length - 1 ? UNIFIED_STEPS.length - 1 : index + 1;
    setInspectedStepIndex(nextInspectIndex);
    setOnPageTab('actions');
  };

  const isCurrentActiveStep = inspectedStepIndex === actualStepIndex;
  const isStepCompleted = inspectedStepIndex < actualStepIndex || isFullyCompleted;
  const isStepFuture = inspectedStepIndex > actualStepIndex && !isFullyCompleted;
  const activeInspectedStep = UNIFIED_STEPS[inspectedStepIndex];
  const isEmergencyTakeover = activeInspectedStep.actor === 'Trader' && currentUser?.role === 'Superadmin';
  const isLogisticsSimulationFullyCompleted = completedLogisticsSubSteps.length === 4;
  const isAuthorizedToClickCurrentInspected = 
    inspectedStepIndex === 1
      ? (isLogisticsSimulationFullyCompleted && (currentUser?.role === 'Trader' || currentUser?.role === 'Superadmin'))
      : (currentUser?.role === activeInspectedStep.actor || isEmergencyTakeover);

  const getStepGuide = (index: number) => {
    switch (index) {
      case 0:
        return {
          title: 'Fase I: Komersial & Negosiasi',
          subtitle: 'Kemitraan Dagang Bilateral Internasional',
          laymanAnalogy: 'Bagaikan tahap lamaran atau tawar-menawar harga mas kawin sebelum melangsungkan pesta pernikahan. Pembeli luar negeri mengirim LOI sebagai tanda minat serius, lalu kedua pihak menyepakati harga, volume kargo, sistem pengapalan (Incoterms), dan menandatangani Proforma Invoice (PI) bersama.',
          purpose: 'Menyepakati seluruh parameter komersial dan legalitas transaksi ekspor sebelum rantai pasok lokal dan logistik ekspor dijalankan.',
          actors: ['Buyer (Jerman)', 'Trader (Indonesia)'],
          badge: 'NEGOSIASI',
          docs: [
            { name: 'Letter of Intent (LOI)', desc: 'Surat ketertarikan resmi dari importir luar negeri untuk membeli komoditas.' },
            { name: 'Proforma Invoice (PI)', desc: 'Faktur sementara bilateral yang draf-nya disepakati dan ditandatangani basah oleh pembeli dan penjual.' }
          ]
        };
      case 1:
        return {
          title: 'Fase II: Logistik Terpadu & Pencairan L/C',
          subtitle: 'Sourcing, Kepabeanan, Pelayaran Samudra, dan Penyelesaian Finansial',
          laymanAnalogy: 'Bagaikan serangkaian estafet kargo dari hulu ke hilir: Supplier tani lokal memanen komoditas terbaik, Bea Cukai menyetujui izin ekspor barang, Forwarder mengangkut kontainer pabean melintasi samudera, dan dokumen lengkap perkapalan diperiksa bank penerbit L/C untuk mencairkan jaminan pembayaran eksportir.',
          purpose: 'Menjamin kelancaran penyediaan komoditas, clearance kepabeanan ekspor, mobilisasi kargo lintas laut, dan pencairan pembayaran L/C internasional secara berurutan dan aman.',
          actors: ['Supplier', 'Trader', 'Forwarder', 'Bank Koresponden'],
          badge: 'LOGISTIK & L/C',
          docs: [
            { name: 'Sourcing DO', desc: 'Surat penyerahan bahan baku dari koperasi pertanian ke gudang eksportir.' },
            { name: 'Pemberitahuan Ekspor Barang (PEB)', desc: 'Deklarasi pabean Bea Cukai yang menerbitkan Nota Pelayanan Ekspor (NPE).' },
            { name: 'Bill of Lading (B/L)', desc: 'Tanda terima pengapalan samudra dan bukti kepemilikan kargo di atas kapal.' },
            { name: 'L/C Settlement Doc', desc: 'Sertifikat kelayakan dokumen bersih yang ditukar dengan pembayaran L/C dari bank pembuka.' }
          ]
        };
      case 2:
      default:
        return {
          title: 'Fase III: Selesai & Serah Terima',
          subtitle: 'Bongkar Muat Kargo & Konfirmasi Penerimaan Komoditas',
          laymanAnalogy: 'Bagaikan menerima paket kiriman barang di depan rumah Anda lalu menandatangani resi penerimaan kurir. Setelah berlayar ribuan mil, kapal berlabuh di Pelabuhan Tokyo, Jerman. Kargo diturunkan, dibongkar pabean setempat, dan diserahkan secara resmi kepada Buyer Jerman dalam kondisi prima.',
          purpose: 'Menyelesaikan siklus transaksi dagang internasional secara paripurna dengan penyerahan kargo fisik dan pencatatan riwayat sukses di sistem ekspor.',
          actors: ['Buyer Jerman', 'Pelabuhan Tokyo'],
          badge: 'SELESAI',
          docs: [
            { name: 'Proof of Delivery (POD)', desc: 'Berita acara serah terima kargo resmi di pelabuhan tujuan yang ditandatangani Buyer.' }
          ]
        };
    }
  };

  const handleDownloadRealFile = () => {
    setIsDownloading(true);
    setDocSavedMessage(null);
    
    setTimeout(() => {
      try {
        const meta = getDocMeta(inspectedStepIndex);
        const title = meta.title;
        const lh = getLetterheadData(inspectedStepIndex, activeLogisticsSubStep);
        
        let customRowsHtml = '';
        meta.inputs.forEach(inp => {
          const val = docFields[inp.key] || '-';
          customRowsHtml += `
            <tr>
              <td class="label">${inp.label}</td>
              <td class="value">${val}</td>
            </tr>
          `;
        });
        
        const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title} - PT Multi Raksa Madani</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:ital,wght@1,800&family=JetBrains+Mono:wght@500;800&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background: #f1f5f9;
      margin: 0;
      padding: 40px;
      display: flex;
      justify-content: center;
    }
    .paper {
      background: white;
      border: 1px solid #cbd5e1;
      width: 100%;
      max-width: 800px;
      min-height: 1050px;
      box-sizing: border-box;
      padding: 60px;
      position: relative;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
    }
    .double-border-1 {
      position: absolute;
      top: 15px;
      bottom: 15px;
      left: 15px;
      right: 15px;
      border: 1px solid #e2e8f0;
      pointer-events: none;
    }
    .double-border-2 {
      position: absolute;
      top: 20px;
      bottom: 20px;
      left: 20px;
      right: 20px;
      border: 1px solid #cbd5e1;
      pointer-events: none;
    }
    .watermark {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 56px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      color: rgba(15, 23, 42, 0.02);
      transform: rotate(-32deg);
      user-select: none;
      pointer-events: none;
    }
    .letterhead {
      border-bottom: 4px double #0f172a;
      text-align: center;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .letterhead h1 {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 900;
      margin: 0 0 5px 0;
      letter-spacing: 2px;
      color: #0f172a;
    }
    .letterhead p {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #64748b;
      margin: 0;
      letter-spacing: 1px;
    }
    .letterhead .sub-logo {
      font-size: 9px;
      font-weight: 800;
      color: #4f46e5;
      margin-top: 5px;
    }
    .doc-title {
      text-align: center;
      margin-bottom: 25px;
    }
    .doc-title h2 {
      font-size: 14px;
      font-weight: 800;
      text-decoration: underline;
      margin: 0 0 5px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .doc-title p {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #94a3b8;
      margin: 0;
    }
    .intro {
      font-size: 11px;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #f8fafc;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 10px;
      text-align: left;
    }
    td {
      border: 1px solid #cbd5e1;
      padding: 10px;
      font-size: 11px;
      color: #334155;
    }
    td.label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5px;
      color: #64748b;
      width: 40%;
      text-transform: uppercase;
      font-weight: 800;
    }
    td.value {
      font-weight: 800;
      color: #0f172a;
    }
    .legal-clause {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 15px;
      font-size: 9.5px;
      line-height: 1.5;
      color: #475569;
      margin-bottom: 40px;
    }
    .footer-stamp-area {
      border-top: 1px dashed #cbd5e1;
      padding-top: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .left-stamp-box {
      font-size: 9px;
      color: #64748b;
      line-height: 1.6;
    }
    .left-stamp-box strong {
      color: #334155;
    }
    .right-signature-box {
      width: 250px;
      text-align: center;
    }
    .signature-title {
      font-size: 9px;
      text-transform: uppercase;
      color: #94a3b8;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    .simulated-signature {
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .stamp-overlay {
      position: absolute;
      border: 2px dashed rgba(59, 130, 246, 0.75);
      border-radius: 50%;
      width: 68px;
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(15deg);
      background: rgba(255, 255, 255, 0.7);
    }
    .stamp-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 6px;
      font-weight: 800;
      color: rgba(59, 130, 246, 0.75);
      text-align: center;
      line-height: 1.2;
    }
    .authorized-name {
      font-family: 'Playfair Display', serif;
      font-size: 13px;
      font-weight: 900;
      color: #0f172a;
      text-decoration: underline;
      margin: 10px 0 2px 0;
    }
    .authorized-details {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      color: #64748b;
      margin: 0;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="paper">
    <div class="double-border-1"></div>
    <div class="double-border-2"></div>
    <div class="watermark">OFFICIAL SPECIMEN</div>
    
    <div class="letterhead">
      <h1>${lh.name}</h1>
      <p>${lh.address}</p>
      <div class="sub-logo">${lh.subtitle}</div>
    </div>
    
    <div class="doc-title">
      <h2>${title}</h2>
      <p>VALIDATION CODE: GEXP-KODE-PABEAN-${Date.now().toString().slice(-4)}</p>
    </div>
    
    <div class="intro">
      Berdasarkan Peraturan Pemerintah Republik Indonesia serta Protokol Logistik Ekspor pabean internasional, dengan ini dokumen ekspor sah berikut diterbitkan demi kelancaran rantai suplai global:
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Parameter Berkas Hukum</th>
          <th>Isian Terdaftar</th>
        </tr>
      </thead>
      <tbody>
        ${customRowsHtml}
      </tbody>
    </table>
    
    <div class="legal-clause">
      <strong>PERNYATAAN AKREDITASI MULTI-PIHAK:</strong><br>
      Dokumen ini dibuat dan divalidasi langsung dalam sistem interkoneksi logistik ekspor <strong>PT Multi Raksa Madani</strong> berbasis enkripsi pengesahan digital terdistribusi. Seluruh data di atas terekam dalam log pabean nasional berstempel waktu nyata demi menjaga transparansi alur suplai.
    </div>
    
    <div class="footer-stamp-area">
      ${inspectedStepIndex === 0 ? `
        <div class="left-signature-box" style="width: 240px; text-align: center;">
          <div class="signature-title">Pihak Pembeli (Buyer/Importer):</div>
          <div class="simulated-signature">
            <div class="stamp-overlay" style="border-color: rgba(16, 185, 129, 0.75);">
              <div class="stamp-text" style="color: rgba(16, 185, 129, 0.75);">
                IMPORT<br>
                APPROVED<br>
                GERMANY
              </div>
            </div>
            <span style="font-family: 'Cinzel', serif; font-size: 24px; color: #047857; font-style: italic; font-weight: bold; transform: rotate(5deg); opacity: 0.85; margin-left: 15px; letter-spacing: -1.5px;">
              HM
            </span>
          </div>
          <p class="authorized-name">Kenji Sato</p>
          <p class="authorized-details">Procurement Director (Tokyo Coffee Trading Co.)</p>
        </div>
        
        <div class="left-stamp-box" style="text-align: center; align-self: center; margin-bottom: 10px;">
          <p><strong>Metode Verifikasi:</strong> ENKRIPSI AES-256 DIGITAL</p>
          <p><strong>Status Kontrak:</strong> DOUBLE SIGNED &amp; VALIDATED</p>
          <p style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #94a3b8; margin-top: 4px;">HASH-ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString().slice(-4)}</p>
        </div>

        <div class="right-signature-box" style="width: 240px; text-align: center;">
          <div class="signature-title">Pihak Penjual (Exporter/Seller):</div>
          <div class="simulated-signature">
            <div class="stamp-overlay">
              <div class="stamp-text">
                METROLOGI<br>
                EKSPOR<br>
                PASSED DEPT
              </div>
            </div>
            <span style="font-family: 'Cinzel', serif; font-size: 24px; color: #1e3a8a; font-style: italic; font-weight: bold; transform: rotate(-5deg); opacity: 0.85; margin-right: 15px; letter-spacing: -1.5px;">
              ${currentUser?.name ? currentUser.name.split(' ').map(n => n.charAt(0)).join('') : 'HK'}
            </span>
          </div>
          <p class="authorized-name">${currentUser?.name || 'Hendry Kurniawan'}</p>
          <p class="authorized-details">${currentUser?.role || 'Trader'} (${currentUser?.companyName || 'PT Multi Raksa Madani'})</p>
        </div>
      ` : `
        <div class="left-stamp-box">
          <p><strong>Metode Verifikasi:</strong> ENKRIPSI AES-256 DIGITAL</p>
          <p><strong>Status Muatan:</strong> PASSED &amp; RELEASED BEACUKAI</p>
          <p style="font-family: 'JetBrains Mono', monospace; font-size: 9.5px; color: #94a3b8; margin-top: 6px;">HASH-ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString().slice(-4)}</p>
        </div>
        
        <div class="right-signature-box">
          <div class="signature-title">Menyatakan secara sah, penerbit wewenang:</div>
          <div class="simulated-signature">
            <div class="stamp-overlay">
              <div class="stamp-text">
                METROLOGI<br>
                EKSPOR<br>
                PASSED DEPT
              </div>
            </div>
            <span style="font-family: 'Cinzel', serif; font-size: 24px; color: #1e3a8a; font-style: italic; font-weight: bold; transform: rotate(-5deg); opacity: 0.85; margin-right: 15px; letter-spacing: -1.5px;">
              ${currentUser?.name ? currentUser.name.split(' ').map(n => n.charAt(0)).join('') : 'HK'}
            </span>
          </div>
          <p class="authorized-name">${currentUser?.name || 'Hendry Kurniawan'}</p>
          <p class="authorized-details">${currentUser?.role || 'Trader'} (${currentUser?.companyName || 'PT Multi Raksa Madani'})</p>
        </div>
      `}
    </div>
    
  </div>
  
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;
        
        let printIframe = document.getElementById('quiet-print-frame') as HTMLIFrameElement;
        if (!printIframe) {
          printIframe = document.createElement('iframe');
          printIframe.id = 'quiet-print-frame';
          printIframe.style.position = 'fixed';
          printIframe.style.right = '0';
          printIframe.style.bottom = '0';
          printIframe.style.width = '0px';
          printIframe.style.height = '0px';
          printIframe.style.border = 'none';
          document.body.appendChild(printIframe);
        }
        
        const doc = printIframe.contentDocument || printIframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(htmlContent);
          doc.close();
        }

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/[\/\\?%*:|"<>\s]+/g, '_')}_RESMI.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setIsDownloading(false);
        setDocSavedMessage(`Sukses mencetak & mengunduh berkas fisik resmi ekspor: "${title}_RESMI.html"! Buka berkas HTML tersebut dari perangkat Anda untuk otomatis meluncurkan dialog cetak/PDF berdesain resmi!`);
      } catch (err) {
        console.error(err);
        setIsDownloading(false);
      }
    }, 1000)  };  return (
    <div className="space-y-6">
      
      {/* Conveyor stepper belt pipeline */}
      <div className="bg-white rounded-2xl border border-slate-150 p-4 sm:p-5 shadow-xs relative">

        {/* Single, continuous horizontal conveyor stepper belt without nested box-cards */}
        <div className="relative py-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <div className="min-w-[1080px] relative px-4 pb-2">
            
            {/* Low-profile, borderless phase header row */}
            <div className="border-b border-slate-150 pb-2 mb-4 flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Alur Proses Dagang &amp; Logistik Ekspor Terpadu (3 Langkah)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-250 px-2.5 py-0.5 rounded-full shadow-3xs">
                  <span className="text-[9.5px] text-indigo-600 font-extrabold uppercase font-sans">Progres:</span>
                  <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden shrink-0">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10.5px] font-mono font-black text-indigo-700">{progressPercent}%</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">ALUR TRANS-NASIONAL UTUH</span>
              </div>
            </div>

            {/* Steps and Product Details Layout */}
            <div className="grid grid-cols-4 gap-6 relative z-10 items-stretch">
              
              {/* Product Info Card (Column 1) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-3xs h-full relative overflow-hidden transition-all hover:shadow-2xs hover:border-slate-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 font-sans">Kargo Transaksi</span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 line-clamp-2 leading-snug tracking-tight">
                      {shipment.productName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] font-mono font-black px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-150 text-indigo-700 inline-block">
                        {shipment.contractNumber}
                      </span>
                      <span className="text-[11px] font-mono font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-150 uppercase animate-pulse inline-block">
                        {shipment.currentStep}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-2.5 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-semibold text-[11px] sm:text-xs">Volume Kargo:</span>
                      <span className="font-mono font-black text-slate-850 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] sm:text-xs">{shipment.quantity} {shipment.unit}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-semibold text-[11px] sm:text-xs">Total Nilai:</span>
                      <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] sm:text-xs">
                        ${shipment.totalValue.toLocaleString('id-ID')} {shipment.currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-semibold text-[11px] sm:text-xs">Incoterms:</span>
                      <span className="font-extrabold text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded text-[11px] sm:text-xs">{shipment.incoterms || 'FOB'}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-semibold text-[11px] sm:text-xs">Rute Ekspor:</span>
                      <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded max-w-[150px] truncate text-[11px] sm:text-xs" title={`${shipment.portOfLoading} → ${shipment.portOfDischarge}`}>
                        {shipment.portOfLoading.split(' ').pop()} → {shipment.portOfDischarge.split(' ').pop()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col span 3 for the steps, with its own track line and 3-step grid */}
              <div className="col-span-3 relative flex flex-col justify-center">
                
                {/* Single background track line spanning across all 3 steps */}
                <div className="absolute left-[16.67%] right-[16.67%] top-[36px] h-1 bg-slate-150 rounded-full overflow-hidden -z-10">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-700"
                    style={{ 
                      width: `${(actualStepIndex / (UNIFIED_STEPS.length - 1)) * 100}%` 
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 relative">
                  {UNIFIED_STEPS.map((st, idx) => {
                    const isPassed = isFullyCompleted ? true : idx < actualStepIndex;
                    const isActiveNow = isFullyCompleted ? false : idx === actualStepIndex;
                    const isBeingInspected = idx === inspectedStepIndex;
                    const isLocked = idx > actualStepIndex && !isFullyCompleted;
                    const isBuyerRestricted = currentUser?.role === 'Buyer' && idx === 1;
                    
                    let statusBorder = 'border-slate-300 bg-white text-slate-450';
                    if (isLocked) {
                      statusBorder = 'border-slate-200 bg-slate-50 text-slate-300';
                    } else if (isBuyerRestricted) {
                      statusBorder = 'border-amber-200 bg-amber-50/50 text-amber-600';
                    } else if (isPassed) {
                      statusBorder = 'border-emerald-500 bg-emerald-50 text-emerald-600';
                    } else if (isActiveNow) {
                      statusBorder = 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-4 ring-blue-100 shadow-md';
                    }
                    
                    return (
                      <div 
                        key={st.stepId}
                        onClick={() => {
                          if (isLocked) {
                            return; // Prevent clicking future/locked steps
                          }
                          
                          if (isBuyerRestricted) {
                            setAccessDeniedMessage(
                              "Akses Terbatas: Tahapan logistik & pemrosesan dokumen L/C merupakan ranah kerja internal eksportir (Trader, Forwarder, dan Supplier). Sebagai Buyer, Anda hanya dapat memantau estimasi progres melalui bilah kemajuan di atas."
                            );
                            return;
                          }

                          setInspectedStepIndex(idx);
                          setSelectedRole(UNIFIED_STEPS[idx].actor);
                          setOnPageTab('actions');
                          setIsStepPopupOpen(true);
                        }}
                        className={`flex flex-col items-center text-center relative focus:outline-none select-none group transition-all duration-200 transform ${
                          isLocked
                            ? 'cursor-not-allowed opacity-50'
                            : isBuyerRestricted
                              ? 'cursor-not-allowed'
                              : `cursor-pointer ${isBeingInspected ? 'scale-[1.05]' : 'hover:scale-[1.02]'}`
                        }`}
                      >
                        {/* Circle container */}
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all relative z-10 ${statusBorder} ${
                          isBeingInspected && !isLocked && !isBuyerRestricted ? 'ring-4 ring-indigo-500/30 border-indigo-500 bg-indigo-50 text-indigo-750 font-bold shadow-xs' : ''
                        }`}>
                          {isActiveNow && !isBuyerRestricted && (
                            <span className="absolute inset-0 rounded-full bg-blue-500/15 animate-ping" />
                          )}
                          {isLocked ? (
                            <Lock className="w-4 h-4 text-slate-300" />
                          ) : isBuyerRestricted ? (
                            <Lock className="w-4 h-4 text-amber-500" />
                          ) : getStepIcon(st.stepIcon, 'w-4.5 h-4.5')}
                          {isPassed && !isBuyerRestricted && (
                            <span className="absolute -top-1 -right-1 rounded-full bg-emerald-500 text-white p-0.5 border border-white flex items-center justify-center shadow-3xs z-20 animate-none">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </span>
                          )}

                          {/* Initials indicator badge */}
                          <span className={`absolute -bottom-1 -right-1 text-[7.5px] font-sans font-bold leading-none uppercase tracking-wider px-1 py-0.5 rounded-full border border-white shadow-3xs text-white z-20 ${
                            isLocked 
                              ? 'bg-slate-300'
                              : isBuyerRestricted
                                ? 'bg-amber-500'
                                : st.actor === 'Superadmin' 
                                  ? 'bg-purple-600' 
                                  : st.actor === 'Trader'
                                    ? 'bg-indigo-600'
                                    : st.actor === 'Buyer'
                                      ? 'bg-blue-600'
                                      : st.actor === 'Forwarder'
                                        ? 'bg-amber-600'
                                        : st.actor === 'Supplier'
                                          ? 'bg-teal-600'
                                          : 'bg-slate-800'
                          }`}>
                            {isBuyerRestricted ? 'LOCK' : st.actor === 'Superadmin' ? 'BC' : st.actor.substring(0, 3).toUpperCase()}
                          </span>
                        </div>

                        {/* Step Index Label */}
                        <span className="text-xs font-black uppercase tracking-wider font-mono mt-2.5 text-slate-500">
                          Langkah {idx + 1}
                        </span>

                        {/* Info label */}
                        <p className={`text-xs sm:text-sm leading-snug font-sans font-bold mt-1.5 max-w-[140px] min-h-[36px] line-clamp-2 ${
                          isBeingInspected && !isLocked && !isBuyerRestricted
                            ? 'text-indigo-750 font-extrabold' 
                            : isActiveNow && !isBuyerRestricted
                              ? 'font-extrabold text-blue-700' 
                              : 'text-slate-600 group-hover:text-slate-900'
                        }`}>
                          {st.label}
                        </p>

                        {/* Sub-label for completion status */}
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-[11px] sm:text-xs font-bold tracking-tight font-sans flex items-center gap-0.5 ${
                            isBuyerRestricted
                              ? 'text-amber-600 font-bold'
                              : isPassed
                                ? 'text-emerald-600 font-bold'
                                : isActiveNow
                                  ? 'text-blue-600 font-bold animate-pulse'
                                  : 'text-slate-450'
                          }`}>
                            {isBuyerRestricted ? 'Hanya Pantau' : isPassed ? 'Selesai' : isActiveNow ? 'Aktif' : 'Belum Terbuka'}
                            {(isLocked || isBuyerRestricted) && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                          </span>
                          {isBeingInspected && !isLocked && !isBuyerRestricted && (
                            <span className="w-1 h-1 rounded-full bg-indigo-600 animate-bounce" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace below conveyor belt when popup is closed removed for cleaner, consolidated popup-only experience */}

      {/* Workspace split layout inside Modal Popup */}
      <AnimatePresence>
        {isStepPopupOpen && (
          <div 
            onClick={() => setIsStepPopupOpen(false)}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 overflow-y-auto"
          >
            <motion.div 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-7xl bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="px-4 py-3 flex items-center justify-between shrink-0 select-none border-b bg-white text-slate-900 border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 text-xs font-mono font-black uppercase tracking-wider rounded bg-indigo-600 text-white shrink-0">
                    LANGKAH {inspectedStepIndex + 1} / 3
                  </span>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-black text-2xl sm:text-3xl tracking-tight leading-tight text-slate-900">
                      {UNIFIED_STEPS[inspectedStepIndex].label}
                    </h3>
                    {inspectedStepIndex === 0 ? (
                      <div id="nego-header-addon" className="flex items-center gap-3 flex-wrap ml-3" />
                    ) : (
                      <>
                        <span className="text-xs font-sans text-slate-500">
                          • Penanggung Jawab: <strong className="text-slate-800 font-semibold">{UNIFIED_STEPS[inspectedStepIndex].actor}</strong>
                        </span>
                        <span className="text-xs font-sans hidden sm:inline text-slate-500">
                          • Durasi: <strong className="text-slate-800 font-semibold">{UNIFIED_STEPS[inspectedStepIndex].expectedDuration}</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setIsStepPopupOpen(false)}
                  className="p-1 rounded-lg transition-all focus:outline-none cursor-pointer shrink-0 ml-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 bg-white">
                {inspectedStepIndex === 0 ? (
                  <div className="w-full animate-fadeIn max-w-5xl mx-auto py-2">
                    <CommercialNegotiationGateway
                      key={shipment.id}
                      shipment={shipment}
                      currentUser={currentUser}
                      currentLanguage={currentLanguage}
                      onUpdateShipmentFromDeal={onUpdateShipmentFromDeal}
                      onSelectUser={onSelectUser}
                      isArchiveMode={shipment.currentStep !== 'Draft'}
                    />
                  </div>
                ) : (
                  <>


                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {inspectedStepIndex === 1 && (
                        <div className="lg:col-span-12 bg-slate-900 border border-slate-800 p-5 rounded-2xl relative shadow-md space-y-4 text-white">
                          {/* Detail role task simulation box */}
                          {(() => {
                            const subDetails = [
                              {
                                title: 'Fase Sourcing: Panen & Pengangkutan Darat Komoditas Agro',
                                role: 'Supplier (Koperasi Tani Lokal)',
                                desc: 'Sebagai Supplier, tanggung jawab Anda adalah melakukan QC terhadap biji kopi gayo premium dari petani lokal, mengemasnya ke dalam karung goni ekspor, dan menyerahkannya ke gudang utama penampungan Trader. Isi formulir Delivery Order (DO) di bawah ini sebagai draf serah terima fisik barang.',
                                btnText: 'Tandatangani DO & Selesaikan Sourcing Tani',
                                event: 'supplier-ready' as const,
                                successMsg: 'Sourcing Sukses! Komoditas tani telah tervalidasi masuk ke gudang utama eksportir.'
                              },
                              {
                                title: 'Fase Kepabeanan: Deklarasi Dokumen Pemberitahuan Ekspor Barang (PEB)',
                                role: 'Trader (Eksportir & Pengurus Dokumen)',
                                desc: 'Sebagai Trader, Anda bertugas melaporkan nilai muatan pabean ekspor, HS Code komoditas, dan Pelabuhan Muat secara presisi ke Sistem Bea Cukai Republik Indonesia. Lengkapi isian formulir deklarasi PEB di bawah ini, lalu terbitkan dokumen Nota Pelayanan Ekspor (NPE) resmi.',
                                btnText: 'Deklarasikan PEB & Terbitkan NPE Bea Cukai',
                                event: 'customs-approved' as const,
                                successMsg: 'Nota Pelayanan Ekspor (NPE) Terbit! Bea Cukai menyetujui izin clearance pengapalan barang.'
                              },
                              {
                                title: 'Fase Pelayaran: Stuffing Kontainer & Penerbitan Bill of Lading (B/L)',
                                role: 'Forwarder (Logistik & Agen Pelayaran Laut)',
                                desc: 'Sebagai Forwarder, Anda bertanggung jawab mengemas kargo laut (stuffing) ke dalam kontainer baja berstandar internasional, menempelkan segel pabean resmi, dan mengoordinasikan jadwal pelayaran rute lintas benua menuju Port of Tokyo Jerman. Isi manifes draf Bill of Lading (B/L) pelayaran di bawah ini.',
                                btnText: 'Terbitkan Bill of Lading & Berangkatkan Kapal',
                                event: 'ship-movement' as const,
                                successMsg: 'Kapal Kargo Berangkat! Bill of Lading (B/L) resmi pelayaran samudera berhasil diterbitkan.'
                              },
                              {
                                title: 'Fase Finansial: Presentasi Berkas Dokumen Bersih & Pencairan L/C',
                                role: 'Bank Koresponden & Buyer Jerman',
                                desc: 'Sebagai Bank/Buyer, Anda memvalidasi keaslian dokumen perkapalan (Bill of Lading asli, PEB, Phytosanitary, COO) yang diajukan eksportir. Jika seluruh syarat jaminan Letter of Credit (L/C) terpenuhi dengan bersih tanpa cacat dokumen (Clean Presentation), Bank langsung mencairkan dana pembayaran ekspor ekspor ke rekening eksportir.',
                                btnText: 'Verifikasi Dokumen Bersih & Cairkan Dana L/C',
                                event: null,
                                successMsg: 'Letter of Credit Sukses Dicairkan! Dana pembayaran ekspor telah aman ditransfer penuh ke Bank eksportir.'
                              }
                            ][activeLogisticsSubStep];

                            const isCurrentSubDone = completedLogisticsSubSteps.includes(activeLogisticsSubStep);
                            const isPreviousStepsDone = Array.from({ length: activeLogisticsSubStep }, (_, i) => i).every(i => completedLogisticsSubSteps.includes(i));
                            
                            return (
                              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                                {/* Compact Linear Progress Step Indicator */}
                                <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 pb-2.5 border-b border-slate-200 mb-1">
                                  {[
                                    { label: 'Sourcing Tani', role: 'Supplier' },
                                    { label: 'Bea Cukai PEB', role: 'Trader' },
                                    { label: 'Pelayaran B/L', role: 'Forwarder' },
                                    { label: 'Pencairan L/C', role: 'Bank' }
                                  ].map((stepInfo, idx) => {
                                    const isDone = completedLogisticsSubSteps.includes(idx);
                                    const isActive = activeLogisticsSubStep === idx;
                                    return (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                          setActiveLogisticsSubStep(idx);
                                          setSelectedRole(stepInfo.role as UserRole);
                                        }}
                                        className={`flex-1 min-w-[100px] py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                                          isActive
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs'
                                            : isDone
                                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                        }`}
                                      >
                                        <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider font-mono">
                                          {idx + 1}. {stepInfo.label}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                                  <div>
                                    <h5 className="font-black text-sm sm:text-base text-slate-900 tracking-tight">
                                      {subDetails.title}
                                    </h5>
                                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                                      Bertindak Sebagai: <strong className="text-indigo-600 font-bold">{subDetails.role}</strong>
                                    </p>
                                  </div>
                                  <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                    isCurrentSubDone 
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                      : isPreviousStepsDone 
                                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 animate-pulse'
                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                  }`}>
                                    {isCurrentSubDone ? 'SELESAI' : isPreviousStepsDone ? 'AKTIF' : 'MENUNGGU'}
                                  </span>
                                </div>

                                <p className="text-sm text-slate-700 leading-relaxed font-sans">
                                  {subDetails.desc}
                                </p>

                                {/* Section: Lampiran Dokumen Sub-Tahap */}
                                <div className="border-t border-slate-200 pt-3.5 mt-3.5 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-900">
                                      <Paperclip className="w-4 h-4 text-indigo-500" />
                                      <span>Dokumen Lampiran ({uploadedSubStepFiles[activeLogisticsSubStep]?.length || 0})</span>
                                    </div>
                                    <span className="text-[11px] sm:text-xs text-slate-500 font-mono">Maks: 1 Berkas / 2MB</span>
                                  </div>

                                  {/* Error message if file is too large */}
                                  {subStepUploadError[activeLogisticsSubStep] && (
                                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-semibold mt-2 text-left">
                                      {subStepUploadError[activeLogisticsSubStep]}
                                    </div>
                                  )}

                                  {/* File List */}
                                  {uploadedSubStepFiles[activeLogisticsSubStep]?.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2">
                                      {uploadedSubStepFiles[activeLogisticsSubStep].map(file => (
                                        <div 
                                          key={file.id} 
                                          className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                        >
                                          <button 
                                            onClick={() => downloadFile(file)}
                                            className="flex items-center gap-3 min-w-0 text-left hover:text-indigo-600 transition-colors group cursor-pointer flex-1"
                                            title="Unduh Berkas"
                                          >
                                            <FileText className="w-4.5 h-4.5 text-slate-500 group-hover:text-indigo-600 shrink-0" />
                                            <div className="truncate">
                                              <p className="font-bold text-slate-900 group-hover:underline truncate">{file.name}</p>
                                              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{file.size} • Diunggah {file.date}</p>
                                            </div>
                                          </button>
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              onClick={() => downloadFile(file)}
                                              className="p-1.5 hover:bg-slate-200 text-indigo-600 hover:text-indigo-700 rounded transition-all cursor-pointer"
                                              title="Unduh Dokumen"
                                            >
                                              <FileDown className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteFile(activeLogisticsSubStep, file.id)}
                                              className="p-1.5 hover:bg-slate-200 text-rose-600 hover:text-rose-700 rounded transition-all cursor-pointer"
                                              title="Hapus Dokumen"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-500 italic text-center py-2 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                      Belum ada dokumen yang diunggah.
                                    </div>
                                  )}

                                  {/* Drag & Drop Upload Zone */}
                                  {isPreviousStepsDone && (
                                    <div
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragActive(prev => ({ ...prev, [activeLogisticsSubStep]: true }));
                                      }}
                                      onDragLeave={(e) => {
                                        e.preventDefault();
                                        setDragActive(prev => ({ ...prev, [activeLogisticsSubStep]: false }));
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        setDragActive(prev => ({ ...prev, [activeLogisticsSubStep]: false }));
                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                          handleUploadFile(activeLogisticsSubStep, e.dataTransfer.files[0]);
                                        }
                                      }}
                                      className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                                        dragActive[activeLogisticsSubStep]
                                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                                          : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100'
                                      }`}
                                      onClick={() => {
                                        const input = document.getElementById(`substep-file-input-${activeLogisticsSubStep}`);
                                        if (input) input.click();
                                      }}
                                    >
                                      <input 
                                        type="file"
                                        id={`substep-file-input-${activeLogisticsSubStep}`}
                                        className="hidden"
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files[0]) {
                                            handleUploadFile(activeLogisticsSubStep, e.target.files[0]);
                                          }
                                        }}
                                      />
                                      <div className="flex flex-col items-center gap-1.5">
                                        <Upload className="w-6 h-6 text-indigo-500 animate-pulse" />
                                        <p className="text-xs sm:text-sm font-black text-slate-800">
                                          Tarik & letakkan berkas di sini, atau <span className="text-indigo-600 hover:underline">cari berkas</span>
                                        </p>
                                        <p className="text-[11px] sm:text-xs text-slate-500">Maksimum 2MB, hanya satu berkas (akan menggantikan berkas lama)</p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="pt-1">
                                  {isCurrentSubDone ? (
                                    <div className="space-y-3">
                                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>{subDetails.successMsg}</span>
                                      </div>
                                      {isLogisticsSimulationFullyCompleted && (
                                        <div className="mt-3 pt-2.5 border-t border-emerald-100 flex justify-end">
                                          <button
                                            onClick={() => executeStepProgression(inspectedStepIndex)}
                                            disabled={!isAuthorizedToClickCurrentInspected}
                                            className={`px-4 py-2 rounded-lg text-xs font-black tracking-wide shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                                              isAuthorizedToClickCurrentInspected
                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02]'
                                                : 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed'
                                            }`}
                                          >
                                            <UserCheck className="w-3.5 h-3.5" />
                                            Selesaikan &amp; Tanda Tangani Tahap Ini Resmi
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ) : !isPreviousStepsDone ? (
                                    <div className="bg-slate-50 border border-slate-200 text-slate-500 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                                      <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                      <span>Selesaikan sub-tahap sebelumnya terlebih dahulu untuk membuka kunci simulasi peran ini.</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setCompletedLogisticsSubSteps(prev => [...prev, activeLogisticsSubStep]);
                                        if (subDetails.event) {
                                          onSimulateEvent(subDetails.event);
                                        }
                                        if (activeLogisticsSubStep < 3) {
                                          setTimeout(() => {
                                            setActiveLogisticsSubStep(prev => prev + 1);
                                          }, 1500);
                                        }
                                      }}
                                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 hover:shadow-md text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Play className="w-3.5 h-3.5" />
                                      {subDetails.btnText}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
             
        {/* LEFT COMPONENT: Live Document Customizer & Paper Specimen Preview */}
        <div className="lg:col-span-12 border border-slate-200 bg-white p-6 rounded-2xl relative shadow-3xs max-w-full space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Live Editor Berkas &amp; Formulir Ekspor Resmi
              </h3>
              <p className="text-xs text-gray-400 font-sans">
                Lakukan pengisian draf formulir di bawah ini, lalu saksikan lembar fisik asli yang akan dicetak terbaharui seketika!
              </p>
            </div>
            
            <button
              onClick={handleDownloadRealFile}
              disabled={isDownloading}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              {isDownloading ? 'Menghimpun Berkas...' : 'Unduh'}
            </button>
          </div>

          {/* Dynamic properties form */}
          {(() => {
            const meta = getDocMeta(inspectedStepIndex);
            return (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                <span className="text-[10px] font-black text-slate-550 uppercase tracking-widest block border-b border-slate-200 pb-1.5">
                  Isian Pengenal Berkas: {meta.title} {isStepCompleted && <span className="ml-2 text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-normal">Diarsipkan</span>}
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {meta.inputs.map(inp => (
                    <div key={inp.key} className="space-y-1">
                      <label className="text-[10.5px] font-bold text-slate-705 text-slate-700 block tracking-tight">
                        {inp.label}
                      </label>
                      <input
                        type="text"
                        value={docFields[inp.key] || ''}
                        disabled={isStepCompleted}
                        onChange={(e) => handleFieldChange(inp.key, e.target.value)}
                        placeholder={isStepCompleted ? "Arsip berkas terkunci..." : "Ketik rincian isian..."}
                        className={`w-full text-xs border rounded px-2.5 py-1.5 shadow-3xs focus:outline-none transition-all font-sans ${
                          isStepCompleted ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-slate-900 border-slate-300 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400">
                  <span>{isStepCompleted ? "*Berkas resmi ini telah diterbitkan dan tidak dapat diubah." : "*Data tersimpan secara lokal ke memori browser Anda."}</span>
                  {!isStepCompleted ? (
                    <button
                      onClick={() => {
                        setDocSavedMessage('Konfigurasi draf berhasil dicadangkan!');
                        setTimeout(() => setDocSavedMessage(null), 3000);
                      }}
                      className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                    >
                      Simpan Draf Berkas
                    </button>
                  ) : (
                    <span className="text-gray-400 font-bold italic">Arsip Terkunci (Read-Only)</span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Toast feedback alerts */}
          <AnimatePresence>
            {docSavedMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-emerald-50 text-emerald-850 p-4 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs font-sans leading-relaxed text-slate-900"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="flex-1 font-medium">{docSavedMessage}</p>
                <button onClick={() => setDocSavedMessage(null)} className="text-slate-400 hover:text-slate-655 font-bold text-xs cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* HIGH-FIDELITY PRINT PAPER SHEETS EMBEDDED PREVIEW CONTAINER */}
          <div className="border border-slate-205 rounded-xl overflow-hidden shadow-2xs relative">
            
            <div className="bg-amber-50 text-amber-900 text-[10px] font-bold px-4 py-2 border-b border-amber-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
              <span>LOG HARIAN SIMULATOR EKSPOR: LEMBAR DRAF TIDAK DAPAT DISALAHGUNAKAN • DRAF ELEKTRONIK</span>
            </div>

            <div className="bg-slate-100 p-4 sm:p-8 flex justify-center overflow-x-auto">
              <div 
                className="bg-white border border-slate-300 relative text-slate-900 shadow-md font-sans p-6 sm:p-12 text-[11px] leading-relaxed select-text"
                style={{ 
                  width: '100%', 
                  maxWidth: '700px', 
                  minHeight: '820px', 
                  boxSizing: 'border-box' 
                }}
              >
                
                <div className="absolute top-[12px] bottom-[12px] left-[12px] right-[12px] border border-slate-200 pointer-events-none" />
                <div className="absolute top-[16px] bottom-[16px] left-[16px] right-[16px] border border-slate-150 pointer-events-none" />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                  <div className="text-[52px] font-bold text-slate-950/2 rotate-[324deg] font-mono select-none tracking-widest uppercase">
                    OFFICIAL SPECIMEN
                  </div>
                </div>

                <div className="relative z-10 space-y-6">
                  
                  <div className="border-b-4 border-double border-slate-900 pb-4 text-center space-y-1.5">
                    <h4 className="text-[15px] font-serif font-black tracking-widest uppercase text-slate-900 leading-snug">
                      {getLetterheadData(inspectedStepIndex, activeLogisticsSubStep).name}
                    </h4>
                    <p className="text-[8.5px] font-mono tracking-wider text-slate-400 font-bold">
                      {getLetterheadData(inspectedStepIndex, activeLogisticsSubStep).address}
                    </p>
                    <p className="text-[8.5px] font-mono tracking-widest text-indigo-700 font-black uppercase">
                      {getLetterheadData(inspectedStepIndex, activeLogisticsSubStep).subtitle}
                    </p>
                  </div>

                  <div className="text-center space-y-1 pt-1">
                    <span className="font-serif font-black text-xs underline uppercase block text-slate-900 tracking-wide">
                      {getDocMeta(inspectedStepIndex).title}
                    </span>
                    <span className="text-[8.5px] font-mono text-slate-400 block uppercase font-bold tracking-widest">
                      KODE TUNTAS VALIDASI EKSPOR: {shipment.trackingNumber || 'GEXP-COF-110295'}/ONLINE-E-DOC/{Date.now().toString().slice(-4)}
                    </span>
                  </div>

                  <p className="text-[10px] leading-relaxed text-slate-700 font-serif">
                    Berdasarkan Ketentuan &amp; Regulasi Ekspor-Impor Kementerian Perdagangan RI beserta Otoritas Kepabeanan Internasional, dengan ini diterbitkan dokumen resmi ekspor yang sah untuk siklus perdagangan luar negeri sebagai berikut:
                  </p>

                  <div className="border border-slate-300 rounded overflow-hidden animate-fade-in" key={inspectedStepIndex}>
                    <table className="w-full text-left text-[10.5px] border-collapse font-sans bg-slate-50/20">
                      <thead>
                        <tr className="border-b border-slate-300 bg-slate-50">
                          <th className="py-2 px-3 font-mono text-[8.5px] font-black uppercase text-slate-500 tracking-wider w-[45%]">
                            Parameter Legalitas Dokumen
                          </th>
                          <th className="py-2 px-3 font-mono text-[8.5px] font-black uppercase text-slate-500 tracking-wider w-[55%]">
                            Isian Terdaftar
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getDocMeta(inspectedStepIndex).inputs.map(inp => {
                          const val = docFields[inp.key] || '-';
                          return (
                            <tr key={inp.key} className="border-b border-slate-200">
                              <td className="py-2 px-3 text-[9.5px] font-mono text-slate-400 font-bold uppercase shrink-0">
                                {inp.label}
                              </td>
                              <td className="py-2 px-3 font-mono text-slate-800 font-black">
                                {val}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[9px] leading-relaxed font-serif text-slate-600">
                    <strong>PERNYATAAN AKREDITASI MULTI-PIHAK:</strong><br />
                    Dokumen ini dibuat dan divalidasi langsung dalam sistem interkoneksi logistik ekspor <strong>PT Multi Raksa Madani</strong> berbasis enkripsi pengesahan digital terdistribusi. Seluruh data di atas terekam dalam log pabean nasional berstempel waktu nyata demi menjaga transparansi alur suplai ekspor Republik Indonesia berganda.
                  </div>

                  <div className="border-t border-dashed border-slate-250 pt-5 grid grid-cols-2 gap-6 items-end mt-8">
                    
                    <div className="space-y-1.5 font-sans">
                      <div className="border border-slate-300 p-1.5 inline-block text-[7.5px] font-mono text-slate-400 leading-tight">
                        METODE DETEKSI VERIFIKASI: ENKRIPSI AES-256 SECURED<br />
                        [VALIDASI DIGITAL SERTIFIKAT TUNTAS]
                      </div>
                      <p className="text-[7.5px] text-slate-400 leading-normal font-sans">
                        Seluruh isian di atas draf legalitas sah yang diterbitkan secara elektronik demi kepentingan kepatuhan ekspor dari wilayah hukum Republik Indonesia.
                      </p>
                    </div>

                    <div className="text-center space-y-3 flex flex-col items-center shrink-0">
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider font-mono">
                        Lembar Tanda Tangan &amp; Cap Resmi:
                      </span>
                      
                      <div className="relative flex items-center justify-center">
                        <div className="border border-double border-blue-500/75 rounded-full px-4 py-1.5 font-mono text-[7px] font-black text-blue-500/75 tracking-widest uppercase rotate-2 bg-white/70 relative z-10">
                          VERIFIED SUBMITTED
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none scale-125 z-0">
                          ⭐ 📄 ⭐
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-[9.5px] font-serif font-black text-slate-900 underline">
                          {currentUser?.name || 'Hendry Kurniawan'}
                        </p>
                        <p className="text-[7px] font-mono text-slate-400 uppercase font-black">
                          Authorized Signer for {currentUser?.role || 'Trader'}
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* Quick instructions alert */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-2.5 items-start text-xs font-sans text-slate-700">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 mb-0.5">💡 Tips Cetak &amp; Simpan Dokumen Negara</p>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Gunakan tombol &quot;Unduh &amp; Cetak Resmi&quot; untuk menggenerate dokumen fisik asli. Berkas akan terunduh sebagai file HTML berformat media cetak standar. Setelah Anda membuka file tersebut, peramban Anda akan secara otomatis memicu dialog cetak halaman (Print to PDF) bersusun rapi letterhead pabean Indonesia!
              </p>
            </div>
          </div>

          {/* Section: Validasi & Tanda Tangan Resmi Tahap Ini */}
          <div className="mt-6 border-t border-slate-200 pt-6 space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              Verifikasi &amp; Tanda Tangan Resmi Tahap ini
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                      Aktor Penanggung Jawab
                    </span>
                    <span className="font-extrabold text-slate-800 text-xs">
                      {activeInspectedStep.actor === 'Superadmin' ? 'Bea Cukai' : activeInspectedStep.actor}
                    </span>
                  </div>
                  <span className="text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded">
                    {activeInspectedStep.actor === 'Superadmin' ? 'BC' : activeInspectedStep.actor.substring(0, 3).toUpperCase()}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                      Sesi Pengguna Aktif Anda
                    </span>
                    <span className="font-extrabold text-slate-800 text-xs">
                      {currentUser?.name || 'Belum Login'}
                    </span>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border capitalize ${
                    isAuthorizedToClickCurrentInspected
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-rose-50 text-rose-600 border-rose-200'
                  }`}>
                    {isAuthorizedToClickCurrentInspected ? '✓ Terotorisasi' : '⚠ Tidak Sesuai'}
                  </span>
                </div>

                {isEmergencyTakeover && (
                  <p className="text-[10px] text-amber-600 font-semibold italic mt-2">
                    ✓ Mode Darurat: Peran Superadmin diizinkan mengambil alih &amp; menandatangani tugas Trader.
                  </p>
                )}

                {!isAuthorizedToClickCurrentInspected && (
                  <p className="text-[10px] text-rose-600 italic mt-2 leading-relaxed">
                    {inspectedStepIndex === 1 && !isLogisticsSimulationFullyCompleted
                      ? '⚠️ Lengkapi ke-4 sub-tahap simulasi logistik terpadu di panel kiri (sampai status L/C cair) terlebih dahulu sebelum menandatangani penyelesaian fase ini secara resmi.'
                      : `Sesi Anda saat ini (${currentUser?.role || 'Akses Umum/Tamu'}) tidak memiliki hak menandatangani tahap ini (${activeInspectedStep.actor}). Silakan beralih ke peran yang sesuai dengan menekan tombol Login di sudut atas.`}
                  </p>
                )}
              </div>

              <div>
                {isFullyCompleted && inspectedStepIndex === 2 ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-2.5">
                    <div className="flex justify-center">
                      <span className="p-1.5 bg-emerald-500 text-white rounded-full block">
                        <Check className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-900 font-black uppercase tracking-wider">
                        🎉 Transaksi Sukses!
                      </p>
                      <p className="text-[10px] text-emerald-700 leading-normal">
                        Seluruh kargo tuntas diserahkan &amp; dana dicairkan sempurna.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCompletedLogisticsSubSteps([]);
                        onUpdateStep(shipment.id, 'Draft', 'Simulasi diulang kembali dari awal draf (Sales Contract) oleh pengguna.');
                      }}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Mulai Ulang Simulasi (Reset)
                    </button>
                  </div>
                ) : isStepCompleted ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-2">
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-black tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Tahap Sudah Selesai Dilaksanakan
                    </button>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Langkah ini telah ditandatangani secara digital oleh aktor penanggung jawab. Data terkunci.
                    </p>
                  </div>
                ) : isStepFuture ? (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-2">
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-black tracking-wide bg-slate-100 text-slate-400 border border-slate-250 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-slate-400" />
                      Tahap Belum Aktif
                    </button>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Selesaikan langkah-langkah sebelumnya terlebih dahulu agar tahap ini dapat diaktifkan.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => executeStepProgression(inspectedStepIndex)}
                    disabled={!isAuthorizedToClickCurrentInspected}
                    className={`w-full py-3 px-4 rounded-lg text-xs font-black tracking-wide shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isAuthorizedToClickCurrentInspected
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    {inspectedStepIndex === 2 ? 'Konfirmasi Penerimaan Barang & Selesaikan Transaksi' : 'Tandatangani Secara Sah & Validasi Tahap ini'}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COMPONENT: Educational Advisor & Work Authorization */}
        {false && showEducation && (
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              
              {/* Title Header */}
              <div className="bg-indigo-950 px-6 py-4 border-b border-indigo-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-indigo-500 text-white font-mono text-[9px] font-black uppercase rounded">
                    {getStepGuide(inspectedStepIndex)?.badge || 'ASISTEN'}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-200">
                    Aksi dan Panduan
                  </span>
                </div>
                <BookOpen className="w-4 h-4 text-indigo-400" />
              </div>

              {/* Subtabs */}
              <div className="grid grid-cols-2 border-b border-slate-800">
                <button
                  onClick={() => setOnPageTab('actions')}
                  className={`py-3 text-[11px] font-bold leading-normal tracking-wide transition-all border-b-2 flex items-center justify-center gap-1 cursor-pointer focus:outline-none ${
                    onPageTab === 'actions'
                      ? 'border-indigo-400 bg-slate-800/50 text-white font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-200 bg-transparent'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  🛡️ Aksi Sah
                </button>
                <button
                  onClick={() => setOnPageTab('details')}
                  className={`py-3 text-[11px] font-bold leading-normal tracking-wide transition-all border-b-2 flex items-center justify-center gap-1 cursor-pointer focus:outline-none ${
                    onPageTab === 'details'
                      ? 'border-indigo-400 bg-slate-800/50 text-white font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-200 bg-transparent'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  💡 Analogi
                </button>
              </div>

              {/* Tab views body */}
              <div className="p-6 space-y-5">
                
                {/* 1. ANALOGI AWAM & DETAILS TAB */}
                {onPageTab === 'details' && (() => {
                  const guide = getStepGuide(inspectedStepIndex);
                  return (
                    <div className="space-y-4">
                      
                      <div>
                        <h4 className="text-white font-black text-sm tracking-tight leading-snug">
                          {guide?.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold mt-1">
                          {guide?.subtitle || 'Alur Kerja Resmi Indonesia'}
                        </p>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {activeInspectedStep.description}
                      </p>

                      {/* Highlight layman analogy box */}
                      <div className="border border-indigo-500/20 bg-indigo-950/40 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-indigo-400">
                          <Lightbulb className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            Analogi Sederhana (Orang Awam):
                          </span>
                        </div>
                        <p className="text-xs text-indigo-100 italic leading-relaxed font-sans font-medium">
                          &ldquo;{guide?.laymanAnalogy}&rdquo;
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-1.5">
                        <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                          Tujuan Operasional &amp; Kepabeanan:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {guide?.purpose}
                        </p>
                      </div>

                      {guide?.actors && (
                        <div className="space-y-1.5 pt-1.5">
                          <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                            Pihak / Aktor yang Terlibat:
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {guide.actors.map((actor, idx) => (
                              <span key={idx} className="text-[10.5px] font-semibold bg-slate-800 text-indigo-300 border border-slate-750 px-2 py-1 rounded-md flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                                {actor}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {guide?.docs && (
                        <div className="space-y-2 pt-2 border-t border-slate-800/60">
                          <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                            Berkas/Dokumen yang Diterbitkan:
                          </span>
                          <div className="space-y-2.5">
                            {guide.docs.map(doc => (
                              <div key={doc.name} className="flex gap-2.5 items-start">
                                <div className="p-1 rounded bg-slate-800 shrink-0 text-indigo-400">
                                  <FileText className="w-3.5 h-3.5" />
                                </div>
                                <div className="font-sans leading-tight">
                                  <p className="text-xs font-black text-slate-100">{doc.name}</p>
                                  <p className="text-[10.5px] text-slate-400 mt-0.5">{doc.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })()}

                {/* 2. SIGNATURES & SIMULATION PANEL ACTIONS TAB */}
                {onPageTab === 'actions' && (
                  <div className="space-y-4">
                    
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                          Persyaratan Tanda Tangan &amp; Otoritas
                        </span>
                      </div>
                      
                      <div className="text-xs space-y-2">
                        <p className="text-slate-300 leading-relaxed">
                          Sesuai tata kelola ekspor terpercaya, tahap ini diterbitkan oleh pihak berwenang berikut:
                        </p>
                        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex items-center justify-between">
                          <div>
                            <span className="text-[8.5px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                              Pihak Penanggung Jawab
                            </span>
                            <span className="font-bold text-white text-xs">
                              {activeInspectedStep.actor === 'Superadmin' ? 'Bea Cukai' : activeInspectedStep.actor}
                            </span>
                          </div>
                          <span className="text-[9.5px] font-black bg-blue-900/40 text-blue-300 border border-blue-800 px-2 py-1 rounded">
                            {activeInspectedStep.actor === 'Superadmin' ? 'BC' : activeInspectedStep.actor.substring(0, 3).toUpperCase()}
                          </span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[8.5px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                                Sesi Pengguna Aktif Anda
                              </span>
                              <span className="font-bold text-white text-xs">
                                {currentUser?.name || 'Belum Login'}
                              </span>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-1 rounded border capitalize ${
                              isAuthorizedToClickCurrentInspected
                                ? 'bg-emerald-900/40 text-emerald-300 border-emerald-800'
                                : 'bg-rose-900/40 text-rose-300 border-rose-800'
                            }`}>
                              {isAuthorizedToClickCurrentInspected ? '✓ Terotorisasi' : '⚠ Tidak Sesuai'}
                            </span>
                          </div>

                           {isEmergencyTakeover && (
                            <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-1.5">
                              <p className="text-[10px] text-amber-300 font-semibold italic">
                                ✓ Mode Darurat: Peran Superadmin diizinkan mengambil alih &amp; menandatangani tugas Trader.
                              </p>
                            </div>
                          )}

                           {!isAuthorizedToClickCurrentInspected && (
                            <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-1.5">
                              <p className="text-[10px] text-rose-300 italic">
                                {inspectedStepIndex === 1 && !isLogisticsSimulationFullyCompleted
                                  ? '⚠️ Lengkapi ke-4 sub-tahap simulasi logistik terpadu di panel kiri (sampai status L/C cair) terlebih dahulu sebelum menandatangani penyelesaian fase ini secara resmi.'
                                  : `Sesi Anda saat ini (${currentUser?.role || 'Akses Umum/Tamu'}) tidak memiliki hak menandatangani tahap ini (${activeInspectedStep.actor}). Silakan beralih ke peran yang sesuai dengan menekan tombol Login di sudut atas.`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2.5">
                      {isFullyCompleted && inspectedStepIndex === 2 ? (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-3.5 shadow-lg">
                          <div className="flex justify-center">
                            <span className="p-2 bg-emerald-500 text-white rounded-full block animate-bounce">
                              <CheckCircle className="w-5 h-5" />
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-emerald-900 font-black uppercase tracking-wider">
                              🎉 Transaksi Sukses!
                            </p>
                            <p className="text-[11px] text-emerald-700 leading-relaxed">
                              Dana Letter of Credit (L/C) berhasil dicairkan penuh ke rekening Eksportir. Seluruh riwayat transaksi &amp; berkas dokumen resmi telah diarsipkan dengan aman.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setCompletedLogisticsSubSteps([]);
                              onUpdateStep(shipment.id, 'Draft', 'Simulasi diulang kembali dari awal draf (Sales Contract) oleh pengguna.');
                            }}
                            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Mulai Ulang Simulasi (Reset ke Tahap 1)
                          </button>
                        </div>
                      ) : shipment.currentStep === 'Draft' ? (
                        <div className="space-y-2 text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <button
                            disabled
                            className="w-full py-3 px-4 rounded-xl text-xs font-black tracking-wide bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed flex items-center justify-center gap-2 shadow-2xs animate-pulse"
                          >
                            <Lock className="w-4 h-4 text-amber-600" />
                            Alur Logistik Ekspor Terkunci
                          </button>
                          <p className="text-[10px] text-slate-500 text-center leading-normal">
                            Selesaikan <strong>Fase I: Negosiasi Komersial &amp; Kontrak Bilateral</strong> terlebih dahulu pada dasbor halaman utama untuk membuka dan memulai alur eksekusi logistik ini.
                          </p>
                        </div>
                      ) : isStepCompleted ? (
                        <div className="space-y-2 text-left bg-emerald-50/80 p-3 rounded-xl border border-emerald-100">
                          <button
                            disabled
                            className="w-full py-3 px-4 rounded-xl text-xs font-black tracking-wide bg-emerald-100/50 text-emerald-700 border border-emerald-200 cursor-not-allowed flex items-center justify-center gap-2 shadow-2xs"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            Tahap ini Sudah Selesai Dilaksanakan
                          </button>
                          <p className="text-[10px] text-slate-500 text-center leading-normal">
                            Langkah ini telah berhasil divalidasi dan ditandatangani secara digital oleh aktor penanggung jawab. Data riwayat terkunci.
                          </p>
                        </div>
                      ) : isStepFuture ? (
                        <div className="space-y-2 text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <button
                            disabled
                            className="w-full py-3 px-4 rounded-xl text-xs font-black tracking-wide bg-slate-100 text-slate-600 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2 shadow-2xs"
                          >
                            <AlertCircle className="w-4 h-4 text-slate-500" />
                            Tahap Belum Aktif
                          </button>
                          <p className="text-[10px] text-slate-500 text-center leading-normal">
                            Selesaikan langkah-langkah sebelumnya terlebih dahulu agar tahap ini dapat diaktifkan dan diproses.
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => executeStepProgression(inspectedStepIndex)}
                          disabled={!isAuthorizedToClickCurrentInspected}
                          className={`w-full py-3 px-4 rounded-xl text-xs font-black tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isAuthorizedToClickCurrentInspected
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg hover:-translate-y-0.5'
                              : 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200'
                          }`}
                        >
                          <UserCheck className="w-4 h-4" />
                          {inspectedStepIndex === 2 ? 'Konfirmasi Penerimaan Barang & Selesaikan Transaksi' : 'Tandatangani Secara Sah & Validasi Tahap ini'}
                        </button>
                      )}
                    </div>

                  </div>
                )}



              </div>

              <div className="bg-indigo-50 border-t border-indigo-100 px-6 py-3 flex items-center justify-between text-[11px] text-indigo-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span>Kepatuhan Internasional Republik Indonesia</span>
                </div>
                <span className="text-indigo-600">*Status Aktif</span>
              </div>

            </div>

          </div>
        )}

      </div>

                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {accessDeniedMessage && (
          <div 
            onClick={() => setAccessDeniedMessage(null)}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          >
            <motion.div 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-left"
            >
              <div className="bg-amber-50 border-b border-amber-100 p-5 flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 font-sans">Akses Dibatasi</h3>
                  <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider mt-0.5 font-sans">Peran Saat Ini: Buyer (Pembeli)</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                  {accessDeniedMessage}
                </p>
                
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="text-[10.5px] text-slate-500 leading-normal font-sans">
                    Fase logistik ini diproses secara internal oleh <strong>Trader</strong>, <strong>Supplier</strong>, dan <strong>Forwarder</strong> untuk pengurusan sertifikasi karantina, PEB, dan pemuatan kapal.
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-5 py-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setAccessDeniedMessage(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10.5px] font-black rounded-lg transition-all shadow-sm cursor-pointer uppercase tracking-wider font-sans"
                >
                  Saya Mengerti
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
