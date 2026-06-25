import React, { useState, useEffect } from 'react';
import { ExportShipment, UserProfile, ShipmentStep, UserRole } from '../types';
import { WORKFLOW_STEPS, mockUsers } from '../mockData';
import { 
  Shield, Briefcase, ShoppingBag, Truck, Leaf, 
  CheckCircle, ArrowRight, Info, AlertCircle, 
  Award, FileText, Anchor, Compass, UserCheck, Play, 
  Layers, ChevronRight, Check, Sparkles, Send, FileDown,
  X, BookOpen, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VesselGPSMap from './VesselGPSMap';
import NegotiationDashboard from './NegotiationDashboard';

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
    stepId: 'nego-loi',
    step: 'Draft',
    label: 'LOI (Surat Minat)',
    description: 'Buyer menyatakan minat pembelian komoditas ekspor via Letter of Intent (LOI) resmi.',
    actor: 'Buyer',
    expectedDuration: '1-2 Hari',
    stepIcon: 'FileText',
    stage: 'negotiation'
  },
  {
    stepId: 'nego-quotation',
    step: 'Draft',
    label: 'Quotation (Penawaran)',
    description: 'Trader mengirim lembar penawaran harga, spesifikasi kargo, dan kalkulasi bea.',
    actor: 'Trader',
    expectedDuration: '1-3 Hari',
    stepIcon: 'Award',
    stage: 'negotiation'
  },
  {
    stepId: 'nego-pi',
    step: 'Draft',
    label: 'Draf PI & Negosiasi',
    description: 'Para pihak merancang Proforma Invoice (PI) dan menegosiasikan klausul jual-beli ekspor.',
    actor: 'Trader',
    expectedDuration: '2-4 Hari',
    stepIcon: 'Layers',
    stage: 'negotiation'
  },
  {
    stepId: 'nego-signing',
    step: 'Draft',
    label: 'Tanda Tangan Kontrak',
    description: 'Penandatanganan bilateral Sales Contract oleh Trader dan Buyer Jerman secara hukum.',
    actor: 'Trader',
    expectedDuration: '1-2 Hari',
    stepIcon: 'UserCheck',
    stage: 'negotiation'
  },
  {
    stepId: 'sourcing',
    step: 'Sourcing',
    label: 'Penyediaan Barang',
    description: 'Supplier memproduksi kargo ramah lingkungan dan mengapalkan ke Gudang Transit Utama.',
    actor: 'Supplier',
    expectedDuration: '7-14 Hari',
    stepIcon: 'Layers',
    stage: 'logistics'
  },
  {
    stepId: 'verification',
    step: 'Verification',
    label: 'Sertifikasi Karantina',
    description: 'Pengujian lab acak oleh Balai Karantina Pertanian RI guna sertifikat Phytosanitary.',
    actor: 'Trader',
    expectedDuration: '2-5 Hari',
    stepIcon: 'Award',
    stage: 'logistics'
  },
  {
    stepId: 'documents',
    step: 'Documents',
    label: 'Sertifikat Asal (COO)',
    description: 'Eksportir mengurus Certificate of Origin (COO) resmi dari Kementerian Perdagangan.',
    actor: 'Trader',
    expectedDuration: '2-3 Hari',
    stepIcon: 'FileText',
    stage: 'logistics'
  },
  {
    stepId: 'customs',
    step: 'Customs',
    label: 'Kepabeanan Bea Cukai',
    description: 'Pengajuan berkas PEB secara daring mandiri dan penerbitan izin muat NPE oleh pabean.',
    actor: 'Owner/Direktur',
    expectedDuration: '1-2 Hari',
    stepIcon: 'Shield',
    stage: 'logistics'
  },
  {
    stepId: 'loading',
    step: 'Loading',
    label: 'Loading & Stuffing',
    description: 'Forwarder memuat kargo FCL ke kontainer baja laut dan dinaikkan ke kapal cargo.',
    actor: 'Forwarder',
    expectedDuration: '1-2 Hari',
    stepIcon: 'Anchor',
    stage: 'logistics'
  },
  {
    stepId: 'shipping',
    step: 'Shipping',
    label: 'Pelayaran Logistik',
    description: 'Kapal kontainer berlayar mengarungi samudra samudera menuju Hamburg lintas negara.',
    actor: 'Forwarder',
    expectedDuration: '15-25 Hari',
    stepIcon: 'Compass',
    stage: 'logistics'
  },
  {
    stepId: 'completed',
    step: 'Completed',
    label: 'Pelunasan L/C',
    description: 'Kargo diterima di Eropa, eksportir melepas draf BL bersih guna klaim dana L/C bank.',
    actor: 'Buyer',
    expectedDuration: '3-5 Hari',
    stepIcon: 'CheckCircle',
    stage: 'logistics'
  }
];

interface InteractiveInfographicProps {
  shipment: ExportShipment;
  currentUser: UserProfile | null;
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
    nextStep: 'Sourcing';
    comments: string;
  }) => void;
}

