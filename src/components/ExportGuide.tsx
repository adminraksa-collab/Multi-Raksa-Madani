import React, { useState } from 'react';
import { 
  BookOpen, Map, Layers, ShieldCheck, FileText, 
  Clock, ChevronRight, HelpCircle, ArrowRight,
  FileSignature, Ship, Anchor, CheckCircle,
  TrendingUp, FileCheck2, Printer, X, RotateCcw, Download
} from 'lucide-react';

interface GuideStep {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  description: string;
  documents: { name: string; desc: string; issuer: string }[];
  laymanAnalogy: string;
  keyActors: string[];
}

export default function ExportGuide() {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<{ name: string; issuer: string } | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [printBlockedError, setPrintBlockedError] = useState<boolean>(false);

  const handleOpenDoc = (name: string, issuer: string) => {
    setSelectedDoc({ name, issuer });
    const fields: Record<string, string> = {};
    if (name.includes('Sales Contract')) {
      fields.contractNo = 'SC-ANG-2026-8801';
      fields.contractDate = '2026-06-20';
      fields.sellerName = 'PT Multi Raksa Madani';
      fields.sellerAddress = 'Gedung Cyber 2, Lt. 17, HR. Rasuna Said, Jakarta, Indonesia';
      fields.buyerName = 'YOSHIHIDE TRADING CO., LTD.';
      fields.buyerAddress = '2-chome-4-1 Shibakoen, Minato City, Tokyo 105-0011, Japan';
      fields.commodity = 'Arang Batok Kelapa (Coconut Shell Charcoal Briquettes)';
      fields.specifications = 'Premium Shisha Grade, Ash 2.2%, Carbon 80% min, Moisture 6% max';
      fields.quantity = '25 Metric Tons (1 Container 40ft High Cube)';
      fields.unitPrice = 'USD 1,450 / MT';
      fields.totalAmount = 'USD 36,250.00';
      fields.paymentTerms = '50% Advance T/T, 50% Balance on BL Copy';
      fields.shippingTerms = 'FOB Port of Tanjung Priok, Jakarta (Incoterms 2020)';
    } else if (name.includes('Proforma Invoice')) {
      fields.invoiceNo = 'PFI-ANG-2026-779';
      fields.invoiceDate = '2026-06-20';
      fields.buyerName = 'YOSHIHIDE TRADING CO., LTD.';
      fields.buyerAddress = '2-chome-4-1 Shibakoen, Minato City, Tokyo 105-0011, Japan';
      fields.commodity = 'Coconut Shell Charcoal Briquettes - Premium';
      fields.quantity = '25.0 MT';
      fields.unitPrice = 'USD 1,450.00';
      fields.totalAmount = 'USD 36,250.00';
      fields.bankName = 'Bank Negara Indonesia (BNI) Syariah / Mandiri Corporate';
      fields.bankAccount = 'PT MULTI RAKSA MADANI - ACC NO: 9988-2231-1100';
    } else if (name.includes('Invoice & Packing List (Awal)')) {
      fields.invoiceNo = 'PL-ANG-2026-102-INIT';
      fields.invoiceDate = '2026-06-25';
      fields.shipper = 'PT Multi Raksa Madani';
      fields.consignee = 'YOSHIHIDE TRADING CO., LTD.';
      fields.packageCount = '2,500 Master Boxes (10kg net per box)';
      fields.grossWeight = '25,300 KGS';
      fields.netWeight = '25,000 KGS';
      fields.dimension = '64.5 CBM (1x40HQ)';
    } else if (name.includes('Certificate of Analysis')) {
      fields.coaNo = 'COA-LAB-SUCOFINDO-26-9051';
      fields.reportDate = '2026-06-27';
      fields.sampleDescription = 'Coconut Charcoal Briquettes - Premium Grade';
      fields.ashContent = '2.18 %';
      fields.moisture = '5.32 %';
      fields.volatileMatter = '13.41 %';
      fields.fixedCarbon = '81.09 %';
      fields.calorificValue = '7,400 Kcal/Kg';
      fields.inspector = 'Sucofindo Laboratories Indonesia';
    } else if (name.includes('Phytosanitary')) {
      fields.certNo = 'PC-0402-2026-EXPORT-2292';
      fields.issueDate = '2026-06-28';
      fields.shipperName = 'PT Multi Raksa Madani';
      fields.consigneeName = 'YOSHIHIDE TRADING CO., LTD.';
      fields.plantScientificName = 'Cocos nucifera (processed shell charcoal)';
      fields.sanitaryDeclaration = 'The consignment conforms with current phytosanitary requirements of the importing country.';
      fields.treatment = 'Methyl Bromide Fumigation (48 g/m³)';
      fields.officerName = 'Dr. Ir. Hermawan Sutisna, M.Si (Karantina Pertanian)';
    } else if (name.includes('Origin') || name.includes('SKA')) {
      fields.cooNo = 'COO-ID-JP-26-44021';
      fields.exporter = 'PT Multi Raksa Madani';
      fields.importer = 'YOSHIHIDE TRADING CO., LTD.';
      fields.transportDetails = 'Vessel: EVER GREEN v.2605E, Port of Loading: Tanjung Priok, Port of Discharge: Tokyo Port';
      fields.hsCode = '4402.90.00';
      fields.originCriteria = 'Wholly Obtained (WO - Indonesia)';
      fields.signatoryAuthority = 'Kementerian Perdagangan RI - Kantor Disperindag DKI Jakarta';
    } else if (name.includes('Fumigation')) {
      fields.certNo = 'FC-PMA-2026-304';
      fields.issueDate = '2026-06-29';
      fields.containerNo = 'EMCU-908127-0 (40ft HQ)';
      fields.sealNo = 'ID-CUSTOMS-88204';
      fields.chemicalUsed = 'Methyl Bromide (CH3Br)';
      fields.dosage = '48 Grams per Cubic Meter';
      fields.exposurePeriod = '24 Hours';
      fields.fumigatorName = 'PT. Pest Management Association Indonesia';
    } else if (name.includes('Pemberitahuan Ekspor Barang')) {
      fields.pebNo = 'PEB-3004-06-2026-00918';
      fields.pebDate = '2026-06-29';
      fields.customsOffice = 'KPU Bea Cukai Tipe A Tanjung Priok';
      fields.exporterNpwp = '01.234.567.8-032.000';
      fields.currencyValuation = 'USD 36,250.00';
      fields.hsCode = '4402.90.00';
      fields.customsBroker = 'PT. Forwardindo Logistik Lestari';
    } else if (name.includes('Nota Pelayanan Ekspor')) {
      fields.npeNo = 'NPE-BC-065-2026-90812';
      fields.npeDate = '2026-06-30';
      fields.pebNoLinked = '3004-06-2026-00918';
      fields.exporterName = 'PT Multi Raksa Madani';
      fields.containerUnitCount = '1 x 40ft HQ Container (EMCU-908127-0)';
      fields.approvingOfficer = 'Andi Wijaya, NIP 198804152010121003';
    } else if (name.includes('Bill of Lading')) {
      fields.blNo = 'BL-EGCV-2605E09118';
      fields.shipper = 'PT Multi Raksa Madani';
      fields.consignee = 'YOSHIHIDE TRADING CO., LTD.';
      fields.notifyParty = 'Same as Consignee';
      fields.vesselVoyage = 'EVER GREEN v.2605E';
      fields.portOfLoading = 'Tanjung Priok, Jakarta, ID';
      fields.portOfDischarge = 'Tokyo Port, JP';
      fields.freightTerms = 'FREIGHT PREPAID';
      fields.carrierSignature = 'Evergreen Marine Corporation (Taiwan) Ltd.';
    } else if (name.includes('Commercial Invoice') || name.includes('Packing List (Final)')) {
      fields.invoiceNo = 'INV-ANG-2026-102-FINAL';
      fields.invoiceDate = '2026-07-01';
      fields.finalVolume = '25.04 MT';
      fields.finalAmount = 'USD 36,308.00';
      fields.paymentStatus = 'Awaiting L/C Settlement';
    } else {
      fields.swiftRef = 'SWIFT-MNDRID-2026-TR-88120';
      fields.valueDate = '2026-07-03';
      fields.remittingBank = 'The Bank of Tokyo-Mitsubishi UFJ, Ltd. (MUFG)';
      fields.beneficiaryBank = 'PT Bank Mandiri (Persero) Tbk, Jakarta';
      fields.settlementAmount = 'USD 36,308.00';
      fields.narrative = 'Full Settlement for Inv INV-ANG-2026-102-FINAL coconut charcoal';
    }
    setFormData(fields);
  };

  const handlePrint = () => {
    // Reset state first
    setPrintBlockedError(false);

    // Modern browsers block window.print() inside sandboxed iframes.
    // Instead of using alert() which is also blocked, we handle this using React state.
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      setPrintBlockedError(true);
    }
    
    try {
      window.print();
    } catch (error) {
      console.warn("Print action was blocked or failed:", error);
      setPrintBlockedError(true);
    }
  };

  const handleDownload = () => {
    const printContent = document.getElementById('export-print-area')?.innerHTML;
    if (!printContent) {
      alert("Error: Konten dokumen kosong.");
      return;
    }

    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${selectedDoc?.name || 'Dokumen Ekspor'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=JetBrains+Mono:wght@450;700&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            slate: {
              150: '#e2e8f0',
            }
          }
        }
      }
    }
  </script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      color: #0f172a;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    #print-container {
      padding: 1.5cm;
      width: 100%;
      max-width: 21cm;
      min-height: 29.7cm;
      margin: 20px auto;
      border: 4px double #475569;
      background: white;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      position: relative;
      box-sizing: border-box;
    }
    @media print {
      body {
        background: white !important;
        color: black !important;
      }
      #print-container {
        border: none !important;
        box-shadow: none !important;
        padding: 1.2cm !important;
        margin: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div id="print-container">
    ${printContent}
  </div>
  <script>
    // Automatically trigger the system print/PDF save dialog as soon as the file is opened!
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedDoc?.name || 'Dokumen'}_Edited.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFriendlyLabel = (key: string): string => {
    const labels: Record<string, string> = {
      contractNo: "Nomor Kontrak Kerja (Contract No)",
      contractDate: "Tanggal Kontrak (Date)",
      sellerName: "Nama Penjual (Seller Name)",
      sellerAddress: "Alamat Penjual (Seller Address)",
      buyerName: "Nama Pembeli / Buyer",
      buyerAddress: "Alamat Pembeli / Buyer Address",
      commodity: "Nama Komoditas (Commodity)",
      specifications: "Spesifikasi Teknis (Specs)",
      quantity: "Volume/Kuantitas (Quantity)",
      unitPrice: "Harga Satuan (Unit Price)",
      totalAmount: "Nilai Total Transaksi",
      paymentTerms: "Syarat Pembayaran",
      shippingTerms: "Syarat Pengangkutan (Incoterms)",
      invoiceNo: "Nomor Invoice / Proforma",
      invoiceDate: "Tanggal Pembuatan",
      bankName: "Nama Bank Penerima Devisa",
      bankAccount: "Nomor Rekening Penerima",
      shipper: "Pihak Pengirim (Shipper)",
      consignee: "Nama Penerima Kargo (Consignee)",
      packageCount: "Jumlah Kemasan / Master Boxes",
      grossWeight: "Berat Kotor (Gross Weight)",
      netWeight: "Berat Bersih (Net Weight)",
      dimension: "Volume Dimensi (CBM)",
      coaNo: "Nomor Laporan Analisis Lab",
      reportDate: "Tanggal Laporan Lab",
      sampleDescription: "Identitas Sampel Uji",
      ashContent: "Kadar Abu (Ash Content)",
      moisture: "Kadar Air (Moisture)",
      volatileMatter: "Zat Terbang (Volatile Matter)",
      fixedCarbon: "Karbon Tertambat (Fixed Carbon)",
      calorificValue: "Nilai Kalori (Calorific Value)",
      inspector: "Laboratorium Penguji",
      certNo: "Nomor Sertifikat Legal",
      issueDate: "Tanggal Penerbitan",
      shipperName: "Nama Pengirim",
      consigneeName: "Nama Penerima",
      plantScientificName: "Nama Ilmiah Tanaman/Hayati",
      sanitaryDeclaration: "Pernyataan Sanitasi Karantina",
      treatment: "Keterangan Tindakan Perlakuan",
      officerName: "Nama Pejabat Yang Berwenang",
      cooNo: "Nomor SKA (Form COO)",
      exporter: "Eksportir Terdaftar",
      importer: "Importir Terdaftar",
      transportDetails: "Moda Pengiriman (Transport)",
      hsCode: "Nomor Pos Tarif (HS Code)",
      originCriteria: "Kriteria Asal Barang (Origin)",
      signatoryAuthority: "Instansi Penerbit SKA",
      containerNo: "Nomor Petikemas / Kontainer",
      sealNo: "Nomor Segel (Seal No)",
      chemicalUsed: "Bahan Kimia Fumigasi",
      dosage: "Dosis Penggunaan gas",
      exposurePeriod: "Waktu Paparan Gas",
      fumigatorName: "Badan Registrasi Fumigasi",
      pebNo: "Nomor Pengajuan PEB",
      pebDate: "Tanggal PEB Didaftarkan",
      customsOffice: "Kantor Pabean Pendaftaran",
      exporterNpwp: "NPWP Eksportir / Perusahaan",
      currencyValuation: "Mata Uang & Nilai Ekspor",
      customsBroker: "Nama Perusahaan Forwarder / PPJK",
      npeNo: "Nomor Dokumen NPE",
      npeDate: "Tanggal Persetujuan NPE",
      pebNoLinked: "Nomor PEB Asosiasi",
      exporterName: "Perusahaan Eksportir",
      containerUnitCount: "Rincian Jumlah Petikemas",
      approvingOfficer: "Pejabat Pemeriksa Bea Cukai",
      blNo: "Nomor Bill of Lading (B/L)",
      notifyParty: "Pihak Pembahu Konsinyasi (Notify)",
      vesselVoyage: "Nama Kapal & Nomor Pelayaran",
      portOfLoading: "Pelabuhan Muat Eskpor",
      portOfDischarge: "Pelabuhan Bongkar Tujuan",
      freightTerms: "Ketentuan Pembayaran Pengapalan",
      carrierSignature: "Agen Pelayaran Penerbit",
      finalVolume: "Volume Berat Bersih Akhir",
      finalAmount: "Nilai Total Invoice Akhir",
      paymentStatus: "Status Realisasi / Pembayaran",
      swiftRef: "Nomor Referensi Transaksi Swift",
      valueDate: "Tanggal Efektif Dana Masuk",
      remittingBank: "Nama Bank Pengirim (Luar Negeri)",
      beneficiaryBank: "Nama Bank Penerima",
      settlementAmount: "Total Dana Yang Diterima",
      narrative: "Berita Pengiriman Uang Bank"
    };
    return labels[key] || key;
  };

  const renderDocumentSheets = () => {
    if (!selectedDoc) return null;
    const name = selectedDoc.name;

    // Define different visual styles of letterheads
    const isGov = name.includes('Phytosanitary') || name.includes('Origin') || name.includes('SKA') || name.includes('Pemberitahuan Ekspor Barang') || name.includes('Nota Pelayanan Ekspor');
    const isSwift = name.includes('Telegraphic Transfer') || name.includes('SWIFT') || name.includes('Settlement');
    const isSurveyor = name.includes('Analysis') || name.includes('COA');

    return (
      <div className="space-y-6">
        {/* Document Header Logotype */}
        {isGov ? (
          <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
            <h4 className="text-sm font-sans font-black uppercase tracking-widest text-slate-900">REPUBLIK INDONESIA</h4>
            <p className="text-[9px] font-sans font-bold uppercase text-slate-500 tracking-wide">
              {name.includes('Phytosanitary') ? 'BADAN KARANTINA PERTANIAN • INDONESIAN AGRICULTURAL QUARANTINE AGENCY' :
               name.includes('Origin') || name.includes('SKA') ? 'MINISTRY OF TRADE • KEMENTERIAN PERDAGANGAN REPUBLIK INDONESIA' :
               'DIREKTORAT JENDERAL BEA DAN CUKAI • DIRECTORATE GENERAL OF CUSTOMS AND EXCISE'}
            </p>
            <div className="h-0.5 bg-slate-900 w-full mt-2" />
            <div className="h-[1px] bg-slate-900 w-full mt-0.5" />
          </div>
        ) : isSwift ? (
          <div className="border-b border-dashed border-slate-400 pb-2 space-y-1 font-mono">
            <div className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
              MT103 SWIFT MESSAGE SENDER RECORD • CONFIRMED SEED
            </div>
            <p className="text-[8px] text-slate-500">TIMESTAMP RECONCILIATION: {new Date().toISOString()}</p>
          </div>
        ) : isSurveyor ? (
          <div className="border-b-2 border-slate-800 pb-3 text-center space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">SUCOFINDO LABORATORIES INDONESIA</h4>
            <p className="text-[8px] text-slate-400 uppercase tracking-widest font-sans font-bold">Laporan Sertifikat Analisis Independen & Verifikasi Kargo</p>
            <div className="h-0.5 bg-slate-800 w-full mt-2" />
          </div>
        ) : (
          <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-sans font-black uppercase tracking-wider text-slate-900">PT MULTI RAKSA MADANI</h4>
              <p className="text-[8px] text-slate-450 uppercase tracking-wider font-sans leading-tight">Gedung Cyber 2, Jakarta, Indonesia • customercare@agrinusantara.co.id</p>
            </div>
            <div className="text-right text-[8px] font-mono font-bold text-slate-400">
              ORIGINAL DRAFT COPY
            </div>
          </div>
        )}

        {/* Document Title Header */}
        <div className="text-center space-y-1 py-1">
          <h3 className="text-xs sm:text-sm font-sans font-black uppercase tracking-widest text-slate-900 underline decoration-double decoration-slate-400 underline-offset-4">
            {name}
          </h3>
          <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">
            NO: {formData.contractNo || formData.invoiceNo || formData.coaNo || formData.certNo || formData.cooNo || formData.pebNo || formData.npeNo || formData.blNo || formData.swiftRef || 'DRAFT-990812-RI'}
          </p>
        </div>

        {/* Content Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[9px] text-slate-800 font-sans border border-slate-200 rounded-lg p-4 bg-slate-50/25">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="border-b border-slate-100 pb-2 flex flex-col justify-between">
              <span className="font-mono text-[7.5px] text-slate-400 font-black uppercase tracking-wider">
                {getFriendlyLabel(key).split(' (')[0]}
              </span>
              <span className="font-serif font-black text-slate-900 mt-1 break-words max-w-full">
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Specimen Stamp Block and Legal Disclaimers */}
        <div className="pt-8 border-t border-dashed border-slate-200 grid grid-cols-2 gap-6 items-end mt-12 pb-4">
          <div className="space-y-1 font-sans">
            <div className="border border-slate-300 rounded p-1.5 inline-block text-[7.5px] font-mono text-slate-400 leading-tight">
              QR AUTHENTICATION SECURE<br />
              [SCAN TO VERIFY INTEGRITY]
            </div>
            <p className="text-[7px] text-slate-400 leading-normal">
              Seluruh isian di atas draf legalitas sah yang diterbitkan secara elektronik demi kepentingan kepatuhan ekspor dari wilayah hukum Republik Indonesia.
            </p>
          </div>

          <div className="text-center space-y-6 flex flex-col items-center">
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider font-sans">
              Lembar Tanda Tangan & Cap Resmi:
            </span>
            
            {/* Visual Red/Blue Stamp Replica */}
            <div className="relative flex items-center justify-center">
              <div className="border-2 border-double border-blue-500/80 rounded-full px-4 py-2 font-mono text-[7px] font-black text-blue-500/80 tracking-widest uppercase rotate-12 bg-white/50 relative z-10 shadow-xs">
                VERIFIED COPY • ORIGINAL
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none scale-125 z-0">
                ⭐ 📑 ⭐
              </div>
            </div>

            <div className="space-y-0.5">
              <p className="text-[8.5px] font-serif font-black text-slate-900 underline">
                {formData.officerName || formData.approvingOfficer || formData.inspector || 'COMMISSIONER OF OATHS'}
              </p>
              <p className="text-[7px] font-mono text-slate-400 uppercase font-black">
                Authorized Signatory for {selectedDoc.issuer}
              </p>
            </div>
          </div>
        </div>

      </div>
    );
  };

  const guideSteps: GuideStep[] = [
    {
      id: 'step-1',
      title: 'Penyusunan Kontrak (Sales Contract / SC)',
      subtitle: 'Inisiasi Transaksi & Kesepakatan Dagang',
      badge: 'Langkah 1: Draft & Kontrak',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      description: 'Ini adalah gerbang masuk seluruh transaksi ekspor. Importir (pembeli luar negeri) dan Eksportir menyepakati harga produk, spesifikasi, kuantitas, mekanisme pembayaran (misal Letter of Credit - L/C atau Transfer), serta metode pengiriman barang.',
      laymanAnalogy: 'Bagaikan ijab qabul atau nota kesepakatan tertulis saat Anda membeli barang pesanan khusus. Isinya komitmen: "Saya jual kelapa ini seharga $1,000 per ton, dikirim lewat laut, dibayar saat barang siap kapal".',
      keyActors: ['Eksportir (Trader/Koperasi)', 'Importir Global (Buyer)'],
      documents: [
        { name: 'Sales Contract (SC)', desc: 'Dokumen induk kesepakatan jual beli barang ekspor.', issuer: 'Trader & Buyer' },
        { name: 'Proforma Invoice', desc: 'Faktur awal/penawaran formal yang dikirimkan ke pembeli sebelum barang diproduksi.', issuer: 'Eksportir/Trader' }
      ]
    },
    {
      id: 'step-2',
      title: 'Verifikasi Komoditas (Produksi & QC)',
      subtitle: 'Memastikan Mutu di Gudang Produsen',
      badge: 'Langkah 2: Terverifikasi',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Eksportir berkoordinasi dengan Supplier/Mitra Petani di daerah untuk mengemas barang sesuai standar ekspor nasional dan permintaan eksklusif negara tujuan. Pada tahap ini dilakukan pemeriksaan kualitas (Quality Control) dan penentuan HS Code (Sistem Klasifikasi Tarif).',
      laymanAnalogy: 'Proses memasak barang di dapur dan membungkusnya dengan rapi. Kita pastikan arang kelapa tidak basah, atau kopi tidak berjamur. Petugas verifikator menyortir agar mutunya lolos standar.',
      keyActors: ['Supplier/Sektor Hulu (Koperasi)', 'Surveyor Independen', 'Tim QC'],
      documents: [
        { name: 'Invoice & Packing List (Awal)', desc: 'Rincian jumlah barang, berat kotor/bersih, serta dimensi kemasan kargo.', issuer: 'Supplier (ke Trader)' },
        { name: 'Certificate of Analysis (COA)', desc: 'Hasil uji laboratorium independen yang melampirkan hasil kandungan materi kargo.', issuer: 'Laboratorium Penguji / Surveyor' }
      ]
    },
    {
      id: 'step-3',
      title: 'Sertifikasi Karantina & Asal barang',
      subtitle: 'Pintu Gerbang Kelayakan Hukum Internasional',
      badge: 'Langkah 3: Dalam Proses / Sertifikasi',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Barang hasil alam wajib melewati karantina pertanian atau instansi berwenang demi memastikan bebas dari hama penyakit (Sertifikat Fitosanitari). Disamping itu, Eksportir memproses Surat Keterangan Asal (SKA) di Dinas Perindustrian dan Perdagangan agar pembeli mendapat fasilitas pemotongan pajak di negaranya.',
      laymanAnalogy: 'Seperti mengurus "paspor kesehatan" bagi tumbuhan/arang kelapa dan membuat "Akte Kelahiran" yang membuktikan barang tersebut adalah hasil bumi asli Indonesia asli (bukan selundupan).',
      keyActors: ['Badan Karantina Indonesia', 'Kementerian Perdagangan (Disperindag)', 'Eksportir'],
      documents: [
        { name: 'Phytosanitary Certificate', desc: 'Sertifikat kesehatan komoditas pertanian/kehutanan dari Badan Karantina.', issuer: 'Instansi Karantina Pertanian' },
        { name: 'Certificate of Origin (Form COO / SKA)', desc: 'Bukti sah hukum bahwa barang diproduksi di Indonesia guna klaim tarif bea masuk murah.', issuer: 'Disperindag Kabupaten/Kota' },
        { name: 'Fumigation Certificate', desc: 'Bukti kontainer telah disemprot gas pembasmi hama/serangga sebelum berangkat.', issuer: 'Perusahaan Fumigasi Berizin' }
      ]
    },
    {
      id: 'step-4',
      title: 'Izin Kepabeanan Eskpor (Customs Approval)',
      subtitle: 'Pendaftaran Ekspor ke Bea Cukai RI',
      badge: 'Langkah 4: Disetujui Bea Cukai',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Eksportir mendaftarkan rencana ekspor ke sistem Bea Cukai melalui pengajuan PEB (Pemberitahuan Ekspor Barang). Bea cukai memeriksa keabsahan dokumen ekspor, meneliti HS Code pengelompokan barang, kemudian menerbitkan NPE (Nota Pelayanan Ekspor) jika kargo clean and clear.',
      laymanAnalogy: 'Melaporkan barang bawaan Anda ke pos penjagaan bandara sebelum masuk ke pesawat kargo. Bea Cukai memberi cap stempel "OK, barang ini legal dan boleh dilepas ke luar negeri".',
      keyActors: ['Direktorat Jenderal Bea dan Cukai (DJBC)', 'Customs Broker / Forwarder'],
      documents: [
        { name: 'Pemberitahuan Ekspor Barang (PEB)', desc: 'Dokumen pendaftaran perincian barang ekspor ke Kantor Bea Cukai.', issuer: 'Eksportir / Forwarder' },
        { name: 'Nota Pelayanan Ekspor (NPE)', desc: 'Surat persetujuan Bea Cukai yang mengizinkan kargo masuk ke dalam kapal eksportir.', issuer: 'Bea Cukai Republik Indonesia' }
      ]
    },
    {
      id: 'step-5',
      title: 'Pengapalan & Logistik Port-to-Port',
      subtitle: 'Pemuatan Barang & Pelepasan Dokumen Angkutan laut',
      badge: 'Langkah 5: Berlayar (Shipped)',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-250',
      description: 'Barang ditata dalam kontainer baja di gudang, ditarik truk kontainer ke pelabuhan muat (Port of Loading), dan dimuat ke atas kapal kargo besar (vessel). Operator pelayaran menerbitkan Bill of Lading (B/L) sebagai bukti serah terima barang sekaligus tanda kepemilikan kargo selama di laut lepas.',
      laymanAnalogy: 'Saat Anda menitipkan paket berharga lewat cargo kurir terpercaya. Anda diberi selembar resi pengiriman sebagai jaminan bahwa paket sedang berlayar mengarungi samudra menuju kota seberang.',
      keyActors: ['Perusahaan Pelayaran (Carrier)', 'Freight Forwarder Nusantara', 'Operator Pelabuhan'],
      documents: [
        { name: 'Bill of Lading (B/L) / Waybill', desc: 'Tanda terima barang kapal samudera sekaligus bukti kepemilikan mutlak kargo ekspor.', issuer: 'Perusahaan Pelayaran Global' },
        { name: 'Commercial Invoice & Packing List (Final)', desc: 'Penagihan final sesuai dengan volume aktual yang termuat di dalam kapal pengapalan.', issuer: 'Eksportir/Trader' }
      ]
    },
    {
      id: 'step-6',
      title: 'Penyelesaian Ekspor (Pelepasan Dokumen & Pembayaran)',
      subtitle: 'Pelepasan Dokumen Asli ke Pembeli Global',
      badge: 'Langkah 5: Selesai / Terbit',
      badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-200',
      description: 'Setelah kapal berangkat, Eksportir mengumpulkan seluruh dokumen asli (B/L, Invoice Final, COO/SKA, Karantina) untuk diserahkan ke bank eksportir. Bank eksportir meneruskannya ke bank importir untuk ditukar dengan dana pembayaran transfer internasional.',
      laymanAnalogy: 'Proses serah terima kunci properti secara aman. Pembeli mentransfer sisa uang pembayaran penuh melalui sistem perbankan global, kemudian kurir bank memberikan seluruh surat-surat asli agar pembeli bisa menebus kontainer di negara tujuan.',
      keyActors: ['Bank Eksportir & Bank Importir', 'Importir Global (Buyer)'],
      documents: [
        { name: 'Telegraphic Transfer (T/T) / L/C Settlement', desc: 'Bukti transfer devisa hasil ekspor yang masuk ke rekening koran rupiah eksportir.', issuer: 'Korespondensi Perbankan Swasta/BUMN' }
      ]
    }
  ];

  const faqs = [
    {
      q: 'Apa itu HS Code (Sistem Harmonisasi) dalam ekspor?',
      a: 'HS Code adalah sistem klasifikasi barang internasional berupa deretan angka unik (biasanya 8 digit di Indonesia). Tujuannya agar seluruh pabean bea cukai di dunia sepakat mendefinisikan suatu komoditas tanpa terhalang kendala bahasa. Contoh: Cocopeat memiliki kode HS 4402.90.00 di seluruh belahan dunia.'
    },
    {
      q: 'Dari mana dokumen Sertifikat Kepatuhan ekspor diterbitkan?',
      a: 'Dokumen ekspor diterbitkan oleh berbagai instansi resmi yang berbeda sesuai kompetensinya. Untuk Karantina ditangani Badan Karantina Indonesia (Barantin). Untuk asal barang (COO) diterbitkan oleh Kementerian Perdagangan RI melalui dinas Disperindag daerah setempat. Surat Kontrak Penjualan dibuat mandiri oleh eksportir (trader) dan disepakati oleh pembeli luar negeri.'
    },
    {
      q: 'Bagaimana cara menggunakan Simulator Transaksi di aplikasi ini?',
      a: 'Sangat mudah! Buka tab "Transaksi", Anda dapat memilih transaksi ekspor aktif di dropdown atas. Klik tombol bulat "Ganti Langkah Alur Kerja" pada infografis interaktif atau klik tombol interaktif di dalam langkah alur kerja untuk menguji, menelusuri, dan memperbarui seluruh tahapan transaksi terpadu.'
    },
    {
      q: 'Bagaimana dasar penomoran dokumen di aplikasi ini (contoh: "SC/NGL/PROD-2-2026-NEGO" atau "SC/NGL/PL-2026-001")?',
      a: 'Penomoran dokumen ekspor (seperti Sales Contract / Kontrak Penjualan) mengikuti format kode standar bisnis internasional terstruktur berikut:\n\n• SC: Singkatan dari jenis dokumen utama, yaitu Sales Contract (Kontrak Penjualan).\n• NGL: Kode identitas dari pihak eksportir, yaitu Multi Raksa Madani (PT Multi Raksa Madani).\n• PROD-2 / PL: Kode komoditas/produk ekspor yang diperdagangkan (misal: PROD-2 untuk spesifikasi produk tertentu, PL untuk Cocopeat/Coir Pith, COF untuk Coffee, CHR untuk Charcoal, dst).\n• 2026: Tahun pembuatan dokumen atau tahun transaksi berjalan.\n• NEGO / 001: Keterangan status atau nomor urut (NEGO menandakan draf negosiasi kesepakatan awal, sedangkan angka seperti 001/002 menunjukkan nomor urut transaksi pada tahun berjalan).'
    },
    {
      q: 'Apakah aplikasi ini benar-benar terhubung ke portal Bea Cukai atau Bea Cukai INSW?',
      a: 'Aplikasi ini adalah simulator instrumen ekspor interaktif berteknologi tinggi untuk visualisasi operasional. Seluruh draft dokumen (PEB, Invoice, Bill of Lading, COO) yang Anda sunting dirancang menyerupai format aslinya yang berlaku di Indonesia untuk tujuan simulasi, edukasi rincian, dan tata kelola internal perusahaan.'
    }
  ];

  // Helper to obtain step-specific icon
  const getStepIcon = (index: number) => {
    switch (index) {
      case 0: return <FileSignature className="w-5 h-5" />;
      case 1: return <ShieldCheck className="w-5 h-5" />;
      case 2: return <FileCheck2 className="w-5 h-5" />;
      case 3: return <Layers className="w-5 h-5" />;
      case 4: return <Ship className="w-5 h-5" />;
      case 5: return <TrendingUp className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* NEW INTERACTIVE VISUAL INFOGRAPHIC MAP */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-3 sm:p-4 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-emerald-400" />
              Peta Alur Perjalanan Ekspor Indonesia (Infografis Interaktif)
            </h3>
            <p className="text-[9px] text-slate-400 leading-normal">Klik salah satu node di bawah untuk melihat rincian penjelasan taktis dan analoginya</p>
          </div>
          <span className="shrink-0 bg-slate-850 py-0.5 px-2 rounded-md border border-slate-750 text-[9px] font-mono text-emerald-300 uppercase tracking-widest text-center self-start sm:self-center">
            ⚓ ALKI ➔ Ekspor Global
          </span>
        </div>

        {/* Visual Track Stepper Container */}
        <div className="relative pt-2 pb-1 px-0.5">
          {/* Timeline Connector Line */}
          <div className="absolute top-8 left-6 right-6 h-0.5 bg-slate-800 rounded hidden md:block">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(activeStepIndex / 5) * 100}%` }}
            />
          </div>

          {/* Stepper Nodes */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 relative z-10">
            {guideSteps.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              const isPassed = idx < activeStepIndex;
              
              let stateColor = "border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-600";
              if (isActive) {
                stateColor = "border-emerald-500 bg-emerald-950 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)] ring-2 ring-emerald-500/10";
              } else if (isPassed) {
                stateColor = "border-emerald-600 bg-slate-900 text-emerald-500";
              }

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`flex flex-col items-center text-center p-2 rounded-lg border transition-all duration-150 active:scale-95 group focus:outline-none ${stateColor}`}
                >
                  {/* Step Step Circle Bubble */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-sans font-bold transition-transform group-hover:scale-105 mb-1.5 [&_svg]:w-3.5 [&_svg]:h-3.5 ${
                    isActive 
                      ? 'bg-emerald-500 border-white text-slate-950 font-black' 
                      : isPassed 
                        ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}>
                    {getStepIcon(idx)}
                  </div>

                  {/* Step ID Label */}
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    Tahap 0{idx + 1}
                  </span>

                  {/* Step Short Title */}
                  <p className={`text-[9px] font-bold mt-0.5 line-clamp-2 leading-snug uppercase tracking-tight ${isActive ? 'text-white font-black' : 'text-slate-300'}`}>
                    {step.title.split(' (')[0]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Explanation Display (Full Width) */}
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 relative">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${guideSteps[activeStepIndex].badgeColor}`}>
                {guideSteps[activeStepIndex].badge}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                TAHAP {activeStepIndex + 1} DARI 6
              </span>
            </div>

            {/* Title & Detail */}
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-sans uppercase tracking-tight">
                {guideSteps[activeStepIndex].title}
              </h2>
              <p className="text-xs text-slate-400 font-bold font-sans italic">
                "{guideSteps[activeStepIndex].subtitle}"
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
                {guideSteps[activeStepIndex].description}
              </p>
            </div>

            {/* Analogi Orang Awam */}
            <div className="bg-emerald-50/75 border border-emerald-100 rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Analogi Sederhana untuk Orang Awam :
              </span>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                {guideSteps[activeStepIndex].laymanAnalogy}
              </p>
            </div>

            {/* Key Actors */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Aktor / Pihak yang Terlibat :</span>
              <div className="flex flex-wrap gap-2">
                {guideSteps[activeStepIndex].keyActors.map((actor, i) => (
                  <span key={i} className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    {actor}
                  </span>
                ))}
              </div>
            </div>

            {/* Documents Generated */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-900" />
                Rantai Dokumen yang Terbit di Tahap Ini :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {guideSteps[activeStepIndex].documents.map((doc, i) => (
                  <button
                    key={i}
                    onClick={() => handleOpenDoc(doc.name, doc.issuer)}
                    className="w-full text-left border border-slate-200 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-100 rounded-xl p-3 bg-slate-50/50 space-y-2 hover:bg-white transition-all transform hover:-translate-y-0.5 active:scale-98 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-blue-600 group-hover:text-emerald-600 transition-colors" />
                        <span className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{doc.name}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                        BUKA / EDIT / CETAK ➔
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">{doc.desc}</p>
                    <div className="pt-2 border-t border-slate-100 mt-1 flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                      <span>ORGANISASI:</span>
                      <span className="text-slate-600 bg-slate-150 px-1.5 py-0.5 rounded">{doc.issuer}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Navigator */}
            <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center">
              <button
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex(prev => prev - 1)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 py-2 px-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
              >
                Kembali
              </button>
              
              {activeStepIndex < 5 ? (
                <button
                  onClick={() => setActiveStepIndex(prev => prev + 1)}
                  className="text-xs font-black bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 py-2 px-4 rounded-xl shadow-xs transition-transform hover:-translate-y-0.5 active:scale-95"
                >
                  Tahap Selanjutnya
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="text-xs font-black text-emerald-600 flex items-center gap-1.5 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle className="w-4 h-4" />
                  Rantai Ekspor Selesai!
                </div>
              )}
            </div>

          </div>
        </div>

      {/* Simulator Flow Connection Section (Bento Card Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 inline-block">
            BAGAIMANA CARA KERJA SISTEM REAL-TIME KAMI?
          </span>
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Keterlibatan Rantai Pasok Digital</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dalam dunia nyata, dokumen tidak mengalir otomatis, melainkan harus diunggah, divalidasi oleh instansi masing-masing (Customs, Karantina, KPA), dan ditandatangani secara digital. 
          </p>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            Aplikasi <strong>ExportFlow</strong> mensimulasikan kepatuhan kepabeanan ini dengan menyediakan dasbor peninjau dokumen langsung, kontrol penerbitan sertifikat, serta log penandatanganan dinamis di mana setiap aktivitas direkam dengan penanda waktu riil demi kepatuhan sanksi logistik global.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase">Simulasi Praktis Mandiri</h4>
              <p className="text-[10px] text-slate-400">Asah kemampuan administrasi perdagangan internasional</p>
            </div>
          </div>
          
          <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
              <span>Membuat transaksi baru dari awal menggunakan tombol <strong>"Mulai Kontrak Penjualan Baru"</strong> di Dashboard Alur Kerja.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
              <span>Mencoba memajukan langkah logistik dengan menekan <strong>"Draf" ➔ "Terverifikasi" ➔ "Sertifikasi" ➔ "Bea Cukai"</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
              <span>Memperbarui data krusial seperti Nomor Kontrak, HS Code, dan nama Buyer untuk mencetaknya di lembar dokumen ekspor asli milik Anda.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-100 rounded-xl">
            <HelpCircle className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Tanya & Jawab tentang Kepatuhan Ekspor</h3>
            <p className="text-xs text-slate-400">Pertanyaan umum dari calon pelaku usaha ekspor pemula</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="border border-slate-150 rounded-xl overflow-hidden transition-all duration-250 bg-slate-50/50"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-850 leading-snug">{faq.q}</span>
                  <span className={`text-base font-black text-slate-400 transform transition-transform ${isOpen ? 'rotate-45 text-slate-900' : ''}`}>
                    ＋
                  </span>
                </button>
                {isOpen && (
                  <div className="p-4 bg-white border-t border-slate-150 text-xs text-slate-600 leading-relaxed font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL POPUP FOR EDITING & PRINTING OFFICIAL SAMPLES */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col h-full max-h-[92vh] sm:max-h-[85vh] overflow-hidden border border-slate-200">
            
            {/* Header Bar */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-sans font-black text-xs sm:text-sm uppercase tracking-wider">
                    PRATINJAU DOKUMEN RESMI (SAMPEL RIIL)
                  </h3>
                </div>
                <p className="text-[10px] text-slate-300 font-bold">
                  Dokumen: <span className="text-emerald-300 font-black">{selectedDoc.name}</span> | Terbit Resmi oleh: <span className="text-emerald-300 font-black">{selectedDoc.issuer}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (window.confirm("Batal mengedit dan kembalikan ke data semula?")) {
                      handleOpenDoc(selectedDoc.name, selectedDoc.issuer);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-black bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 border border-slate-700"
                  title="Reset data semula"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 shadow-md border border-blue-400 hover:scale-[1.03] active:scale-95 duration-150 ring-2 ring-blue-500/10"
                  title="Unduh dokumen. Ketika file dibuka di komputer Anda, dialog printernya akan langsung terbuka otomatis!"
                >
                  <Download className="w-3.5 h-3.5 animate-pulse" />
                  <span>Unduh & Cetak Langsung ➔</span>
                </button>

                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1 px-2 rounded-lg bg-slate-850 hover:bg-red-500 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dynamic Warning Banner */}
            <div className="bg-amber-50 border-b border-amber-100 p-3 text-center text-[10px] text-amber-900 font-medium shrink-0 flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="font-bold flex items-center gap-1">
                ⚠️ Mode Live Editor:
              </span>
              <span>Anda dapat mengedit data langsung pada formulir di kolom kiri, lembar cetak di kolom kanan akan terupdate seketika!</span>
              <span className="bg-blue-100 text-blue-950 px-2 py-0.5 rounded font-black border border-blue-200 animate-pulse">
                🚀 SOLUSI CETAK INSTAN: Klik tombol biru "Unduh & Cetak Langsung ➔" di kanan atas, file Anda akan otomatis memicu dialog cetak printer bawaan saat dibuka!
              </span>
            </div>

            {/* Print Blocked Alert Message */}
            {printBlockedError && (
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3.5 text-xs font-sans font-bold flex flex-col md:flex-row items-center justify-between gap-3 shrink-0 shadow-lg border-b border-red-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📢</span>
                  <span>
                    <strong>Pemberitahuan Cetak:</strong> Browser memblokir printer popup karena sandbox AI Studio. <strong>Silakan klik tombol biru "Unduh & Cetak Langsung" di atas untuk mencetak secara otomatis saat file dibuka!</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-red-700 hover:bg-slate-100 px-3.5 py-1.5 rounded-lg text-[11px] font-black tracking-normal uppercase transition-all shadow-sm shrink-0 flex items-center gap-1"
                  >
                    <span>Buka Di Tab Baru ↗️</span>
                  </a>
                  <button
                    onClick={() => setPrintBlockedError(false)}
                    className="p-1 hover:bg-red-800 rounded text-center text-white"
                    title="Tutup pesan"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Main Interface Layout */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
              
              {/* LEFT COLUMN: EDITOR FORM FIELDS (2/5) */}
              <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 sm:p-5 overflow-y-auto bg-slate-50 space-y-4">
                <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-[10px] font-black tracking-wider text-slate-700 uppercase">
                  ⚙️ KOLOM PENGISIAN FORMULIR
                </div>


                
                <div className="grid grid-cols-1 gap-3.5">
                  {Object.keys(formData).map((key) => (
                    <div key={key} className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-slate-600 font-sans tracking-wide">
                        {getFriendlyLabel(key)}
                      </label>
                      {formData[key].length > 40 ? (
                        <textarea
                          value={formData[key]}
                          onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                          rows={3}
                          className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-shadow shadow-xs text-slate-850 animate-fade-in"
                        />
                      ) : (
                        <input
                          type="text"
                          value={formData[key]}
                          onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-shadow shadow-xs text-slate-850 animate-fade-in"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs rounded-xl transition-all shadow-xs"
                  >
                    Selesai Mengedit & Simpan
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: REALISTIC HARD-COPY PREVIEW (3/5) */}
              <div className="w-full lg:w-7/12 p-3 sm:p-6 overflow-y-auto bg-slate-300 flex justify-center items-start min-h-0 font-serif">
                
                {/* Sheet wrapper */}
                <div 
                  id="export-print-area"
                  className="bg-white text-slate-950 w-full max-w-[21cm] min-h-[29.7cm] shadow-xl p-5 sm:p-8 rounded-sm text-left border-4 border-double border-slate-400 relative overflow-hidden text-[10px] leading-relaxed select-text"
                >
                  
                  {/* WATERMARK BACKGROUND EFFECT */}
                  <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none flex items-center justify-center">
                    <div className="border-[20px] border-slate-900 rounded-full w-[450px] h-[450px] flex items-center justify-center text-5xl font-black text-center uppercase tracking-widest text-slate-900 rotate-45 leading-none">
                      NEGARA REPUBLIK INDONESIA
                    </div>
                  </div>

                  {/* RENDER DYNAMIC OFFICIAL CERTIFICATE LETTERHEADS / COVERS */}
                  {renderDocumentSheets()}

                </div>

              </div>

            </div>

            {/* Dynamic printable area styles injection */}
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                html, body {
                  background: white !important;
                  color: black !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                }
                body * {
                  visibility: hidden !important;
                }
                #export-print-area, #export-print-area * {
                  visibility: visible !important;
                }
                #export-print-area {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  border: none !important;
                  box-shadow: none !important;
                  background: white !important;
                  color: black !important;
                  padding: 1.5cm !important;
                  margin: 0 !important;
                  display: block !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
            `}} />

          </div>
        </div>
      )}

    </div>
  );
}
