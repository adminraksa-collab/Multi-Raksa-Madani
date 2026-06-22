import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { 
  Users, UserCheck, Shield, Trash2, CheckCircle, 
  Search, ShieldAlert, AlertCircle, Sparkles, Building, Mail, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccountManagementProps {
  users: UserProfile[];
  currentUser: UserProfile | null;
  onDeleteUser: (userId: string) => void;
  onToggleApprove: (userId: string, isApproved: boolean) => void;
}

export default function AccountManagement({ 
  users, 
  currentUser, 
  onDeleteUser, 
  onToggleApprove 
}: AccountManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');

  // Search & Filtered users
  const filteredUsers = users.filter(user => {
    // Search match
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.companyName.toLowerCase().includes(searchLower);

    // Role filter
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    // Status filter
    const isApproved = user.isApproved !== false; // Default to true if not specified
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'APPROVED' && isApproved) ||
      (statusFilter === 'PENDING' && !isApproved);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Role details styling helper
  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Owner/Direktur':
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
  const totalUsers = users.length;
  const pendingUsers = users.filter(u => u.isApproved === false && (u.role === 'Trader' || u.role === 'Forwarder' || u.role === 'Supplier')).length;
  const approvedTraders = users.filter(u => u.role === 'Trader' && u.isApproved !== false).length;
  const approvedForwarders = users.filter(u => u.role === 'Forwarder' && u.isApproved !== false).length;
  const approvedSuppliers = users.filter(u => u.role === 'Supplier' && u.isApproved !== false).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-500/25 border border-indigo-400/30 rounded-lg text-indigo-300 font-extrabold text-[10px] tracking-wider uppercase">
              Direktur Panel
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight leading-none">Manajemen Akun &amp; Kredensial</h1>
          <p className="text-xs text-slate-300 font-medium">
            Otoritas penuh Direktur untuk menghapus, meneliti, atau mensahkan pendaftaran akun Trader, Forwarder, dan Supplier.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
          <Shield className="w-5 h-5 text-indigo-300 shrink-0" />
          <div className="text-left text-xs">
            <p className="font-extrabold text-white leading-none">Otoritas Validasi Aktif</p>
            <p className="text-[10px] text-slate-300 leading-tight mt-0.5">{currentUser?.name}</p>
          </div>
        </div>
      </div>

      {/* Stats Bento Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat - Pending Action */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 shadow-3xs">
          <div className="p-3 bg-amber-500 text-white rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Persetujuan Tertunda</p>
            <p className="text-2xl font-black text-amber-900 leading-none mt-1">{pendingUsers}</p>
            <p className="text-[10px] text-amber-700 font-semibold mt-1">Menunggu disahkan</p>
          </div>
        </div>

        {/* Stat - Active Traders */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-3xs">
          <div className="p-3 bg-blue-600 text-white rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Trader Disahkan</p>
            <p className="text-2xl font-black text-slate-900 leading-none mt-1">{approvedTraders}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Eksportir berlisensi</p>
          </div>
        </div>

        {/* Stat - Active Forwarders */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-3xs">
          <div className="p-3 bg-amber-600 text-white rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Forwarder Disahkan</p>
            <p className="text-2xl font-black text-slate-900 leading-none mt-1">{approvedForwarders}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Mitra logistik draf kapal</p>
          </div>
        </div>

        {/* Stat - Active Suppliers */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-3xs">
          <div className="p-3 bg-emerald-600 text-white rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Supplier Disahkan</p>
            <p className="text-2xl font-black text-slate-900 leading-none mt-1">{approvedSuppliers}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Koperasi produsen tani</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-3xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau perusahaan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-indigo-600"
          />
        </div>

        {/* Filtering Options */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Peran:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-bold focus:outline-none pr-1"
            >
              <option value="ALL">Semua Peran</option>
              <option value="Trader">Trader / Eksportir</option>
              <option value="Forwarder">Forwarder Logistik</option>
              <option value="Supplier">Supplier / Produsen</option>
              <option value="Buyer">Buyer / Importir</option>
              <option value="Owner/Direktur">Direktur / Bea Cukai</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent border-none text-slate-700 font-bold focus:outline-none pr-1"
            >
              <option value="ALL">Semua Status</option>
              <option value="APPROVED">Telah Disahkan (Aktif)</option>
              <option value="PENDING">Menunggu Pengesahan</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Daftar Akun Pengguna Terdaftar ({filteredUsers.length} Terpilih)</span>
          </h3>
          {pendingUsers > 0 && (
            <span className="text-[10px] bg-red-100 text-red-800 font-black px-2.5 py-1 rounded-full animate-bounce">
              ⚠️ {pendingUsers} MENUNGGU VALIDASI PI PIHAK DIREKTUR
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold">Tidak ada akun yang sesuai dengan filter pencarian.</p>
              <button 
                onClick={() => { setSearchTerm(''); setRoleFilter('ALL'); setStatusFilter('ALL'); }}
                className="mt-3 px-3 py-1.5 bg-indigo-650 hover:bg-slate-100 text-indigo-750 text-[10px] font-extrabold rounded-lg border border-indigo-250 cursor-pointer"
              >
                Reset Filter Pencarian
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-extrabold text-[9px]">
                  <th className="p-4 w-[240px]">Profil &amp; Identitas</th>
                  <th className="p-4 w-[200px]">Surel (Email)</th>
                  <th className="p-4 w-[140px]">Peran Sistem</th>
                  <th className="p-4 w-[200px]">Instansi / Perusahaan</th>
                  <th className="p-4 w-[160px] text-center">Status Validasi</th>
                  <th className="p-4 w-[160px] text-right">Tindakan Otoritas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((user) => {
                    const isCurrentUser = currentUser?.id === user.id;
                    const canBeApproved = user.role === 'Trader' || user.role === 'Forwarder' || user.role === 'Supplier';
                    const isApproved = user.isApproved !== false;

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
                            <div className="text-left min-w-0">
                              <p className="font-extrabold text-slate-900 text-xs truncate flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isCurrentUser && (
                                  <span className="bg-indigo-550 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">Saya</span>
                                )}
                              </p>
                              <p className="text-[9px] text-slate-400 font-medium">Kab/Kota: {user.country || 'Indonesia'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="p-4">
                          <div className="text-xs font-semibold text-slate-600 flex items-center gap-1 select-all cursor-pointer">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </td>

                        {/* Role BADGE */}
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase border tracking-wider leading-none shrink-0 ${getRoleBadgeStyle(user.role)}`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Company Name */}
                        <td className="p-4">
                          <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 animate-pulse" />
                            <span className="truncate max-w-[200px]">{user.companyName}</span>
                          </div>
                        </td>

                        {/* Status (Approved vs Pending) */}
                        <td className="p-4 text-center">
                          {canBeApproved ? (
                            isApproved ? (
                              <div className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-black uppercase">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Disah - Sah</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-red-50 text-red-800 border border-red-200 rounded-full text-[10px] font-black uppercase animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-spin" />
                                <span>Belum Sah</span>
                              </div>
                            )
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                              Sistem Luar Otorisasi
                            </span>
                          )}
                        </td>

                        {/* Owner Authority Actions (Delete / Approve toggle) */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Validate/Sahkan Button */}
                            {canBeApproved && (
                              <button
                                onClick={() => onToggleApprove(user.id, !isApproved)}
                                className={`px-2.5 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                                  isApproved
                                    ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-transparent'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-750 shadow-sm animate-pulse'
                                }`}
                                title={isApproved ? "Kembalikan ke status belum disahkan" : "Sahkan akun untuk mengakses ekspor"}
                              >
                                {isApproved ? (
                                  <>Batalkan Pengesahan</>
                                ) : (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Sahkan (Acc)</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* Delete Button (Can delete anyone except current logged in Owner) */}
                            {!isCurrentUser ? (
                              <button
                                onClick={() => {
                                  if (confirm(`Anda yakin ingin menghapus akun ${user.name} (${user.role}) dari data sistem secara permanen? This action is irreversible.`)) {
                                    onDeleteUser(user.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-red-100"
                                title="Hapus Akun Permanen"
                              >
                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-550" />
                              </button>
                            ) : (
                              <div className="p-1.5 text-[9px] text-slate-400 font-bold uppercase italic select-none">
                                Kunci
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

      {/* Guide Banner for Owner on how validations affect users */}
      <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 flex gap-3 text-left">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 text-indigo-950">
          <p className="font-extrabold uppercase tracking-wide text-indigo-900 text-[10px]">Panduan Direktur Bea Cukai &amp; Otoritas</p>
          <p className="font-semibold leading-relaxed">
            Akun yang berstatus <strong className="text-red-750">"Belum Sah" (Unapproved)</strong> masih diizinkan masuk ke ruang kerja, namun mereka akan dibatasi melalui 
            sistem pengaman siber terintegrasi. Mereka tidak dapat: menerbitkan Sales Contract baru, memvalidasi manifes penimbunan logistik, 
            mengirim persetujuan draf kapal, maupun menyatakan draf komoditanya siap, hingga Anda (Owner/Direktur) menekan tombol <strong>"Sahkan (Acc)"</strong> di atas.
          </p>
        </div>
      </div>
    </div>
  );
}