export default function InteractiveInfographic({
  shipment,
  currentUser,
  onSelectUser,
  onUpdateStep,
  onOpenDocumentEditor,
  onSimulateEvent,
  negoStepId,
  onNegoStepIdChange,
  onUpdateShipmentFromDeal
}: InteractiveInfographicProps) {
  
  // Index of the actual/real shipment progress step
  const getActualUnifiedIndex = () => {
    if (shipment.currentStep !== 'Draft') {
      switch (shipment.currentStep) {
        case 'Sourcing': return 4;
        case 'Verification': return 5;
        case 'Documents': return 6;
        case 'Customs': return 7;
        case 'Loading': return 8;
        case 'Shipping': return 9;
        case 'Completed': return 10;
        default: return 4;
      }
    } else {
      // It's Draft (Negotiation Phase)
      const currentNegoStep = negoStepId || 1;
      if (currentNegoStep === 1) return 0;
      if (currentNegoStep === 2) return 1;
      if (currentNegoStep === 3 || currentNegoStep === 4) return 2;
      if (currentNegoStep === 5) return 3;
      return 0;
    }
  };

  const actualStepIndex = getActualUnifiedIndex();
  
  // Currently inspected step on the infographic map (default to the current active step)
  const [inspectedStepIndex, setInspectedStepIndex] = useState<number>(actualStepIndex);
  
  // Track selected actor profile inside the Kamus tab
  const activeStepActor = UNIFIED_STEPS[actualStepIndex]?.actor || 'Trader';
  const [selectedRole, setSelectedRole] = useState<UserRole>(activeStepActor);

  // Dynamic state for custom editable document template fields
  const [docFields, setDocFields] = useState<{[key: string]: string}>({});
  const [docSavedMessage, setDocSavedMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // On-page UI tab controls & configurations
  const [onPageTab, setOnPageTab] = useState<'details' | 'actions' | 'dictionary'>('details');
  const [showEducation, setShowEducation] = useState<boolean>(true);
  const [dictionaryRole, setDictionaryRole] = useState<UserRole>('Trader');
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState<boolean>(true);

  // Trigger auto-focus whenever the actual active step advances
  useEffect(() => {
    setInspectedStepIndex(actualStepIndex);
  }, [actualStepIndex]);

  useEffect(() => {
    // Generate default fields based on inspectedStepIndex & shipment
    const defaultFields: {[key: string]: string} = {};
    if (inspectedStepIndex === 4) {
      defaultFields.deliveryNo = 'DO/TRANSIT-GAYO/2026/889';
      defaultFields.supplier = shipment.supplierCompany || 'Koperasi Kopi Gayo Organik';
      defaultFields.receiver = 'Gudang Transit Utama PT Multi Raksa Madani';
      defaultFields.truckNo = 'B 9201 TXX';
      defaultFields.netMass = `${shipment.quantity * 1000} Kilogram (kg)`;
      defaultFields.condition = 'Kadar air tervalidasi 12% max, bebas jamur & hama parasit';
    } else if (inspectedStepIndex === 5) {
      defaultFields.appNo = 'REQ-PHYT/KT-GAYO/2026/410';
      defaultFields.exporter = 'PT Multi Raksa Madani (Hendry Kurniawan)';
      defaultFields.consignee = shipment.buyerCompany || 'EuroFoods Import GmbH (Hans Mueller)';
      defaultFields.botanicalName = shipment.productName.toLowerCase().includes('kopi') ? 'Coffea arabica' : 'Cocos nucifera';
      defaultFields.origin = 'Sumatran Highlands, Indonesia';
      defaultFields.treatment = 'Sertifikasi lab bebas pestisida, fumigasi Metil Bromida';
    } else if (inspectedStepIndex === 6) {
      defaultFields.cooNo = 'COO/A-EUR/2026/10291';
      defaultFields.cooNo_part2 = 'KEMENTERIAN PERDAGANGAN RI';
      defaultFields.shipper = 'PT Multi Raksa Madani';
      defaultFields.consignee = shipment.buyerCompany || 'EuroFoods Import GmbH (Hans Mueller)';
      defaultFields.transport = `${shipment.vesselName} ${shipment.voyageNumber || 'HP.991'} via ${shipment.portOfLoading}`;
      defaultFields.preference = 'Indonesian Origin Certified (GSP Scheme)';
      defaultFields.hsCode = shipment.hsCode || '0901.11.10';
    } else if (inspectedStepIndex === 7) {
      defaultFields.pebNo = 'PEB-REG/BEACUKAI-TJP/2026/778';
      defaultFields.declarant = 'Hendry Kurniawan (PT Multi Raksa Madani)';
      defaultFields.hsCode = shipment.hsCode || '0901.11.10';
      defaultFields.fobValue = `$${shipment.totalValue.toLocaleString('id-ID')} USD`;
      defaultFields.currency = 'USD';
      defaultFields.loadingPort = shipment.portOfLoading;
    } else if (inspectedStepIndex === 8) {
      defaultFields.stuffingNo = 'SO/SK-LOG/2026/1102';
      defaultFields.forwarder = 'PT Samudera Logistik Internasional';
      defaultFields.containerNo = 'TGBU 882019-2 (40ft High Cube)';
      defaultFields.sealNo = 'ID-BC-SEGEL-88201';
      defaultFields.driverPhone = 'Budiono (+62 812-9908-1123)';
      defaultFields.stuffingDate = shipment.etd || '2026-07-01';
    } else if (inspectedStepIndex === 9) {
      defaultFields.siNo = 'SI/SAMUDERA/2026/099';
      defaultFields.shipper = 'PT Multi Raksa Madani';
      defaultFields.consignee = shipment.buyerCompany || 'EuroFoods Import GmbH (Hans Mueller)';
      defaultFields.vesselName = shipment.vesselName;
      defaultFields.destination = shipment.portOfDischarge;
      defaultFields.freightCharges = 'Freight Prepaid (Sistem CIF)';
    } else if (inspectedStepIndex === 10) {
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
  }, [inspectedStepIndex, shipment]);

  const handleFieldChange = (key: string, val: string) => {
    setDocFields(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const getDocMeta = (idx: number) => {
    switch (idx) {
      case 4:
        return {
          title: 'Draf Surat Jalan Penyerahan Barang (Delivery Order)',
          inputs: [
            { label: 'Nomor Surat Jalan', key: 'deliveryNo' },
            { label: 'Supplier Pengirim', key: 'supplier' },
            { label: 'Gudang Penerima', key: 'receiver' },
            { label: 'Nomor Plat Truk', key: 'truckNo' },
            { label: 'Berat Bersih', key: 'netMass' },
            { label: 'Spesifikasi/Kualitas', key: 'condition' },
          ]
        };
      case 5:
        return {
          title: 'Permohonan Pengujian Lab & Karantina (Phytosanitary Application)',
          inputs: [
            { label: 'Nomor Permohonan', key: 'appNo' },
            { label: 'Eksportir Pemohon', key: 'exporter' },
            { label: 'Pihak Penerima', key: 'consignee' },
            { label: 'Nama Botani Tumbuhan', key: 'botanicalName' },
            { label: 'Negara/Daerah Asal', key: 'origin' },
            { label: 'Rincian Treatment', key: 'treatment' },
          ]
        };
      case 6:
        return {
          title: 'Keterangan Asal / Certificate of Origin (Form D / A)',
          inputs: [
            { label: 'Nomor COO', key: 'cooNo' },
            { label: 'Instansi Penerbit', key: 'cooNo_part2' },
            { label: 'Shipper (Pengirim)', key: 'shipper' },
            { label: 'Penerima Barang', key: 'consignee' },
            { label: 'Moda Transportasi', key: 'transport' },
            { label: 'Kriteria Preferensi', key: 'preference' },
            { label: 'Kode HS Code', key: 'hsCode' },
          ]
        };
      case 7:
        return {
          title: 'Draft Laporan Pemberitahuan Ekspor Barang (Draft PEB)',
          inputs: [
            { label: 'Nomor Pengajuan PEB', key: 'pebNo' },
            { label: 'Eksportir Terdaftar', key: 'declarant' },
            { label: 'HS Code Komoditas', key: 'hsCode' },
            { label: 'Nilai Ekspor (FOB)', key: 'fobValue' },
            { label: 'Valuta Bayar', key: 'currency' },
            { label: 'Pelabuhan Asal Muat', key: 'loadingPort' },
          ]
        };
      case 8:
        return {
          title: 'Perintah Muat Kontainer (Container Stuffing Order)',
          inputs: [
            { label: 'Nomor Stuffing Order', key: 'stuffingNo' },
            { label: 'Perusahaan Logistik', key: 'forwarder' },
            { label: 'Nomor Kontainer', key: 'containerNo' },
            { label: 'Nomor Segel Bea Cukai', key: 'sealNo' },
            { label: 'Kontak Sopir Truk', key: 'driverPhone' },
            { label: 'Tanggal Stuffing', key: 'stuffingDate' },
          ]
        };
      case 9:
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
      case 10:
        return {
          title: 'Permohonan Pencairan Letter of Credit (L/C Settlement Request)',
          inputs: [
            { label: 'Nomor Letter of Credit (L/C)', key: 'lcNo' },
            { label: 'Beneficiary (Penerima)', key: 'beneficiary' },
            { label: 'Advising Bank', key: 'advisingBank' },
            { label: 'Nilai Klaim Penagihan', key: 'amount' },
            { label: 'Daftar Dokumen Terlampir', key: 'docRequiredList' },
          ]
        };
      default:
        return { 
          title: 'Draf Dokumen Ekspor Dagang', 
          inputs: [
            { label: 'ID Transaksi', key: 'trxId' }
          ] 
        };
    }
  };

  const getRoleTheme = (role: UserRole) => {
    switch (role) {
      case 'Owner/Direktur': return {
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
      case 'Owner/Direktur': return <Shield className={className} />;
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
            'Menuntut verifikasi pencairan dana Letter of Credit (L/C) dari bank setelah menyerahkan berkas kargo bersih.'
          ],
          kewajiban: [
            'Menyusun Sales Contract komoditi yang tervalidasi harga FOB/CIF bersama Buyer Jerman.',
            'Melunasi biaya pabean kontainer & biaya administrasi pendaftaran Karantina Pertanian.',
            'Memastikan muatan yang disuplai oleh petani lokal memenuhi grade kadar kelembapan ekspor.'
          ],
          steps: ['Draft', 'Verification', 'Documents']
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
          steps: ['Sourcing']
        };
      case 'Owner/Direktur':
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
          steps: ['Customs']
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
          steps: ['Loading', 'Shipping']
        };
      case 'Buyer':
        return {
          title: 'Buyer (Mitra Importir Internasional)',
          company: 'EuroFoods Import GmbH & Co. KG (Munich, Germany)',
          hak: [
            'Meneri komoditas pangan/agro premium dalam kondisi prima tanpa cacat laut di pelabuhan tujuan.',
            'Meminta draf salinan berkas komersial ekspor asli guna tebus dokumen clearance pelabuhan eropa.',
            'Mengajukan tuntutan klaim asuransi laut jika terjadi kebocoran kontainer di atas dek samudera.'
          ],
          kewajiban: [
            'Membuka instrumen pembayaran Letter of Credit (L/C) dengan bank koresponden pelunasan resmi Eropa.',
            'Membayar penuh sisa pelunasan barang setelah menerima draf konfirmasi manifest laut.',
            'Mengurus bea cukai impor clearance lokal di Pelabuhan Hamburg Jerman tepat waktu.'
          ],
          steps: ['Completed']
        };
    }
  };

  const executeStepProgression = (index: number) => {
    if (index < 4) return; // Handled by NegotiationDashboard
    const targetStep = UNIFIED_STEPS[index];
    let defaultComments = '';
    
    switch (targetStep.step) {
      case 'Sourcing':
        onSimulateEvent('supplier-ready');
        break;
      case 'Verification':
        onSimulateEvent('phytosanitary-issued');
        defaultComments = 'Sertifikat kesehatan komoditas/karantina tumbuhan disetujui lab karantina negara.';
        onUpdateStep(shipment.id, 'Documents', defaultComments);
        break;
      case 'Documents':
        defaultComments = 'Semua pemberkasan komersial (Invoice, PL, dan Surat Keterangan Asal / COO) diterbitkan resmi oleh Trader.';
        onUpdateStep(shipment.id, 'Customs', defaultComments);
        break;
      case 'Customs':
        onSimulateEvent('customs-approved');
        break;
      case 'Loading':
        defaultComments = 'Kargo dimasukkan dalam kontainer FCL (stuffing) dan dimuat ke dek kapal logistik kelas samudra.';
        onUpdateStep(shipment.id, 'Shipping', defaultComments);
        break;
      case 'Shipping':
        onSimulateEvent('ship-movement');
        defaultComments = 'Kapal kontainer berlayar melewati Samudra Hindia menuju Terusan Suez / Pelabuhan Hamburg.';
        onUpdateStep(shipment.id, 'Completed', defaultComments);
        break;
      case 'Completed':
        defaultComments = 'Buyer secara resmi mengonfirmasi penerimaan kargo kontainer di pelabuhan tujuan, menyerahkan Bill of Lading (B/L) asli ke bank penjamin, dan mencairkan pembayaran Letter of Credit (L/C) penuh ke rekening Eksportir. Siklus data diarsipkan.';
        onUpdateStep(shipment.id, 'Completed', defaultComments);
        break;
    }
    
    // Set focus inspection to next step or keep it on the completed screen
    const nextInspectIndex = index === UNIFIED_STEPS.length - 1 ? 10 : index + 1;
    setInspectedStepIndex(nextInspectIndex);
    setOnPageTab('details');
  };

  const isFullyCompleted = shipment.currentStep === 'Completed' && shipment.stepHistory.some(h => h.step === 'Completed');
  const activeInspectedStep = UNIFIED_STEPS[inspectedStepIndex];
  const isEmergencyTakeover = activeInspectedStep.actor === 'Trader' && currentUser?.role === 'Owner/Direktur';
  const isAuthorizedToClickCurrentInspected = currentUser?.role === activeInspectedStep.actor || isEmergencyTakeover;

  const getStepGuide = (index: number) => {
    switch (index) {
      case 0:
        return {
          title: 'Letter of Intent (Inquiry LOI)',
          subtitle: 'Minat Awal Kemitraan Dagang',
          laymanAnalogy: 'Bagaikan surat minat formal dari calon pembeli luar negeri yang menyatakan secara tertulis ketertarikan mereka mengimpor komoditas Anda dengan perkiraan volume awal.',
          purpose: 'Menyatakan secara sah kehendak calon importir untuk melakukan kemitraan pembelian komoditas ekspor Indonesia.',
          actors: ['Buyer (Hans Mueller / Jerman)', 'Trader (Eksportir)'],
          badge: 'INQUIRY',
          docs: [
            { name: 'Letter of Intent (LOI)', desc: 'Surat resmi bermaterai niaga internasional dari perusahaan importir luar negeri.' }
          ]
        };
      case 1:
        return {
          title: 'Offer Sheets / Quotation (Penawaran Resmi)',
          subtitle: 'Kalkulasi Tarif & Lembar Penawaran',
          laymanAnalogy: 'Bagaikan surat rincian penawaran harga dari eksportir PT Multi Raksa Madani sebagai respon LOI, memuat batas toleransi mutu, harga FOB/CIF, serta garansi pengapalan.',
          purpose: 'Trader/Eksportir memaparkan syarat harga penawaran niaga komoditi berdasarkan LOI yang diterima.',
          actors: ['Trader (Hendry Kurniawan)', 'Buyer'],
          badge: 'QUOTATION',
          docs: [
            { name: 'Commercial Quotation Sheet', desc: 'Rincian lembar penawaran harga komoditas per satuan unit beserta durasi validasi.' }
          ]
        };
      case 2:
        return {
          title: 'Proforma Invoice (PI) & Syarat Bayar',
          subtitle: 'Negosiasi Klausul & Cara Pembayaran Internasional',
          laymanAnalogy: 'Bagaikan draf struk detail belanjaan sementara sebelum pelunasan kasir. Draf ini dipakai oleh pembeli untuk memohon pembukaan Letter of Credit di bank koresponden Jerman.',
          purpose: 'Menetapkan spesifikasi kargo final, nilai transaksi total, dan jaminan pembayaran instrumen perbankan.',
          actors: ['Trader', 'Buyer', 'Bank Koresponden'],
          badge: 'NEGOSIASI',
          docs: [
            { name: 'Proforma Invoice (PI)', desc: 'Faktur komersial awal pembuka transaksi dagang bilateral secara internasional.' }
          ]
        };
      case 3:
        return {
          title: 'Sales Contract & Bilateral Signatures',
          subtitle: 'Penandatanganan Kontrak Jual-Beli Konkrit',
          laymanAnalogy: 'Bagaikan akad deal mengikat dalam bisnis ekspor. Begitu tanda tangan disematkan secara bilateral, kontrak mengikat demi hukum dan kargo resmi berstatus pesanan aktif!',
          purpose: 'Mengikat kedua belah pihak secara hukum formal dalam payung transaksi ekspor-impor bebas sengketa.',
          actors: ['Trader', 'Buyer'],
          badge: 'KONTRAK',
          docs: [
            { name: 'Sales Contract (SC)', desc: 'Surat kontrak hukum internasional final bermeterai serta bertanda tangan direksi.' }
          ]
        };
      case 4:
        return {
          title: 'Surat Penyerahan Bahan Baku (Sourcing DO)',
          subtitle: 'Pengiriman Komoditas dari Petani & Koperasi',
          laymanAnalogy: 'Bagaikan nota kirim barang dari suplier bahan baku lokal ke gudang utama Anda. Ini membuktikan bahwa bahan premium segar sudah dipanen dan berpindah dari kebun gayo ke pengemasan pabrik.',
          purpose: 'Menjamin ketersediaan barang mentah berkualitas premium sesuai kuota yang disepakati.',
          actors: ['Supplier Koperasi Kopi', 'Trader (QC Lapangan)'],
          badge: 'PASOKAN',
          docs: [
            { name: 'Delivery Order (DO)', desc: 'Bukti jalan truk logistik mengangkut komoditas agro menuju gudang transit.' }
          ]
        };
      case 5:
        return {
          title: 'Uji Lab & Karantina (Phytosanitary)',
          subtitle: 'Pemeriksaan Kesehatan Bebas Hama Tumbuhan',
          laymanAnalogy: 'Bagaikan tes bebas penyakit menular tumbuhan. Tanpa surat sertifikat ini, otoritas Jerman akan menolak pembongkaran muatan demi melindungi kelestarian biosfer alam mereka.',
          purpose: 'Mendapat sertifikasi jaminan kesehatan tumbuhan bebas parasit, serangga, dan kontaminasi jamur paku.',
          actors: ['Balai Karantina Pertanian RI', 'Trader'],
          badge: 'KARANTINA',
          docs: [
            { name: 'Phytosanitary Certificate (PC)', desc: 'Sertifikat kesehatan nabati wajib dari Kementerian Pertanian RI.' }
          ]
        };
      case 6:
        return {
          title: 'Penerbitan Dokumen Pabean (COO & Dokumen Dagang)',
          subtitle: 'Pembuatan Sertifikat Asal Barang Nusantara',
          laymanAnalogy: 'Bagaikan akte kepemilikan geografi atau sertifikasi keaslian asli "Made in Indonesia". Ini dipakai guna meraup tarif preferensial bea masuk kargo di negara Uni Eropa (Jerman).',
          purpose: 'Menerbitkan Certificate of Origin (COO), Invoice Resmi, dan Packing List untuk kebutuhan pemeriksaan bea masuk impor Jerman.',
          actors: ['Dinas Perindustrian & Perdagangan RI', 'Trader'],
          badge: 'SERTIFIKASI',
          docs: [
            { name: 'Certificate of Origin (COO)', desc: 'Bukti sahih barang diproduksi di Indonesia (Form A/D).' },
            { name: 'Commercial Invoice & Packing List', desc: 'Isian nilai barang, berat bersih, berat kotor, dan rincian kemasan karung kargo.' }
          ]
        };
      case 7:
        return {
          title: 'Deklarasi Bea Cukai (Draft PEB & NPE)',
          subtitle: 'Pemberitahuan Ekspor Barang & Persetujuan Muat',
          laymanAnalogy: 'Bagaikan meminta paspor keluar bandara untuk kargo Anda. Kita melapor secara sistem ELEKTRONIK (PEB) kementerian keuangan mengenai muatan agar diperiksa kelaikannya dan diizinkan naik ke kapal.',
          purpose: 'Melaporkan manifes pabean ekspor negara guna mendapatkan Nota Pelayanan Ekspor (NPE) hijau yang sah dari kepabeanan.',
          actors: ['Owner/Direktur', 'Trader'],
          badge: 'PABEAN',
          docs: [
            { name: 'Pemberitahuan Ekspor Barang (PEB)', desc: 'Dokumen deklarasi deklararif pabean resmi dari eksportir.' },
            { name: 'Nota Pelayanan Ekspor (NPE)', desc: 'Surat clearance resmi pabean yang mengizinkan kontainer masuk pintu dermaga terminal.' }
          ]
        };
      case 8:
        return {
          title: 'Pemuatan & Pengemasan (Stuffing & Seal)',
          subtitle: 'Memasukkan Kargo ke Kontainer & Penyegelan Logistik',
          laymanAnalogy: 'Bagaikan mempacking koper tebal bersegor baja laut berpaku. Kontainer baja diisi penuh kargo (stuffing), kemudian segel magnetik resmi dipasang guna menandakan muatan belum dibuka sepihak.',
          purpose: 'Melakukan penataan kargo seimbang di dalam kontainer samudra 20ft/40ft, melindunginya dari guncangan badai laut, serta menyegel penutup.',
          actors: ['Forwarder Logistik', 'Petugas Bea Cukai'],
          badge: 'STUFFING',
          docs: [
            { name: 'Stuffing Packing Order / Seal Report', desc: 'Laporan segel baja resmi berkode QR pabean dan sertifikasi muat roda logistik.' }
          ]
        };
      case 9:
        return {
          title: 'Instruksi Pengapalan (Shipping Bill of Lading)',
          subtitle: 'Pemuatan ke Dek Kapal & Pelayaran Samudra',
          laymanAnalogy: 'Bagaikan tiket kapal sekuritas samudera bergaransi. Kapten kapal meneken tanda terima sah B/L ini sebagai garansi bahwa muatan siap melaut berlayar.',
          purpose: 'Menerbitkan Bill of Lading (B/L) resmi pelayaran laut yang berfungsi sebagai dokumen kepemilikan kargo utama selama di laut lepas.',
          actors: ['Pelayaran Samudra / Forwarder', 'Trader'],
          badge: 'PELAYARAN',
          docs: [
            { name: 'Bill of Lading (B/L)', desc: 'Surat perjanjian pengangkutan muatan laut resmi sekaligus tanda kepemilikan barang dagang.' }
          ]
        };
      case 10:
        return {
          title: 'Pencairan Pembayaran L/C (Letter of Credit)',
          subtitle: 'Penyerahan Seberkas Dokumen Bersih ke Bank Koresponden',
          laymanAnalogy: 'Bagaikan melepaskan kunci brankas bersama di bank setelah seluruh pengapalan tuntas. Kita menukar dokumen asli pabean laut dengan kucuran dana L/C impor jaminan aman anti-gagal bayar.',
          purpose: 'Menuntaskan siklus transaksi dagang internasional dengan pembayaran aman, bebas risiko gagal bayar pembeli luar negeri.',
          actors: ['Buyer', 'Trader'],
          badge: 'TRANSAKSI',
          docs: [
            { name: 'Letter of Credit Settlement', desc: 'Nota pencairan penagihan ekspor sah berjaminan bank penyelesaian aman.' }
          ]
        };
      default:
        return {
          title: 'Langkah Edukasi',
          subtitle: 'Prosedur Dagang RI',
          laymanAnalogy: 'Panduan belajar praktis tata kelola logistik ekspor ekosistem maritim.',
          purpose: 'Menyelidiki alur kepatuhan dagang.',
          actors: ['Pelaku Dagang Nusantara'],
          badge: 'EDUKASI',
          docs: []
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
      <h1>PT MULTI RAKSA MADANI</h1>
      <p>Menara Karya Lt.12, Jalan HR. Rasuna Said Blok X-5 Kuningan, Jakarta Selatan • Telp: (021) 529-5000</p>
      <div class="sub-logo">PORTAL TERPADU HUB PERDAGANGAN EKSPOR REPUBLIK INDONESIA</div>
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
          <p class="authorized-name">Hans Mueller</p>
          <p class="authorized-details">Procurement Director (EuroFoods Import GmbH)</p>
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
            <div className="grid grid-cols-11 mb-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
              <div className="col-span-4 border-b border-indigo-150 pb-1.5 flex items-center gap-1.5 text-indigo-600 pr-4">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>Fase I: Komersial &amp; Kontrak (Langkah 1 - 4)</span>
              </div>
              <div className="col-span-7 border-b border-emerald-150 pb-1.5 flex items-center gap-1.5 text-emerald-600 pl-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Fase II: Logistik &amp; Kepabeanan Ekspor (Langkah 5 - 11)</span>
              </div>
            </div>

            {/* Single background track line spanning across all 11 steps */}
            <div className="absolute left-[4.5%] right-[4.5%] top-[54px] h-1 bg-slate-150 rounded-full overflow-hidden -z-10">
              <div 
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ 
                  width: `${(actualStepIndex / 10) * 100}%` 
                }}
              />
            </div>

            {/* Steps container */}
            <div className="grid grid-cols-11 relative z-10">
              {UNIFIED_STEPS.map((st, idx) => {
                const isPassed = isFullyCompleted ? true : idx < actualStepIndex;
                const isActiveNow = isFullyCompleted ? false : idx === actualStepIndex;
                const isBeingInspected = idx === inspectedStepIndex;
                
                let statusBorder = 'border-slate-300 bg-white text-slate-450';
                if (isPassed) statusBorder = 'border-emerald-500 bg-emerald-50 text-emerald-600';
                if (isActiveNow) statusBorder = 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-4 ring-blue-100 shadow-md';
                
                return (
                  <div 
                    key={st.stepId}
                    onClick={() => {
                      setInspectedStepIndex(idx);
                      setSelectedRole(UNIFIED_STEPS[idx].actor);
                      setOnPageTab('details');
                    }}
                    className={`flex flex-col items-center text-center relative focus:outline-none select-none cursor-pointer group transition-all duration-200 transform ${
                      isBeingInspected ? 'scale-[1.05]' : 'hover:scale-[1.02]'
                    }`}
                  >
                    {/* Circle container */}
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all relative z-10 ${statusBorder} ${
                      isBeingInspected ? 'ring-4 ring-indigo-500/30 border-indigo-500 bg-indigo-50 text-indigo-750 font-bold shadow-xs' : ''
                    }`}>
                      {isActiveNow && (
                        <span className="absolute inset-0 rounded-full bg-blue-500/15 animate-ping" />
                      )}
                      {isPassed ? (
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                      ) : (
                        getStepIcon(st.stepIcon, 'w-4.5 h-4.5')
                      )}

                      {/* Initials indicator badge */}
                      <span className={`absolute -bottom-1 -right-1 text-[7.5px] font-sans font-bold leading-none uppercase tracking-wider px-1 py-0.5 rounded-full border border-white shadow-3xs text-white z-20 ${
                        st.actor === 'Owner/Direktur' 
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
                        {st.actor === 'Owner/Direktur' ? 'BC' : st.actor.substring(0, 3).toUpperCase()}
                      </span>
                    </div>

                    {/* Step Index Label */}
                    <span className={`text-[8.5px] font-black uppercase tracking-wider font-mono mt-2.5 ${
                      idx < 4 ? 'text-indigo-600' : 'text-emerald-600'
                    }`}>
                      Langkah {idx + 1}
                    </span>

                    {/* Info label */}
                    <p className={`text-[10px] leading-tight font-sans font-bold mt-1 max-w-[90px] min-h-[30px] line-clamp-2 ${
                      isBeingInspected 
                        ? 'text-indigo-750 font-extrabold' 
                        : isActiveNow 
                          ? 'font-extrabold text-blue-700' 
                          : 'text-slate-600 group-hover:text-slate-900'
                    }`}>
                      {st.label}
                    </p>

                    {/* Sub-label for completion status */}
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-[8.5px] font-medium tracking-tight font-sans ${
                        isPassed ? 'text-emerald-600 font-bold' : isActiveNow ? 'text-blue-600 font-bold animate-pulse' : 'text-slate-400'
                      }`}>
                        {isPassed ? 'Selesai' : isActiveNow ? 'Aktif' : 'Menunggu'}
                      </span>
                      {isBeingInspected && (
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

      {/* Put Vessel GPS MAP here! */}
      {(shipment.currentStep === 'Shipping' || UNIFIED_STEPS[inspectedStepIndex].stepId === 'shipping') && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <VesselGPSMap shipment={shipment} />
        </motion.div>
      )}

      {/* Workspace split layout */}
      {inspectedStepIndex < 4 ? (
        <div className="animate-fadeIn">
          <div className="bg-gradient-to-r from-indigo-50/60 to-blue-50/60 border border-indigo-100 p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-3xs text-slate-800 text-left mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-600 text-white rounded-lg px-2.5 py-1 text-[9px] uppercase font-mono font-black animate-pulse shrink-0">
                Tahap {inspectedStepIndex + 1}: {UNIFIED_STEPS[inspectedStepIndex].label}
              </span>
              <span>
                Anda sedang melihat langkah negosiasi komersial <strong>{UNIFIED_STEPS[inspectedStepIndex].label}</strong>. 
                Sistem mengintegrasikan jalannya perundingan harga dengan alur pengiriman logistik dalam satu peta terpadu.
              </span>
            </div>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-mono font-bold uppercase tracking-wider shrink-0 hidden md:inline-block">
              FASE PRA-PENGAPALAN
            </span>
          </div>
          <NegotiationDashboard
            shipment={shipment}
            currentUser={currentUser}
            onUpdateShipmentFromDeal={onUpdateShipmentFromDeal}
            forcedStepId={
              inspectedStepIndex === 0 ? 1 :
              inspectedStepIndex === 1 ? 2 :
              inspectedStepIndex === 2 ? 3 :
              inspectedStepIndex === 3 ? 5 : 1
            }
            onStepIdChange={(stepId) => {
              if (onNegoStepIdChange) {
                onNegoStepIdChange(stepId);
              }
              const newIndex = 
                stepId === 1 ? 0 :
                stepId === 2 ? 1 :
                stepId === 3 || stepId === 4 ? 2 :
                stepId === 5 ? 3 : 0;
              setInspectedStepIndex(newIndex);
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT: Educational Advisor & Work Authorization */}
        {showEducation && (
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              
              {/* Title Header */}
              <div className="bg-indigo-950 px-6 py-4 border-b border-indigo-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-indigo-500 text-white font-mono text-[9px] font-black uppercase rounded">
                    {getStepGuide(inspectedStepIndex)?.badge || 'ASISTEN'}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-200">
                    Panduan &amp; Edukasi Ekspor Awam
                  </span>
                </div>
                <BookOpen className="w-4 h-4 text-indigo-400" />
              </div>

              {/* Subtabs */}
              <div className="grid grid-cols-3 border-b border-slate-800">
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
                  onClick={() => setOnPageTab('dictionary')}
                  className={`py-3 text-[11px] font-bold leading-normal tracking-wide transition-all border-b-2 flex items-center justify-center gap-1 cursor-pointer focus:outline-none ${
                    onPageTab === 'dictionary'
                      ? 'border-indigo-400 bg-slate-800/50 text-white font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-200 bg-transparent'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  📖 Kewajiban
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
                              {activeInspectedStep.actor === 'Owner/Direktur' ? 'Bea Cukai' : activeInspectedStep.actor}
                            </span>
                          </div>
                          <span className="text-[9.5px] font-black bg-blue-900/40 text-blue-300 border border-blue-800 px-2 py-1 rounded">
                            {activeInspectedStep.actor === 'Owner/Direktur' ? 'BC' : activeInspectedStep.actor.substring(0, 3).toUpperCase()}
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
                                ✓ Mode Darurat: Peran Owner/Direktur diizinkan mengambil alih &amp; menandatangani tugas Trader.
                              </p>
                            </div>
                          )}

                           {!isAuthorizedToClickCurrentInspected && (
                            <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-1.5">
                              <p className="text-[10px] text-rose-300 italic">
                                Sesi Anda saat ini ({currentUser?.role || 'Akses Umum/Tamu'}) tidak memiliki hak menandatangani tahap ini ({activeInspectedStep.actor}). Silakan beralih ke peran yang sesuai dengan menekan tombol **Login** di sudut atas.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2.5">
                      {isFullyCompleted ? (
                        <div className="bg-emerald-950/90 border border-emerald-500/40 p-4 rounded-xl text-center space-y-3.5 shadow-lg">
                          <div className="flex justify-center">
                            <span className="p-2 bg-emerald-500 text-white rounded-full block animate-bounce">
                              <CheckCircle className="w-5 h-5" />
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-white font-black uppercase tracking-wider">
                              🎉 Transaksi Sukses!
                            </p>
                            <p className="text-[11px] text-emerald-300 leading-relaxed">
                              Dana Letter of Credit (L/C) berhasil dicairkan penuh ke rekening Eksportir. Seluruh riwayat transaksi &amp; berkas dokumen resmi telah diarsipkan dengan aman.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              onUpdateStep(shipment.id, 'Draft', 'Simulasi diulang kembali dari awal draf (Sales Contract) oleh pengguna.');
                            }}
                            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Mulai Ulang Simulasi (Reset ke Tahap 1)
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => executeStepProgression(inspectedStepIndex)}
                          disabled={!isAuthorizedToClickCurrentInspected}
                          className={`w-full py-3 px-4 rounded-xl text-xs font-black tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isAuthorizedToClickCurrentInspected
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg hover:-translate-y-0.5'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          }`}
                        >
                          <UserCheck className="w-4 h-4" />
                          {inspectedStepIndex === 10 ? 'Cairkan L/C & Selesaikan Transaksi' : 'Tandatangani Secara Sah & Validasi Tahap ini'}
                        </button>
                      )}
                    </div>

                  </div>
                )}

                {/* 3. ROLES CONSTITUTION HAK & KEWAJIBAN TAB */}
                {onPageTab === 'dictionary' && (
                  <div className="space-y-4">
                    
                    <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-3">
                      {(['Trader', 'Supplier', 'Owner/Direktur', 'Forwarder', 'Buyer'] as UserRole[]).map(rl => (
                        <button
                          key={rl}
                          onClick={() => setDictionaryRole(rl)}
                          className={`text-[9.5px] font-extrabold px-2 py-1 rounded transition-all cursor-pointer ${
                            dictionaryRole === rl
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {rl === 'Owner/Direktur' ? 'Owner/Direktur' : rl}
                        </button>
                      ))}
                    </div>

                    {(() => {
                      const selMeta = getActorMeta(dictionaryRole);
                      const theme = getRoleTheme(dictionaryRole);
                      return (
                        <div className="space-y-3 font-sans break-words pt-1">
                          
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg ${theme?.bg} ${theme?.primary}`}>
                              {getRoleIcon(dictionaryRole, 'w-4 h-4')}
                            </span>
                            <div>
                              <h5 className="text-white font-extrabold text-xs">
                                {selMeta?.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-mono">
                                Contoh: {selMeta?.company}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3.5 pt-3">
                            
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block font-mono">
                                Hak Konstitusi Dagang (Rights)
                              </span>
                              <ul className="space-y-2">
                                {selMeta?.hak.map((hk, i) => (
                                  <li key={i} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed">
                                    <span className="text-indigo-500 font-bold font-mono text-[10.5px]">0{i+1}.</span>
                                    <span>{hk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-slate-800/50">
                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block font-mono">
                                Kewajiban Operasional (Duties)
                              </span>
                              <ul className="space-y-2">
                                {selMeta?.kewajiban.map((kw, i) => (
                                  <li key={i} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed">
                                    <span className="text-amber-500 font-bold font-mono text-[10.5px]">0{i+1}.</span>
                                    <span>{kw}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                          </div>

                        </div>
                      );
                    })()}

                  </div>
                )}

              </div>

              <div className="bg-indigo-950/80 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span>Kepatuhan Internasional Republik Indonesia</span>
                </div>
                <span>*Status Aktif</span>
              </div>

            </div>

          </div>
        )}

        {/* RIGHT COMPONENT: Live Document Customizer & Paper Specimen Preview */}
        <div className={`${showEducation ? 'lg:col-span-7' : 'lg:col-span-12'} border border-slate-200 bg-white p-6 rounded-2xl relative shadow-3xs max-w-full space-y-6`}>
          
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
              {isDownloading ? 'Menghimpun Berkas...' : 'Unduh &amp; Cetak Resmi'}
            </button>
          </div>

          {/* Dynamic properties form */}
          {(() => {
            const meta = getDocMeta(inspectedStepIndex);
            return (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                <span className="text-[10px] font-black text-slate-550 uppercase tracking-widest block border-b border-slate-200 pb-1.5">
                  Isian Pengenal Berkas: {meta.title}
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
                        onChange={(e) => handleFieldChange(inp.key, e.target.value)}
                        placeholder="Ketik rincian isian..."
                        className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 shadow-3xs focus:outline-none focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400">
                  <span>*Data tersimpan secara lokal ke memori browser Anda.</span>
                  <button
                    onClick={() => {
                      setDocSavedMessage('Konfigurasi draf berhasil dicadangkan!');
                      setTimeout(() => setDocSavedMessage(null), 3000);
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                  >
                    Simpan Draf Berkas
                  </button>
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
                    <h4 className="text-[15px] font-serif font-black tracking-widest uppercase text-slate-900">
                      PT MULTI RAKSA MADANI
                    </h4>
                    <p className="text-[8.5px] font-mono tracking-wider text-slate-400 font-bold">
                      Menara Karya Lt.12, Jalan HR. Rasuna Said Blok X-5 Kuningan, Jakarta Selatan • Telp: (021) 529-5000
                    </p>
                    <p className="text-[8.5px] font-mono tracking-widest text-indigo-700 font-black uppercase">
                      PORTAL TERPADU HUB PERDAGANGAN EKSPOR REPUBLIK INDONESIA
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

        </div>

      </div>

      )}

    </div>
  );
}
