import React, { useState } from 'react';
import { 
  Globe, ArrowRight, ShieldCheck, FileText, 
  ChevronRight, Ship, FileSignature, Calculator, Info, X,
  Lock, UserPlus, Edit, Trash2, Save, Plus, Award, MapPin, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { UserProfile, ExportProduct } from '../types';

interface CompanyProfileData {
  nib: string;
  nibNotes: string;
  address: string;
  telephone: string;
  email: string;
}

interface LandingPageProps {
  onNavigate: (tab: any) => void;
  onStartNegotiation: (product: ExportProduct) => void;
  shipmentsCount: number;
  totalVolume: number;
  totalValue: number;
  currentUser: UserProfile | null;
  onOpenProfile: (mode?: 'login' | 'register', fromCalculator?: boolean) => void;
  onLogout: () => void;
  isCalcOpen?: boolean;
  setIsCalcOpen?: (open: boolean) => void;
  products: ExportProduct[];
  onUpdateProducts: (newProds: ExportProduct[]) => void;
  companyProfile: CompanyProfileData;
  onUpdateCompanyProfile: (newProfile: CompanyProfileData) => void;
}

export default function LandingPage({ 
  onNavigate, 
  onStartNegotiation,
  shipmentsCount, 
  totalVolume, 
  totalValue,
  currentUser,
  onOpenProfile,
  onLogout,
  isCalcOpen: isCalcOpenProp,
  setIsCalcOpen: setIsCalcOpenProp,
  products,
  onUpdateProducts,
  companyProfile,
  onUpdateCompanyProfile
}: LandingPageProps) {
  const [targetProduct, setTargetProduct] = useState<string>('prod-1');
  const [orderVolume, setOrderVolume] = useState<number>(20); // default 20 metric tons
  const [localCalcOpen, setLocalCalcOpen] = useState<boolean>(false);
  const isCalcOpen = isCalcOpenProp !== undefined ? isCalcOpenProp : localCalcOpen;
  const setIsCalcOpen = setIsCalcOpenProp !== undefined ? setIsCalcOpenProp : setLocalCalcOpen;

  // Company profile edit state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempProfile, setTempProfile] = useState(companyProfile);

  const handleEditProfileClick = () => {
    setTempProfile(companyProfile);
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyProfile(tempProfile);
    setIsProfileModalOpen(false);
  };

  // Catalog products editing state
  const [editingProduct, setEditingProduct] = useState<ExportProduct | 'new' | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    hsCode: '',
    price: '',
    unit: 'Metrik Ton (MT)',
    specification: '',
    origin: '',
    minOrder: '',
    image: '',
  });

  const handleEditProductClick = (prod: ExportProduct) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      hsCode: prod.hsCode,
      price: prod.price,
      unit: prod.unit,
      specification: prod.specification,
      origin: prod.origin,
      minOrder: prod.minOrder,
      image: prod.image,
    });
  };

  const handleAddProductClick = () => {
    setEditingProduct('new');
    setProductForm({
      name: '',
      category: 'Pertanian / Hasil Bumi',
      hsCode: '0901.11.10',
      price: '1,000',
      unit: 'Metrik Ton (MT)',
      specification: '',
      origin: 'Indonesia',
      minOrder: '10 MT',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus komoditas ini dari katalog?')) {
      const updated = products.filter(p => p.id !== productId);
      onUpdateProducts(updated);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct === 'new') {
      const newProd: ExportProduct = {
        id: 'prod-' + Date.now(),
        name: productForm.name,
        category: productForm.category,
        hsCode: productForm.hsCode,
        price: productForm.price,
        unit: productForm.unit,
        specification: productForm.specification,
        origin: productForm.origin,
        minOrder: productForm.minOrder,
        image: productForm.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
        supplierName: 'Koperasi Mitra AgriFlow',
      };
      onUpdateProducts([...products, newProd]);
      // set as default target
      setTargetProduct(newProd.id);
    } else if (editingProduct && editingProduct !== 'new') {
      const updated = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: productForm.name,
            category: productForm.category,
            hsCode: productForm.hsCode,
            price: productForm.price,
            unit: productForm.unit,
            specification: productForm.specification,
            origin: productForm.origin,
            minOrder: productForm.minOrder,
            image: productForm.image,
            // keep old supplier or fallback
            supplierName: p.supplierName || 'Koperasi Mitra AgriFlow',
          };
        }
        return p;
      });
      onUpdateProducts(updated);
    }
    setEditingProduct(null);
  };

  // Product price guidelines derived dynamically from the products state
  const productPricing = products.reduce((acc, p) => {
    const cleanPrice = parseFloat(p.price.replace(/,/g, '')) || 1000;
    const minVolMatch = p.minOrder.match(/\d+/);
    const minVol = minVolMatch ? parseInt(minVolMatch[0]) : 10;
    
    acc[p.id] = {
      name: p.name,
      pricePerTon: cleanPrice,
      containerCapacity20ft: p.id === 'prod-1' ? 20 : p.id === 'prod-2' ? 18 : p.id === 'prod-3' ? 15 : p.id === 'prod-4' ? 21 : 16,
      hsCode: p.hsCode,
      leadTimeDays: p.id === 'prod-1' ? 30 : p.id === 'prod-2' ? 25 : p.id === 'prod-3' ? 28 : p.id === 'prod-4' ? 20 : 22,
      rawProduct: p,
      minVol: minVol,
      maxVol: minVol * 50
    };
    return acc;
  }, {} as Record<string, any>);

  const activeProductId = productPricing[targetProduct] ? targetProduct : (products[0]?.id || 'prod-1');
  const activeProduct = productPricing[activeProductId] || {
    name: 'Komoditas',
    pricePerTon: 1000,
    containerCapacity20ft: 20,
    hsCode: '0000.00.00',
    leadTimeDays: 30,
    rawProduct: products[0],
    minVol: 10,
    maxVol: 500
  };

  const totalCost = (orderVolume || activeProduct.minVol) * activeProduct.pricePerTon;
  const fclCount = Math.ceil((orderVolume || activeProduct.minVol) / activeProduct.containerCapacity20ft);

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-blue-500/5 to-transparent pointer-events-none" />

        <div className="p-8 sm:p-12 relative z-15 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 text-left space-y-4">
            <span className="text-xs font-extrabold text-indigo-400 md:text-sm uppercase tracking-widest block">PORTAL PENJUALAN KOMODITAS EKSPOR INDONESIA</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight uppercase">
              Sourcing Komoditas Premium Secara Aman &amp; Transparan
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
              PT Multi Raksa Madani menghubungkan petani lokal dengan pembeli internasional secara transparan. Mulai negosiasi kargo bilateral secara elektronik, awasi draf berkas pabean dari meja kerja Anda.
            </p>
          </div>

          <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-left space-y-3.5 shadow-xl backdrop-blur-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2 mb-3.5">
                <span className="text-[11px] font-black text-indigo-400 tracking-widest uppercase">PROFIL PERUSAHAAN</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">Terverifikasi</span>
              </div>
              
              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Izin Resmi</span>
                  <p className="text-slate-200 font-semibold leading-relaxed">
                    {companyProfile.nib} 
                    <span className="block text-[10px] text-indigo-300 mt-0.5">{companyProfile.nibNotes}</span>
                  </p>
                </div>
                
                <div className="border-t border-slate-800/80" />
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Alamat Kantor</span>
                  <p className="text-slate-300 font-medium leading-relaxed">
                    {companyProfile.address}
                  </p>
                </div>
                
                <div className="border-t border-slate-800/80" />
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kontak &amp; Layanan</span>
                  <p className="text-slate-300 font-medium leading-relaxed">
                    Telp: <span className="text-white font-semibold">{companyProfile.telephone}</span><br />
                    Email: <span className="text-indigo-300 font-semibold hover:underline">{companyProfile.email}</span>
                  </p>
                </div>
              </div>
            </div>

            {currentUser?.role === 'Owner/Direktur' && (
              <button
                onClick={handleEditProfileClick}
                className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10.5px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow hover:shadow-lg border border-indigo-505 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-indigo-100" />
                <span>Edit Profil Perusahaan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC INLINE COMMODITY CATALOG */}
      <div id="featured-commodities" className="space-y-6 scroll-mt-20">
          <div className="text-left border-b border-gray-200 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">Katalog Komoditas Ekspor Unggulan</h2>
              <p className="text-xs text-slate-500">Eksplorasi komoditas agro-industri Indonesia bersertifikat ekspor aman siap kirim.</p>
            </div>
            <div className="flex gap-2 items-center">
              {currentUser?.role === 'Owner/Direktur' && (
                <button
                  onClick={handleAddProductClick}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Komoditas</span>
                </button>
              )}
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                99.8% Lolos Bea Cukai RI &amp; Karantina
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-3xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all relative group">
                <div>
                  <div className="relative h-44 w-full bg-slate-100">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-3xs animate-pulse">
                      {p.category}
                    </div>

                    {currentUser?.role === 'Owner/Direktur' && (
                      <div className="absolute top-3 right-3 flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditProductClick(p)}
                          className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg backdrop-blur-3xs transition-colors cursor-pointer border border-slate-700"
                          title="Edit Komoditas"
                        >
                          <Edit className="w-3.5 h-3.5 text-indigo-300" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded-lg backdrop-blur-3xs transition-colors cursor-pointer border border-red-700"
                          title="Hapus Komoditas"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-100" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-5 text-left space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-slate-900 hover:text-indigo-600 transition-colors leading-snug">{p.name}</h3>
                      <p className="text-[10px] text-gray-400 font-extrabold flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded">HS {p.hsCode}</span>
                        <span>&bull;</span>
                        <span>Asal: {p.origin}</span>
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium h-16 overflow-y-auto">
                      {p.specification}
                    </p>
                    <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                      <div>
                        <span className="text-[9px] uppercase font-black text-gray-400 block tracking-wider leading-none">Harga FOB Tentatif</span>
                        <span className="text-sm font-black text-indigo-600 font-mono">${p.price} <span className="text-[10px] text-gray-500 font-bold">/ {p.unit.split(' ')[0]}</span></span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-black text-gray-400 block tracking-wider leading-none">Min. Order</span>
                        <span className="text-[10px] font-black text-slate-800">{p.minOrder}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setTargetProduct(p.id);
                      const prodInfo = productPricing[p.id as keyof typeof productPricing];
                      if (prodInfo) {
                        setOrderVolume(prodInfo.minVol);
                      }
                      setIsCalcOpen(true);
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg transition-all shadow-sm hover:translate-y-[-1px] flex items-center justify-center gap-1.5 tracking-wider cursor-pointer font-sans"
                  >
                    <Calculator className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Kalkulator & Permintaan/LOI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* 5. SOURCING CALCULATOR MODAL POPUP */}
      <AnimatePresence>
        {isCalcOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCalcOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-white shadow-2xl flex flex-col z-10 font-sans"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-slate-900 z-20 px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-550/10 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
                    <Calculator className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black tracking-tight text-white leading-none mb-1">Kalkulator & Permintaan/LOI</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Estimasi Volume, Wadah Laut FCL, &amp; Harga FOB</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCalcOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-440 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-5 space-y-6 flex flex-col justify-between text-left">
                  <div className="space-y-5">
                    {/* Detail Komoditas Terpilih */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-4">
                      <div className="flex items-start gap-3">
                        {activeProduct.rawProduct?.image && (
                          <img
                            src={activeProduct.rawProduct.image}
                            alt={activeProduct.name}
                            className="w-16 h-16 object-cover rounded-xl border border-white/10 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block mb-1">Komoditas Sourcing</span>
                          <h4 className="text-sm font-extrabold text-white leading-snug break-words">{activeProduct.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono font-semibold block mt-1">Origin: {activeProduct.rawProduct?.origin || 'Indonesia'}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-white/10 pt-3 space-y-3">
                        {activeProduct.rawProduct?.specification && (
                          <div className="text-left">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Spesifikasi Utama</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-medium line-clamp-3">
                              {activeProduct.rawProduct.specification}
                            </p>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                          <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Harga Acuan FOB</span>
                          <span className="font-mono font-black text-indigo-300">${activeProduct.pricePerTon.toLocaleString('id-ID')} USD / MT</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2 gap-2 text-left">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Tentukan Volume Pesanan</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={activeProduct.minVol}
                            max={activeProduct.maxVol}
                            value={orderVolume || ''}
                            onChange={(e) => {
                              let val = Number(e.target.value);
                              if (val > activeProduct.maxVol) val = activeProduct.maxVol;
                              setOrderVolume(val);
                            }}
                            onBlur={() => {
                              if (!orderVolume || orderVolume < activeProduct.minVol) {
                                setOrderVolume(activeProduct.minVol);
                              }
                            }}
                            className="w-20 py-1 px-2 text-center font-mono font-black text-xs text-indigo-400 bg-indigo-500/10 rounded border border-indigo-500/30 focus:outline-none focus:border-indigo-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-[11px] font-bold text-slate-400">MT</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={activeProduct.minVol}
                        max={activeProduct.maxVol}
                        step="1"
                        value={orderVolume || activeProduct.minVol}
                        onChange={(e) => setOrderVolume(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                        <span>Min: {activeProduct.minVol} MT</span>
                        <span>Max: {activeProduct.maxVol} MT</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-6 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-b border-white/10 pb-3 text-left">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Kode HS Standard</span>
                      <span className="text-sm font-mono font-bold text-indigo-300">{activeProduct.hsCode}</span>
                    </div>
                    <div className="border-b border-white/10 pb-3 text-left">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Jenis Kontainer Laut</span>
                      <span className="text-sm font-bold text-slate-200">FCL Container (20ft Dry Van)</span>
                    </div>
                    <div className="border-b border-white/10 pb-3 text-left">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Estimasi Lead Time Gudang</span>
                      <span className="text-sm font-bold text-slate-200">~{activeProduct.leadTimeDays} Hari Kerja</span>
                    </div>
                    <div className="border-b border-white/10 pb-3 text-left">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Jumlah Kontainer Diperlukan</span>
                      <span className="text-sm font-mono font-bold text-indigo-300">{fclCount} × Wadah Kontainer 20ft</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-left">
                      <div>
                        <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider block">Total Estimasi Harga FOB</span>
                        <span className="text-xs text-slate-400 font-medium">Bebas di Atas Kapal (Tanjung Priok, Jakarta)</span>
                      </div>
                      <span className="text-2xl font-black text-white font-mono">${totalCost.toLocaleString('id-ID')} USD</span>
                    </div>
                    
                    {/* Pembatasan Autentikasi Peran Buyer */}
                    {currentUser?.role !== 'Buyer' && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-left rounded-lg text-[10.5px] text-amber-300 leading-relaxed font-semibold flex items-start gap-2">
                        <Info className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-2 flex-1">
                          <p>
                            {!currentUser 
                              ? "Anda masuk sebagai Tamu. Pengajuan Letter of Intent (LOI) memerlukan akun pembeli (Buyer) terdaftar."
                              : `Peran Anda saat ini (${currentUser.role}) dilarang mengirimkan LOI. Silakan login kembali sebagai 'Buyer'.`
                            }
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <button
                              onClick={() => {
                                onOpenProfile('login', true);
                              }}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-[8.5px] tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Lock className="w-3 h-3 text-slate-900" />
                              <span>Login</span>
                            </button>
                            <button
                              onClick={() => {
                                onOpenProfile('register', true);
                              }}
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/10 text-amber-300 font-extrabold uppercase text-[8.5px] tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-1"
                            >
                              <UserPlus className="w-3 h-3 text-amber-400" />
                              <span>Daftar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-slate-400">
                      <span className="italic flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Sesuai batasan acuan FOB: ${activeProduct.pricePerTon}/MT
                      </span>
                      <button
                        onClick={() => {
                          if (currentUser?.role !== 'Buyer') return;
                          const targetProdObj = activeProduct.rawProduct;
                          if (targetProdObj) {
                            setIsCalcOpen(false);
                            onStartNegotiation(targetProdObj);
                          }
                        }}
                        disabled={currentUser?.role !== 'Buyer'}
                        className={`px-3.5 py-1.5 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 shadow ${
                          currentUser?.role === 'Buyer'
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <span>Permintaan / LOI →</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPANY PROFILE EDIT MODAL */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-y-auto text-white shadow-2xl flex flex-col z-10 p-6 font-sans text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-black uppercase tracking-wider">Edit Profil Perusahaan</h3>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Izin Resmi (NIB/SIUP)</label>
                  <input
                    type="text"
                    required
                    value={tempProfile.nib}
                    onChange={(e) => setTempProfile({ ...tempProfile, nib: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catatan Tambahan Izin</label>
                  <input
                    type="text"
                    required
                    value={tempProfile.nibNotes}
                    onChange={(e) => setTempProfile({ ...tempProfile, nibNotes: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Kantor</label>
                  <textarea
                    required
                    rows={2}
                    value={tempProfile.address}
                    onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Telepon</label>
                  <input
                    type="text"
                    required
                    value={tempProfile.telephone}
                    onChange={(e) => setTempProfile({ ...tempProfile, telephone: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Kontak</label>
                  <input
                    type="email"
                    required
                    value={tempProfile.email}
                    onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT COMMODITY CATALOG MODAL */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-y-auto max-h-[90vh] text-white shadow-2xl flex flex-col z-10 p-6 font-sans text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-black uppercase tracking-wider">
                    {editingProduct === 'new' ? 'Tambah Komoditas Baru' : 'Edit Komoditas Katalog'}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs overflow-y-auto pr-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Komoditas</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Premium Coffee Beans"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pertanian / Kopi"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">HS Code</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 0901.11.10"
                      value={productForm.hsCode}
                      onChange={(e) => setProductForm({ ...productForm, hsCode: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Harga FOB (USD)</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 1,450"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Satuan</label>
                    <input
                      type="text"
                      required
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asal / Origin</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Aceh Tengah, Sumatra"
                      value={productForm.origin}
                      onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Order</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 10 MT"
                      value={productForm.minOrder}
                      onChange={(e) => setProductForm({ ...productForm, minOrder: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Foto Komoditas (Preset JPG/PNG Link)</label>
                  <select
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:indigo-500 font-semibold select-none mb-1.5 focus:border-indigo-500"
                  >
                    <option value="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400">Gayo Coffee Beans (Kopi)</option>
                    <option value="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400">Coconut Shell Charcoal (Briket Arang)</option>
                    <option value="https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400">Whole Nutmeg (Pala Kupas)</option>
                    <option value="https://images.unsplash.com/photo-1622484211148-71749840bcec?w=400">Palm Olein Oils (Minyak Kelapa Sawit)</option>
                    <option value="https://images.unsplash.com/photo-1550592755-cb0c0fc33827?w=400">Desiccated Coconut (Kelapa Kering)</option>
                    <option value="https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400">Raw Cocoa Beans (Biji Kakao Cokelat)</option>
                    <option value="https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400">Green Tea Leaves (Daun Teh)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Atau masukkan tautan gambar kustom..."
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spesifikasi Detail</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Spesifikasi kualitas ekspor, kadar air, defek, kemurnian..."
                    value={productForm.specification}
                    onChange={(e) => setProductForm({ ...productForm, specification: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan Komoditas
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
