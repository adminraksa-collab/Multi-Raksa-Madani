import React, { useState, useEffect } from 'react';
import { UserProfile, ExportShipment, ExportDocument, ShipmentStep, RealTimeAlert, ExportProduct, Certification } from './types';
import { 
  mockUsers, 
  initialShipments, 
  initialAlerts, 
  createMockDocuments, 
  mockCertificationsList, 
  WORKFLOW_STEPS,
  mockProducts
} from './mockData';
import LoginModal from './components/LoginModal';
import CatalogSection from './components/CatalogSection';
import NotificationPanel from './components/NotificationPanel';
import DocumentEditor from './components/DocumentEditor';
import DocumentViewer from './components/DocumentViewer';
import ShipmentWorkflowTracker from './components/ShipmentWorkflowTracker';
import InteractiveInfographic from './components/InteractiveInfographic';
import ExportGuide from './components/ExportGuide';
import NegotiationDashboard from './components/NegotiationDashboard';
import LandingPage from './components/LandingPage';
import AccountManagement from './components/AccountManagement';
import { 
  Bell, Globe, Activity, ShieldCheck, FileText, 
  Clock, CheckCircle, Package, Truck, AlertCircle, 
  Database, UserCheck, UserPlus, Users, TrendingUp, Info, Layers,
  Plus, X, FileSignature, BookOpen, Lock, ArrowRight, ArrowLeft, ShieldAlert
} from 'lucide-react';

