import React, { useRef } from 'react';
import { ExportDocument, UserProfile } from '../types';
import { Printer, X, ShieldAlert, Check, Milestone } from 'lucide-react';

interface DocumentViewerProps {
  document: ExportDocument;
  onClose: () => void;
  currentUser: UserProfile | null;
  onApproveDocument?: (docId: string) => void;
  onSubmitDocumentForApproval?: (docId: string) => void;
}

export default function DocumentViewer({ 
  document, 
  onClose, 
  currentUser, 
  onApproveDocument,
  onSubmitDocumentForApproval 
}: DocumentViewerProps) {
  const documentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    // Generate a printable iframe or print stylesheet easily
    const printContent = documentRef.current?.innerHTML;
    const originalContent = window.document.body.innerHTML;

    // Create a sleek pop up or print specific window to prevent iframe issues
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak - ${document.type} - ${document.code}</title>
            <style>
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                color: #0f172a;
                background: white;
                padding: 40px;
                margin: 0;
              }
              .border { border: 1px solid #e2e8f0; }
              .border-t { border-top: 1px solid #e2e8f0; }
              .border-b { border-bottom: 1px solid #e2e8f0; }
              .bg-gray-50 { background-color: #f8fafc; }
              .p-4 { padding: 16px; }
              .p-6 { padding: 24px; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
              .gap-4 { gap: 16px; }
              .gap-6 { gap: 24px; }
              .text-xs { font-size: 11px; }
              .text-sm { font-size: 13px; }
              .text-lg { font-size: 18px; }
              .text-2xl { font-size: 24px; }
              .font-bold { font-weight: 700; }
              .font-semibold { font-weight: 600; }
              .text-right { text-align: right; }
              .uppercase { text-transform: uppercase; }
              .tracking-wider { tracking-wider: 0.05em; }
              .mt-4 { margin-top: 16px; }
              .mt-6 { margin-top: 24px; }
              .mb-6 { margin-bottom: 24px; }
              .py-2 { padding-top: 8px; padding-bottom: 8px; }
              .px-4 { padding-left: 16px; padding-right: 16px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 12px; }
              th { background-color: #f1f5f9; font-weight: bold; }
              .stamp-approved {
                border: 3px double #10b981;
                color: #10b981;
                font-size: 13px;
                font-weight: bold;
                text-transform: uppercase;
                display: inline-block;
                padding: 6px 12px;
                transform: rotate(-3deg);
                margin-top: 10px;
                border-radius: 4px;
              }
              .stamp-issued {
                border: 3px double #3b82f6;
                color: #3b82f6;
                font-size: 13px;
                font-weight: bold;
                text-transform: uppercase;
                display: inline-block;
                padding: 6px 12px;
                transform: rotate(-3deg);
                margin-top: 10px;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const getStatusStamp = () => {
    switch (document.status) {
      case 'Approved':
        return (
          <div className="border-3 border-double border-emerald-500 text-emerald-600 font-bold text-[10px] uppercase px-3 py-1.5 rounded-sm inline-block transform rotate-[-4deg] tracking-wider shadow-xs bg-white text-center">
            ★ RESMI DISAHKAN ★<br />
            DIRECTOR / OMNDER / BEACUKAI RI
          </div>
        );
      case 'Issued':
        return (
          <div className="border-3 border-double border-blue-500 text-blue-600 font-bold text-[10px] uppercase px-3 py-1.5 rounded-sm inline-block transform rotate-[-4deg] tracking-wider bg-white text-center animate-pulse">
            SURAT PENGAJUAN AKTIF<br />
            MENUNGGU PENGESAHAN
          </div>
        );
      default:
        return (
          <div className="border-3 border-double border-amber-550 border-amber-600 text-amber-600 font-bold text-[10px] uppercase px-3 py-1.5 rounded-sm inline-block transform rotate-[-4deg] tracking-wider bg-white text-center">
            DRAF INTERNAL BELUM DIAJUKAN<br />
            (DRAFT UN-SUBMITTED)
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-150 my-8 overflow-hidden">
        
        {/* Actions header bar */}
        <div className="p-4 bg-slate-900 border-b border-gray-150 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-slate-800 text-gray-300 px-2 py-1 rounded">
              {document.code}
            </span>
            <h3 className="font-bold text-sm">Pratinjau Dokumen Ekspor Resmi</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen
            </button>
            {document.status === 'Issued' && currentUser?.role === 'Superadmin' && onApproveDocument && (
              <button
                onClick={() => onApproveDocument(document.id)}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                Validasi Bea Cukai
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 px-2.5 bg-slate-800 hover:bg-slate-755 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Workflow Info Banners reflecting the requested Surat Pengajuan -> Surat Pengesahan sequence */}
        {document.status === 'Approved' && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-150 flex items-center gap-2 text-emerald-900 text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dokumen telah <strong>Resmi Disahkan</strong> oleh Otoritas Dagang &amp; Bea Cukai di sistem. Silakan cetak atau unduh berkas final ini.</span>
          </div>
        )}

        {document.status === 'Issued' && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-150 flex flex-col sm:flex-row sm:items-center justify-between text-blue-950 text-xs gap-3">
            <span className="flex items-center gap-2 font-medium">
              <Milestone className="w-5 h-5 text-blue-600 shrink-0 animate-pulse" />
              <span>
                <strong>Surat Pengajuan Aktif</strong>: Pihak Eksportir telah mengirimkan draf permohonan. Menunggu tanda tangan pabean dari <strong>Superadmin</strong>.
              </span>
            </span>
            {currentUser?.role === 'Superadmin' && onApproveDocument && (
              <button
                onClick={() => onApproveDocument(document.id)}
                className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold uppercase text-[10px] tracking-wide transition-colors self-end sm:self-auto shrink-0 shadow-xs"
              >
                ✓ Beri Pengesahan Resmi
              </button>
            )}
          </div>
        )}

        {document.status !== 'Approved' && document.status !== 'Issued' && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-150 flex flex-col sm:flex-row sm:items-center justify-between text-amber-950 text-xs gap-3">
            <span className="flex items-center gap-2 font-medium">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Draf Dokumen Belum Diajukan</strong>. Agar instansi berwenang dapat meneliti dan memberikan pengesahan, Anda harus mengirimkan <strong>Surat Pengajuan resmi</strong> terlebih dahulu.
              </span>
            </span>
            {onSubmitDocumentForApproval && (
              <button
                onClick={() => onSubmitDocumentForApproval(document.id)}
                className="py-1 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold uppercase text-[10px] tracking-wide transition-all self-end sm:self-auto shrink-0 animate-bounce"
              >
                ✉ Kirim Surat Pengajuan &rarr;
              </button>
            )}
          </div>
        )}

        {/* Scrollable Printable Area Wrapper */}
        <div className="p-6 max-h-[80vh] overflow-y-auto bg-gray-50">
          <div 
            ref={documentRef} 
            className="p-8 md:p-12 bg-white border border-gray-200 shadow-sm max-w-[210mm] mx-auto font-sans text-gray-900"
          >
            {/* Header document letterhead */}
            <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-6">
              <div>
                <span className="text-[10px] tracking-widest font-mono text-gray-400 block uppercase">Republic of Indonesia</span>
                <span className="text-xl font-bold tracking-tight uppercase text-slate-900">Customs & Trade Logistics Network</span>
                <p className="text-[10px] text-gray-500 mt-1">Sistem Terpadu Tata Kelola Ekspor (ExportFlow)</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-gray-400 block py-0.5">DOKUMEN RESMI</span>
                <span className="text-sm font-bold text-blue-700 block uppercase tracking-wider">{document.type}</span>
                <span className="text-xs font-mono font-medium text-gray-500 block">No: {document.code}</span>
              </div>
            </div>

            {/* Shipper and Consignee Information */}
            <div className="grid grid-cols-2 gap-6 border border-gray-200 mb-6">
              <div className="p-4 border-r border-gray-200">
                <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">1. Exporter (Eksportir) / Shipper :</span>
                <p className="text-xs font-bold text-slate-900 mt-1 whitespace-pre-line leading-relaxed">
                  {document.details.exporter}
                </p>
              </div>
              <div className="p-4">
                <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">2. Importer (Importir) / Consignee :</span>
                <p className="text-xs font-bold text-slate-900 mt-1 whitespace-pre-line leading-relaxed">
                  {document.details.importer}
                </p>
              </div>
            </div>

            {/* Shipping Information Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border border-gray-200 mb-6 font-sans">
              <div className="p-3 border-r border-b border-gray-200">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Vessel & Voyage No.</span>
                <span className="text-xs font-semibold text-gray-900 mt-0.5 block">{document.details.vesselName || '-'}</span>
              </div>
              <div className="p-3 border-r border-b border-gray-200">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Port of Loading</span>
                <span className="text-xs font-semibold text-gray-900 mt-0.5 block">{document.details.portOfLoading || '-'}</span>
              </div>
              <div className="p-3 border-r border-b border-gray-200">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Port of Discharge</span>
                <span className="text-xs font-semibold text-gray-900 mt-0.5 block">{document.details.portOfDischarge || '-'}</span>
              </div>
              <div className="p-3 border-b border-gray-200">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Payment Terms</span>
                <span className="text-xs font-semibold text-gray-900 mt-0.5 block">{document.details.paymentTerms || '-'}</span>
              </div>
              <div className="p-3 border-r border-gray-200 col-span-2">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Shipping Marks & Container Numbers</span>
                <span className="text-xs font-mono text-gray-800 mt-0.5 block whitespace-pre-line leading-normal">
                  {document.details.shippingMark || 'N/M'}
                </span>
              </div>
              <div className="p-3 border-r border-gray-200 font-mono">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Net Weight</span>
                <span className="text-xs font-semibold text-gray-900 mt-0.5 block">{document.details.weightNet || '-'}</span>
              </div>
              <div className="p-3 font-mono">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Gross Weight</span>
                <span className="text-xs font-semibold text-gray-900 mt-0.5 block">{document.details.weightGross || '-'}</span>
              </div>
            </div>

            {/* Cargo item list table */}
            <table className="mb-6">
              <thead>
                <tr>
                  <th className="w-12 text-center uppercase tracking-wider text-[10px]">No</th>
                  <th className="uppercase tracking-wider text-[10px]">Description of Goods</th>
                  <th className="w-24 text-center uppercase tracking-wider text-[10px]">HS Code</th>
                  <th className="w-24 text-right uppercase tracking-wider text-[10px]">Quantity</th>
                  <th className="w-28 text-right uppercase tracking-wider text-[10px]">Unit Price (USD)</th>
                  <th className="w-32 text-right uppercase tracking-wider text-[10px]">Amount (USD)</th>
                </tr>
              </thead>
              <tbody>
                {document.details.items.map((item, idx) => (
                  <tr key={idx} className="font-sans text-xs">
                    <td className="text-center font-mono">{idx + 1}</td>
                    <td className="font-semibold text-gray-900">{item.description}</td>
                    <td className="text-center font-mono text-gray-500">{item.hsCode}</td>
                    <td className="text-right font-mono">{item.quantity} {item.unit}</td>
                    <td className="text-right font-mono">${item.unitPrice.toLocaleString('id-ID')}</td>
                    <td className="text-right font-mono font-bold">${(item.quantity * item.unitPrice).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr>
                  <td colSpan={5} className="text-right font-bold uppercase text-[11px] bg-gray-50">Total FOB Amount (USD) :</td>
                  <td className="text-right font-bold text-blue-800 font-mono text-sm bg-gray-50">
                    ${document.details.totalAmount.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Notes & Terms */}
            {document.details.additionalNotes && (
              <div className="p-4 border border-dashed border-gray-200 rounded mb-6 text-xs text-gray-600 background-light font-sans">
                <span className="font-bold text-gray-800 block mb-1">Additional Terms & Notes :</span>
                <p className="leading-relaxed">{document.details.additionalNotes}</p>
              </div>
            )}

            {/* Footers, Stamps, & Signatures */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100 min-h-[140px]">
              <div className="text-center">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Sistem Kredensial</span>
                <div className="mt-4">
                  <span className="text-[9px] font-mono text-gray-400 bg-gray-50 p-1.5 border border-gray-100 rounded block text-left truncate">
                    UUID: {document.id}
                  </span>
                  <span className="text-[9px] font-mono text-gray-400 block text-left mt-1">
                    Issued Date: {document.issuedDate || document.createdAt.slice(0, 10)}
                  </span>
                </div>
              </div>

              {/* Stamp Column */}
              <div className="text-center flex flex-col justify-center items-center">
                {getStatusStamp()}
              </div>

              <div className="text-center select-none">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Authorised Signatory</span>
                <div className="mt-6 border-b border-gray-300 w-40 mx-auto h-8 flex items-center justify-center">
                  <span className="font-serif italic text-sm text-blue-800 tracking-widest">
                    {document.createdBy === 'usr-trader' ? 'H. Kurniawan' : 'Siti Aminah'}
                  </span>
                </div>
                <span className="text-[9px] font-semibold text-gray-500 block mt-1">PT Multi Raksa Madani</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-[11px] text-gray-400">
          Gunakan tombol &ldquo;Cetak Dokumen&rdquo; di kanan atas untuk memicu dialog print sistem operasi secara otomatis bebas dari elemen navigasi luar.
        </div>

      </div>
    </div>
  );
}
