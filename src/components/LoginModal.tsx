import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { mockUsers } from '../mockData';
import { 
  Shield, Briefcase, ShoppingBag, Truck, Leaf, X, 
  Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle, 
  ArrowRight, Key, Sparkles, UserCheck, UserPlus, Building, Phone
} from 'lucide-react';
import { motion } from 'motion/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserProfile | null) => void;
  currentUser: UserProfile | null;
  initialMode?: 'login' | 'register';
}

// In-memory mapping of credentials
const demoCredentials = [
  {
    role: 'Owner/Direktur' as UserRole,
    email: 'admin@exportflow.com',
    password: 'admin123',
    name: 'Budi Raharjo',
    company: 'Kementerian Perdagangan & Bea Cukai (Bea Cukai RI)'
  },
  {
    role: 'Trader' as UserRole,
    email: 'hendry@nusantara-traders.com',
    password: 'trader123',
    name: 'Hendry Kurniawan',
    company: 'PT Multi Raksa Madani'
  },
  {
    role: 'Buyer' as UserRole,
    email: 'hans.m@eurofoods-import.de',
    password: 'buyer123',
    name: 'Hans Mueller',
    company: 'EuroFoods Import GmbH'
  },
  {
    role: 'Forwarder' as UserRole,
    email: 'siti.aminah@samuderatrans.co.id',
    password: 'forwarder123',
    name: 'Siti Aminah',
    company: 'PT Samudera Logistik Internasional'
  },
  {
    role: 'Supplier' as UserRole,
    email: 'wayan@organic-bali-spices.com',
    password: 'supplier123',
    name: 'Wayan Karang',
    company: 'Koperasi Tani rempah Organik Bali'
  }
];