export default function App() {
  // 1. Initial State Initialization
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [shipments, setShipments] = useState<ExportShipment[]>(() => {
    const base = initialShipments();
    return base.map(s => ({
      ...s,
      documents: createMockDocuments(s.id, s.totalValue, s.quantity, s.unit, s.productName, s.hsCode),
      certifications: mockCertificationsList(s.id)
    }));
  });

  const [alerts, setAlerts] = useState<RealTimeAlert[]>(() => initialAlerts);
  const [activeShipmentId, setActiveShipmentId] = useState<string>('ship-1005');
  const [activeTab, setActiveTab] = useState<'home' | 'workflow' | 'catalog' | 'notifications' | 'guide' | 'negotiation' | 'users'>('home');
  const [workflowViewMode, setWorkflowViewMode] = useState<'infographic' | 'checklist'>('infographic');
  const [negotiationProduct, setNegotiationProduct] = useState<ExportProduct | undefined>(undefined);
  const [showRestrictedAlert, setShowRestrictedAlert] = useState<string | null>(null);

  // Local storage based user list and login credential state
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const stored = localStorage.getItem('exportflow_users');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    const initial = mockUsers.map(u => ({ ...u, isApproved: true }));
    localStorage.setItem('exportflow_users', JSON.stringify(initial));
    return initial;
  });

  // Helper values for restrictions (Public guests are restricted to home)
  const isRestricted = !currentUser;

  const getFriendlyTabName = (tabName: string) => {
    switch (tabName) {
      case 'workflow': return 'Dashboard Alur Kerja Logistik';
      case 'catalog': return 'Katalog Komoditi Unggul';
      case 'negotiation': return 'Alur Negosiasi & Proforma Invoice (PI)';
      case 'guide': return 'Hub Regulasi & Panduan Ekspor';
      case 'notifications': return 'Pemberitahuan & Notifikasi';
      case 'users': return 'Manajemen Akun Terdaftar';
      default: return tabName;
    }
  };

  const handleTabClick = (tab: 'home' | 'workflow' | 'catalog' | 'notifications' | 'guide' | 'negotiation' | 'users') => {
    if (isRestricted && tab !== 'home') {
      setShowRestrictedAlert(tab);
      // Auto-hide alert after 8 seconds
      setTimeout(() => setShowRestrictedAlert(null), 8000);
      return;
    }
    setShowRestrictedAlert(null);
    setActiveTab(tab);
  };

  // Enforce the rule: if restricted, they can never land on other tabs
  useEffect(() => {
    if (isRestricted && activeTab !== 'home') {
      setActiveTab('home');
    }
  }, [currentUser, activeTab, isRestricted]);

  // Modal / overlay states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register'>('login');
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [openedLoginFromCalculator, setOpenedLoginFromCalculator] = useState(false);
  const [isDocEditorOpen, setIsDocEditorOpen] = useState(false);
  const [isNewContractModalOpen, setIsNewContractModalOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<ExportDocument | null>(null);

  // Form state for new contract builder
  const [newContractForm, setNewContractForm] = useState({
    productId: 'prod-1',
    productName: 'Premium Coconut Shell Charcoal Briquette',
    quantity: 15,
    unit: 'Metrik Ton (MT)',
    totalValue: 21750,
    buyerName: 'Jane Doe',
    buyerCompany: 'Global Spices Distribution Inc. (New York)',
    supplierName: 'Koperasi Arang Kelapa Berkah Halmahera',
    supplierCompany: 'Koperasi Arang Kelapa Berkah Halmahera',
    portOfLoading: 'Tanjung Priok (IDTPP), Jakarta',
    portOfDischarge: 'Port of New York (USNYC), USA',
    vesselName: 'MV Nusantara Maritime',
    hsCode: '4402.20.10'
  });

  const handleProductChange = (prodId: string) => {
    const prod = mockProducts.find(p => p.id === prodId);
    if (!prod) return;
    const priceNum = parseFloat(prod.price.replace(/,/g, '')) || 1000;
    const defaultQty = newContractForm.quantity;
    setNewContractForm(prev => ({
      ...prev,
      productId: prod.id,
      productName: prod.name,
      unit: prod.unit,
      hsCode: prod.hsCode,
      supplierName: prod.supplierName,
      supplierCompany: prod.supplierName,
      totalValue: priceNum * defaultQty
    }));
  };

  const handleQuantityChange = (qty: number) => {
    const prod = mockProducts.find(p => p.id === newContractForm.productId);
    const priceNum = prod ? (parseFloat(prod.price.replace(/,/g, '')) || 1000) : 1000;
    setNewContractForm(prev => ({
      ...prev,
      quantity: qty,
      totalValue: priceNum * qty
    }));
  };

  // Active Shipment Ref Helper
  const activeShipment = shipments.find(s => s.id === activeShipmentId) || shipments[0];

  // 2. Real-time / IoT event simulator handlers
  const handleSimulateEvent = (type: 'ship-movement' | 'customs-approved' | 'phytosanitary-issued' | 'supplier-ready') => {
    const newAlertId = `alt-sim-${Date.now()}`;
    const timestamp = new Date().toISOString();

    switch (type) {
      case 'ship-movement': {
        // Append movement notification & update Shipping status comments
        setShipments(prev => prev.map(s => {
          if (s.currentStep === 'Shipping') {
            return {
              ...s,
              trackingNumber: `SMDR-GPS-${Math.floor(100000 + Math.random() * 900000)}`,
              stepHistory: [
                ...s.stepHistory,
                { step: 'Shipping', timestamp, updatedBy: 'usr-forwarder', comments: 'Update IoT Satelit: Kapal kargo terdeteksi aman melewati koordinat Selat Malaka.' }
              ]
            };
          }
          return s;
        }));

        const newAlert: RealTimeAlert = {
          id: newAlertId,
          shipmentId: 'ship-1002',
          contractNumber: 'SC/NGL/COF-2026-002',
          title: 'Pelacakan Kapal (Satelit GPS) Aktif',
          message: 'Sinyal kapal kontainer MV Global Express berhasil dikirim kembali ke sistem Hub. Koordinat: Selat Malaka, Kecepatan: 14.5 Knot.',
          type: 'info',
          timestamp,
          readBy: []
        };
        setAlerts(prev => [newAlert, ...prev]);
        break;
      }

      case 'customs-approved': {
        // Find shipments in 'Customs' state, advance them to 'Loading' (Forwarder)
        let simulatedCount = 0;
        setShipments(prev => prev.map(s => {
          if (s.currentStep === 'Customs') {
            simulatedCount++;
            return {
              ...s,
              currentStep: 'Loading',
              stepHistory: [
                ...s.stepHistory,
                { step: 'Loading', timestamp, updatedBy: 'usr-admin', comments: 'Sistem integrasi Bea Cukai (CEISA) menyetujui PEB. NPE diterbitkan otomatis.' }
              ]
            };
          }
          return s;
        }));

        const newAlert: RealTimeAlert = {
          id: newAlertId,
          shipmentId: activeShipmentId,
          contractNumber: activeShipment.contractNumber,
          title: 'Persetujuan Bea Cukai RI (NPE)',
          message: simulatedCount > 0 
            ? 'Dokumen Cukai ekspor PEB disetujui, Nota Pelayanan Ekspor diterbitkan. Cargo dilepaskan untuk proses Loading.' 
            : 'Sinyal Bea Cukai dipancarkan. Tidak ada transaksi yang sedang menunggu pemeriksaan Bea Cukai di tahap "Customs" saat ini.',
          type: 'success',
          timestamp,
          readBy: []
        };
        setAlerts(prev => [newAlert, ...prev]);
        break;
      }

      case 'phytosanitary-issued': {
        // Look up active certs, mark Phytosanitary as Verified
        setShipments(prev => prev.map(s => {
          if (s.id === activeShipmentId) {
            return {
              ...s,
              certifications: s.certifications.map(c => 
                c.name.includes('Phytosanitary') ? { ...c, status: 'Verified', updatedAt: timestamp } : c
              )
            };
          }
          return s;
        }));

        const newAlert: RealTimeAlert = {
          id: newAlertId,
          shipmentId: activeShipmentId,
          contractNumber: activeShipment.contractNumber,
          title: 'Sertifikasi Karantina Tervalidasi',
          message: `Sertifikasi karantina phytosanitary hasil tani pada kontrak ${activeShipment.contractNumber} dinyatakan lulus uji laboratorium oleh Balai Karandina Indonesia.`,
          type: 'success',
          timestamp,
          readBy: []
        };
        setAlerts(prev => [newAlert, ...prev]);
        break;
      }

      case 'supplier-ready': {
        // Check shipments in Sourcing step, set to Sourcing Complete
        let updatedCount = 0;
        setShipments(prev => prev.map(s => {
          if (s.currentStep === 'Sourcing') {
            updatedCount++;
            return {
              ...s,
              currentStep: 'Verification',
              stepHistory: [
                ...s.stepHistory,
                { step: 'Verification', timestamp, updatedBy: 'usr-supplier', comments: 'Supplier menyatakan komoditas selesai dipacking, siap dimasuki karantina.' }
              ]
            };
          }
          return s;
        }));

        const newAlert: RealTimeAlert = {
          id: newAlertId,
          shipmentId: activeShipmentId,
          contractNumber: activeShipment.contractNumber,
          title: 'Barang Siap oleh Supplier',
          message: updatedCount > 0 
            ? 'Supplier memberikan notifikasi kargo siap angkut dari gudang tani lokal.' 
            : 'Tidak ada transaksi dengan tahap "Sourcing" saat ini.',
          type: 'info',
          timestamp,
          readBy: []
        };
        setAlerts(prev => [newAlert, ...prev]);
        break;
      }
    }
  };

  // 3. Document Creation & Verification handlers
  const handleSaveNewDocument = (newDoc: ExportDocument) => {
    setShipments(prev => prev.map(s => {
      if (s.id === newDoc.shipmentId) {
        // Replace existing document of same type if present, or append
        const filterDocs = s.documents.filter(d => d.type !== newDoc.type);
        return {
          ...s,
          documents: [...filterDocs, newDoc]
        };
      }
      return s;
    }));

    setIsDocEditorOpen(false);

    // Push alert
    const newAlert: RealTimeAlert = {
      id: `alt-doc-${Date.now()}`,
      shipmentId: newDoc.shipmentId,
      contractNumber: activeShipment.contractNumber,
      title: 'Penerbitan Dokumen Baru',
      message: `${newDoc.type} ekspor berhasil dirilis oleh Trader (${currentUser?.name}) dengan nomor formal ${newDoc.code}.`,
      type: 'info',
      timestamp: new Date().toISOString(),
      readBy: []
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleSubmitDocumentForApproval = (docId: string) => {
    // Trader/Supplier submits the draft document as formal application (Surat Pengajuan)
    setShipments(prev => prev.map(s => {
      return {
        ...s,
        documents: s.documents.map(d => {
          if (d.id === docId) {
            return { d, ...d, status: 'Issued', updatedAt: new Date().toISOString() };
          }
          return d;
        })
      };
    }));

    // Update document in viewer
    if (viewingDocument && viewingDocument.id === docId) {
      setViewingDocument(p => p ? { ...p, status: 'Issued' } : null);
    }

    // Push alert
    const newAlert: RealTimeAlert = {
      id: `alt-sub-${Date.now()}`,
      shipmentId: activeShipmentId,
      contractNumber: activeShipment.contractNumber,
      title: 'Surat Pengajuan Terkirim',
      message: `Surat Pengajuan resmi untuk berkas ekspor telah dikirimkan oleh pelaku usaha (${currentUser?.name}) agar ditelaah & disahkan oleh Otoritas Dagang.`,
      type: 'warning',
      timestamp: new Date().toISOString(),
      readBy: []
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleApproveDocument = (docId: string) => {
    // Customs (Owner/Direktur) stamps / approves the document
    setShipments(prev => prev.map(s => {
      return {
        ...s,
        documents: s.documents.map(d => {
          if (d.id === docId) {
            return { ...d, status: 'Approved', updatedAt: new Date().toISOString() };
          }
          return d;
        })
      };
    }));

    // Update document in viewer
    if (viewingDocument && viewingDocument.id === docId) {
      setViewingDocument(p => p ? { ...p, status: 'Approved' } : null);
    }

    // Push alert
    const newAlert: RealTimeAlert = {
      id: `alt-app-${Date.now()}`,
      shipmentId: activeShipmentId,
      contractNumber: activeShipment.contractNumber,
      title: 'Pabean Memvalidasi Dokumen',
      message: `Pihak Bea Cukai (Owner/Direktur) telah meneliti fisik serta menerbitkan cap validasi pabean hijau pada berkas.`,
      type: 'success',
      timestamp: new Date().toISOString(),
      readBy: []
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleUpdateStep = (shipmentId: string, nextStep: ShipmentStep, comments: string) => {
    setShipments(prev => prev.map(s => {
      if (s.id === shipmentId) {
        return {
          ...s,
          currentStep: nextStep,
          stepHistory: [
            ...s.stepHistory,
            {
              step: nextStep,
              timestamp: new Date().toISOString(),
              updatedBy: currentUser?.id || 'sim',
              comments
            }
          ]
        };
      }
      return s;
    }));

    // Push real-time alert
    const nextStepName = WORKFLOW_STEPS.find(st => st.step === nextStep)?.label || nextStep;
    const newAlert: RealTimeAlert = {
      id: `alt-step-${Date.now()}`,
      shipmentId,
      contractNumber: activeShipment.contractNumber,
      title: `Perubahan Alur Pengapalan`,
      message: `Transaksi ekspor kini beralih ke tahap "${nextStepName}". Tindakan diperbarui oleh: ${currentUser?.name || currentUser?.role}`,
      type: 'info',
      timestamp: new Date().toISOString(),
      readBy: []
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleAddCertToShipment = (shipmentId: string, name: string, authority: string) => {
    const newCert: Certification = {
      id: `cert-custom-${Date.now()}`,
      name,
      code: `CERT-ID-${Math.floor(10000 + Math.random() * 90000)}`,
      description: 'Sertifikat eksternal tambahan pengangkutan pabean internasional.',
      authority,
      requiredFor: 'Komoditi terkait tujuan kedaulatan impor',
      status: 'Verified',
      updatedAt: new Date().toISOString()
    };

    setShipments(prev => prev.map(s => {
      if (s.id === shipmentId) {
        return {
          ...s,
          certifications: [...s.certifications, newCert]
        };
      }
      return s;
    }));

    // Alert
    const newAlert: RealTimeAlert = {
      id: `alt-cert-${Date.now()}`,
      shipmentId,
      contractNumber: activeShipment.contractNumber,
      title: 'Sertifikasi Tambahan Diterbitkan',
      message: `Sertifikasi tambahan "${name}" dilampirkan oleh Trader.`,
      type: 'info',
      timestamp: new Date().toISOString(),
      readBy: []
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleInitiateContractFromCatalog = (product: ExportProduct) => {
    // Generate new shipment
    const newShipmentId = `ship-${1000 + shipments.length + 1}`;
    const newShip: ExportShipment = {
      id: newShipmentId,
      contractNumber: `SC/NGL/${product.id.toUpperCase()}-2026`,
      buyerId: 'usr-buyer',
      buyerName: 'EuroFoods Import GmbH',
      buyerCompany: 'EuroFoods Import GmbH (München)',
      supplierId: 'usr-supplier',
      supplierName: product.supplierName,
      supplierCompany: product.supplierName,
      forwarderId: 'usr-forwarder',
      forwarderName: 'Siti Aminah',
      forwarderCompany: 'PT Samudera Logistik Internasional',
      traderId: 'usr-trader',
      traderName: currentUser?.name || 'Hendry Kurniawan',
      productName: product.name,
      quantity: 15,
      unit: product.unit,
      totalValue: parseFloat(product.price.replace(/,/g, '')) * 15,
      currency: 'USD',
      hsCode: product.hsCode,
      portOfLoading: 'Tanjung Priok, Jakarta',
      portOfDischarge: 'Port of Hamburg, Germany',
      vesselName: 'MV Nusantara Trans',
      voyageNumber: 'V.11',
      etd: '2026-07-10',
      eta: '2026-08-15',
      trackingNumber: `SMDR-TR-${Math.floor(100000 + Math.random() * 900000)}`,
      currentStep: 'Draft',
      stepHistory: [
        { step: 'Draft', timestamp: new Date().toISOString(), updatedBy: 'usr-trader', comments: 'Draf Kontrak diajukan dari halaman katalog komoditas unggulan.' }
      ],
      documents: [],
      certifications: []
    };

    // Populate initial items
    newShip.documents = createMockDocuments(newShip.id, newShip.totalValue, newShip.quantity, newShip.unit, newShip.productName, newShip.hsCode);
    newShip.certifications = mockCertificationsList(newShip.id);

    setShipments(prev => [newShip, ...prev]);
    setActiveShipmentId(newShipmentId);
    setActiveTab('workflow'); // Go to workflow page to inspect it right away!
  };

  const handleCreateNewTransaction = (formData: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    totalValue: number;
    buyerName: string;
    buyerCompany: string;
    supplierName: string;
    supplierCompany: string;
    portOfLoading: string;
    portOfDischarge: string;
    vesselName: string;
    hsCode: string;
  }) => {
    const newShipmentId = `ship-${Date.now().toString().slice(-4)}`;
    const randNum = Math.floor(100 + Math.random() * 900);
    const prodCode = formData.productId.toUpperCase().replace('PROD-', 'PR');
    const newShip: ExportShipment = {
      id: newShipmentId,
      contractNumber: `SC/NGL/${prodCode}-2026-${randNum}`,
      buyerId: 'usr-buyer',
      buyerName: formData.buyerName,
      buyerCompany: formData.buyerCompany,
      supplierId: 'usr-supplier',
      supplierName: formData.supplierName,
      supplierCompany: formData.supplierCompany,
      forwarderId: 'usr-forwarder',
      forwarderName: 'Siti Aminah',
      forwarderCompany: 'PT Samudera Logistik Internasional',
      traderId: 'usr-trader',
      traderName: currentUser?.name || 'Hendry Kurniawan',
      productName: formData.productName,
      quantity: formData.quantity,
      unit: formData.unit,
      totalValue: formData.totalValue,
      currency: 'USD',
      hsCode: formData.hsCode,
      portOfLoading: formData.portOfLoading,
      portOfDischarge: formData.portOfDischarge,
      vesselName: formData.vesselName || 'MV Samudera Nusantara',
      voyageNumber: 'V.01A',
      etd: new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString().split('T')[0],
      eta: new Date(Date.now() + 50 * 24 * 3600 * 1000).toISOString().split('T')[0],
      trackingNumber: `SMDR-TR-${Math.floor(100000 + Math.random() * 900000)}`,
      currentStep: 'Draft',
      stepHistory: [
        { 
          step: 'Draft', 
          timestamp: new Date().toISOString(), 
          updatedBy: currentUser?.id || 'usr-trader', 
          comments: 'Penandatanganan Kontrak Penjualan (Sales Contract) resmi perdana. Transaksi dimulai dari awal!' 
        }
      ],
      documents: [],
      certifications: []
    };

    // Populate initial items
    newShip.documents = createMockDocuments(newShip.id, newShip.totalValue, newShip.quantity, newShip.unit, newShip.productName, newShip.hsCode);
    
    // Force documents to start as Draft
    newShip.documents = newShip.documents.map(d => ({
      ...d,
      status: 'Draft',
      updatedAt: new Date().toISOString()
    }));

    newShip.certifications = mockCertificationsList(newShip.id).map(c => ({
      ...c,
      status: 'Pending',
      updatedAt: new Date().toISOString()
    }));

    setShipments(prev => [newShip, ...prev]);
    setActiveShipmentId(newShipmentId);
    setActiveTab('workflow');
    setIsNewContractModalOpen(false);

    // Push real-time alert
    const newAlert: RealTimeAlert = {
      id: `alt-new-${Date.now()}`,
      shipmentId: newShipmentId,
      contractNumber: newShip.contractNumber,
      title: 'Draf Kontrak Baru Disepakati',
      message: `Kontrak Penjualan baru "${newShip.contractNumber}" dengan pembeli global ${formData.buyerCompany} resmi ditandatangani. Transaksi dimulai pada langkah Draft!`,
      type: 'success',
      timestamp: new Date().toISOString(),
      readBy: []
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleMarkAlertAsRead = (alertId: string) => {
    if (!currentUser) return;
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          readBy: [...a.readBy, currentUser.id]
        };
      }
      return a;
    }));
  };

  const handleClearAlerts = () => {
    setAlerts([]);
  };

  const handleStartNegotiation = (product: ExportProduct) => {
    setNegotiationProduct(product);
    setActiveTab('negotiation');
  };

  const handleSelectUser = (profile: UserProfile | null) => {
    setCurrentUser(profile);
    const stored = localStorage.getItem('exportflow_users');
    if (stored) {
      try {
        setUsers(JSON.parse(stored));
      } catch (e) {}
    }
    if (profile && openedLoginFromCalculator) {
      setIsCalcOpen(true);
      setOpenedLoginFromCalculator(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('exportflow_users', JSON.stringify(updatedUsers));
    
    // Also remove from credentials if needed
    const storedCreds = localStorage.getItem('exportflow_credentials');
    if (storedCreds) {
      try {
        const creds = JSON.parse(storedCreds);
        const userToDelete = users.find(u => u.id === userId);
        if (userToDelete) {
          const updatedCreds = creds.filter((c: any) => c.email.toLowerCase() !== userToDelete.email.toLowerCase());
          localStorage.setItem('exportflow_credentials', JSON.stringify(updatedCreds));
        }
      } catch (e) {}
    }

    // If deleted user is currently active, log them out
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      setActiveTab('home');
    }

    // Send a system notification!
    const userObj = users.find(u => u.id === userId);
    if (userObj) {
      const newAlert: RealTimeAlert = {
        id: 'alert-' + Date.now(),
        type: 'danger',
        title: 'Akun Terhapus',
        message: `Akun pendaftaran atas nama ${userObj.name} (${userObj.role}) telah dihapus dari database pabean oleh Direktur.`,
        timestamp: new Date().toISOString(),
        readBy: []
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const handleToggleApproveUser = (userId: string, isApproved: boolean) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, isApproved };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('exportflow_users', JSON.stringify(updatedUsers));

    const userObj = users.find(u => u.id === userId);
    if (userObj) {
      // Also update currentUser in-place if they are logged in currently!
      if (currentUser?.id === userId) {
        setCurrentUser({ ...userObj, isApproved });
      }

      // Send a system notification!
      const newAlert: RealTimeAlert = {
        id: 'alert-' + Date.now(),
        type: isApproved ? 'success' : 'warning',
        title: isApproved ? 'Akun Disahkan' : 'Pengesahan Akun Dicabut',
        message: isApproved 
          ? `Akun ${userObj.name} (${userObj.role}) telah disahkan secara penuh oleh Direktur Bea Cukai untuk menjalankan aktivitas ekspor.`
          : `Pengesahan lisensi akun ${userObj.name} telah dicabut oleh Direktur Bea Cukai. Akses logistik dibatasi.`,
        timestamp: new Date().toISOString(),
        readBy: []
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const handleCloseLoginModal = () => {
    setIsLoginOpen(false);
    if (openedLoginFromCalculator) {
      setIsCalcOpen(true);
      setOpenedLoginFromCalculator(false);
    }
  };

  const handleDealCreated = (dealData: {
    product: ExportProduct;
    quantity: number;
    pricePerUnit: number;
    paymentTerms: string;
    incoterms: string;
    portOfDischarge: string;
    buyerCompany: string;
  }) => {
    // Generate a new shipment
    const newShipmentId = `ship-gps-${Date.now().toString().slice(-4)}`;
    const trackingNumber = `SMDR-GPS-${Math.floor(100000 + Math.random() * 900000)}`;

    const newShip: ExportShipment = {
      id: newShipmentId,
      contractNumber: `SC/NGL/${dealData.product.id.toUpperCase().replace('PROD-', 'PR')}-2026-GPS`,
      buyerId: 'usr-buyer',
      buyerName: 'Kenji Yoshihide',
      buyerCompany: dealData.buyerCompany,
      supplierId: 'usr-supplier',
      supplierName: dealData.product.supplierName,
      supplierCompany: dealData.product.supplierName,
      forwarderId: 'usr-forwarder',
      forwarderName: 'Siti Aminah',
      forwarderCompany: 'PT Samudera Logistik Internasional',
      traderId: 'usr-trader',
      traderName: currentUser?.name || 'Hendry Kurniawan',
      productName: dealData.product.name,
      quantity: dealData.quantity,
      unit: dealData.product.unit,
      totalValue: dealData.quantity * dealData.pricePerUnit,
      currency: 'USD',
      hsCode: dealData.product.hsCode,
      portOfLoading: 'Tanjung Priok, Jakarta',
      portOfDischarge: dealData.portOfDischarge,
      vesselName: 'MV Samudera Pasifik V.204',
      voyageNumber: 'V.204',
      etd: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      eta: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString().split('T')[0],
      trackingNumber: trackingNumber,
      currentStep: 'Shipping',
      stepHistory: [
        { 
          step: 'Draft', 
          timestamp: new Date().toISOString(), 
          updatedBy: 'usr-buyer', 
          comments: 'Inisiasi Bilateral: LOI dan Quotation disetujui bersama melalui meja penandatanganan PI.' 
        },
        { 
          step: 'Sourcing', 
          timestamp: new Date().toISOString(), 
          updatedBy: 'usr-supplier', 
          comments: 'Supplier menyelesaikan penyiapan barang dari gudang tani lokal.' 
        },
        { 
          step: 'Verification', 
          timestamp: new Date().toISOString(), 
          updatedBy: 'usr-trader', 
          comments: 'Hasil uji lab karantina diperoleh, phytosanitary lengkap bebas hama.' 
        },
        { 
          step: 'Documents', 
          timestamp: new Date().toISOString(), 
          updatedBy: 'usr-trader', 
          comments: 'Seluruh draf dokumen ekspor (COO, Packing List, Invoice) terverifikasi.' 
        },
        { 
          step: 'Customs', 
          timestamp: new Date().toISOString(), 
          updatedBy: 'usr-admin', 
          comments: 'Beacukai menerbitkan NPE hijau resmi tanpa kendala penahanan.' 
        },
        { 
          step: 'Loading', 
          timestamp: new Date().toISOString(), 
          updatedBy: 'usr-forwarder', 
          comments: 'Kargo utuh dimasukkan ke dek kapal laut besi raksasa.' 
        },
        { 
          step: 'Shipping', 
          timestamp: new Date().toISOString(), 
          updatedBy: 'usr-forwarder', 
          comments: 'Kapal pembawa kargo resmi lepas jangkar, menyalakan sistem transmitter IoT satelit GPS aktif.' 
        }
      ],
      documents: [],
      certifications: []
    };

    // Populate initial items
    newShip.documents = createMockDocuments(newShip.id, newShip.totalValue, newShip.quantity, newShip.unit, newShip.productName, newShip.hsCode);
    
    // Mark documents as Approved / Validated
    newShip.documents = newShip.documents.map(d => ({
      ...d,
      status: 'Approved',
      updatedAt: new Date().toISOString()
    }));

    newShip.certifications = mockCertificationsList(newShip.id).map(c => ({
      ...c,
      status: 'Verified',
      updatedAt: new Date().toISOString()
    }));

    setShipments(prev => [newShip, ...prev]);
    setActiveShipmentId(newShipmentId);
    setActiveTab('workflow');
    setWorkflowViewMode('infographic');

    // Create a real-time notification alert
    const newAlert: RealTimeAlert = {
      id: `alt-deal-${Date.now()}`,
      shipmentId: newShipmentId,
      contractNumber: newShip.contractNumber,
      title: 'Kargo Pelayaran Aktif (GPS Live)',
      message: `Bilateral PI ditandatangani! Kargo untuk ${newShip.productName} telah otomatis maju ke tahap Shipping. Transmisi satelit GPS diaktifkan pada nomor pelacakan ${trackingNumber}.`,
      type: 'success',
      timestamp: new Date().toISOString(),
      readBy: []
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // 4. Counts and Analytics Calculation
  const unreadAlertsCount = alerts.filter(a => !currentUser || !a.readBy.includes(currentUser.id)).length;
  
  const completedShipmentsValue = shipments
    .filter(s => s.currentStep === 'Completed')
    .reduce((sum, s) => sum + s.totalValue, 0);

  const activeShipmentsCount = shipments.filter(s => s.currentStep !== 'Completed').length;
  
  const totalVolumeExported = shipments.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 font-sans antialiased pb-12">
      {/* Main Structural Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-3xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo and branding */}
            <div 
              onClick={() => handleTabClick('home')}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
              title="Kembali ke Beranda Utama"
            >
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <Globe className="w-5 h-5 text-blue-400 animate-spin-slow" />
              </div>
              <div>
                <span className="text-sm font-black text-gray-900 uppercase tracking-widest block">ExportFlow</span>
                <span className="text-[10px] text-gray-400 font-bold block">TATA KELOLA EKSPOR NASIONAL</span>
              </div>
            </div>

            {/* Desktop Center Navigation - None if on Home, Back Button if on other tabs, otherwise Tab menu if logged in */}
            {currentUser ? (
              <nav className="hidden md:flex space-x-1 items-center">
                <button
                  onClick={() => handleTabClick('workflow')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'workflow'
                      ? 'bg-slate-900 text-white shadow-sm font-extrabold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>Dashboard Alur Kerja</span>
                </button>
                <button
                  onClick={() => handleTabClick('catalog')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'catalog'
                      ? 'bg-slate-900 text-white shadow-sm font-extrabold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>Katalog Komoditi</span>
                </button>
                <button
                  onClick={() => handleTabClick('notifications')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 relative ${
                    activeTab === 'notifications'
                      ? 'bg-slate-900 text-white shadow-sm font-extrabold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>Notifikasi</span>
                  {unreadAlertsCount > 0 && (
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
                <button
                  onClick={() => handleTabClick('negotiation')}
                  className={`px-3 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'negotiation'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                  }`}
                >
                  <FileSignature className="w-3.5 h-3.5" />
                  <span>Alur Kerja &amp; PI</span>
                </button>
                <button
                  onClick={() => handleTabClick('guide')}
                  className={`px-3 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'guide'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Panduan Ekspor</span>
                </button>
                {currentUser.role === 'Owner/Direktur' && (
                  <button
                    onClick={() => handleTabClick('users')}
                    className={`px-3 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === 'users'
                        ? 'bg-purple-700 text-white shadow-sm'
                        : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                    <span>Manajemen Akun</span>
                  </button>
                )}
                {activeTab !== 'home' && (
                  <button
                    onClick={() => handleTabClick('home')}
                    className="ml-2 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all flex items-center gap-1 border border-gray-200 cursor-pointer"
                    title="Kembali ke Beranda Utama"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                    <span>Beranda</span>
                  </button>
                )}
              </nav>
            ) : (
              <div className="hidden md:flex items-center">
                {activeTab !== 'home' && (
                  <button
                    onClick={() => handleTabClick('home')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 border border-gray-200 shadow-3xs cursor-pointer hover:-translate-y-0.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                    <span>← Kembali ke Beranda Utama</span>
                  </button>
                )}
              </div>
            )}

            {/* Right side controls user actions with dynamic Logout for testability */}
            <div className="flex items-center gap-3">
              {currentUser && (
                <button
                  onClick={() => handleTabClick('notifications')}
                  className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
                  title={`${unreadAlertsCount} Notifikasi Belum Dibaca`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadAlertsCount > 0 && !isRestricted && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                      {unreadAlertsCount}
                    </span>
                  )}
                </button>
              )}

              <div className="hidden sm:flex items-center gap-2 border-l border-gray-250 pl-3">
                {currentUser ? (
                  <>
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="w-8 h-8 rounded-full border border-gray-100 object-cover"
                    />
                    <div className="text-left text-xs">
                      <p className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span>{currentUser.name.split(' ')[0]}</span>
                        <button 
                          onClick={() => {
                            setCurrentUser(null);
                            setShowRestrictedAlert(null);
                          }}
                          className="text-[9px] text-red-600 hover:text-red-700 font-extrabold px-1 bg-slate-100 rounded hover:underline uppercase tracking-wider animate-pulse"
                          title="Keluar"
                        >
                          Keluar
                        </button>
                      </p>
                      <p className="text-[10px] text-gray-400 font-extrabold capitalize leading-none pt-0.5">{currentUser.role === 'Owner/Direktur' ? 'Owner/Direktur' : currentUser.role}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setLoginModalMode('login');
                        setIsLoginOpen(true);
                      }}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1 shadow-md hover:-translate-y-0.5 uppercase tracking-wider cursor-pointer font-sans"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Login</span>
                    </button>
                    <button
                      onClick={() => {
                        setLoginModalMode('register');
                        setIsLoginOpen(true);
                      }}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all flex items-center gap-1 shadow-xs hover:-translate-y-0.5 uppercase tracking-wider cursor-pointer font-sans"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                      <span>Daftar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* Dynamic restricted page warning banner */}
        {showRestrictedAlert && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3 shadow-3xs animate-fadeIn text-left">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <h4 className="text-xs font-black text-amber-900 uppercase">Akses Halaman Dibatasi ("{getFriendlyTabName(showRestrictedAlert).toUpperCase()}")</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold mt-0.5">
                Peran tamu umum (Guest) / pembeli (Buyer) hanya diizinkan untuk melihat tab <strong>Informasi Umum</strong> saja. 
                Silakan beralih ke peran operasional ekspor seperti <strong>Eksportir (Trader)</strong> atau <strong>Bea Cukai RI (Director)</strong> 
                untuk membukanya secara penuh.
              </p>
              <button
                onClick={() => {
                  setIsLoginOpen(true);
                  setShowRestrictedAlert(null);
                }}
                className="mt-2.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 hover:bg-indigo-700 transition-colors shadow-2xs"
              >
                <span>Beralih Peran / Login</span>
                <ArrowRight className="w-3 h-3 text-indigo-200" />
              </button>
            </div>
            <button 
              onClick={() => setShowRestrictedAlert(null)}
              className="text-amber-400 hover:text-amber-600 font-extrabold text-lg px-2"
            >
              &times;
            </button>
          </div>
        )}
        
        {/* Mobile Navigation */}
        {currentUser ? (
          <div className="block md:hidden bg-white p-1.5 rounded-xl border border-gray-150 shadow-sm">
            <div className={`grid ${currentUser?.role === 'Owner/Direktur' ? 'grid-cols-6' : 'grid-cols-5'} gap-1`}>
              <button
                onClick={() => handleTabClick('workflow')}
                className={`text-center py-2 px-1 text-[9px] font-bold rounded-lg transition-all ${
                  activeTab === 'workflow' ? 'bg-slate-950 text-white font-black animate-pulse' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Logistik
              </button>
              <button
                onClick={() => handleTabClick('catalog')}
                className={`text-center py-2 px-1 text-[9px] font-bold rounded-lg transition-all ${
                  activeTab === 'catalog' ? 'bg-slate-950 text-white font-black' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Katalog
              </button>
              <button
                onClick={() => handleTabClick('negotiation')}
                className={`text-center py-2 px-1 text-[9px] font-bold rounded-lg transition-all ${
                  activeTab === 'negotiation' ? 'bg-indigo-650 text-white font-black' : 'text-indigo-750 hover:bg-indigo-50'
                }`}
              >
                Negosiasi
              </button>
              <button
                onClick={() => handleTabClick('notifications')}
                className={`text-center py-2 px-1 text-[9px] font-bold rounded-lg transition-all relative ${
                  activeTab === 'notifications' ? 'bg-slate-950 text-white font-black' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Notif
                {unreadAlertsCount > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => handleTabClick('guide')}
                className={`text-center py-2 px-1 text-[9px] font-bold rounded-lg transition-all ${
                  activeTab === 'guide' ? 'bg-emerald-600 text-white font-black' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Panduan
              </button>
              {currentUser?.role === 'Owner/Direktur' && (
                <button
                  onClick={() => handleTabClick('users')}
                  className={`text-center py-2 px-1 text-[9px] font-bold rounded-lg transition-all ${
                    activeTab === 'users' ? 'bg-purple-700 text-white font-black' : 'text-purple-750 hover:bg-purple-50'
                  }`}
                >
                  Akun
                </button>
              )}
            </div>
            {activeTab !== 'home' && (
              <button
                onClick={() => handleTabClick('home')}
                className="w-full mt-1.5 flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[10px] rounded-lg uppercase tracking-wider transition-all border border-gray-200 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>← Kembali ke Beranda Utama</span>
              </button>
            )}
          </div>
        ) : (
          activeTab !== 'home' && (
            <div className="block md:hidden bg-white p-2.5 rounded-xl border border-gray-150 shadow-sm">
              <button
                onClick={() => handleTabClick('home')}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 text-white font-black text-xs rounded-lg uppercase tracking-wider transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-300" />
                <span>Kembali ke Beranda Utama</span>
              </button>
            </div>
          )
        )}

        {/* Dynamic Inner Tab Views */}
        {activeTab === 'home' ? (
          <LandingPage
            onNavigate={(tab) => setActiveTab(tab)}
            onStartNegotiation={handleStartNegotiation}
            shipmentsCount={shipments.length}
            totalVolume={totalVolumeExported}
            totalValue={shipments.reduce((sum, s) => sum + s.totalValue, 0)}
            currentUser={currentUser}
            onOpenProfile={(mode, fromCalc) => {
              setLoginModalMode(mode || 'login');
              setOpenedLoginFromCalculator(!!fromCalc);
              setIsLoginOpen(true);
            }}
            onLogout={() => {
              setCurrentUser(null);
              setShowRestrictedAlert(null);
            }}
            isCalcOpen={isCalcOpen}
            setIsCalcOpen={setIsCalcOpen}
          />
        ) : activeTab === 'workflow' ? (
          <div className="space-y-6">
            {/* Shipment selector drop down block */}
            <div className="p-5 bg-white rounded-xl border border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Pilih Dokumen & Transaksi Berjalan :</h2>
                <p className="text-xs text-gray-400">Alur kerja memajukan langkah logistik demi memantau status ekspor secara mandiri</p>
              </div>
              <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-semibold uppercase">Transaksi:</span>
                  <select
                    value={activeShipmentId}
                    onChange={(e) => setActiveShipmentId(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50"
                  >
                    {shipments.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.contractNumber} - {s.productName} ({s.currentStep})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* View switcher buttons! */}
                <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setWorkflowViewMode('infographic')}
                    className={`px-3 py-1.5 text-[10.5px] font-bold rounded-md transition-all ${
                      workflowViewMode === 'infographic'
                        ? 'bg-slate-950 text-white shadow-xs font-black'
                        : 'text-gray-500 hover:text-slate-800'
                    }`}
                  >
                    Infografis
                  </button>
                  <button
                    onClick={() => setWorkflowViewMode('checklist')}
                    className={`px-3 py-1.5 text-[10.5px] font-bold rounded-md transition-all ${
                      workflowViewMode === 'checklist'
                        ? 'bg-slate-950 text-white shadow-xs font-black'
                        : 'text-gray-500 hover:text-slate-800'
                    }`}
                  >
                    Tabel Detail
                  </button>
                </div>

                <button
                  onClick={() => setIsNewContractModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  Mulai Kontrak Penjualan Baru
                </button>
              </div>
            </div>

            {/* Document Editor Component (Toggle Mode) */}
            {isDocEditorOpen ? (
              <DocumentEditor
                shipments={shipments}
                currentUser={currentUser}
                onSaveDocument={handleSaveNewDocument}
                onClose={() => setIsDocEditorOpen(false)}
              />
            ) : workflowViewMode === 'infographic' ? (
              <InteractiveInfographic
                shipment={activeShipment}
                currentUser={currentUser}
                onSelectUser={(profile) => setCurrentUser(profile)}
                onUpdateStep={handleUpdateStep}
                onOpenDocumentEditor={() => setIsDocEditorOpen(true)}
                onSimulateEvent={handleSimulateEvent}
              />
            ) : (
              <ShipmentWorkflowTracker
                shipment={activeShipment}
                currentUser={currentUser}
                onUpdateStep={handleUpdateStep}
                onOpenDocumentEditor={() => setIsDocEditorOpen(true)}
                onViewDocument={(doc) => setViewingDocument(doc)}
                onUploadCertification={handleAddCertToShipment}
              />
            )}
          </div>
        ) : activeTab === 'catalog' ? (
          <CatalogSection
            currentUser={currentUser}
            onInitiateShipment={handleInitiateContractFromCatalog}
            onStartNegotiation={handleStartNegotiation}
          />
        ) : activeTab === 'users' ? (
          <AccountManagement
            users={users}
            currentUser={currentUser}
            onDeleteUser={handleDeleteUser}
            onToggleApprove={handleToggleApproveUser}
          />
        ) : activeTab === 'guide' ? (
          <ExportGuide />
        ) : activeTab === 'negotiation' ? (
          <NegotiationDashboard
            initialProduct={negotiationProduct}
            currentUser={currentUser}
            onDealCreated={handleDealCreated}
          />
        ) : (
          <NotificationPanel
            alerts={alerts}
            currentUser={currentUser}
            onMarkAsRead={handleMarkAlertAsRead}
            onClearAll={handleClearAlerts}
            onSimulateEvent={handleSimulateEvent}
          />
        )}

      </main>

      {/* Floating popup login modal component */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={handleCloseLoginModal}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        initialMode={loginModalMode}
      />

      {/* New Sales Contract Builder Modal (Mulai transaksi dari awal) */}
      {isNewContractModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-205 flex flex-col overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg text-slate-900">
                  <FileSignature className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider">Mulai Kontrak Penjualan Baru</h3>
                  <p className="text-[10px] text-emerald-400 font-sans font-bold">TAHAP AWAL (DRAFT) - SALES CONTRACT INSTANSI EKSPOR</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNewContractModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-left font-sans">
              <p className="text-xs text-slate-500">
                Langkah pertama dalam rantai perdagangan internasional adalah penandatanganan <strong>Sales Contract (Kontrak Penjualan)</strong> antara Eksportir Indonesia (Trader/Supplier) dan Importir Luar Negeri (Buyer). Gunakan formulir di bawah ini untuk menginisiasi contoh transaksi baru dari nol:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Select */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-600">Pilih Komoditas Ekspor</label>
                  <select
                    value={newContractForm.productId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    {mockProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* HS Code Display */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-600">Sistem Harmonisasi (HS Code)</label>
                  <input
                    type="text"
                    disabled
                    value={newContractForm.hsCode}
                    className="w-full p-2.5 border border-slate-200 bg-slate-100 text-slate-500 rounded-xl text-xs font-mono"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-600">Volume Cargo Ekspor ({newContractForm.unit})</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={newContractForm.quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 font-semibold"
                  />
                </div>

                {/* Total Value */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-600 font-bold">Perkiraan Nilai Kontrak (FOB USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      value={newContractForm.totalValue}
                      onChange={(e) => setNewContractForm(p => ({ ...p, totalValue: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-7 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 font-bold text-emerald-600"
                    />
                  </div>
                </div>

                {/* Buyer Company */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-600">Perusahaan Importir (Buyer)</label>
                  <input
                    type="text"
                    value={newContractForm.buyerCompany}
                    onChange={(e) => setNewContractForm(p => ({ ...p, buyerCompany: e.target.value }))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 font-medium"
                    placeholder="Nama Perusahaan Importir Global"
                  />
                </div>

                {/* Buyer Contact */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-600">Nama Kontak Importir</label>
                  <input
                    type="text"
                    value={newContractForm.buyerName}
                    onChange={(e) => setNewContractForm(p => ({ ...p, buyerName: e.target.value }))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 font-medium"
                    placeholder="Nama Representatif Pembeli"
                  />
                </div>

                {/* Port of Loading */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-600">Pelabuhan Muat (Indonesia)</label>
                  <input
                    type="text"
                    value={newContractForm.portOfLoading}
                    onChange={(e) => setNewContractForm(p => ({ ...p, portOfLoading: e.target.value }))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>

                {/* Port of Discharge */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-600">Pelabuhan Bongkar (Tujuan)</label>
                  <input
                    type="text"
                    value={newContractForm.portOfDischarge}
                    onChange={(e) => setNewContractForm(p => ({ ...p, portOfDischarge: e.target.value }))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>

                {/* Vessel Name Optional */}
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-[11px] font-black uppercase text-slate-600">Nama Kapal Kargo Terjadwal (Vessel Booking)</label>
                  <input
                    type="text"
                    value={newContractForm.vesselName}
                    onChange={(e) => setNewContractForm(p => ({ ...p, vesselName: e.target.value }))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Supplier Info Info note */}
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-2 text-indigo-950 text-[11px]">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Informasi Rantai Pasok:</span> Komoditas pilihan Anda akan disuplai secara langsung oleh <strong>{newContractForm.supplierCompany}</strong> sebagai mitra produsen tani terdaftar di portal ExportFlow.
                </div>
              </div>
            </div>

            {/* Modal Footer actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-20c flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsNewContractModalOpen(false)}
                className="py-2.5 px-5 bg-white border border-slate-350 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleCreateNewTransaction(newContractForm)}
                className="py-2.5 px-6 bg-slate-900 hover:bg-slate-805 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-2 hover:-translate-y-0.5"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Sah & Terbitkan Draf Kontrak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating popup login modal component */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={handleCloseLoginModal}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        initialMode={loginModalMode}
      />

      {/* Floating document detailed viewer with PRINT utilities */}
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          currentUser={currentUser}
          onClose={() => setViewingDocument(null)}
          onApproveDocument={handleApproveDocument}
          onSubmitDocumentForApproval={handleSubmitDocumentForApproval}
        />
      )}

      {/* Portal humble professional footer */}
      <footer className="mt-16 border-t border-gray-200 pt-8 max-w-7xl mx-auto px-4 text-center space-y-2">
        <p className="text-xs font-medium text-gray-500">
          Aplikasi Manajemen Administrasi Ekspor Indonesia (ExportFlow) &bull; Terintegrasi Karantina & Bea Cukai RI.
        </p>
        <p className="text-[10px] text-gray-400">
          Proyek Simulasi Pameran Kemendag RI &copy; 2026. Semua kalkulasi FOB dan data kepabeanan mematuhi standar INCOTERMS internasional.
        </p>
      </footer>

    </div>
  );
}
