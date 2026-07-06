import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { 
  Users, UserCheck, Shield, Trash2, CheckCircle, 
  Search, ShieldAlert, AlertCircle, Sparkles, Building, Mail, Filter,
  Truck, Key, Eye, EyeOff, Plus, X, Edit, Save, Check, Info, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccountManagementProps {
  users: UserProfile[];
  currentUser: UserProfile | null;
  onDeleteUser: (userId: string) => void;
  onToggleApprove: (userId: string, isApproved: boolean) => void;
  onUpdateUsersList: (newUsers: UserProfile[]) => void;
  currentLanguage?: string;
}

export default function AccountManagement({ 
  users, 
  currentUser, 
  onDeleteUser, 
  onToggleApprove,
  onUpdateUsersList,
  currentLanguage = 'id'
}: AccountManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');

  // Track credentials synchronized state
  const [credentials, setCredentials] = useState<any[]>(() => {
    const stored = localStorage.getItem('exportflow_credentials');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return [
      {
        role: 'Superadmin',
        email: 'admin@exportflow.com',
        password: 'admin123',
        name: 'Budi Raharjo',
        company: 'Kementerian Perdagangan & Bea Cukai (Bea Cukai RI)'
      },
      {
        role: 'Trader',
        email: 'dwi@nusantara-traders.com',
        password: 'trader123',
        name: 'Dwi Rokhdialisa',
        company: 'PT Multi Raksa Madani'
      },
      {
        role: 'Buyer',
        email: 'hans.m@TokyoCoffee-import.de',
        password: 'buyer123',
        name: 'Kenji Sato',
        company: 'Tokyo Coffee Trading Co.'
      },
      {
        role: 'Forwarder',
        email: 'siti.aminah@samuderatrans.co.id',
        password: 'forwarder123',
        name: 'Siti Aminah',
        company: 'PT Samudera Logistik Internasional'
      },
      {
        role: 'Supplier',
        email: 'wayan@organic-bali-spices.com',
        password: 'supplier123',
        name: 'Wayan Karang',
        company: 'Koperasi Tani rempah Organik Bali'
      }
    ];
  });

  // Keep credentials persistent
  useEffect(() => {
    localStorage.setItem('exportflow_credentials', JSON.stringify(credentials));
  }, [credentials]);

  // Passwords visibility mapping
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Add User State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Trader');
  const [newUserCompany, setNewUserCompany] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserApproved, setNewUserApproved] = useState(true);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Trader');
  const [editCompany, setEditCompany] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editApproved, setEditApproved] = useState(true);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const isIndo = currentLanguage === 'id';
  const t = {
    formErrorRequired: isIndo ? 'Harap lengkapi semua bidang yang wajib diisi.' : 'Please complete all required fields.',
    emailExists: isIndo ? 'Email ini sudah terdaftar di sistem.' : 'This email is already registered in the system.',
    registerSuccess: (name: string, role: string) => isIndo ? `Sukses mendaftarkan ${name} (${role}) dengan kata sandi aktif!` : `Successfully registered ${name} (${role}) with active password!`,
    allFieldsRequired: isIndo ? 'Semua bidang wajib diisi.' : 'All fields are required.',
    emailClash: isIndo ? 'Surel tersebut sudah dipakai oleh pengguna lain.' : 'This email is already used by another user.',
    editSuccess: isIndo ? 'Data akun & password berhasil diperbarui!' : 'Account data & password successfully updated!',
    
    // Header
    superadminPanel: isIndo ? 'Panel Superadmin' : 'Superadmin Panel',
    title: isIndo ? 'Manajemen User, Akun & Kata Sandi' : 'User, Account & Password Management',
    desc: isIndo ? 'Otoritas tertinggi Superadmin untuk mengawasi akun, menyunting username, melihat kata sandi, mengubah approval, dan mendaftarkan kru baru.' : 'Superadmin authority to manage accounts, edit usernames, view passwords, toggle approval, and register new crew members.',
    validationActive: isIndo ? 'Otoritas Validasi Aktif' : 'Active Validation Authority',
    
    // Stats
    pendingApproval: isIndo ? 'Persetujuan Tertunda' : 'Pending Approval',
    waitingAuthorize: isIndo ? 'Menunggu disahkan' : 'Awaiting approval',
    traderApproved: isIndo ? 'Trader Disahkan' : 'Trader Approved',
    licensedExporter: isIndo ? 'Eksportir berlisensi' : 'Licensed exporter',
    forwarderApproved: isIndo ? 'Forwarder Disahkan' : 'Forwarder Approved',
    logisticsPartner: isIndo ? 'Mitra draf kapal logistik' : 'Logistics vessel partner',
    supplierApproved: isIndo ? 'Supplier Disahkan' : 'Supplier Approved',
    coopProducer: isIndo ? 'Koperasi produsen tani' : 'Agricultural producer cooperative',
    
    // Form toggle
    formTitle: isIndo ? 'Pendaftaran & Buat Akun Baru Langsung' : 'Registration & Instant New Account Creation',
    closeForm: isIndo ? 'Tutup Formulir' : 'Close Form',
    openForm: isIndo ? 'Buka Formulir Buat Akun' : 'Open Create Account Form',
    formHeader: isIndo ? 'Lengkapi Data Kredensial Pabean' : 'Complete Custom Credentials Details',
    formSubtitle: isIndo ? 'Akun baru yang dibuat di sini otomatis menyatu dengan basis data kredensial masuk pabean.' : 'New accounts created here automatically integrate with the login credential database.',
    
    // Form fields
    fullName: isIndo ? 'Nama Lengkap Pengguna' : 'User Full Name',
    fullNamePlaceholder: isIndo ? 'Contoh: Andi Wijaya' : 'e.g. Andi Wijaya',
    emailLabel: isIndo ? 'Surel (Email) untuk Masuk' : 'Login Email Address',
    emailPlaceholder: isIndo ? 'Contoh: andi@eksporindo.com' : 'e.g. andi@eksporindo.com',
    passwordLabel: isIndo ? 'Kata Sandi (Password) Akun' : 'Account Password',
    passwordPlaceholder: isIndo ? 'Ketik minimal 6 karakter...' : 'At least 6 characters...',
    roleLabel: isIndo ? 'Peran Sistem (Aktor)' : 'System Role (Actor)',
    companyLabel: isIndo ? 'Nama Instansi / Perusahaan' : 'Company / Institution Name',
    companyPlaceholder: isIndo ? 'Contoh: PT Agro Sukses Makmur' : 'e.g. PT Agro Sukses Makmur',
    phoneLabel: isIndo ? 'Nomor Telepon / WhatsApp' : 'Phone / WhatsApp Number',
    phonePlaceholder: isIndo ? 'Contoh: +6281234567890' : 'e.g. +6281234567890',
    approveInstantly: isIndo ? 'Sahkan langsung (Beri Izin Akses Penuh tanpa Verifikasi)' : 'Approve instantly (Grant full access without extra verification)',
    cancel: isIndo ? 'Batal' : 'Cancel',
    registerAccount: isIndo ? 'Mendaftarkan Akun' : 'Register Account',
    
    // Search
    searchPlaceholder: isIndo ? 'Cari nama, email, perusahaan, atau kata sandi...' : 'Search name, email, company, or password...',
    roleFilterLabel: isIndo ? 'Peran:' : 'Role:',
    allRoles: isIndo ? 'Semua Peran' : 'All Roles',
    statusFilterLabel: isIndo ? 'Status:' : 'Status:',
    allStatus: isIndo ? 'Semua Status' : 'All Statuses',
    approvedStatus: isIndo ? 'Telah Disahkan (Aktif)' : 'Approved (Active)',
    pendingStatus: isIndo ? 'Menunggu Pengesahan' : 'Pending Approval',
    
    // Table
    tableTitle: (count: number) => isIndo ? `Daftar Akun Pengguna Terdaftar (${count} Pengguna)` : `Registered User Accounts List (${count} Users)`,
    waitingValidation: (count: number) => isIndo ? `⚠️ ${count} AKUN MENUNGGU VALIDASI DIREKTUR` : `⚠️ ${count} ACCOUNTS AWAITING DIRECTOR VALIDATION`,
    noResults: isIndo ? 'Tidak ada akun yang sesuai dengan filter pencarian.' : 'No accounts match the search filters.',
    resetFilters: isIndo ? 'Reset Filter Pencarian' : 'Reset Search Filters',
    
    thProfile: isIndo ? 'Profil & Identitas' : 'Profile & Identity',
    thEmail: isIndo ? 'Surel & Kata Sandi' : 'Email & Password',
    thRole: isIndo ? 'Peran Sistem' : 'System Role',
    thCompany: isIndo ? 'Instansi / Perusahaan' : 'Company / Institution',
    thStatus: isIndo ? 'Status Validasi' : 'Validation Status',
    thAction: isIndo ? 'Tindakan Otoritas' : 'Authority Action',
    
    me: isIndo ? 'Saya' : 'Me',
    cityCountry: isIndo ? 'Kab/Kota: Indonesia' : 'City/Country: Indonesia',
    
    hidePass: isIndo ? "Sembunyikan Sandi" : "Hide Password",
    showPass: isIndo ? "Tampilkan Sandi" : "Show Password",
    approvedBadge: isIndo ? 'Disah - Sah' : 'Approved',
    pendingBadge: isIndo ? 'Belum Sah' : 'Pending',
    fullAccess: isIndo ? 'Akses Penuh' : 'Full Access',
    editTooltip: isIndo ? 'Edit Akun & Password' : 'Edit Account & Password',
    toggleApproveCancel: isIndo ? 'Batal' : 'Revoke',
    toggleApproveOk: isIndo ? 'Acc' : 'Approve',
    revokeTooltip: isIndo ? "Batalkan pengesahan pabean" : "Revoke custom validation",
    approveTooltip: isIndo ? "Sahkan akun pabean" : "Validate custom account",
    deleteTooltip: isIndo ? 'Hapus Akun Permanen' : 'Delete Account Permanently',
    confirmDelete: (name: string, role: string) => isIndo ? `Anda yakin ingin menghapus akun ${name} (${role}) secara permanen? Akun ini tidak akan bisa login lagi.` : `Are you sure you want to permanently delete account ${name} (${role})? This user will no longer be able to log in.`,
    locked: isIndo ? 'Kunci' : 'Locked',
    
    // Modal
    modalTitle: isIndo ? 'Sunting Akun & Kata Sandi' : 'Edit Account & Password',
    modalNewPass: isIndo ? 'Kata Sandi (Password Baru)' : 'Password (New Password)',
    modalPassPlaceholder: isIndo ? 'Masukkan sandi unik pabean hulu...' : 'Enter unique custom password...',
    modalPassDesc: isIndo ? 'Ubah password di sini akan langsung berlaku saat pengguna melakukan login siber berikutnya.' : 'Changing the password here will take effect immediately upon their next login.',
    modalRoleLabel: isIndo ? 'Aktor / Hak Akses' : 'Actor / Access Rights',
    modalApproveCheckbox: isIndo ? 'Akun Berstatus Sah (Approved) - Aktif melakukan alur ekspor' : 'Validated Account Status (Approved) - Active in export workflow',
    modalSave: isIndo ? 'Simpan Perubahan' : 'Save Changes',
    
    // Sidebar/Footer banner
    bannerTitle: isIndo ? 'Panduan Kredensial & Pengaman Siber' : 'Credentials & Cybersecurity Guide',
    bannerDesc: isIndo ? 'Semua perubahan nama lengkap, surat elektronik (email), maupun sandi yang diawasi di menu ini di-enkripsi dalam penyimpanan lokal browser (localStorage). Ini menjaga keamanan pendaftaran data agar tetap sinkron dan andal saat Anda berpindah aktor dengan tombol "Ganti Aktor" di halaman gerbang utama.' : 'All changes to full name, email, or password managed in this menu are encrypted in the browser\'s local storage (localStorage). This ensures secure, synchronized, and reliable user profiles when switching actors using the "Switch Actor" button on the main portal page.'
  };

  const togglePasswordVisibility = (email: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  // Create User Handler
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newUserName || !newUserEmail || !newUserPassword || !newUserCompany) {
      setFormError(t.formErrorRequired);
      return;
    }

    const emailLower = newUserEmail.trim().toLowerCase();
    
    // Check if email already registered
    const emailExists = users.some(u => u.email.toLowerCase() === emailLower);
    if (emailExists) {
      setFormError(t.emailExists);
      return;
    }

    const newProfile: UserProfile = {
      id: 'usr-' + Date.now(),
      name: newUserName.trim(),
      role: newUserRole,
      email: emailLower,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=150`,
      companyName: newUserCompany.trim(),
      phone: newUserPhone.trim() || undefined,
      isApproved: newUserApproved
    };

    const newCred = {
      role: newUserRole,
      email: emailLower,
      password: newUserPassword,
      name: newUserName.trim(),
      company: newUserCompany.trim()
    };

    // Update States
    const updatedUsers = [...users, newProfile];
    onUpdateUsersList(updatedUsers);

    const updatedCreds = [...credentials, newCred];
    setCredentials(updatedCreds);

    setFormSuccess(t.registerSuccess(newUserName, newUserRole));
    
    // Clear Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserCompany('');
    setNewUserPhone('');
    setNewUserApproved(true);

    setTimeout(() => {
      setShowAddForm(false);
      setFormSuccess('');
    }, 1500);
  };

  // Open Edit Dialog
  const handleOpenEditModal = (user: UserProfile) => {
    const credObj = credentials.find(c => c.email.toLowerCase() === user.email.toLowerCase());
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword(credObj ? credObj.password : '');
    setEditRole(user.role);
    setEditCompany(user.companyName);
    setEditPhone(user.phone || '');
    setEditApproved(user.isApproved !== false);
    setEditError('');
    setEditSuccess('');
  };

  // Save Edit Changes
  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    if (!editingUser) return;
    if (!editName || !editEmail || !editPassword || !editCompany) {
      setEditError(t.allFieldsRequired);
      return;
    }

    const emailLower = editEmail.trim().toLowerCase();

    // Check email clash
    const isEmailClash = users.some(u => u.id !== editingUser.id && u.email.toLowerCase() === emailLower);
    if (isEmailClash) {
      setEditError(t.emailClash);
      return;
    }

    // Update User list
    const updatedUsers = users.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          name: editName.trim(),
          email: emailLower,
          role: editRole,
          companyName: editCompany.trim(),
          phone: editPhone.trim() || undefined,
          isApproved: editApproved
        };
      }
      return u;
    });

    // Update credentials
    const updatedCreds = credentials.map(c => {
      if (c.email.toLowerCase() === editingUser.email.toLowerCase()) {
        return {
          ...c,
          name: editName.trim(),
          email: emailLower,
          password: editPassword,
          role: editRole,
          company: editCompany.trim()
        };
      }
      return c;
    });

    // Handle when updating email that does not exist in credentials yet
    const hasCreds = credentials.some(c => c.email.toLowerCase() === editingUser.email.toLowerCase());
    if (!hasCreds) {
      updatedCreds.push({
        role: editRole,
        email: emailLower,
        password: editPassword,
        name: editName.trim(),
        company: editCompany.trim()
      });
    }

    onUpdateUsersList(updatedUsers);
    setCredentials(updatedCreds);

    setEditSuccess(t.editSuccess);
    setTimeout(() => {
      setEditingUser(null);
    }, 1200);
  };

  // Auto delete credentials on deleting user
  const handleDeleteWrapper = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete) {
      const updatedCreds = credentials.filter(c => c.email.toLowerCase() !== userToDelete.email.toLowerCase());
      setCredentials(updatedCreds);
    }
    onDeleteUser(userId);
  };

  // Search & Filtered users list
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.companyName.toLowerCase().includes(searchLower);

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    const isApproved = user.isApproved !== false; 
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'APPROVED' && isApproved) ||
      (statusFilter === 'PENDING' && !isApproved);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get Password helper
  const getPasswordForEmail = (email: string) => {
    const cred = credentials.find(c => c.email.toLowerCase() === email.toLowerCase());
    return cred ? cred.password : '—';
  };

  // Role details styling helper
  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Superadmin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Trader':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Buyer':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Forwarder':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Supplier':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Quick statistics
  const pendingUsers = users.filter(u => u.isApproved === false && (u.role === 'Trader' || u.role === 'Forwarder' || u.role === 'Supplier')).length;
  const approvedTraders = users.filter(u => u.role === 'Trader' && u.isApproved !== false).length;
  const approvedForwarders = users.filter(u => u.role === 'Forwarder' && u.isApproved !== false).length;
  const approvedSuppliers = users.filter(u => u.role === 'Supplier' && u.isApproved !== false).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      {/* Stats Bento Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat - Pending Action */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 shadow-3xs">
          <div className="p-3 bg-amber-500 text-white rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[12px] font-black text-amber-500 uppercase tracking-wider">{t.pendingApproval}</p>
            <p className="text-2xl font-black text-amber-900 leading-none mt-1">{pendingUsers}</p>
            <p className="text-[12px] text-amber-700 font-semibold mt-1">{t.waitingAuthorize}</p>
          </div>
        </div>

        {/* Stat - Active Traders */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-3xs">
          <div className="p-3 bg-blue-600 text-white rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[12px] font-black text-blue-600 uppercase tracking-wider">{t.traderApproved}</p>
            <p className="text-2xl font-black text-slate-900 leading-none mt-1">{approvedTraders}</p>
            <p className="text-[12px] text-slate-500 font-medium mt-1">{t.licensedExporter}</p>
          </div>
        </div>

        {/* Stat - Active Forwarders */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-3xs">
          <div className="p-3 bg-amber-600 text-white rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[12px] font-black text-amber-700 uppercase tracking-wider">{t.forwarderApproved}</p>
            <p className="text-2xl font-black text-slate-900 leading-none mt-1">{approvedForwarders}</p>
            <p className="text-[12px] text-slate-500 font-medium mt-1">{t.logisticsPartner}</p>
          </div>
        </div>

        {/* Stat - Active Suppliers */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-3xs">
          <div className="p-3 bg-emerald-600 text-white rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[12px] font-black text-emerald-700 uppercase tracking-wider">{t.supplierApproved}</p>
            <p className="text-2xl font-black text-slate-900 leading-none mt-1">{approvedSuppliers}</p>
            <p className="text-[12px] text-slate-500 font-medium mt-1">{t.coopProducer}</p>
          </div>
        </div>
      </div>

      {/* Insert Toggleable Account Creator */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-800 focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Plus className={`w-5 h-5 text-indigo-600 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">{t.formTitle}</span>
          </div>
          <span className="text-[12px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">
            {showAddForm ? t.closeForm : t.openForm}
          </span>
        </button>

        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-200 overflow-hidden"
            >
              <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4 bg-white text-left grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-500" />
                    <span>{t.formHeader}</span>
                  </h4>
                  <p className="text-[12px] text-slate-500 mt-1 font-medium">{t.formSubtitle}</p>
                </div>

                {/* Form Alerts */}
                {formError && (
                  <div className="md:col-span-2 p-3 bg-red-550/10 border border-red-200 rounded-xl text-red-750 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="md:col-span-2 p-3 bg-emerald-500/10 border border-emerald-250 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* Field 1: Nama */}
                <div className="space-y-1">
                  <label className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">{t.fullName}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.fullNamePlaceholder}
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                  />
                </div>

                {/* Field 2: Email */}
                <div className="space-y-1">
                  <label className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">{t.emailLabel}</label>
                  <input
                    type="email"
                    required
                    placeholder={t.emailPlaceholder}
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                  />
                </div>

                {/* Field 3: Password */}
                <div className="space-y-1">
                  <label className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">{t.passwordLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.passwordPlaceholder}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600 font-mono"
                  />
                </div>

                {/* Field 4: Peran */}
                <div className="space-y-1">
                  <label className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">{t.roleLabel}</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                  >
                    <option value="Trader">{isIndo ? 'Trader (Eksportir)' : 'Trader (Exporter)'}</option>
                    <option value="Forwarder">{isIndo ? 'Forwarder (Mitra Logistik)' : 'Forwarder (Logistics Partner)'}</option>
                    <option value="Supplier">{isIndo ? 'Supplier (Koperasi Produsen)' : 'Supplier (Producer Coop)'}</option>
                    <option value="Buyer">{isIndo ? 'Buyer (Importir Asing)' : 'Buyer (Foreign Importer)'}</option>
                    <option value="Superadmin">{isIndo ? 'Superadmin Utama' : 'Main Superadmin'}</option>
                  </select>
                </div>

                {/* Field 5: Perusahaan */}
                <div className="space-y-1">
                  <label className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">{t.companyLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.companyPlaceholder}
                    value={newUserCompany}
                    onChange={(e) => setNewUserCompany(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                  />
                </div>

                {/* Field 5b: Nomor Telepon / WA */}
                <div className="space-y-1">
                  <label className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">{t.phoneLabel}</label>
                  <input
                    type="tel"
                    required
                    placeholder={t.phonePlaceholder}
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                  />
                </div>

                {/* Field 6: Approval */}
                <div className="flex items-center gap-3 self-end py-2">
                  <input
                    type="checkbox"
                    id="newApprovedCheck"
                    checked={newUserApproved}
                    onChange={(e) => setNewUserApproved(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-650 focus:ring-indigo-600 cursor-pointer"
                  />
                  <label htmlFor="newApprovedCheck" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    {t.approveInstantly}
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="md:col-span-2 pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-slate-250 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 text-white text-xs font-black rounded-xl cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{t.registerAccount}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-3xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
          />
        </div>

        {/* Filtering Options */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold">
            <span className="text-[12px] uppercase font-black tracking-wider text-slate-400">{t.roleFilterLabel}</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-bold focus:outline-none pr-1"
            >
              <option value="ALL">{t.allRoles}</option>
              <option value="Trader">{isIndo ? 'Trader / Eksportir' : 'Trader / Exporter'}</option>
              <option value="Forwarder">{isIndo ? 'Forwarder Logistik' : 'Logistics Forwarder'}</option>
              <option value="Supplier">{isIndo ? 'Supplier / Produsen' : 'Supplier / Producer'}</option>
              <option value="Buyer">{isIndo ? 'Buyer / Importir' : 'Buyer / Importer'}</option>
              <option value="Superadmin">Superadmin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold">
            <span className="text-[12px] uppercase font-black tracking-wider text-slate-400">{t.statusFilterLabel}</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent border-none text-slate-700 font-bold focus:outline-none pr-1"
            >
              <option value="ALL">{t.allStatus}</option>
              <option value="APPROVED">{t.approvedStatus}</option>
              <option value="PENDING">{t.pendingStatus}</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{t.tableTitle(filteredUsers.length)}</span>
          </h3>
          {pendingUsers > 0 && (
            <span className="text-[12px] bg-red-100 text-red-900 font-black px-2.5 py-1 rounded-full animate-pulse">
              {t.waitingValidation(pendingUsers)}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold">{t.noResults}</p>
              <button 
                onClick={() => { setSearchTerm(''); setRoleFilter('ALL'); setStatusFilter('ALL'); }}
                className="mt-3 px-3 py-1.5 bg-indigo-50 hover:bg-slate-100 text-indigo-750 text-[12px] font-extrabold rounded-lg border border-indigo-200 cursor-pointer"
              >
                {t.resetFilters}
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-extrabold text-[12px]">
                  <th className="p-4 w-[220px]">{t.thProfile}</th>
                  <th className="p-4 w-[240px]">{t.thEmail}</th>
                  <th className="p-4 w-[130px]">{t.thRole}</th>
                  <th className="p-4 w-[180px]">{t.thCompany}</th>
                  <th className="p-4 w-[140px] text-center">{t.thStatus}</th>
                  <th className="p-4 w-[180px] text-right">{t.thAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((user) => {
                    const isCurrentUser = currentUser?.id === user.id;
                    const canBeApproved = user.role === 'Trader' || user.role === 'Forwarder' || user.role === 'Supplier';
                    const isApproved = user.isApproved !== false;
                    const userPassword = getPasswordForEmail(user.email);
                    const isPassVisible = visiblePasswords[user.email] || false;

                    return (
                      <motion.tr 
                        key={user.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`hover:bg-slate-50 transition-colors ${isCurrentUser ? 'bg-indigo-50/20' : ''}`}
                      >
                        {/* Profile Photo & Name */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-3xs shrink-0"
                            />
                            <div className="text-left min-w-0 font-sans">
                              <p className="font-extrabold text-slate-900 text-xs truncate flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isCurrentUser && (
                                  <span className="bg-indigo-650 text-white text-[12px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">{t.me}</span>
                                )}
                              </p>
                              <p className="text-[12px] text-slate-400 font-semibold truncate">{(isIndo ? 'Kab/Kota: ' : 'City/Regency: ') + (user.country || 'Indonesia')}</p>
                              {user.phone && (
                                <p className="text-[12px] text-emerald-600 font-bold truncate flex items-center gap-1 mt-0.5" title="WhatsApp / Telepon">
                                  <Phone className="w-3 h-3 shrink-0 text-emerald-500" />
                                  <span>{user.phone}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email & Password */}
                        <td className="p-4">
                          <div className="space-y-1 text-left">
                            <div className="text-xs font-semibold text-slate-600 flex items-center gap-1 select-all hover:text-indigo-600 cursor-pointer">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{user.email}</span>
                            </div>
                            
                            {/* Password Viewer */}
                            <div className="text-[12px] font-bold text-slate-500 flex items-center gap-1.5">
                              <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                                {isPassVisible ? (
                                  userPassword
                                ) : (
                                  <span>••••••••</span>
                                )}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(user.email)}
                                className="text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none cursor-pointer p-0.5 rounded"
                                title={isPassVisible ? t.hidePass : t.showPass}
                              >
                                {isPassVisible ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Role BADGE */}
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-lg text-[12px] font-extrabold uppercase border tracking-wider leading-none shrink-0 ${getRoleBadgeStyle(user.role)}`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Company Name */}
                        <td className="p-4">
                          <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{user.companyName}</span>
                          </div>
                        </td>

                        {/* Status (Approved vs Pending) */}
                        <td className="p-4 text-center">
                          {canBeApproved ? (
                            isApproved ? (
                              <div className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[12px] font-black uppercase">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{t.approvedBadge}</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-red-50 text-red-800 border border-red-200 rounded-full text-[12px] font-black uppercase animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                <span>{t.pendingBadge}</span>
                              </div>
                            )
                          ) : (
                            <span className="text-[12px] font-bold text-slate-400 uppercase italic">
                              {t.fullAccess}
                            </span>
                          )}
                        </td>

                        {/* Actions (Edit / Delete / Toggle validation) */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(user)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg cursor-pointer transition-colors"
                              title={t.editTooltip}
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Validate/Sahkan Button */}
                            {canBeApproved && (
                              <button
                                onClick={() => onToggleApprove(user.id, !isApproved)}
                                className={`px-2 py-1 text-[12px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-0.5 ${
                                  isApproved
                                    ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-transparent'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 border border-transparent shadow-sm'
                                  }`}
                                title={isApproved ? t.revokeTooltip : t.approveTooltip}
                              >
                                {isApproved ? t.toggleApproveCancel : t.toggleApproveOk}
                              </button>
                            )}

                            {/* Delete Button */}
                            {!isCurrentUser ? (
                              <button
                                onClick={() => {
                                  if (confirm(t.confirmDelete(user.name, user.role))) {
                                    handleDeleteWrapper(user.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-red-100"
                                title={t.deleteTooltip}
                              >
                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                              </button>
                            ) : (
                              <div className="px-2 text-[12px] text-slate-400 font-bold uppercase italic select-none">
                                {t.locked}
                              </div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit User & Pass Modal Dialog */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto border border-slate-200 shadow-2xl relative text-left"
            >
              {/* Close Button */}
              <button 
                onClick={() => setEditingUser(null)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">{t.modalTitle}</h3>
              </div>

              {editError && (
                <div className="mb-3 p-3 bg-red-100 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}
              {editSuccess && (
                <div className="mb-3 p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveEditSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">{t.fullName}</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                  />
                </div>

                {/* Email (User) */}
                <div className="space-y-1">
                  <label className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">{t.emailLabel}</label>
                  <input
                    type="type"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                  />
                </div>

                {/* Password Management */}
                <div className="space-y-1 bg-indigo-50/40 p-3 rounded-2xl border border-indigo-100/40">
                  <label className="text-[12px] font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1">
                    <Key className="w-3.5 h-3.5" />
                    <span>{t.passwordLabel}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-indigo-200 bg-white text-indigo-900 focus:outline-indigo-600"
                    placeholder={t.modalPassPlaceholder}
                  />
                  <p className="text-[12px] text-slate-500 mt-1 font-semibold">{t.modalPassDesc}</p>
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">{t.roleLabel}</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                  >
                    <option value="Trader">{isIndo ? 'Trader (Eksportir)' : 'Trader (Exporter)'}</option>
                    <option value="Forwarder">{isIndo ? 'Forwarder (Mitra Logistik)' : 'Forwarder (Logistics Partner)'}</option>
                    <option value="Supplier">{isIndo ? 'Supplier (Koperasi Produsen)' : 'Supplier (Producer Coop)'}</option>
                    <option value="Buyer">{isIndo ? 'Buyer (Importir Asing)' : 'Buyer (Foreign Importer)'}</option>
                    <option value="Superadmin">{isIndo ? 'Superadmin Utama' : 'Main Superadmin'}</option>
                  </select>
                </div>

                {/* Company */}
                <div className="space-y-1">
                  <label className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">{t.companyLabel}</label>
                  <input
                    type="text"
                    required
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                  />
                </div>

                {/* Nomor Telepon / WA */}
                <div className="space-y-1">
                  <label className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">{t.phoneLabel}</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                    placeholder={t.phonePlaceholder}
                  />
                </div>

                {/* Toggle Is Approved status */}
                {(editRole === 'Trader' || editRole === 'Forwarder' || editRole === 'Supplier') && (
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="editApprovedCheck"
                      checked={editApproved}
                      onChange={(e) => setEditApproved(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    />
                    <label htmlFor="editApprovedCheck" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                      {t.modalApproveCheckbox}
                    </label>
                  </div>
                )}

                {/* Footer buttons */}
                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-black rounded-xl cursor-pointer shadow-md flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t.modalSave}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guide Banner for Superadmin on how validations affect users */}
      <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 flex gap-3 text-left">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="text-xs space-y-1 text-indigo-950">
          <p className="font-extrabold uppercase tracking-wide text-indigo-900 text-[12px]">{t.bannerTitle}</p>
          <p className="font-semibold leading-relaxed">
            {t.bannerDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