export default function LoginModal({ isOpen, onClose, onSelectUser, currentUser, initialMode }: LoginModalProps) {
  if (!isOpen) return null;

  // Tab mode
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form local states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register form local states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regCompany, setRegCompany] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Buyer');
  const [regPhone, setRegPhone] = useState('');

  // Local state for credentials and user list in storage
  const [localCredentials, setLocalCredentials] = useState<any[]>([]);
  const [localUsers, setLocalUsers] = useState<UserProfile[]>([]);

  // Load dynamic lists on open
  useEffect(() => {
    if (isOpen) {
      const storedCreds = localStorage.getItem('exportflow_credentials');
      let creds = demoCredentials;
      if (storedCreds) {
        try {
          creds = JSON.parse(storedCreds);
        } catch (e) {}
      } else {
        localStorage.setItem('exportflow_credentials', JSON.stringify(demoCredentials));
      }
      setLocalCredentials(creds);

      const storedUsers = localStorage.getItem('exportflow_users');
      let us = mockUsers.map(u => ({ ...u, isApproved: true }));
      if (storedUsers) {
        try {
          us = JSON.parse(storedUsers);
        } catch (e) {}
      } else {
        localStorage.setItem('exportflow_users', JSON.stringify(us));
      }
      setLocalUsers(us);
    }
  }, [isOpen]);

  // Sync mode with initialMode when modal is opened
  useEffect(() => {
    if (isOpen) {
      if (initialMode) {
        setMode(initialMode);
      } else {
        setMode('login');
      }
    }
  }, [isOpen, initialMode]);

  // Auto-set the email input if currentUser is present to make switching/logging in back easier
  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
    } else {
      setEmail('hendry@nusantara-traders.com'); // Default to Trader
    }
    setPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  }, [currentUser, isOpen]);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Owner/Direktur':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'Trader':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'Buyer':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'Forwarder':
        return <Truck className="w-4 h-4 text-amber-600" />;
      case 'Supplier':
        return <Leaf className="w-4 h-4 text-teal-600" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Owner/Direktur': return 'bg-purple-100/80 text-purple-800 border-purple-200';
      case 'Trader': return 'bg-blue-100/80 text-blue-800 border-blue-200';
      case 'Buyer': return 'bg-emerald-100/80 text-emerald-800 border-emerald-200';
      case 'Forwarder': return 'bg-amber-100/80 text-amber-800 border-amber-200';
      case 'Supplier': return 'bg-teal-100/80 text-teal-800 border-teal-200';
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Check against credentials list
    const cred = localCredentials.find(c => c.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (!cred) {
      setErrorMsg('Surel (Email) tidak terdaftar dalam sistem.');
      return;
    }

    if (password !== cred.password) {
      setErrorMsg('Kata sandi (password) salah. Silakan periksa daftar kredensial uji coba di sebelah kanan.');
      return;
    }

    // Success login
    const userToLogin = localUsers.find(u => u.email === cred.email);
    if (userToLogin) {
      setSuccessMsg(`Berhasil masuk sebagai ${userToLogin.name}!`);
      setTimeout(() => {
        onSelectUser(userToLogin);
        onClose();
      }, 800);
    } else {
      setErrorMsg('Aktor tidak ditemukan pada basis data pengguna.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirmPassword || !regCompany.trim()) {
      setErrorMsg('Semua kolom pendaftaran wajib diisi.');
      return;
    }

    if (regName.trim().length > 50) {
      setErrorMsg('Nama Lengkap maksimal 50 karakter.');
      return;
    }

    if (regCompany.trim().length > 50) {
      setErrorMsg('Nama Instansi / Perusahaan maksimal 50 karakter.');
      return;
    }

    if (regEmail.trim().length > 100) {
      setErrorMsg('Email maksimal 100 karakter.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Kata sandi minimal harus 6 karakter.');
      return;
    }

    if (regPassword.length > 32) {
      setErrorMsg('Kata sandi maksimal 32 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak sesuai dengan kata sandi.');
      return;
    }

    const emailLower = regEmail.trim().toLowerCase();
    const exists = localCredentials.some(c => c.email.trim().toLowerCase() === emailLower);
    if (exists) {
      setErrorMsg('Email ini sudah terdaftar. Silakan masuk menggunakan surel tersebut.');
      return;
    }

    const needsApproval = regRole === 'Trader' || regRole === 'Forwarder' || regRole === 'Supplier';
    const newProfile: UserProfile = {
      id: 'usr-' + Date.now(),
      name: regName.trim(),
      role: regRole,
      email: emailLower,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      companyName: regCompany.trim(),
      phone: regPhone.trim() || undefined,
      isApproved: !needsApproval // false if Trader, Forwarder, Supplier
    };

    const newCred = {
      role: regRole,
      email: emailLower,
      password: regPassword,
      name: regName.trim(),
      company: regCompany.trim()
    };

    // Mutate fallback arrays to keep code fully backwards compatible
    mockUsers.push(newProfile);
    demoCredentials.push(newCred);

    // Save to localStorage dynamically
    const updatedUsers = [...localUsers, newProfile];
    const updatedCreds = [...localCredentials, newCred];
    localStorage.setItem('exportflow_users', JSON.stringify(updatedUsers));
    localStorage.setItem('exportflow_credentials', JSON.stringify(updatedCreds));

    setLocalUsers(updatedUsers);
    setLocalCredentials(updatedCreds);

    if (needsApproval) {
      setSuccessMsg(`Pendaftaran Berhasil! Akun "${newProfile.name}" didaftarkan. Hubungi Owner/Direktur Bea Cukai RI untuk mensahkan status akun Anda.`);
    } else {
      setSuccessMsg(`Pendaftaran Berhasil! Masuk otomatis sebagai ${newProfile.name} (${newProfile.role})...`);
    }
    
    setTimeout(() => {
      onSelectUser(newProfile);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setShowRegPassword(false);
      setShowRegConfirmPassword(false);
      setRegCompany('');
      setRegRole('Buyer');
      onClose();
    }, needsApproval ? 2200 : 1200);
  };

  const handleAutofillAndLogin = (cred: typeof demoCredentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setErrorMsg('');
    setSuccessMsg(`Mengisi otomatis & beralih aktor ke ${cred.name}...`);
    
    // Quick login action
    const userToLogin = localUsers.find(u => u.email === cred.email);
    if (userToLogin) {
      setTimeout(() => {
        onSelectUser(userToLogin);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-150 flex flex-col md:flex-row my-4 sm:my-8 text-left max-h-[90vh] md:max-h-[85vh] overflow-y-auto md:overflow-hidden"
        >
          {/* LEFT SIDE: FORM LOGIN */}
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between text-left space-y-6 md:overflow-y-auto md:max-h-[85vh]">
            <div className="space-y-4">
              {/* Brand and titles */}
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 leading-tight">Otentikasi Portal</h3>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Garuda Indonesia Export Hub</p>
                </div>
              </div>

              {/* TABS SELECTOR */}
              <div className="flex border-b border-slate-100 p-0.5 bg-slate-50 rounded-lg">
                <button 
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-center text-[10.5px] font-black uppercase tracking-wider transition-all rounded-md ${
                    mode === 'login' 
                      ? 'bg-white text-indigo-650 shadow-3xs border border-slate-150 font-black' 
                      : 'text-slate-500 hover:text-slate-800 font-bold font-sans'
                  }`}
                >
                  Masuk (Login)
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-center text-[10.5px] font-black uppercase tracking-wider transition-all rounded-md ${
                    mode === 'register' 
                      ? 'bg-white text-indigo-650 shadow-3xs border border-slate-150 font-black' 
                      : 'text-slate-500 hover:text-slate-800 font-bold font-sans'
                  }`}
                >
                  Daftar Akun
                </button>
              </div>

              {mode === 'login' ? (
                <>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">Masuk ke Ruang Kerja Anda</h4>
                    <p className="text-xs text-slate-500">Gunakan kata sandi terdaftar untuk mengakses peran khusus dalam mengelola rantai pasok ekspor komoditi.</p>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
                    {/* Email Selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Surel Aktor (Email)</span>
                      </label>
                      <select
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrorMsg('');
                        }}
                        className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600 cursor-pointer"
                      >
                        <option value="" disabled>--- Pilih Surel / Peran ---</option>
                        {localCredentials.map((c, idx) => (
                          <option key={idx} value={c.email}>
                            {c.role} — {c.name} ({c.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Key className="w-3.5 h-3.5" />
                          <span>Kata Sandi (Password)</span>
                        </label>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Uji Coba Gampang</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setErrorMsg('');
                          }}
                          placeholder="Masukkan kata sandi peran..."
                          className="w-full text-xs font-mono p-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Feedbacks */}
                    {errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-xl flex items-start gap-2 animate-shake">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                        <span className="font-semibold">{errorMsg}</span>
                      </div>
                    )}

                    {successMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-900 text-xs rounded-xl flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                        <span className="font-semibold">{successMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 cursor-pointer"
                    >
                      <span>Verifikasi & Masuk Ruang Kerja</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 font-sans">Daftar Akun Baru</h4>
                    <p className="text-xs text-slate-500 font-sans">Mulai langkah bisnis ekspor dengan mendaftarkan identitas serta peran instansi Anda secara mandiri.</p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-1">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Nama Lengkap / Deskripsi</span>
                        </label>
                        <span className="text-[8px] text-slate-400 font-bold uppercase">Maks 50 Karakter</span>
                      </div>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => {
                          setRegName(e.target.value);
                          setErrorMsg('');
                        }}
                        maxLength={50}
                        placeholder="Contoh: Hans Mueller"
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </label>
                        <span className="text-[8px] text-slate-400 font-bold uppercase">Maks 100 Karakter</span>
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          setErrorMsg('');
                        }}
                        maxLength={100}
                        placeholder="nama@perusahaan.com"
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Password */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                            <Key className="w-3.5 h-3.5" />
                            <span>Kata Sandi</span>
                          </label>
                          <span className="text-[8px] text-slate-400 font-bold uppercase">Min 6 - Maks 32</span>
                        </div>
                        <div className="relative">
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regPassword}
                            onChange={(e) => {
                              setRegPassword(e.target.value);
                              setErrorMsg('');
                            }}
                            minLength={6}
                            maxLength={32}
                            placeholder="Buat sandi baru..."
                            className="w-full text-xs font-mono p-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3 top-2 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                          >
                            {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5 text-slate-400" />
                            <span>Konfirmasi Kata Sandi</span>
                          </label>
                          <span className="text-[8px] text-slate-400 font-bold uppercase">Maks 32</span>
                        </div>
                        <div className="relative">
                          <input
                            type={showRegConfirmPassword ? 'text' : 'password'}
                            value={regConfirmPassword}
                            onChange={(e) => {
                              setRegConfirmPassword(e.target.value);
                              setErrorMsg('');
                            }}
                            maxLength={32}
                            placeholder="Tulis ulang sandi..."
                            className="w-full text-xs font-mono p-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                            className="absolute right-3 top-2 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                          >
                            {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Company Name */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                            <Building className="w-3.5 h-3.5" />
                            <span>Instansi / Perusahaan</span>
                          </label>
                          <span className="text-[8px] text-slate-400 font-bold uppercase">Maks 50 Karakter</span>
                        </div>
                        <input
                          type="text"
                          value={regCompany}
                          onChange={(e) => {
                            setRegCompany(e.target.value);
                            setErrorMsg('');
                          }}
                          maxLength={50}
                          placeholder="Contoh: EuroFoods GmbH"
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                          required
                        />
                      </div>

                      {/* Role */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>Peran Ekosistem</span>
                        </label>
                        <select
                          value={regRole}
                          onChange={(e) => {
                            setRegRole(e.target.value as UserRole);
                            setErrorMsg('');
                          }}
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600 cursor-pointer"
                        >
                          <option value="Buyer">Buyer (Pembeli Luar Negeri)</option>
                          <option value="Trader">Trader / Eksportir RI</option>
                          <option value="Supplier">Supplier / UMKM Penyedia</option>
                          <option value="Forwarder">Forwarder / Logistik</option>
                          <option value="Owner/Direktur">Direktur / Bea Cukai</option>
                        </select>
                      </div>
                    </div>

                    {/* Nomor Telepon / WA */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>Nomor Telepon / WhatsApp</span>
                        </label>
                        <span className="text-[8px] text-slate-400 font-bold uppercase">Wajib Diisi</span>
                      </div>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => {
                          setRegPhone(e.target.value);
                          setErrorMsg('');
                        }}
                        placeholder="Contoh: +6281234567890"
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                        required
                      />
                    </div>

                    {/* Feedbacks */}
                    {errorMsg && (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-900 text-xs rounded-xl flex items-start gap-2 animate-shake">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600 mt-0.5" />
                        <span className="font-semibold">{errorMsg}</span>
                      </div>
                    )}

                    {successMsg && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600 mt-0.5" />
                        <span className="font-semibold">{successMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-indigo-200" />
                      <span>Buat Akun & Masuk Otomatis</span>
                    </button>
                  </form>
                </>
              )}

              {currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectUser(null);
                    setSuccessMsg('Berhasil keluar! Beralih ke Akses Umum (Tamu)...');
                    setTimeout(() => onClose(), 600);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-black uppercase rounded-xl border border-slate-200 hover:border-red-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Keluar Peran & Jadikan Tamu (Akses Umum)</span>
                </button>
              )}
            </div>

            {/* Current user badge info */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Aktor Aktif Sekarang:</span>
              {currentUser ? (
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{currentUser.name} ({currentUser.role})</span>
                </div>
              ) : (
                <span className="font-bold text-amber-600">Terputus (Akses Umum / Tamu)</span>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: EASY TESTING CREDENTIALS BAR */}
          <div className="md:w-1/2 bg-slate-50 border-t md:border-t-0 md:border-l border-gray-150 p-6 sm:p-8 flex flex-col justify-between text-left space-y-6 md:overflow-y-auto md:max-h-[85vh]">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 p-1.5 px-3 bg-indigo-100 border border-indigo-200 rounded-lg text-[10px] text-indigo-800 font-extrabold uppercase shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Kredensial Uji Coba (Sandbox)</span>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1 px-2.5 bg-slate-201 hover:bg-slate-200 rounded-lg text-slate-405 hover:text-slate-800 transition-colors shrink-0 font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-slate-900 uppercase">Akses Instan Pemeragaan</h4>
                <p className="text-[11px] text-slate-500">
                  Klik tombol <strong>"Masuk Instan ➔"</strong> di bawah untuk langsung beralih peran tanpa perlu mengetik email & password secara manual.
                </p>
              </div>

              <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                {localCredentials.map((cred, idx) => {
                  const isMatch = currentUser?.email === cred.email;
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all ${
                        isMatch 
                          ? 'bg-indigo-50/70 border-indigo-250 border-indigo-300 ring-2 ring-indigo-50' 
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-3xs'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${getRoleBadgeColor(cred.role)}`}>
                              <span className="flex items-center gap-1">
                                {getRoleIcon(cred.role)}
                                {cred.role}
                              </span>
                            </span>
                          </div>
                          <span className="text-xs font-extrabold text-slate-900 block">{cred.name}</span>
                          <span className="text-[10px] text-slate-405 text-slate-500 font-medium block leading-none">{cred.company}</span>
                        </div>
                        
                        <button
                          onClick={() => handleAutofillAndLogin(cred)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-indigo-600 hover:text-white text-white font-extrabold rounded-lg text-[9px] uppercase tracking-wider transition-all"
                        >
                          Masuk Instan ➔
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1.5 flex flex-wrap items-center justify-between text-[10px] gap-2 font-mono">
                        <span className="text-[9px] text-slate-400">
                          ID: <strong className="text-slate-700 font-semibold">{cred.email}</strong>
                        </span>
                        <span className="text-[9px] text-slate-400">
                          Pass: <strong className="text-indigo-600 font-extrabold">{cred.password}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-955 text-[10px] font-medium rounded-xl leading-relaxed flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Semua data modifikasi dokumen dan persetujuan Pabean akan diperbarui secara langsung sesuai status perwakilan yang sedang aktif!</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
