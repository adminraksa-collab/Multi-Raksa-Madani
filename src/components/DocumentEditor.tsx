import React, { useState, useEffect } from 'react';
import { ExportShipment, ExportDocument, DocumentType, UserProfile } from '../types';
import { FileCode, FileSpreadsheet, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface DocumentEditorProps {
  shipments: ExportShipment[];
  currentUser: UserProfile | null;
  onSaveDocument: (doc: ExportDocument) => void;
  onClose: () => void;
}

export default function DocumentEditor({ shipments, currentUser, onSaveDocument, onClose }: DocumentEditorProps) {
  const [selectedShipmentId, setSelectedShipmentId] = useState('');
  const [docType, setDocType] = useState<DocumentType>('Commercial Invoice');
  const [shipper, setShipper] = useState('');
  const [consignee, setConsignee] = useState('');
  const [vessel, setVessel] = useState('');
  const [portLoading, setPortLoading] = useState('');
  const [portDischarge, setPortDischarge] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('L/C at Sight');
  const [shippingMark, setShippingMark] = useState('');
  const [weightNet, setWeightNet] = useState('');
  const [weightGross, setWeightGross] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Item list state
  const [items, setItems] = useState<Array<{
    description: string;
    hsCode: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }>>([{ description: '', hsCode: '', quantity: 1, unit: 'MT', unitPrice: 0 }]);

  // Load shipment info when changed
  useEffect(() => {
    if (selectedShipmentId) {
      const ship = shipments.find(s => s.id === selectedShipmentId);
      if (ship) {
        setShipper(ship.traderName + '\n' + (currentUser?.companyName || 'PT Multi Raksa Madani') + '\n' + (currentUser?.address || 'Jakarta, Indonesia'));
        setConsignee(ship.buyerName + '\n' + ship.buyerCompany + '\nFrankfurt, Germany');
        setVessel(ship.vesselName + ' ' + (ship.voyageNumber || ''));
        setPortLoading(ship.portOfLoading);
        setPortDischarge(ship.portOfDischarge);
        setShippingMark(`EF / ${ship.productName.split(' ')[0].toUpperCase()} / FRANKFURT\nNO. 1 - ${Math.round(ship.quantity * 25)}\nMADE IN INDONESIA`);
        setItems([{
          description: ship.productName,
          hsCode: ship.hsCode || '0908.11.00',
          quantity: ship.quantity,
          unit: ship.unit,
          unitPrice: Math.round(ship.totalValue / ship.quantity)
        }]);
        setWeightNet(`${ship.quantity * 1000 - 100} Kgs`);
        setWeightGross(`${ship.quantity * 1000} Kgs`);
      }
    }
  }, [selectedShipmentId, shipments, currentUser]);

  // Set default initial selection
  useEffect(() => {
    if (shipments.length > 0 && !selectedShipmentId) {
      // Find one in Draft / Verification / Documents
      const draftShipment = shipments.find(s => ['Draft', 'Shipping'].includes(s.currentStep)) || shipments[0];
      setSelectedShipmentId(draftShipment.id);
    }
  }, [shipments, selectedShipmentId]);

  const handleAddItem = () => {
    setItems([...items, { description: '', hsCode: '', quantity: 1, unit: 'Kg', unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setItems(updated);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipmentId) return;

    const ship = shipments.find(s => s.id === selectedShipmentId);
    if (!ship) return;

    const randomID = Math.floor(1000 + Math.random() * 9000);
    const codePrefix = docType === 'Commercial Invoice' ? 'INV' : docType === 'Packing List' ? 'PL' : 'SC';
    const docCode = `${codePrefix}/NGL/${ship.id.slice(-4).toUpperCase()}/${randomID}`;

    const newDoc: ExportDocument = {
      id: `doc-new-${Date.now()}`,
      shipmentId: selectedShipmentId,
      type: docType,
      code: docCode,
      title: docType,
      status: 'Draft',
      createdBy: currentUser?.id || 'usr-trader',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      issuedDate: new Date().toISOString().split('T')[0],
      details: {
        exporter: shipper,
        importer: consignee,
        shippingMark: shippingMark,
        portOfLoading: portLoading,
        portOfDischarge: portDischarge,
        vesselName: vessel,
        paymentTerms: paymentTerms,
        items: items.map(item => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice
        })),
        totalAmount,
        weightNet,
        weightGross,
        additionalNotes
      }
    };

    onSaveDocument(newDoc);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-950 text-white">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-bold text-base">Formulir Pembuatan Dokumen Ekspor Resmi</h3>
            <p className="text-[12px] text-gray-400">Hubungkan dokumen langsung ke nomor sirkulasi pengiriman aktif</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold px-3 py-1.5 bg-slate-800 text-gray-300 hover:text-white rounded hover:bg-slate-700 transition-colors"
        >
          Batal
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Shipment Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Pilih Transaksi / Shipment :</label>
            <select
              value={selectedShipmentId}
              onChange={(e) => setSelectedShipmentId(e.target.value)}
              className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-150"
              required
            >
              <option value="">-- Hubungkan dengan pengiriman --</option>
              {shipments.map(s => (
                <option key={s.id} value={s.id}>
                  {s.contractNumber} ({s.productName}) - Tahap: {s.currentStep}
                </option>
              ))}
            </select>
          </div>

          {/* Doc Type Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Tipe Dokumen Ekspor :</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-150 font-semibold text-gray-900"
              required
            >
              <option value="Commercial Invoice">Commercial Invoice</option>
              <option value="Packing List">Packing List</option>
              <option value="Sales Contract">Sales Contract</option>
              <option value="Shipping Instruction">Shipping Instruction</option>
            </select>
          </div>

          {/* Payment Terms */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Metode Pembayaran (Payment Terms) :</label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-150"
              placeholder="Misal: L/C at Sight, Telegraphic Transfer (T/T)"
            />
          </div>
        </div>

        {/* Shipper & Consignee boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Eksportir / Shipper :</label>
            <textarea
              rows={3}
              value={shipper}
              onChange={(e) => setShipper(e.target.value)}
              className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-150 font-sans"
              placeholder="Nama PT, alamat lengkap, kota, Indonesia"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Importir / Consignee :</label>
            <textarea
              rows={3}
              value={consignee}
              onChange={(e) => setConsignee(e.target.value)}
              className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-150 font-sans"
              placeholder="Nama Buyer Company, alamat luar negeri, dsb"
              required
            />
          </div>
        </div>

        {/* Shipping details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-1">
            <label className="text-[12px] font-bold text-gray-600">Vessel / Carrier :</label>
            <input
              type="text"
              value={vessel}
              onChange={(e) => setVessel(e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 bg-white rounded focus:outline-none"
              placeholder="Vessel Name & Voyage"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-bold text-gray-600">Pelabuhan Muat (Load) :</label>
            <input
              type="text"
              value={portLoading}
              onChange={(e) => setPortLoading(e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 bg-white rounded focus:outline-none"
              placeholder="Port of Loading"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-bold text-gray-600">Pelabuhan Bongkar (Discharge) :</label>
            <input
              type="text"
              value={portDischarge}
              onChange={(e) => setPortDischarge(e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 bg-white rounded focus:outline-none"
              placeholder="Port of Discharge"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-bold text-gray-600">Marks & Numbers :</label>
            <input
              type="text"
              value={shippingMark}
              onChange={(e) => setShippingMark(e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 bg-white rounded focus:outline-none"
              placeholder="Misal: EF/NUTMEG/FRANKFURT"
            />
          </div>
        </div>

        {/* Cargo Weight information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Berat Bersih (Net Weight) :</label>
            <input
              type="text"
              value={weightNet}
              onChange={(e) => setWeightNet(e.target.value)}
              className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none"
              placeholder="Contoh: 9,850 Kgs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Berat Kotor (Gross Weight) :</label>
            <input
              type="text"
              value={weightGross}
              onChange={(e) => setWeightGross(e.target.value)}
              className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none"
              placeholder="Contoh: 10,000 Kgs"
            />
          </div>
        </div>

        {/* Item Cargo Details list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-150 pb-2">
            <span className="text-xs font-bold text-gray-900">Rincian Pos Pos Barang (Sirkulasi Komoditi) :</span>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Sisipkan Baris Baru
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50/50 p-3 rounded-lg border border-gray-200">
                <div className="flex-1 space-y-1">
                  <label className="text-[12px] uppercase tracking-wider text-gray-400 font-bold">Nama / Keterangan Barang</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 bg-white rounded focus:outline-none"
                    placeholder="Nama barang ekspor detail"
                    required
                  />
                </div>

                <div className="w-full sm:w-28 space-y-1">
                  <label className="text-[12px] uppercase tracking-wider text-gray-400 font-bold">HS Code</label>
                  <input
                    type="text"
                    value={item.hsCode}
                    onChange={(e) => handleItemChange(index, 'hsCode', e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 bg-white rounded font-mono focus:outline-none"
                    placeholder="Contoh: 0908.11.00"
                    required
                  />
                </div>

                <div className="w-full sm:w-20 space-y-1">
                  <label className="text-[12px] uppercase tracking-wider text-gray-400 font-bold">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 border border-gray-300 bg-white rounded font-mono focus:outline-none"
                    min="1"
                    required
                  />
                </div>

                <div className="w-full sm:w-16 space-y-1">
                  <label className="text-[12px] uppercase tracking-wider text-gray-400 font-bold">Satuan</label>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 bg-white rounded focus:outline-none"
                    placeholder="MT / Boks"
                    required
                  />
                </div>

                <div className="w-full sm:w-28 space-y-1">
                  <label className="text-[12px] uppercase tracking-wider text-gray-400 font-bold">Harga Satuan (USD)</label>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 border border-gray-300 bg-white rounded font-mono focus:outline-none"
                    min="0"
                    required
                  />
                </div>

                <div className="w-full sm:w-auto shrink-0 self-end sm:self-center pb-1">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                    className="p-1.5 text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end p-3 bg-gray-50 border border-gray-150 rounded-lg">
            <p className="text-sm font-bold text-gray-900">
              Total Kalkulasi FOB: <span className="font-mono text-blue-700">${totalAmount.toLocaleString('id-ID')} USD</span>
            </p>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700">Catatan Kaki dan Ketentuan Opsional :</label>
          <textarea
            rows={2}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-150"
            placeholder="Aturan arbitrase, syarat khusus packing, klaim kerusakan..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Terbitkan & Sahkan Dokumen
          </button>
        </div>
      </form>
    </div>
  );
}
