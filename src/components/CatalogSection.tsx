import React, { useState } from 'react';
import { ExportProduct, UserProfile } from '../types';
import { mockProducts } from '../mockData';
import { Search, Tag, MapPin, Layers, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CatalogSectionProps {
  currentUser: UserProfile | null;
  onInitiateShipment: (product: ExportProduct) => void;
  onStartNegotiation: (product: ExportProduct) => void;
}

export default function CatalogSection({ currentUser, onInitiateShipment, onStartNegotiation }: CatalogSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastProductOrdered, setLastProductOrdered] = useState('');

  const categories = ['Semua', 'Energi Terbarukan / Arang Kelapa', 'Pertanian / Kopi', 'Pertanian / Rempah-rempah', 'Minyak Nabati / CPO', 'Pengolahan Kelapa'];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.hsCode.includes(searchTerm) ||
                          product.origin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOrder = (product: ExportProduct) => {
    onInitiateShipment(product);
    setLastProductOrdered(product.name);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border-l-4 border-emerald-500 text-white p-4 rounded-lg shadow-xl flex items-center space-x-3 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-semibold">Draft Kontrak Berhasil Dibuat!</p>
            <p className="text-xs text-gray-300">
              Transaksi ekspor baru untuk &ldquo;{lastProductOrdered}&rdquo; telah terdaftar di sistem. Silakan periksa Alur Kerja untuk melengkapi dokumen.
            </p>
          </div>
        </div>
      )}

      {/* Header and Search Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 bg-white rounded-xl border border-gray-150">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Katalog Komoditas Ekspor Unggulan</h2>
          <p className="text-xs text-gray-500">Daftar produk bersertifikasi mutu yang siap dipasarkan dengan HS Code kepabeanan internasional.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, HS code, asal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-150 bg-gray-50/50"
            />
          </div>
        </div>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
              selectedCategory === category
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col bg-white rounded-xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
          >
            {/* Image & Price Overlay */}
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-sm border border-orange-100">
                <span className="text-xs text-gray-500 font-medium font-sans">Estimasi FOB</span>
                <p className="text-sm font-bold text-orange-600 font-mono">${product.price} <span className="text-[10px] text-gray-500">/ {product.unit}</span></p>
              </div>
              <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-gray-100 font-mono tracking-wider">
                HS CODE: {product.hsCode}
              </div>
            </div>

            {/* Product Body */}
            <div className="flex-1 p-5 space-y-3.5">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-sm">
                  <Tag className="w-3 h-3" />
                  {product.category}
                </span>
                <h3 className="font-bold text-gray-950 text-base line-clamp-2">{product.name}</h3>
              </div>

              {/* Attributes block */}
              <div className="space-y-2 border-t border-b border-gray-100 py-3 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Asal Komoditas</span>
                  <span className="font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    {product.origin}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Mitra Supplier</span>
                  <span className="font-medium text-gray-900 line-clamp-1 max-w-[180px]">{product.supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Pesanan Minimal</span>
                  <span className="font-mono font-semibold text-gray-900">{product.minOrder}</span>
                </div>
              </div>

              {/* Spec text */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-900">Spesifikasi Ekspor :</p>
                <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-2.5 rounded border border-gray-100 line-clamp-3">
                  {product.specification}
                </p>
              </div>
            </div>

            {/* Product Footer / Action */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2">
              <button
                onClick={() => onStartNegotiation(product)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-xs"
              >
                <FileText className="w-4 h-4 text-indigo-200" />
                Mulai Negosiasi &amp; Alur PI
              </button>

              {currentUser?.role === 'Trader' ? (
                <button
                  onClick={() => handleOrder(product)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  Bypass Kontrak Cepat
                </button>
              ) : currentUser?.role === 'Buyer' ? (
                <button
                  onClick={() => handleOrder(product)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  Bypass Ajukan PO Cepat
                </button>
              ) : (
                <div className="text-center text-[11px] text-gray-400 font-medium py-1">
                  *Login untuk melakukan bypass administrasi pabean
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-500 space-y-3">
            <Layers className="w-12 h-12 text-gray-350 mx-auto" />
            <div>
              <p className="font-semibold text-gray-800 text-base">Komoditas tidak ditemukan</p>
              <p className="text-xs text-gray-400">Silakan gunakan kata kunci pencarian lain atau pilih kategori lain.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
