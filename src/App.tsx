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
import DocumentEditor from './components/DocumentEditor';
import DocumentViewer from './components/DocumentViewer';
import InteractiveInfographic from './components/InteractiveInfographic';
import ExportGuide from './components/ExportGuide';
import LandingPage from './components/LandingPage';
import AccountManagement from './components/AccountManagement';
import NotificationCenter from './components/NotificationCenter';
import { LANGUAGES, translations } from './translations';
import { 
  Bell, Globe, Activity, ShieldCheck, FileText, 
  Clock, CheckCircle, Package, Truck, AlertCircle, 
  Database, UserCheck, UserPlus, Users, TrendingUp, Info, Layers,
  Plus, X, FileSignature, BookOpen, Lock, ArrowRight, ArrowLeft, ShieldAlert,
  Ship, Home, Key, Eye, EyeOff, Edit, User, Settings, Trash2, Search, Filter, Award
} from 'lucide-react';

export default function App() {
  // 1. Initial State Initialization
  const [lang, setLang] = useState<string>(() => {
    // Default to 'id' for the user's workspace
    return 'id';
  });

  useEffect(() => {
    localStorage.setItem('exportflow_language', lang);
  }, [lang]);

  const t = translations[lang] || translations.id;

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('exportflow_current_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return null;
  });

  const [shipments, setShipments] = useState<ExportShipment[]>(() => {
    const stored = localStorage.getItem('exportflow_shipments');
    if (stored) {
      try {
        let parsed: ExportShipment[] = JSON.parse(stored);
        // Correct legacy localStorage data where Frankie Shippers (ship-1003) or others had conflicting buyerId 'usr-buyer'
        let changed = false;
        parsed = parsed.map(s => {
          if (s.id === 'ship-1003' && s.buyerId === 'usr-buyer') {
            changed = true;
            return { ...s, buyerId: 'usr-buyer-frankie' };
          }
          if (s.buyerId === 'usr-buyer' && s.buyerCompany && !s.buyerCompany.toLowerCase().includes('eurofoods') && !s.buyerName.toLowerCase().includes('mueller')) {
            changed = true;
            const slug = s.buyerCompany.toLowerCase().trim()
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            return { ...s, buyerId: `usr-buyer-${slug || 'generic'}` };
          }
          return s;
        });
        if (changed) {
          localStorage.setItem('exportflow_shipments', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {}
    }
    const base = initialShipments();
    const initial = base.map(s => ({
      ...s,
      documents: createMockDocuments(s.id, s.totalValue, s.quantity, s.unit, s.productName, s.hsCode),
      certifications: mockCertificationsList(s.id)
    }));
    localStorage.setItem('exportflow_shipments', JSON.stringify(initial));
    return initial;
  });

  // Save current user to local storage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('exportflow_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('exportflow_current_user');
    }
  }, [currentUser]);

  // Save shipments to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('exportflow_shipments', JSON.stringify(shipments));
  }, [shipments]);

  const [alerts, setAlerts] = useState<RealTimeAlert[]>(() => initialAlerts);
  const [activeShipmentId, setActiveShipmentId] = useState<string>('');
  const [targetStepIndex, setTargetStepIndex] = useState<number | undefined>(undefined);
  const [targetSubStepIndex, setTargetSubStepIndex] = useState<number | undefined>(undefined);
  const [shipmentSearchQuery, setShipmentSearchQuery] = useState('');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'home' | 'workflow' | 'guide' | 'negotiation' | 'users'>('home');
  const [workflowSubTab, setWorkflowSubTab] = useState<'cargo' | 'sample'>('cargo');
  const [negoStepId, setNegoStepId] = useState<number>(1);
  const [negotiationProduct, setNegotiationProduct] = useState<ExportProduct | undefined>(undefined);
  const [showRestrictedAlert, setShowRestrictedAlert] = useState<string | null>(null);
  const [autoOpenLoi, setAutoOpenLoi] = useState<boolean>(false);

  // Local storage based user list and login credential state
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const isSandboxToRemove = (emailStr: string) => {
      const e = (emailStr || '').trim().toLowerCase();
      return [
        'admin@exportflow.com',
        'hendry@nusantara-traders.com',
        'hans.m@tokyocoffee-import.de',
        'siti.aminah@samuderatrans.co.id',
        'wayan@organic-bali-spices.com'
      ].includes(e);
    };

    const stored = localStorage.getItem('exportflow_users');
    if (stored) {
      try {
        let us = JSON.parse(stored);
        us = us.map((u: any) => u.role === 'Owner/Direktur' ? { ...u, role: 'Superadmin' } : u);
        us = us.filter((u: any) => !isSandboxToRemove(u.email));
        
        // Ensure joko is present in users
        if (!us.some((u: any) => u.name.toLowerCase() === 'joko')) {
          us.unshift({
            id: 'usr-joko',
            name: 'joko',
            role: 'Superadmin',
            email: 'joko@exportflow.com',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            companyName: 'Kementerian Perdagangan & Bea Cukai (Bea Cukai RI)',
            phone: '0822-1832-2672',
            isApproved: true
          } as any);
        }
        // Ensure lis is present in users
        if (!us.some((u: any) => u.name.toLowerCase() === 'lis')) {
          us.unshift({
            id: 'usr-lis',
            name: 'lis',
            role: 'Trader',
            email: 'lis@exportflow.com',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
            companyName: 'PT Multi Raksa Madani',
            phone: '0857-2045-21691',
            isApproved: true
          } as any);
        }
        localStorage.setItem('exportflow_users', JSON.stringify(us));
        return us;
      } catch (e) {}
    }
    const initial = mockUsers.map(u => ({ ...u, isApproved: true })).filter((u: any) => !isSandboxToRemove(u.email));
    localStorage.setItem('exportflow_users', JSON.stringify(initial));
    return initial;
  });

  // Local storage based products state
  const [products, setProducts] = useState<ExportProduct[]>(() => {
    const stored = localStorage.getItem('exportflow_products');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return mockProducts;
  });

  // Local storage based company profile
  const [companyProfile, setCompanyProfile] = useState(() => {
    const defaultProfile = {
      nib: '0602230086432',
      nibNotes: '(Izin Ekspor Pertanian & Agro-Industri Aktif)',
      npwp: '62.708.227.4-429.000',
      ceisa: 'rec CEISA',
      insw: 'rec insw',
      address: 'Kompleks Cisaranten Indah No. 21, Kota Bandung, Jawa Barat, Indonesia',
      telephone: '0857-2045-21691',
      whatsapp: '0822-1832-2672',
      email: 'support@ptmrm.my.id',
      bannerImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600&q=80',
      originPort: 'Tanjung Priok, JKT',
      exporterLegality: 'NIK-294021796-A',
      qualityCompliance: 'ISO 9001, SVLK',
      financialGuarantee: 'Bank Escrow SSL',
    };
    const stored = localStorage.getItem('exportflow_company_profile');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...defaultProfile, ...parsed };
      } catch (e) {}
    }
    return defaultProfile;
  });

  useEffect(() => {
    // Migrate legacy users and currentUser from older company names to 'PT Multi Raksa Madani'
    let usersChanged = false;
    const updatedUsers = users.map(u => {
      if (u.companyName === 'PT Nusantara Global Trader' || u.companyName === 'PT Nusantara Global Agrisindo') {
        usersChanged = true;
        return { ...u, companyName: 'PT Multi Raksa Madani' };
      }
      return u;
    });
    if (usersChanged) {
      setUsers(updatedUsers);
      localStorage.setItem('exportflow_users', JSON.stringify(updatedUsers));
    }

    if (currentUser && (currentUser.companyName === 'PT Nusantara Global Trader' || currentUser.companyName === 'PT Nusantara Global Agrisindo')) {
      const updatedCurrentUser = { ...currentUser, companyName: 'PT Multi Raksa Madani' };
      setCurrentUser(updatedCurrentUser);
      localStorage.setItem('exportflow_current_user', JSON.stringify(updatedCurrentUser));
    }

    // Migrate company profile to updated legality and contact info
    const storedProfile = localStorage.getItem('exportflow_company_profile');
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        if (parsed.nib === 'No. NIB 0122110034455 / SIUP 452/32.10/2026' || !parsed.npwp || parsed.email === 'support@multiraksamaradani.co.id') {
          const updatedProfile = {
            ...parsed,
            nib: '0602230086432',
            npwp: '62.708.227.4-429.000',
            ceisa: 'rec CEISA',
            insw: 'rec insw',
            address: 'Kompleks Cisaranten Indah No. 21, Kota Bandung, Jawa Barat, Indonesia',
            telephone: '0857-2045-21691',
            whatsapp: '0822-1832-2672',
            email: 'support@ptmrm.my.id',
          };
          setCompanyProfile(updatedProfile);
          localStorage.setItem('exportflow_company_profile', JSON.stringify(updatedProfile));
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('exportflow_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('exportflow_company_profile', JSON.stringify(companyProfile));
  }, [companyProfile]);

  // Local storage based sample requests state
  const [sampleRequests, setSampleRequests] = useState<any[]>(() => {
    const stored = localStorage.getItem('exportflow_sample_requests');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return [
      {
        id: 'samp-101',
        productId: 'prod-1',
        productName: 'Kopi Gayo Arabika (Grade 1 Specialty)',
        buyerName: 'Hiroshi Tanaka',
        buyerCompany: 'Tanaka Specialty Coffee Ltd.',
        quantity: '2 kg',
        courier: 'DHL Express',
        courierAccount: 'DHL-987654321',
        shippingAddress: 'Aoyama 3-Chome, Minato-ku, Tokyo 107-0062, Japan',
        shippingFeePaidBy: 'buyer',
        shippingFeeAmount: 85,
        status: 'shipped',
        trackingNumber: 'TRK-DHL-88772211',
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'samp-102',
        productId: 'prod-2',
        productName: 'Arang Batok Kelapa (Coconut Charcoal Briquettes)',
        buyerName: 'Sophie Dubois',
        buyerCompany: 'Paris Hookah Lounge Supply',
        quantity: '1 kg',
        courier: 'FedEx International',
        courierAccount: '',
        shippingAddress: 'Rue du Faubourg Saint-Antoine, 75011 Paris, France',
        shippingFeePaidBy: 'buyer',
        shippingFeeAmount: 95,
        status: 'pending',
        trackingNumber: '',
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('exportflow_sample_requests', JSON.stringify(sampleRequests));
  }, [sampleRequests]);

  // States for Change Password Modal
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // States for Edit Profile Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileCompany, setProfileCompany] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileCountry, setProfileCountry] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [showProfileCurrentPassword, setShowProfileCurrentPassword] = useState(false);
  const [showProfileNewPassword, setShowProfileNewPassword] = useState(false);
  const [showProfileConfirmPassword, setShowProfileConfirmPassword] = useState(false);

  const openEditProfile = () => {
    if (!currentUser) return;
    setProfileName(currentUser.name);
    setProfileEmail(currentUser.email);
    setProfileCompany(currentUser.companyName);
    setProfilePhone(currentUser.phone || '');
    setProfileAddress(currentUser.address || '');
    setProfileCountry(currentUser.country || '');
    setProfileAvatar(currentUser.avatar);
    setProfileCurrentPassword('');
    setProfileNewPassword('');
    setProfileConfirmPassword('');
    setProfileError('');
    setProfileSuccess('');
    setShowProfileCurrentPassword(false);
    setShowProfileNewPassword(false);
    setShowProfileConfirmPassword(false);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!currentUser) {
      setProfileError('Sesi login kedaluwarsa. Silakan masuk kembali.');
      return;
    }

    if (!profileName.trim() || !profileEmail.trim() || !profileCompany.trim()) {
      setProfileError('Nama, Email, dan Nama Perusahaan wajib diisi.');
      return;
    }

    const emailLower = profileEmail.trim().toLowerCase();

    // Check if email is already taken by another user
    const emailExists = users.some(u => u.id !== currentUser.id && u.email.toLowerCase() === emailLower);
    if (emailExists) {
      setProfileError('Email ini sudah terdaftar oleh pengguna lain.');
      return;
    }

    // Load credentials from localStorage to check/update password or email
    const storedCreds = localStorage.getItem('exportflow_credentials');
    let creds: any[] = [];
    if (storedCreds) {
      try {
        creds = JSON.parse(storedCreds);
      } catch (err) {}
    }

    let userCredIndex = creds.findIndex((c: any) => c.email.toLowerCase() === currentUser.email.toLowerCase());
    if (userCredIndex === -1) {
      userCredIndex = creds.findIndex((c: any) => c.name.toLowerCase() === currentUser.name.toLowerCase() && c.role === currentUser.role);
    }

    const isChangingPassword = profileNewPassword.length > 0;

    if (isChangingPassword) {
      if (!profileCurrentPassword) {
        setProfileError('Harap masukkan kata sandi saat ini untuk mengubah kata sandi.');
        return;
      }
      if (userCredIndex !== -1 && creds[userCredIndex].password !== profileCurrentPassword) {
        setProfileError('Kata sandi saat ini salah.');
        return;
      }
      if (profileNewPassword.length < 6) {
        setProfileError('Kata sandi baru minimal harus 6 karakter.');
        return;
      }
      if (profileNewPassword !== profileConfirmPassword) {
        setProfileError('Konfirmasi kata sandi baru tidak cocok.');
        return;
      }
    }

    // Update credentials
    if (userCredIndex !== -1) {
      creds[userCredIndex].name = profileName.trim();
      creds[userCredIndex].email = emailLower;
      creds[userCredIndex].company = profileCompany.trim();
      if (isChangingPassword) {
        creds[userCredIndex].password = profileNewPassword;
      }
    } else {
      creds.push({
        role: currentUser.role,
        email: emailLower,
        password: isChangingPassword ? profileNewPassword : 'user123',
        name: profileName.trim(),
        company: profileCompany.trim()
      });
    }
    localStorage.setItem('exportflow_credentials', JSON.stringify(creds));

    // Update users list state and localStorage
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          name: profileName.trim(),
          email: emailLower,
          companyName: profileCompany.trim(),
          phone: profilePhone.trim() || undefined,
          address: profileAddress.trim(),
          country: profileCountry.trim(),
          avatar: profileAvatar
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('exportflow_users', JSON.stringify(updatedUsers));

    // Update current user state
    const updatedCurrentUser = {
      ...currentUser,
      name: profileName.trim(),
      email: emailLower,
      companyName: profileCompany.trim(),
      phone: profilePhone.trim() || undefined,
      address: profileAddress.trim(),
      country: profileCountry.trim(),
      avatar: profileAvatar
    };
    setCurrentUser(updatedCurrentUser);
    localStorage.setItem('exportflow_current_user', JSON.stringify(updatedCurrentUser));

    setProfileSuccess('Profil & kata sandi berhasil diperbarui!');
    
    setTimeout(() => {
      setIsEditProfileOpen(false);
      setProfileSuccess('');
    }, 1500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');

    if (!currentUser) {
      setChangePasswordError('Sesi login kedaluwarsa. Silakan masuk kembali.');
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setChangePasswordError('Semua kolom wajib diisi.');
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError('Sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError('Konfirmasi sandi baru tidak cocok.');
      return;
    }

    // Load credentials from localStorage
    const storedCreds = localStorage.getItem('exportflow_credentials');
    let creds = [];
    if (storedCreds) {
      try {
        creds = JSON.parse(storedCreds);
      } catch (err) {}
    }

    // Find current user's credentials
    const userCredIndex = creds.findIndex((c: any) => c.email.toLowerCase() === currentUser.email.toLowerCase());
    
    if (userCredIndex === -1) {
      setChangePasswordError('Data kredensial akun Anda tidak ditemukan.');
      return;
    }

    if (creds[userCredIndex].password !== currentPassword) {
      setChangePasswordError('Sandi saat ini salah.');
      return;
    }

    // Update password
    creds[userCredIndex].password = newPassword;
    localStorage.setItem('exportflow_credentials', JSON.stringify(creds));

    setChangePasswordSuccess('Sandi berhasil diperbarui secara aman!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    
    // Auto close after 2 seconds
    setTimeout(() => {
      setIsChangePasswordOpen(false);
      setChangePasswordSuccess('');
    }, 2000);
  };

  // Helper values for restrictions (Public guests are restricted to home)
  const isRestricted = !currentUser;

  const getFriendlyTabName = (tabName: string) => {
    switch (tabName) {
      case 'workflow': return 'Transaksi';
      case 'guide': return 'Hub Regulasi & Panduan';
      case 'users': return 'Atur Akun';
      default: return tabName;
    }
  };

  const handleTabClick = (tab: 'home' | 'workflow' | 'guide' | 'negotiation' | 'users') => {
    if (isRestricted && tab !== 'home') {
      setShowRestrictedAlert(tab);
      // Auto-hide alert after 8 seconds
      setTimeout(() => setShowRestrictedAlert(null), 8000);
      return;
    }
    if (tab === 'guide' && currentUser && currentUser.role !== 'Superadmin' && currentUser.role !== 'Trader') {
      return;
    }
    setShowRestrictedAlert(null);
    setActiveTab(tab);
  };

  const scrollToSection = (id: string) => {
    setShowRestrictedAlert(null);
    if (activeTab !== 'home') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Enforce the rule: if restricted, they can never land on other tabs
  useEffect(() => {
    if (isRestricted && activeTab !== 'home') {
      setActiveTab('home');
    }
    // If not superadmin or trader, they cannot access the guide tab
    if (currentUser && activeTab === 'guide' && currentUser.role !== 'Superadmin' && currentUser.role !== 'Trader') {
      setActiveTab('workflow');
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
  const [shipmentToDeleteId, setShipmentToDeleteId] = useState<string | null>(null);

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

  // Autofill new contract builder form if currentUser is a Buyer
  useEffect(() => {
    if (currentUser && currentUser.role === 'Buyer') {
      setNewContractForm(prev => ({
        ...prev,
        buyerName: currentUser.name,
        buyerCompany: currentUser.companyName
      }));
    }
  }, [currentUser, isNewContractModalOpen]);

  const handleProductChange = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
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
    const prod = products.find(p => p.id === newContractForm.productId);
    const priceNum = prod ? (parseFloat(prod.price.replace(/,/g, '')) || 1000) : 1000;
    setNewContractForm(prev => ({
      ...prev,
      quantity: qty,
      totalValue: priceNum * qty
    }));
  };

  // Filtering shipments by role (Buyer, Supplier, Forwarder can only see/edit their own transactions)
  const visibleShipments = shipments.filter(s => {
    if (!currentUser) return true;
    if (currentUser.role === 'Buyer') {
      return s.buyerId === currentUser.id;
    }
    if (currentUser.role === 'Supplier') {
      return s.supplierId === currentUser.id;
    }
    if (currentUser.role === 'Forwarder') {
      return s.forwarderId === currentUser.id;
    }
    return true;
  });

  // Apply Search Query & Status Filters
  const filteredShipments = visibleShipments.filter(s => {
    // Status Filter
    if (shipmentStatusFilter === 'Draft') {
      const isSigned = s.documents.some(d => (d.type === 'Sales Contract' || d.type === 'Proforma Invoice') && d.status === 'Approved');
      if (isSigned) return false;
    } else if (shipmentStatusFilter === 'Completed') {
      const isSigned = s.documents.some(d => (d.type === 'Sales Contract' || d.type === 'Proforma Invoice') && d.status === 'Approved');
      if (!isSigned) return false;
    }
    // Search Query Filter
    if (shipmentSearchQuery.trim() !== '') {
      const q = shipmentSearchQuery.toLowerCase();
      const matchContract = s.contractNumber.toLowerCase().includes(q);
      const matchProduct = s.productName.toLowerCase().includes(q);
      const matchBuyer = s.buyerCompany.toLowerCase().includes(q);
      const matchPol = s.portOfLoading.toLowerCase().includes(q);
      const matchPod = s.portOfDischarge.toLowerCase().includes(q);
      return matchContract || matchProduct || matchBuyer || matchPol || matchPod;
    }
    return true;
  });

  // Active Shipment Ref Helper
  const activeShipment = visibleShipments.find(s => s.id === activeShipmentId) || (visibleShipments.length > 0 ? visibleShipments[0] : undefined);

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
          contractNumber: activeShipment?.contractNumber || 'SC-GLOBAL',
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
          contractNumber: activeShipment?.contractNumber || 'SC-GLOBAL',
          title: 'Sertifikasi Karantina Tervalidasi',
          message: `Sertifikasi karantina phytosanitary hasil tani pada kontrak ${activeShipment?.contractNumber || 'SC-GLOBAL'} dinyatakan lulus uji laboratorium oleh Balai Karandina Indonesia.`,
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
          contractNumber: activeShipment?.contractNumber || 'SC-GLOBAL',
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
      contractNumber: activeShipment?.contractNumber || 'SC-GLOBAL',
      title: 'Penerbitan Dokumen Baru',
      message: `${newDoc.type} ekspor berhasil dirilis oleh ${currentUser?.role === 'Superadmin' ? 'Superadmin (mewakili Trader)' : 'Trader'} (${currentUser?.name}) dengan nomor formal ${newDoc.code}.`,
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
      contractNumber: activeShipment?.contractNumber || 'SC-GLOBAL',
      title: 'Surat Pengajuan Terkirim',
      message: `Surat Pengajuan resmi untuk berkas ekspor telah dikirimkan oleh pelaku usaha (${currentUser?.name}) agar ditelaah & disahkan oleh Otoritas Dagang.`,
      type: 'warning',
      timestamp: new Date().toISOString(),
      readBy: []
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleApproveDocument = (docId: string) => {
    // Customs (Superadmin) stamps / approves the document
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
      contractNumber: activeShipment?.contractNumber || 'SC-GLOBAL',
      title: 'Pabean Memvalidasi Dokumen',
      message: `Pihak Bea Cukai (Superadmin) telah meneliti fisik serta menerbitkan cap validasi pabean hijau pada berkas.`,
      type: 'success',
      timestamp: new Date().toISOString(),
      readBy: []
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleUpdateShipmentFromDeal = (
    shipmentId: string, 
    updatedData: {
      quantity: number;
      pricePerUnit: number;
      paymentTerms: string;
      incoterms: string;
      portOfDischarge: string;
      buyerCompany: string;
      nextStep: ShipmentStep;
      comments: string;
    }
  ) => {
    // Find active shipment's total calculated value
    const calculatedValue = updatedData.quantity * updatedData.pricePerUnit;

    let finalContractNumber = activeShipment?.contractNumber || 'SC-GLOBAL';
    if (finalContractNumber.endsWith('-NEGO')) {
      const randNum = Math.floor(100 + Math.random() * 900);
      finalContractNumber = finalContractNumber.replace('-NEGO', `-${randNum}`);
    }

    setShipments(prev => prev.map(s => {
      if (s.id === shipmentId) {
        // Also update documents status
        const updatedDocs = s.documents.map(d => {
          if (d.type === 'Sales Contract' || d.type === 'Proforma Invoice') {
            return { ...d, status: 'Approved' as const };
          }
          return d;
        });

        return {
          ...s,
          contractNumber: finalContractNumber,
          quantity: updatedData.quantity,
          totalValue: calculatedValue,
          portOfDischarge: updatedData.portOfDischarge,
          buyerCompany: updatedData.buyerCompany,
          incoterms: updatedData.incoterms,
          paymentTerms: updatedData.paymentTerms,
          currentStep: updatedData.nextStep,
          documents: updatedDocs,
          stepHistory: [
            ...s.stepHistory,
            {
              step: updatedData.nextStep,
              timestamp: new Date().toISOString(),
              updatedBy: currentUser?.id || 'sim',
              comments: updatedData.comments
            }
          ]
        };
      }
      return s;
    }));

    // Trigger success alert
    const newAlert: RealTimeAlert = {
      id: `alt-dealConfirm-${Date.now()}`,
      shipmentId,
      contractNumber: finalContractNumber,
      title: 'Kesepakatan Deal PI/Kontrak Tercapai!',
      message: `Draf negosiasi resmi disahkan secara bilateral untuk ${activeShipment?.productName}. Nomor kontrak resmi diterbitkan: ${finalContractNumber}. Nominal total: $${calculatedValue.toLocaleString('id-ID')} USD.`,
      type: 'success',
      timestamp: new Date().toISOString(),
      readBy: []
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleUpdateStep = (shipmentId: string, nextStep: ShipmentStep, comments: string) => {
    let finalContractNumber = '';

    setShipments(prev => prev.map(s => {
      if (s.id === shipmentId) {
        let contractNumber = s.contractNumber;
        if (nextStep === 'Draft') {
          if (!contractNumber.endsWith('-NEGO')) {
            const hasTrailingDigits = /-\d{3}$/.test(contractNumber);
            if (hasTrailingDigits) {
              contractNumber = contractNumber.slice(0, -4) + '-NEGO';
            } else {
              contractNumber = contractNumber + '-NEGO';
            }
          }
        } else {
          if (contractNumber.endsWith('-NEGO')) {
            const randNum = Math.floor(100 + Math.random() * 900);
            contractNumber = contractNumber.replace('-NEGO', `-${randNum}`);
          }
        }
        finalContractNumber = contractNumber;

        return {
          ...s,
          contractNumber,
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
      contractNumber: finalContractNumber || activeShipment?.contractNumber || 'SC-GLOBAL',
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
      contractNumber: activeShipment?.contractNumber || 'SC-GLOBAL',
      title: 'Sertifikasi Tambahan Diterbitkan',
      message: `Sertifikasi tambahan "${name}" dilampirkan oleh ${currentUser?.role === 'Superadmin' ? 'Superadmin (mewakili Trader)' : 'Trader'}.`,
      type: 'info',
      timestamp: new Date().toISOString(),
      readBy: []
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const getBuyerIdForNewTransaction = (buyerCompany: string, buyerName?: string) => {
    if (currentUser && currentUser.role === 'Buyer') {
      return currentUser.id;
    }
    const cleanCompany = (buyerCompany || '').toLowerCase().trim();
    const cleanName = (buyerName || '').toLowerCase().trim();
    
    // Primary: look up in registered users list
    const foundUser = users.find(u => 
      u.role === 'Buyer' && 
      (
        (u.companyName && cleanCompany && (u.companyName.toLowerCase().includes(cleanCompany) || cleanCompany.includes(u.companyName.toLowerCase()))) ||
        (u.name && cleanName && (u.name.toLowerCase().includes(cleanName) || cleanName.includes(u.name.toLowerCase())))
      )
    );
    if (foundUser) {
      return foundUser.id;
    }
    
    // Fallback: If it's Eurofoods, use the default usr-buyer
    if (cleanCompany.includes('eurofoods') || cleanName.includes('mueller')) {
      return 'usr-buyer';
    }
    
    // Otherwise, generate a clean slug-based buyerId to isolate it
    const slug = cleanCompany
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return `usr-buyer-${slug || 'generic'}`;
  };

  const handleInitiateContractFromCatalog = (product: ExportProduct) => {
    // Generate new shipment
    const newShipmentId = `ship-${1000 + shipments.length + 1}`;
    const defaultBuyerCompany = (currentUser && currentUser.role === 'Buyer') ? currentUser.companyName : 'EuroFoods Import GmbH (München)';
    const defaultBuyerName = (currentUser && currentUser.role === 'Buyer') ? currentUser.name : 'EuroFoods Import GmbH';
    const newShip: ExportShipment = {
      id: newShipmentId,
      contractNumber: `SC/NGL/${product.id.toUpperCase()}-2026`,
      buyerId: getBuyerIdForNewTransaction(defaultBuyerCompany, defaultBuyerName),
      buyerName: defaultBuyerName,
      buyerCompany: defaultBuyerCompany,
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
    newShip.documents = createMockDocuments(newShip.id, newShip.totalValue, newShip.quantity, newShip.unit, newShip.productName, newShip.hsCode).map(d => ({
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
    const newShipmentId = `ship-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const randNum = Math.floor(100 + Math.random() * 900);
    const prodCode = formData.productId.toUpperCase().replace('PROD-', 'PR');
    const newShip: ExportShipment = {
      id: newShipmentId,
      contractNumber: `SC/NGL/${prodCode}-2026-${randNum}`,
      buyerId: getBuyerIdForNewTransaction(formData.buyerCompany, formData.buyerName),
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

  const handleStartNegotiation = (product: ExportProduct, customQuantity?: number) => {
    // Generate new active shipment in draft mode
    const newShipmentId = `ship-${1000 + shipments.length + 1}`;
    const defaultBuyerCompany = (currentUser && currentUser.role === 'Buyer') ? currentUser.companyName : 'YOSHIHIDE TRADING CO., LTD.';
    const defaultBuyerName = (currentUser && currentUser.role === 'Buyer') ? currentUser.name : 'Kenji Yoshihide';
    
    const finalQty = customQuantity || 15;
    const pricePerTon = parseFloat(product.price.replace(/,/g, '')) || 1000;
    const finalTotalValue = pricePerTon * finalQty;

    const newShip: ExportShipment = {
      id: newShipmentId,
      contractNumber: `SC/NGL/${product.id.toUpperCase()}-2026-NEGO`,
      buyerId: getBuyerIdForNewTransaction(defaultBuyerCompany, defaultBuyerName),
      buyerName: defaultBuyerName,
      buyerCompany: defaultBuyerCompany,
      supplierId: 'usr-supplier',
      supplierName: product.supplierName,
      supplierCompany: product.supplierName,
      forwarderId: 'usr-forwarder',
      forwarderName: 'Siti Aminah',
      forwarderCompany: 'PT Samudera Logistik Internasional',
      traderId: 'usr-trader',
      traderName: currentUser?.name || 'Hendry Kurniawan',
      productName: product.name,
      quantity: finalQty,
      unit: product.unit,
      totalValue: finalTotalValue,
      currency: 'USD',
      hsCode: product.hsCode,
      portOfLoading: 'Tanjung Priok, Jakarta',
      portOfDischarge: 'Port of Yokohama, Japan',
      vesselName: 'MV Samudera Pasifik V.204',
      voyageNumber: 'V.204',
      etd: new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString().split('T')[0],
      eta: new Date(Date.now() + 50 * 24 * 3600 * 1000).toISOString().split('T')[0],
      trackingNumber: `SMDR-TR-${Math.floor(100000 + Math.random() * 900000)}`,
      currentStep: 'Draft',
      stepHistory: [
        { 
          step: 'Draft', 
          timestamp: new Date().toISOString(), 
          updatedBy: 'usr-buyer', 
          comments: 'Inisiasi minat pembeli asing (Letter of Intent / LOI) dari Halaman Katalog.' 
        }
      ],
      documents: [],
      certifications: []
    };

    // Populate initial documents & certifications
    newShip.documents = createMockDocuments(newShip.id, finalTotalValue, finalQty, newShip.unit, newShip.productName, newShip.hsCode).map(d => ({
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
    setNegotiationProduct(product);
    setActiveTab('workflow'); // Go straight to the combined workflow dashboard!
    setAutoOpenLoi(true);
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
        type: 'alert',
        title: 'Akun Terhapus',
        message: `Akun pendaftaran atas nama ${userObj.name} (${userObj.role}) telah dihapus dari database pabean oleh Superadmin.`,
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
          ? `Akun ${userObj.name} (${userObj.role}) telah disahkan secara penuh oleh Superadmin Bea Cukai untuk menjalankan aktivitas ekspor.`
          : `Pengesahan lisensi akun ${userObj.name} telah dicabut oleh Superadmin Bea Cukai. Akses logistik dibatasi.`,
        timestamp: new Date().toISOString(),
        readBy: []
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const handleUpdateUsersList = (newUsers: UserProfile[]) => {
    setUsers(newUsers);
    localStorage.setItem('exportflow_users', JSON.stringify(newUsers));
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

    const defaultBuyerName = (currentUser && currentUser.role === 'Buyer') ? currentUser.name : 'Kenji Yoshihide';
    const newShip: ExportShipment = {
      id: newShipmentId,
      contractNumber: `SC/NGL/${dealData.product.id.toUpperCase().replace('PROD-', 'PR')}-2026-GPS`,
      buyerId: getBuyerIdForNewTransaction(dealData.buyerCompany, defaultBuyerName),
      buyerName: defaultBuyerName,
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
      currentStep: 'Draft',
      stepHistory: [
        { 
          step: 'Draft', 
          timestamp: new Date().toISOString(), 
          updatedBy: 'usr-buyer', 
          comments: 'Inisiasi Bilateral: LOI dan Quotation disetujui bersama melalui meja penandatanganan PI.' 
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
  
  const isShipmentDealCompleted = (s: ExportShipment) => {
    return s.documents.some(d => d.type === 'Sales Contract' && d.status === 'Approved');
  };

  const completedShipmentsValue = visibleShipments
    .filter(isShipmentDealCompleted)
    .reduce((sum, s) => sum + s.totalValue, 0);

  const activeShipmentsCount = visibleShipments.filter(s => !isShipmentDealCompleted(s)).length;
  
  const totalVolumeExported = visibleShipments.reduce((sum, s) => sum + s.quantity, 0);

  const getStepDetails = (s: ExportShipment) => {
    const isSigned = s.documents.some(d => (d.type === 'Sales Contract' || (d.type as string) === 'Proforma Invoice') && d.status === 'Approved');
    
    switch (s.currentStep) {
      case 'Draft':
        if (!isSigned) {
          return {
            label: 'Negosiasi Kontrak',
            color: 'text-amber-700 bg-amber-50/70 border-amber-200',
            percent: 15
          };
        } else {
          return {
            label: 'Kontrak Disetujui',
            color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
            percent: 30
          };
        }
      case 'Shipping': {
        let completedSubs: number[] = [];
        const stored = localStorage.getItem(`exportflow_completed_substeps_${s.id}`);
        if (stored) {
          try {
            completedSubs = JSON.parse(stored);
          } catch (e) {}
        }
        const completedCount = completedSubs.length;
        const percent = 30 + Math.min(completedCount, 4) * 15;
        
        let subLabel = 'Proses Logistik';
        if (completedCount === 0) subLabel = 'Sourcing Komoditas';
        else if (completedCount === 1) subLabel = 'Karantina & Bea Cukai';
        else if (completedCount === 2) subLabel = 'Pelayaran Kargo';
        else if (completedCount === 3) subLabel = 'Pencairan L/C';
        else if (completedCount === 4) subLabel = 'L/C Cair (Menunggu Verifikasi Akhir)';

        return {
          label: `${subLabel} (${completedCount}/4 Selesai)`,
          color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
          percent: percent
        };
      }
      case 'Completed':
        return {
          label: 'Transaksi Selesai',
          color: 'text-emerald-700 bg-emerald-100 border-emerald-200',
          percent: 100
        };
      default:
        return {
          label: 'Draf',
          color: 'text-slate-700 bg-slate-50 border-slate-200',
          percent: 10
        };
    }
  };

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
              <svg viewBox="0 0 150 80" className="w-10 h-6 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Right Dark Blue */}
                <polygon points="90,25 100,10 125,10 145,55 135,70 110,70" fill="#1b329a" />
                {/* Middle Purple */}
                <polygon points="45,25 55,10 80,10 100,55 90,70 65,70" fill="#9c64c4" />
                {/* Left Light Blue Hexagon */}
                <polygon points="13,55 20,40 40,40 47,55 40,70 20,70" fill="#7bc4ed" />
              </svg>
            </div>

            {/* Desktop Center Navigation with short, easy-to-understand menus including Profil and Katalog */}
            <nav className="hidden md:flex space-x-1 items-center">
              <button
                onClick={() => scrollToSection('company-profile-section')}
                className="px-3.5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-950 hover:bg-gray-100"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Profil</span>
              </button>

              <button
                onClick={() => scrollToSection('featured-commodities')}
                className="px-3.5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-950 hover:bg-gray-100"
              >
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Katalog</span>
              </button>

              {currentUser && (
                <>
                  <button
                    onClick={() => handleTabClick('workflow')}
                    className={`px-3.5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'workflow'
                        ? 'bg-slate-900 text-white shadow-sm font-extrabold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <FileSignature className="w-4 h-4" />
                    <span>{t.tabWorkflow}</span>
                  </button>
                  {(currentUser.role === 'Superadmin' || currentUser.role === 'Trader') && (
                    <button
                      onClick={() => handleTabClick('guide')}
                      className={`px-3.5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'guide'
                          ? 'bg-slate-900 text-white shadow-sm font-extrabold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{t.tabGuide}</span>
                    </button>
                  )}
                  {currentUser.role === 'Superadmin' && (
                    <button
                      onClick={() => handleTabClick('users')}
                      className={`px-3.5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'users'
                          ? 'bg-slate-900 text-white shadow-sm font-extrabold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>{t.tabAccount}</span>
                    </button>
                  )}
                </>
              )}
            </nav>

            {/* Right side controls user actions with dynamic Logout for testability */}
            <div className="flex items-center gap-3">
              {/* Notification Center Bell */}
              <NotificationCenter 
                currentUser={currentUser}
                shipments={shipments}
                onSelectShipment={(shipmentId, stepIndex, subStepIndex) => {
                  setActiveShipmentId(shipmentId);
                  setTargetStepIndex(stepIndex);
                  setTargetSubStepIndex(subStepIndex);
                }}
                onNavigateToTab={handleTabClick}
                alerts={alerts}
                onMarkAlertAsRead={handleMarkAlertAsRead}
                onClearAlerts={handleClearAlerts}
              />

              {/* Language Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-gray-200 rounded-lg px-2 py-1.5 hover:border-gray-300 transition-all shadow-3xs">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer pr-1"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="text-gray-950 bg-white">
                      {l.code.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 border-l border-gray-250 pl-2 sm:pl-3">
                {currentUser ? (
                  <>
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="w-8 h-8 rounded-full border border-gray-100 object-cover"
                    />
                    <div className="hidden sm:block text-left text-sm">
                      <p className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span>{currentUser.name.split(' ')[0]}</span>
                        <button 
                          onClick={() => {
                            setCurrentUser(null);
                            setShowRestrictedAlert(null);
                          }}
                          className="text-[11px] text-red-600 hover:text-red-700 font-extrabold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded uppercase tracking-wider transition-all"
                          title={t.logoutText}
                        >
                          {t.logoutText}
                        </button>
                        <button 
                          onClick={openEditProfile}
                          className="text-slate-600 hover:text-slate-800 p-1 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center transition-all"
                          title="Edit Profil & Sandi"
                        >
                          <Settings className="w-4 h-4 text-slate-600 hover:rotate-90 transition-transform duration-300" />
                        </button>
                      </p>
                      <p className="text-xs text-gray-400 font-extrabold capitalize leading-none pt-1">{currentUser.role === 'Superadmin' ? 'Superadmin' : currentUser.role}</p>
                    </div>

                    {/* Compact Mobile Only Controls */}
                    <div className="flex sm:hidden items-center gap-1">
                      <button 
                        onClick={openEditProfile}
                        className="text-slate-600 hover:text-slate-800 p-1 bg-slate-100 hover:bg-slate-200 rounded-md transition-all"
                        title="Edit Profil & Sandi"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          setCurrentUser(null);
                          setShowRestrictedAlert(null);
                        }}
                        className="text-[10px] text-red-600 font-extrabold px-1.5 py-1 bg-red-50 hover:bg-red-100 rounded uppercase tracking-wider transition-all"
                        title={t.logoutText}
                      >
                        Keluar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {/* Desktop Button */}
                    <button
                      onClick={() => {
                        setLoginModalMode('login');
                        setIsLoginOpen(true);
                      }}
                      className="hidden sm:flex px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all items-center gap-1 shadow-md hover:-translate-y-0.5 uppercase tracking-wider cursor-pointer font-sans"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Login</span>
                    </button>

                    {/* Mobile Button - compact icon only */}
                    <button
                      onClick={() => {
                        setLoginModalMode('login');
                        setIsLoginOpen(true);
                      }}
                      className="flex sm:hidden p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all items-center justify-center shadow-md hover:-translate-y-0.5 cursor-pointer"
                      title="Login"
                    >
                      <UserCheck className="w-4 h-4" />
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
        <div className="block md:hidden bg-white p-1.5 rounded-xl border border-gray-150 shadow-sm">
          <div className="flex flex-wrap gap-1 justify-center">
            <button
              onClick={() => scrollToSection('company-profile-section')}
              className="text-center py-2 px-2 text-[9.5px] font-black rounded-lg transition-all text-gray-600 hover:bg-gray-50 bg-slate-50 flex-1 min-w-[70px]"
            >
              Profil
            </button>
            <button
              onClick={() => scrollToSection('featured-commodities')}
              className="text-center py-2 px-2 text-[9.5px] font-black rounded-lg transition-all text-gray-600 hover:bg-gray-50 bg-slate-50 flex-1 min-w-[70px]"
            >
              Katalog
            </button>
            {currentUser && (
              <>
                <button
                  onClick={() => handleTabClick('workflow')}
                  className={`text-center py-2 px-2 text-[9.5px] font-black rounded-lg transition-all flex-1 min-w-[70px] ${
                    activeTab === 'workflow' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-50 bg-slate-50'
                  }`}
                >
                  Transaksi
                </button>
                {(currentUser?.role === 'Superadmin' || currentUser?.role === 'Trader') && (
                  <button
                    onClick={() => handleTabClick('guide')}
                    className={`text-center py-2 px-2 text-[9.5px] font-black rounded-lg transition-all flex-1 min-w-[70px] ${
                      activeTab === 'guide' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-50 bg-slate-50'
                    }`}
                  >
                    Panduan
                  </button>
                )}
                {currentUser?.role === 'Superadmin' ? (
                  <button
                    onClick={() => handleTabClick('users')}
                    className={`text-center py-2 px-2 text-[9.5px] font-black rounded-lg transition-all flex-1 min-w-[70px] ${
                      activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-50 bg-slate-50'
                    }`}
                  >
                    Akun
                  </button>
                ) : (
                  <div className="text-center py-2 px-1 text-[9.5px] font-bold rounded-lg text-slate-300 bg-slate-100/50 select-none flex items-center justify-center flex-1 min-w-[30px]">
                    •
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Dynamic Inner Tab Views */}
        {activeTab === 'home' ? (
          <LandingPage
            onNavigate={(tab) => setActiveTab(tab)}
            onStartNegotiation={handleStartNegotiation}
            shipmentsCount={visibleShipments.length}
            totalVolume={totalVolumeExported}
            totalValue={visibleShipments.reduce((sum, s) => sum + s.totalValue, 0)}
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
            products={products}
            onUpdateProducts={setProducts}
            companyProfile={companyProfile}
            onUpdateCompanyProfile={setCompanyProfile}
            currentLanguage={lang}
            activeShipment={activeShipment || undefined}
            negoStepId={negoStepId}
            onAddSampleRequest={(req) => setSampleRequests([...sampleRequests, req])}
          />
        ) : activeTab === 'workflow' ? (
          <div className="space-y-6">
            {/* Header and Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-gray-150 shadow-3xs text-left">
              <div className="space-y-1">
                <h2 className="text-base font-black text-slate-850 uppercase tracking-tight">
                  Dasbor Tata Kelola Transaksi Kargo Ekspor
                </h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Pantau, verifikasi dokumen kepabeanan RI, audit COO/Karantina, dan kelola alur pengapalan internasional secara real-time.
                </p>
              </div>

              {/* Action buttons (New Contract) */}
              {(currentUser?.role === 'Trader' || currentUser?.role === 'Buyer' || currentUser?.role === 'Superadmin') && (
                <button
                  onClick={() => setIsNewContractModalOpen(true)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer animate-none"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Mulai Kontrak Baru</span>
                </button>
              )}
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setWorkflowSubTab('cargo')}
                className={`py-2 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  workflowSubTab === 'cargo'
                    ? 'border-indigo-600 text-indigo-700 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-700 font-bold'
                }`}
              >
                Kargo Ekspor ({filteredShipments.length})
              </button>
              <button
                onClick={() => setWorkflowSubTab('sample')}
                className={`py-2 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  workflowSubTab === 'sample'
                    ? 'border-indigo-600 text-indigo-700 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-700 font-bold'
                }`}
              >
                Permintaan Sampel ({sampleRequests.length})
              </button>
            </div>

            {workflowSubTab === 'cargo' ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Left Column: Shipments list */}
                <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-gray-150 shadow-3xs space-y-4 text-left">
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Daftar Transaksi ({filteredShipments.length})
                    </h3>
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari Kontrak/Pelabuhan..."
                        value={shipmentSearchQuery}
                        onChange={(e) => setShipmentSearchQuery(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    {/* Status Filters */}
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { code: 'All', label: 'Semua' },
                        { code: 'Draft', label: 'Draf' },
                        { code: 'Completed', label: 'Selesai' }
                      ].map(f => (
                        <button
                          key={f.code}
                          onClick={() => setShipmentStatusFilter(f.code)}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer text-center ${
                            shipmentStatusFilter === f.code
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shipments List */}
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {filteredShipments.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400 font-semibold">
                        Tidak ada transaksi.
                      </div>
                    ) : (
                      filteredShipments.map((s) => {
                        const isActive = s.id === activeShipment?.id;
                        const isCompleted = s.currentStep === 'Completed';
                        const isDraft = s.currentStep === 'Draft';
                        
                        return (
                          <div
                            key={s.id}
                            onClick={() => {
                              setActiveShipmentId(s.id);
                              setTargetStepIndex(undefined);
                              setTargetSubStepIndex(undefined);
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                              isActive
                                ? 'bg-indigo-50/50 border-indigo-200 shadow-3xs'
                                : 'bg-white hover:bg-slate-50 border-slate-150'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[10px] font-bold font-mono text-indigo-650">{s.id.toUpperCase()}</span>
                              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isDraft
                                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {s.currentStep}
                              </span>
                            </div>
                            
                            <div>
                              <h4 className="text-[11px] font-extrabold text-slate-800 line-clamp-1">{s.productName}</h4>
                              <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5 font-mono">{s.contractNumber}</p>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold border-t border-slate-100 pt-1.5 mt-0.5">
                              <span className="line-clamp-1">{s.buyerCompany}</span>
                              <span className="font-extrabold text-indigo-600 shrink-0">{s.quantity} {s.unit.split(' ')[0]}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Column: Shipment detail (InteractiveInfographic) */}
                <div className="lg:col-span-3">
                  {activeShipment ? (
                    <InteractiveInfographic
                      shipment={activeShipment}
                      currentUser={currentUser}
                      currentLanguage={lang}
                      onSelectUser={handleSelectUser}
                      onUpdateStep={handleUpdateStep}
                      onOpenDocumentEditor={() => setIsDocEditorOpen(true)}
                      onSimulateEvent={handleSimulateEvent}
                      negoStepId={negoStepId}
                      onNegoStepIdChange={setNegoStepId}
                      onUpdateShipmentFromDeal={handleUpdateShipmentFromDeal}
                      autoOpenLoi={autoOpenLoi}
                      onResetAutoOpenLoi={() => setAutoOpenLoi(false)}
                      targetStepIndex={targetStepIndex}
                      targetSubStepIndex={targetSubStepIndex}
                      onResetTargetStepIndices={() => {
                        setTargetStepIndex(undefined);
                        setTargetSubStepIndex(undefined);
                      }}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-150 p-16 text-center shadow-3xs max-w-lg mx-auto space-y-4">
                      <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center mx-auto text-slate-400">
                        <Layers className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider">Belum Ada Transaksi</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                          Pilih transaksi atau mulai buat transaksi baru untuk memantau alur logistik ekspor.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-left">
                <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-750 rounded-xl shrink-0 mt-0.5">
                    <Award className="w-5 h-5 text-emerald-800" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Jurnal Permintaan Sampel</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Daftar permintaan sampel yang masuk dari calon buyer Anda.
                    </p>
                  </div>
                </div>

                {sampleRequests.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-150 p-12 text-center max-w-lg mx-auto space-y-4 shadow-3xs">
                    <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center mx-auto text-slate-400">
                      <Award className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider">Belum Ada Permintaan</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                        Saat ini belum ada permintaan sampel produk rill yang diajukan oleh calon buyer.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sampleRequests.map((req) => {
                      const isPending = req.status === 'pending';
                      const isShipped = req.status === 'shipped';
                      const isDelivered = req.status === 'delivered';
                      const isExporter = currentUser?.role === 'Trader' || currentUser?.role === 'Superadmin';

                      return (
                        <div 
                          key={req.id}
                          className="bg-white rounded-2xl border border-gray-150 hover:border-emerald-200 transition-all p-5 flex flex-col justify-between gap-4 shadow-3xs"
                        >
                          <div className="space-y-3.5">
                            <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                              <div>
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-mono">KODE: {req.id}</span>
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight mt-0.5">{req.productName}</h4>
                              </div>
                              <span className={`px-2 py-0.5 text-[9.5px] font-bold uppercase rounded-md border shrink-0 ${
                                isPending 
                                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                                  : isShipped
                                    ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                                    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              }`}>
                                {isPending ? 'Menunggu Kirim' : isShipped ? 'Dalam Perjalanan' : 'Telah Sampai'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 text-xs text-left">
                              <div>
                                <span className="text-gray-400 font-bold block text-[9.5px] uppercase tracking-wider font-sans">Calon Buyer:</span>
                                <span className="font-extrabold text-slate-800 block mt-0.5">{req.buyerName}</span>
                                <span className="text-[10px] text-slate-500 font-semibold block">{req.buyerCompany}</span>
                              </div>

                              <div>
                                <span className="text-gray-400 font-bold block text-[9.5px] uppercase tracking-wider font-sans">Jumlah Sampel:</span>
                                <span className="font-extrabold text-indigo-600 block mt-0.5">{req.quantity}</span>
                              </div>

                              <div className="col-span-2">
                                <span className="text-gray-400 font-bold block text-[9.5px] uppercase tracking-wider font-sans">Alamat Pengiriman:</span>
                                <span className="font-medium text-slate-600 block leading-normal bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10.5px] mt-0.5">
                                  {req.shippingAddress}
                                </span>
                              </div>
                            </div>

                            {/* Status Update Actions for Exporter */}
                            {isExporter && isPending && (
                              <button
                                onClick={() => {
                                  setSampleRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'shipped' } : r));
                                }}
                                className="w-full mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>Kirim Sampel</span>
                              </button>
                            )}
                            {isExporter && isShipped && (
                              <button
                                onClick={() => {
                                  setSampleRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'delivered' } : r));
                                }}
                                className="w-full mt-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>Konfirmasi Terkirim</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activeTab === 'guide' && (currentUser?.role === 'Superadmin' || currentUser?.role === 'Trader') ? (
          <ExportGuide />
        ) : activeTab === 'users' ? (
          <AccountManagement
            users={users}
            currentUser={currentUser}
            onDeleteUser={handleDeleteUser}
            onToggleApprove={handleToggleApproveUser}
            onUpdateUsersList={handleUpdateUsersList}
          />
        ) : null}

      </main>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-white text-slate-900 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                  <Lock className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Ganti Sandi Akun</h3>
                  <p className="text-[10px] text-slate-500">Perbarui kata sandi login untuk peran: {currentUser?.role}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleChangePassword} className="p-6 space-y-4 text-left overflow-y-auto">
              {changePasswordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              {changePasswordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{changePasswordSuccess}</span>
                </div>
              )}

              {/* Current Password Field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase text-slate-600">Sandi Saat Ini</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan sandi saat ini"
                    className="w-full text-xs p-2.5 pr-10 bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase text-slate-600">Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Sandi baru (min. 6 karakter)"
                    className="w-full text-xs p-2.5 pr-10 bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password Field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase text-slate-600">Konfirmasi Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Ketik ulang sandi baru"
                    className="w-full text-xs p-2.5 pr-10 bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all text-center cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md text-center cursor-pointer"
                >
                  Simpan Sandi Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile & Password Modal */}
      {isEditProfileOpen && currentUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-150 flex flex-col overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-white text-slate-900 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Edit Profil & Kata Sandi</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">Perbarui data profil & sandi login Anda ({currentUser.role})</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-5 text-left overflow-y-auto">
              {profileError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold flex items-start gap-2 animate-bounce">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {/* Avatar Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase text-slate-500">Pilih Foto Profil</label>
                <div className="flex items-center gap-3">
                  <img 
                    src={profileAvatar} 
                    alt="Current Avatar" 
                    className="w-12 h-12 rounded-full border-2 border-indigo-500 object-cover p-0.5" 
                  />
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
                      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
                      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
                    ].map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfileAvatar(url)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 ${
                          profileAvatar === url ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Name Field */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-500">Nama Lengkap</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Nama Lengkap"
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none transition-all font-sans font-medium"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-500">Alamat Surel / Email</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="Alamat Email"
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none transition-all font-sans font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Company Name Field */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-500">Nama Perusahaan</label>
                  <input
                    type="text"
                    value={profileCompany}
                    onChange={(e) => setProfileCompany(e.target.value)}
                    placeholder="Nama Perusahaan"
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none transition-all font-sans font-medium"
                  />
                </div>

                {/* Country Field */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-500">Negara Asal (Country)</label>
                  <input
                    type="text"
                    value={profileCountry}
                    onChange={(e) => setProfileCountry(e.target.value)}
                    placeholder="Contoh: Indonesia, Jerman"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none transition-all font-sans font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Phone Field */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-500">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="Contoh: +62 812 3456 7890"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none transition-all font-sans font-medium"
                  />
                </div>
              </div>

              {/* Address Field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase text-slate-500">Alamat Perusahaan</label>
                <textarea
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap perusahaan"
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none transition-all font-sans font-medium"
                />
              </div>

              {/* Divider for Password Section */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2">Ganti Kata Sandi (Opsional)</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Current Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="block text-[11px] font-black uppercase text-slate-500">Kata Sandi Saat Ini</label>
                  <span className="text-[9px] text-slate-400 font-semibold italic">Isi jika Anda ingin mengubah sandi</span>
                </div>
                <div className="relative">
                  <input
                    type={showProfileCurrentPassword ? "text" : "password"}
                    value={profileCurrentPassword}
                    onChange={(e) => setProfileCurrentPassword(e.target.value)}
                    placeholder="Sandi saat ini untuk autentikasi"
                    className="w-full text-xs p-2.5 pr-10 bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProfileCurrentPassword(!showProfileCurrentPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showProfileCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* New Password Field */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-500">Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      type={showProfileNewPassword ? "text" : "password"}
                      value={profileNewPassword}
                      onChange={(e) => setProfileNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full text-xs p-2.5 pr-10 bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfileNewPassword(!showProfileNewPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showProfileNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase text-slate-500">Konfirmasi Sandi Baru</label>
                  <div className="relative">
                    <input
                      type={showProfileConfirmPassword ? "text" : "password"}
                      value={profileConfirmPassword}
                      onChange={(e) => setProfileConfirmPassword(e.target.value)}
                      placeholder="Ulangi sandi baru"
                      className="w-full text-xs p-2.5 pr-10 bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfileConfirmPassword(!showProfileConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showProfileConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all text-center cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-black transition-all shadow-md text-center cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
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

      {/* Deletion Confirmation Modal for Superadmin or Buyer */}
      {shipmentToDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-red-100 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                  {currentUser?.role === 'Buyer' ? 'Batalkan / Hapus Order' : 'Hapus Transaksi'}
                </h3>
                <p className="text-[10px] text-red-500 font-extrabold uppercase">
                  {currentUser?.role === 'Buyer' ? 'Otorisasi Importir (Buyer)' : 'Otorisasi Superadmin'}
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus transaksi kontainer dengan nomor kontrak{" "}
              <strong className="font-mono text-indigo-600">
                {shipments.find(s => s.id === shipmentToDeleteId)?.contractNumber}
              </strong>{" "}
              secara permanen? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShipmentToDeleteId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={() => {
                  if (shipmentToDeleteId) {
                    const shipmentToDelete = shipments.find(s => s.id === shipmentToDeleteId);
                    if (shipmentToDelete) {
                      setShipments(prev => prev.filter(s => s.id !== shipmentToDeleteId));
                      if (activeShipmentId === shipmentToDeleteId) {
                        setActiveShipmentId('');
                      }
                      const isBuyer = currentUser?.role === 'Buyer';
                      const newAlert: RealTimeAlert = {
                        id: `alt-delete-${Date.now()}`,
                        shipmentId: shipmentToDeleteId,
                        contractNumber: shipmentToDelete.contractNumber,
                        title: isBuyer ? 'Order Dibatalkan Oleh Buyer' : 'Transaksi Dihapus Secara Permanen',
                        message: isBuyer
                          ? `Transaksi untuk ${shipmentToDelete.productName} (${shipmentToDelete.contractNumber}) senilai $${shipmentToDelete.totalValue.toLocaleString('id-ID')} USD telah dibatalkan & dihapus secara permanen dari portal oleh pihak Importir (Buyer).`
                          : `Transaksi untuk ${shipmentToDelete.productName} (${shipmentToDelete.contractNumber}) senilai $${shipmentToDelete.totalValue.toLocaleString('id-ID')} USD telah dihapus secara permanen dari pabean oleh Superadmin.`,
                        type: 'warning',
                        timestamp: new Date().toISOString(),
                        readBy: []
                      };
                      setAlerts(prev => [newAlert, ...prev]);
                    }
                    setShipmentToDeleteId(null);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-3xs cursor-pointer animate-none"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Sales Contract Builder Modal (Mulai transaksi dari awal) */}
      {isNewContractModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-205 flex flex-col overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-white text-slate-900 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <FileSignature className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider">Mulai Kontrak Penjualan Baru</h3>
                  <p className="text-[10px] text-emerald-600 font-sans font-bold">TAHAP AWAL (DRAFT) - SALES CONTRACT INSTANSI EKSPOR</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNewContractModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
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
                    {products.map(p => (
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

      {/* Floating document editor with templates */}
      {isDocEditorOpen && (
        <DocumentEditor
          shipments={shipments}
          currentUser={currentUser}
          onSaveDocument={handleSaveNewDocument}
          onClose={() => setIsDocEditorOpen(false)}
        />
      )}

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
          Aplikasi Manajemen Administrasi Ekspor Indonesia (ExportFlow) &bull; Terintegrasi dengan Karantina, Bea Cukai RI, CEISA, & INSW.
        </p>
        <p className="text-[10px] text-gray-400">
          Proyek Simulasi Pameran Kemendag RI &copy; 2026. Semua kalkulasi FOB dan data kepabeanan mematuhi standar INCOTERMS internasional.
        </p>
      </footer>

    </div>
  );
}
