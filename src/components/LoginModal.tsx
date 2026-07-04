import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { mockUsers } from '../mockData';
import { 
  Shield, Briefcase, ShoppingBag, Truck, Leaf, X, 
  Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle, 
  ArrowRight, Key, Sparkles, UserCheck, UserPlus, Building, Phone
} from 'lucide-react';
import { motion } from 'motion/react';

import { TranslationKeys } from '../translations';

interface LoginModalProps {
  t: TranslationKeys;
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserProfile | null) => void;
  currentUser: UserProfile | null;
  initialMode?: 'login' | 'register';
}

// In-memory mapping of credentials
const demoCredentials = [
  {
    role: 'Trader' as UserRole,
    email: 'lis@exportflow.com',
    password: 'Aisyah10',
    name: 'lis',
    company: 'PT Multi Raksa Madani'
  },
  {
    role: 'Superadmin' as UserRole,
    email: 'joko@exportflow.com',
    password: 'Fauzan03',
    name: 'joko',
    company: 'Kementerian Perdagangan & Bea Cukai (Bea Cukai RI)'
  }
];

export default function LoginModal({ isOpen, onClose, onSelectUser, currentUser, initialMode, t }: LoginModalProps) {
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

      const storedCreds = localStorage.getItem('exportflow_credentials');
      let creds = demoCredentials;
      if (storedCreds) {
        try {
          creds = JSON.parse(storedCreds);
          creds = creds.map((c: any) => c.role === 'Owner/Direktur' ? { ...c, role: 'Superadmin' } : c);
          creds = creds.filter((c: any) => !isSandboxToRemove(c.email));
          
          // Ensure joko is present in credentials
          if (!creds.some((c: any) => c.name.toLowerCase() === 'joko')) {
            creds.unshift({
              role: 'Superadmin',
              email: 'joko@exportflow.com',
              password: 'Fauzan03',
              name: 'joko',
              company: 'Kementerian Perdagangan & Bea Cukai (Bea Cukai RI)'
            });
          }
          // Ensure lis is present in credentials
          if (!creds.some((c: any) => c.name.toLowerCase() === 'lis')) {
            creds.unshift({
              role: 'Trader',
              email: 'lis@exportflow.com',
              password: 'Aisyah10',
              name: 'lis',
              company: 'PT Multi Raksa Madani'
            });
          }
          localStorage.setItem('exportflow_credentials', JSON.stringify(creds));
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
      setEmail(''); // Default to empty as requested by user
    }
    setPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  }, [currentUser, isOpen]);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Superadmin':
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
      case 'Superadmin': return 'bg-purple-100/80 text-purple-800 border-purple-200';
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

    // Check against credentials list (support both email and username)
    const cred = localCredentials.find(c => 
      c.email.trim().toLowerCase() === email.trim().toLowerCase() ||
      c.name.trim().toLowerCase() === email.trim().toLowerCase()
    );
    if (!cred) {
      setErrorMsg('Surel (Email) atau Username tidak terdaftar dalam sistem.');
      return;
    }

    if (password !== cred.password) {
      setErrorMsg('Kata sandi (password) salah. Silakan periksa daftar kredensial uji coba di sebelah kanan.');
      return;
    }

    // Success login
    const userToLogin = localUsers.find(u => 
      u.email === cred.email || 
      u.name.trim().toLowerCase() === cred.name.trim().toLowerCase()
    );
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
      setSuccessMsg(`Pendaftaran Berhasil! Akun "${newProfile.name}" didaftarkan. Hubungi Superadmin Bea Cukai RI untuk mensahkan status akun Anda.`);
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
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-150 my-4 sm:my-8 text-left overflow-hidden"
        >
          {/* CLOSE BUTTON */}
          <button 
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors z-10 cursor-pointer"
          >
            <X className="w-4 h-4 font-bold" />
          </button>

          {/* FORM LOGIN */}
          <div className="p-6 sm:p-8 flex flex-col justify-between text-left space-y-6">
            <div className="space-y-4">
              {/* Brand and titles */}
              <div className="flex items-center gap-2 pr-8">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 leading-tight">
                    {mode === 'login' ? t.loginToSystem : t.registerNewAccount}
                  </h3>
                </div>
              </div>

              {/* TABS SELECTOR */}
              <div className="flex border border-slate-200 p-1 bg-slate-50 rounded-xl">
                <button 
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
                    mode === 'login' 
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                      : 'text-slate-500 hover:text-slate-800'
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
                  className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
                    mode === 'register' 
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Daftar Akun
                </button>
              </div>

              {mode === 'login' ? (
                <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
                  {/* Email Selector */}
                  <div className="space-y-1">
                    <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{t.userEmailLabel}</span>
                    </label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder={t.userEmailPlaceholder}
                      className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                      required
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" />
                        <span>{t.passwordLabel}</span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrorMsg('');
                        }}
                        placeholder={t.passwordPlaceholder}
                        className="w-full text-sm font-mono p-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Feedbacks */}
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-950 text-xs rounded-xl flex items-start gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                      <span className="font-semibold">{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span className="font-semibold">{successMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{t.verifyLoginBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-1 max-h-[380px] overflow-y-auto pr-1">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{t.fullNameLabel}</span>
                      </label>
                      <span className="text-[12px] text-slate-400 font-bold uppercase">{t.max50Chars}</span>
                    </div>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        setErrorMsg('');
                      }}
                      maxLength={50}
                      placeholder="Contoh: Kenji Sato"
                      className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Surel (Email) *</span>
                      </label>
                      <span className="text-[12px] text-slate-400 font-bold uppercase">Maks 100</span>
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
                      className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                      required
                    />
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Key className="w-3.5 h-3.5" />
                          <span>Sandi *</span>
                        </label>
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
                          placeholder="Min 6 karakter"
                          className="w-full text-xs sm:text-sm font-mono p-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-slate-400" />
                          <span>Konfirmasi *</span>
                        </label>
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
                          placeholder="Ketik ulang"
                          className="w-full text-xs sm:text-sm font-mono p-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Company & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" />
                        <span>Instansi *</span>
                      </label>
                      <input
                        type="text"
                        value={regCompany}
                        onChange={(e) => {
                          setRegCompany(e.target.value);
                          setErrorMsg('');
                        }}
                        maxLength={50}
                        placeholder="Nama perusahaan"
                        className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Peran Ekosistem</span>
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => {
                          setRegRole(e.target.value as UserRole);
                          setErrorMsg('');
                        }}
                        className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600 cursor-pointer"
                      >
                        <option value="Buyer">Buyer (Pembeli Luar Negeri)</option>
                        <option value="Trader">Trader / Eksportir RI</option>
                        <option value="Supplier">Supplier / UMKM Penyedia</option>
                        <option value="Forwarder">Forwarder / Logistik</option>
                        <option value="Superadmin">Superadmin</option>
                      </select>
                    </div>
                  </div>

                  {/* Nomor Telepon */}
                  <div className="space-y-1">
                    <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Nomor Telepon / WhatsApp *</span>
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => {
                        setRegPhone(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="Contoh: +6281234567890"
                      className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                      required
                    />
                  </div>

                  {/* Feedbacks */}
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-950 text-xs rounded-xl flex items-start gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                      <span className="font-semibold">{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span className="font-semibold">{successMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-indigo-200" />
                    <span>Buat Akun Baru</span>
                  </button>
                </form>
              )}

              {currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectUser(null);
                    setSuccessMsg('Berhasil keluar! Beralih ke Akses Umum (Tamu)...');
                    setTimeout(() => onClose(), 600);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-black uppercase rounded-xl border border-slate-200 hover:border-red-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Keluar Peran & Jadikan Tamu (Akses Umum)</span>
                </button>
              )}
            </div>

            
          </div>
        </motion.div>
      </div>
    </div>
  );
}
