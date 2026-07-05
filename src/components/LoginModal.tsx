import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { mockUsers } from '../mockData';
import { 
  Shield, Briefcase, ShoppingBag, Truck, Leaf, X, 
  Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle, 
  ArrowRight, Key, Sparkles, UserCheck, UserPlus, Building, Phone,
  Globe, Anchor, MapPin, Upload
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
    company: ''
  },
  {
    role: 'Superadmin' as UserRole,
    email: 'joko@exportflow.com',
    password: 'Fauzan03',
    name: 'joko',
    company: ''
  }
];

export default function LoginModal({ isOpen, onClose, onSelectUser, currentUser, initialMode, t }: LoginModalProps) {
  if (!isOpen) return null;

  // Tab mode
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  // Forgot password form local states
  const [resetUsername, setResetUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [matchedCred, setMatchedCred] = useState<any | null>(null);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmNewResetPassword, setConfirmNewResetPassword] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);

  // Login form local states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register form local states
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regCompany, setRegCompany] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Buyer');
  const [regPhone, setRegPhone] = useState('');
  const [regAvatar, setRegAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
  const [regCountry, setRegCountry] = useState('');
  const [regPortOfLoading, setRegPortOfLoading] = useState('');
  const [regPortOfDischarge, setRegPortOfDischarge] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const handleRegAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setErrorMsg('Ukuran file foto profil maksimal adalah 500 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRegAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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
              company: ''
            });
          }
          // Ensure lis is present in credentials
          if (!creds.some((c: any) => c.name.toLowerCase() === 'lis')) {
            creds.unshift({
              role: 'Trader',
              email: 'lis@exportflow.com',
              password: 'Aisyah10',
              name: 'lis',
              company: ''
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
              companyName: '',
              phone: '',
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
              companyName: '',
              phone: '',
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

  // Auto-set the email input to empty by default, and never reset if already filled
  useEffect(() => {
    if (isOpen) {
      if (!email) {
        setEmail('');
      }
      setPassword('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

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

  const handleResetStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const usernameTrimmed = resetUsername.trim().toLowerCase();
    const emailTrimmed = resetEmail.trim().toLowerCase();

    if (!usernameTrimmed || !emailTrimmed) {
      setErrorMsg('Silakan masukkan Username DAN Email Anda.');
      return;
    }

    const matched = localCredentials.find(c => {
      const dbUsername = (c.username || c.name || '').trim().toLowerCase();
      const dbEmail = (c.email || '').trim().toLowerCase();
      return dbUsername === usernameTrimmed && dbEmail === emailTrimmed;
    });

    if (!matched) {
      setErrorMsg('Username dan Email tidak cocok atau tidak terdaftar.');
      return;
    }

    setMatchedCred(matched);
    setResetStep(2);
  };

  const handleResetStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!matchedCred) {
      setResetStep(1);
      return;
    }

    if (newResetPassword.length < 6) {
      setErrorMsg('Kata sandi minimal harus 6 karakter.');
      return;
    }

    if (newResetPassword.length > 32) {
      setErrorMsg('Kata sandi maksimal 32 karakter.');
      return;
    }

    if (newResetPassword !== confirmNewResetPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak sesuai.');
      return;
    }

    // Perform password update
    const updatedCreds = localCredentials.map(c => {
      if (c.email.trim().toLowerCase() === matchedCred.email.trim().toLowerCase()) {
        return { ...c, password: newResetPassword };
      }
      return c;
    });

    // Update static array
    const staticIdx = demoCredentials.findIndex(c => c.email.trim().toLowerCase() === matchedCred.email.trim().toLowerCase());
    if (staticIdx !== -1) {
      demoCredentials[staticIdx].password = newResetPassword;
    }

    localStorage.setItem('exportflow_credentials', JSON.stringify(updatedCreds));
    setLocalCredentials(updatedCreds);
    setSuccessMsg(t.resetSuccessMsg);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const usernameTrimmed = regUsername.trim();

    if (!regName.trim() || !usernameTrimmed || !regEmail.trim() || !regPassword || !regConfirmPassword || !regCompany.trim()) {
      setErrorMsg('Semua kolom pendaftaran wajib diisi.');
      return;
    }

    if (regName.trim().length > 50) {
      setErrorMsg('Nama Lengkap maksimal 50 karakter.');
      return;
    }

    if (usernameTrimmed.length > 30) {
      setErrorMsg('Nama User Login (Username) maksimal 30 karakter.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameTrimmed)) {
      setErrorMsg('Nama User Login (Username) hanya boleh berisi huruf, angka, dan underscore (_).');
      return;
    }

    const usernameLower = usernameTrimmed.toLowerCase();
    const usernameExists = localCredentials.some(c => 
      (c.username && c.username.trim().toLowerCase() === usernameLower) || 
      c.name.trim().toLowerCase() === usernameLower
    );
    if (usernameExists) {
      setErrorMsg('Nama User Login (Username) ini sudah digunakan. Silakan pilih username lain.');
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
      username: usernameTrimmed,
      role: regRole,
      email: emailLower,
      avatar: regAvatar,
      companyName: regCompany.trim(),
      phone: regPhone.trim() || undefined,
      country: regCountry.trim() || undefined,
      preferredPortOfLoading: regPortOfLoading.trim() || undefined,
      preferredPortOfDischarge: regPortOfDischarge.trim() || undefined,
      address: regAddress.trim() || undefined,
      isApproved: !needsApproval // false if Trader, Forwarder, Supplier
    };

    const newCred = {
      role: regRole,
      email: emailLower,
      password: regPassword,
      name: regName.trim(),
      username: usernameTrimmed,
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
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setShowRegPassword(false);
      setShowRegConfirmPassword(false);
      setRegCompany('');
      setRegRole('Buyer');
      setRegPhone('');
      setRegAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
      setRegCountry('');
      setRegPortOfLoading('');
      setRegPortOfDischarge('');
      setRegAddress('');
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
                    {mode === 'login' ? t.loginToSystem : mode === 'register' ? t.registerNewAccount : t.resetPasswordTitle}
                  </h3>
                </div>
              </div>

              {/* TABS SELECTOR */}
              {mode !== 'forgot_password' && (
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
                    {t.loginTab}
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
                    {t.registerTab}
                  </button>
                </div>
              )}

              {mode === 'forgot_password' ? (
                <div className="space-y-4 pt-1 text-left">
                  {/* Step 1: Input email and username */}
                  {resetStep === 1 && (
                    <form onSubmit={handleResetStep1} className="space-y-4">
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Masukkan Username DAN Email terdaftar untuk memverifikasi akun Anda.
                      </p>
                      
                      {/* Username Input */}
                      <div className="space-y-1">
                        <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Username *</span>
                        </label>
                        <input
                          type="text"
                          value={resetUsername}
                          onChange={(e) => {
                            setResetUsername(e.target.value);
                            setErrorMsg('');
                          }}
                          placeholder="Masukkan username Anda..."
                          className="w-full text-[13px] font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                          required
                        />
                      </div>

                      {/* Email Input */}
                      <div className="space-y-1">
                        <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Surel (Email) *</span>
                        </label>
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => {
                            setResetEmail(e.target.value);
                            setErrorMsg('');
                          }}
                          placeholder="Masukkan email terdaftar..."
                          className="w-full text-[13px] font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                          required
                        />
                      </div>

                      {errorMsg && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-950 text-xs rounded-xl flex items-start gap-2 animate-shake">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                          <span className="font-semibold">{errorMsg}</span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setMode('login');
                            setErrorMsg('');
                            setSuccessMsg('');
                          }}
                          className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center cursor-pointer"
                        >
                          {t.backToLoginBtn}
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 cursor-pointer"
                        >
                          <span>{t.resetPasswordBtn}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Step 2: Set New Password / Complete */}
                  {resetStep === 2 && matchedCred && (
                    <form onSubmit={handleResetStep2} className="space-y-4">
                      {successMsg ? (
                        <div className="space-y-4 text-center py-2">
                          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl flex items-start gap-2 text-left">
                            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                            <span className="font-semibold">{successMsg}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setMode('login');
                              setResetStep(1);
                              setResetUsername('');
                              setResetEmail('');
                              setSecurityAnswer('');
                              setNewResetPassword('');
                              setConfirmNewResetPassword('');
                              setErrorMsg('');
                              setSuccessMsg('');
                            }}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                          >
                            <span>{t.backToLoginBtn}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Silakan masukkan kata sandi baru untuk akun Anda.
                          </p>
                          
                          {/* New Password Input */}
                          <div className="space-y-1">
                            <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                              <Key className="w-3.5 h-3.5" />
                              <span>{t.newPasswordResetLabel}</span>
                            </label>
                            <div className="relative">
                              <input
                                type={showResetPass ? 'text' : 'password'}
                                value={newResetPassword}
                                onChange={(e) => {
                                  setNewResetPassword(e.target.value);
                                  setErrorMsg('');
                                }}
                                placeholder="Masukkan sandi baru (min 6 karakter)..."
                                className="w-full text-[13px] font-mono p-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowResetPass(!showResetPass)}
                                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                              >
                                {showResetPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Confirm New Password Input */}
                          <div className="space-y-1">
                            <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                              <Key className="w-3.5 h-3.5" />
                              <span>{t.confirmNewPasswordResetLabel}</span>
                            </label>
                            <input
                              type={showResetPass ? 'text' : 'password'}
                              value={confirmNewResetPassword}
                              onChange={(e) => {
                                  setConfirmNewResetPassword(e.target.value);
                                  setErrorMsg('');
                              }}
                              placeholder="Ketik ulang sandi baru..."
                              className="w-full text-[13px] font-mono p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                              required
                            />
                          </div>

                          {errorMsg && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-950 text-xs rounded-xl flex items-start gap-2 animate-shake">
                              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                              <span className="font-semibold">{errorMsg}</span>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setResetStep(1);
                                setErrorMsg('');
                                setSuccessMsg('');
                              }}
                              className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center cursor-pointer"
                            >
                              {t.cancel}
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 cursor-pointer"
                            >
                              <span>Simpan Sandi</span>
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </form>
                  )}
                </div>
              ) : mode === 'login' ? (
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
                      className="w-full text-[13px] font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
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
                        className="w-full text-[13px] font-mono p-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setResetStep(1);
                        setResetUsername('');
                        setResetEmail('');
                        setSecurityAnswer('');
                        setNewResetPassword('');
                        setConfirmNewResetPassword('');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      {t.forgotPasswordLink}
                    </button>
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
                <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-1 max-h-[440px] overflow-y-auto pr-1">
                  {/* Profile Avatar Selection & Upload */}
                  <div className="space-y-1.5 pb-1">
                    <label className="block text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{t.chooseProfileAvatar || 'Pilih Foto Profil'}</span>
                    </label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                      <img 
                        src={regAvatar} 
                        alt="Reg Avatar" 
                        className="w-12 h-12 rounded-full border-2 border-indigo-500 object-cover p-0.5 shrink-0" 
                      />
                      <div className="flex flex-wrap items-center gap-1.5">
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
                            onClick={() => setRegAvatar(url)}
                            className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 ${
                              regAvatar === url ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                          </button>
                        ))}

                        {/* Show custom uploaded avatar if not preset */}
                        {regAvatar && ![
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
                          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
                          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
                        ].includes(regAvatar) && (
                          <button
                            type="button"
                            onClick={() => setRegAvatar(regAvatar)}
                            className="w-7 h-7 rounded-full overflow-hidden border-2 border-indigo-600 ring-2 ring-indigo-200 transition-all cursor-pointer hover:scale-105"
                          >
                            <img src={regAvatar} alt="Custom Upload" className="w-full h-full object-cover" />
                          </button>
                        )}

                        {/* Custom image upload button */}
                        <label
                          className="w-7 h-7 rounded-full border border-dashed border-slate-350 hover:border-indigo-500 hover:bg-white hover:text-indigo-600 text-slate-400 transition-all flex items-center justify-center cursor-pointer hover:scale-105 shrink-0 bg-slate-50"
                          title="Unggah Foto Kustom (Maks 500kb)"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleRegAvatarUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* Full Name */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{t.fullNameLabel}</span>
                      </label>
                      <span className="text-[12px] text-slate-400 font-bold">50</span>
                    </div>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        setErrorMsg('');
                      }}
                      maxLength={50}
                      placeholder={t.placeholderExampleName}
                      className="w-full text-[13px] font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                      required
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{t.loginUsernameLabel}</span>
                      </label>
                      <span className="text-[12px] text-slate-400 font-bold">30</span>
                    </div>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => {
                        setRegUsername(e.target.value);
                        setErrorMsg('');
                      }}
                      maxLength={30}
                      placeholder={t.placeholderUsername}
                      className="w-full text-[13px] font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{t.emailLabel}</span>
                      </label>
                      <span className="text-[12px] text-slate-400 font-bold">100</span>
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        setErrorMsg('');
                      }}
                      maxLength={100}
                      placeholder={t.placeholderEmail}
                      className="w-full text-[13px] font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                      required
                    />
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Key className="w-3.5 h-3.5" />
                          <span>{t.passwordLabel}</span>
                        </label>
                        <span className="text-[12px] text-slate-400 font-bold">32</span>
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
                          placeholder={t.placeholderMinChars}
                          className="w-full text-[13px] font-mono p-2 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t.confirmPasswordLabel}</span>
                        </label>
                        <span className="text-[12px] text-slate-400 font-bold">32</span>
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
                          placeholder={t.placeholderRetype}
                          className="w-full text-[13px] font-mono p-2 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-1.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Company & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          <span>{t.institutionLabel}</span>
                        </label>
                        <span className="text-[12px] text-slate-400 font-bold">50</span>
                      </div>
                      <input
                        type="text"
                        value={regCompany}
                        onChange={(e) => {
                          setRegCompany(e.target.value);
                          setErrorMsg('');
                        }}
                        maxLength={50}
                        placeholder={t.placeholderCompany}
                        className="w-full text-[13px] font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{t.ecosystemRoleLabel}</span>
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => {
                          setRegRole(e.target.value as UserRole);
                          setErrorMsg('');
                        }}
                        className="w-full text-[13px] font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600 cursor-pointer"
                      >
                        <option value="Buyer">{t.roleBuyer}</option>
                        <option value="Trader">{t.roleTrader}</option>
                        <option value="Supplier">{t.roleSupplier}</option>
                        <option value="Forwarder">{t.roleForwarder}</option>
                        <option value="Superadmin">{t.roleSuperadmin}</option>
                      </select>
                    </div>
                  </div>

                  {/* Country of Origin & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t.countryLabel || 'Negara Asal (Country)'}</span>
                        </label>
                        <span className="text-[12px] text-slate-400 font-bold">50</span>
                      </div>
                      <input
                        type="text"
                        value={regCountry}
                        onChange={(e) => {
                          setRegCountry(e.target.value);
                          setErrorMsg('');
                        }}
                        maxLength={50}
                        placeholder="Contoh: Indonesia, Jerman"
                        className="w-full text-[13px] font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{t.phoneWhatsappLabel}</span>
                        </label>
                        <span className="text-[12px] text-slate-400 font-bold">20</span>
                      </div>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => {
                          setRegPhone(e.target.value);
                          setErrorMsg('');
                        }}
                        maxLength={20}
                        placeholder={t.placeholderPhone}
                        className="w-full text-[13px] font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Ports Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Anchor className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t.preferredPortOfLoadingLabel || 'Pelabuhan Muat Utama (Asal)'}</span>
                        </label>
                        <span className="text-[12px] text-slate-400 font-bold">50</span>
                      </div>
                      <input
                        type="text"
                        value={regPortOfLoading}
                        onChange={(e) => {
                          setRegPortOfLoading(e.target.value);
                          setErrorMsg('');
                        }}
                        maxLength={50}
                        placeholder="Contoh: Tanjung Priok, Jakarta"
                        className="w-full text-[13px] font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Anchor className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t.preferredPortOfDischargeLabel || 'Pelabuhan Bongkar Utama (Destinasi)'}</span>
                        </label>
                        <span className="text-[12px] text-slate-400 font-bold">50</span>
                      </div>
                      <input
                        type="text"
                        value={regPortOfDischarge}
                        onChange={(e) => {
                          setRegPortOfDischarge(e.target.value);
                          setErrorMsg('');
                        }}
                        maxLength={50}
                        placeholder="Contoh: Port of Yokohama, Japan"
                        className="w-full text-[13px] font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Company Address */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.companyAddressLabel || 'Alamat Perusahaan'}</span>
                      </label>
                      <span className="text-[12px] text-slate-400 font-bold">200</span>
                    </div>
                    <textarea
                      value={regAddress}
                      onChange={(e) => {
                        setRegAddress(e.target.value);
                        setErrorMsg('');
                      }}
                      maxLength={200}
                      placeholder="Masukkan alamat lengkap perusahaan..."
                      rows={2}
                      className="w-full text-[13px] font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600 font-sans"
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
                    <span>{t.createAccountBtn}</span>
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
                  <span>{t.logoutText}</span>
                </button>
              )}
            </div>

            
          </div>
        </motion.div>
      </div>
    </div>
  );
}
