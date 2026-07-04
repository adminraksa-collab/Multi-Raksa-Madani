import { UserProfile, ExportProduct, ExportShipment, Certification, ExportDocument, RealTimeAlert, ShipmentStep, UserRole } from './types';

export const mockUsers: UserProfile[] = [];

export const mockProducts: ExportProduct[] = [];

export const mockCertificationsList = (shipmentId: string): Certification[] => [
  {
    id: `cert-${shipmentId}-1`,
    name: 'Sertifikat Phytosanitary (Karantina Tumbuhan)',
    code: 'PHYT-ID-2026-90812',
    description: 'Menjamin produk pertanian bebas hama & penyakit karantina, diterbitkan oleh Badan Karantina Indonesia.',
    authority: 'Badan Karantina Indonesia (Barantin)',
    requiredFor: 'Semua komoditas hasil bumi/pertanian',
    status: 'Verified',
    expiryDate: '2026-12-15',
    uploadedUrl: '#',
    updatedAt: '2026-06-12T10:00:00Z',
  },
  {
    id: `cert-${shipmentId}-2`,
    name: 'Sertifikat Halal Indonesia (BPJPH)',
    code: 'HALAL-ID-312100045812',
    description: 'Sertifikasi jaminan produk halal untuk konsumsi pangan dan komoditas pendukung.',
    authority: 'Badan Penyelenggara Jaminan Produk Halal (BPJPH)',
    requiredFor: 'Komoditas pangan, kopi, rempah-rempah eksportasi negara Muslim',
    status: 'Verified',
    expiryDate: '2030-05-20',
    uploadedUrl: '#',
    updatedAt: '2026-06-11T14:30:00Z',
  },
  {
    id: `cert-${shipmentId}-3`,
    name: 'Certificate of Origin (COO / SKA Form-A/D/E)',
    code: 'COO-SKA-JKT-19028',
    description: 'Surat Keterangan Asal membuktikan barang berasal dari Indonesia untuk pemotongan tarif pabean preferensil.',
    authority: 'Dinas Perindustrian dan Perdagangan DKI Jakarta',
    requiredFor: 'Keringanan bea masuk di negara mitra dagang rujukan',
    status: 'In Progress',
    updatedAt: '2026-06-18T09:15:00Z',
  },
  {
    id: `cert-${shipmentId}-4`,
    name: 'Sertifikat Sistem Manajemen Keamanan Pangan (HACCP)',
    code: 'HACCP-SMKP-2026-004a',
    description: 'Sertifikasi uji titik kritis pengolahan makanan higienis standar ekspor internasional.',
    authority: 'Komite Akreditasi Nasional (KAN)',
    requiredFor: 'Keamanan pangan Uni Eropa, Amerika Serikat, & Jepang',
    status: 'Pending',
    updatedAt: '2026-06-10T16:00:00Z',
  }
];

export const createMockDocuments = (shipmentId: string, value: number, qty: number, unit: string, prodName: string, hsCode: string): ExportDocument[] => [
  {
    id: `doc-${shipmentId}-1`,
    shipmentId,
    type: 'Sales Contract',
    code: `SC/NGL/${shipmentId.slice(-4).toUpperCase()}/2026`,
    title: 'Sales Contract Agreement',
    status: 'Approved',
    createdBy: 'usr-trader',
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-02T15:00:00Z',
    issuedDate: '2026-06-02',
    details: {
      exporter: 'PT Multi Raksa Madani\nSudirman Central Business District, Jakarta, Indonesia',
      importer: 'Tokyo Coffee Trading Co.\nKaiserstraße 12, Frankfurt am Main, Germany',
      paymentTerms: 'L/C (Letter of Credit) at sight',
      items: [
        {
          description: prodName,
          hsCode: hsCode,
          quantity: qty,
          unit: unit,
          unitPrice: value / qty,
          totalPrice: value,
        }
      ],
      totalAmount: value,
      additionalNotes: 'FOB Tanjung Priok Port, Jakarta. Dispute settlement shall be conducted at BANI (Indonesian National Board of Arbitration).'
    }
  },
  {
    id: `doc-${shipmentId}-2`,
    shipmentId,
    type: 'Commercial Invoice',
    code: `INV/NGL-${shipmentId.slice(-4).toUpperCase()}/236`,
    title: 'Commercial Invoice',
    status: 'Issued',
    createdBy: 'usr-trader',
    createdAt: '2026-06-03T10:00:00Z',
    updatedAt: '2026-06-18T11:00:00Z',
    issuedDate: '2026-06-18',
    details: {
      exporter: 'PT Multi Raksa Madani\nSudirman Central Business District, Jakarta, Indonesia',
      importer: 'Tokyo Coffee Trading Co.\nKaiserstraße 12, Frankfurt am Main, Germany',
      portOfLoading: 'Tanjung Priok, Jakarta (IDTPP)',
      portOfDischarge: 'Port of Tokyo, Germany (DEHAM)',
      vesselName: 'MV Samudera Pasifik V.204',
      paymentTerms: 'L/C at Sight No. LC-9831-2026',
      shippingMark: 'EF / NUTMEG / FRANKFURT\nNO. 1 - 250\nMADE IN INDONESIA',
      items: [
        {
          description: prodName,
          hsCode: hsCode,
          quantity: qty,
          unit: unit,
          unitPrice: value / qty,
          totalPrice: value,
        }
      ],
      totalAmount: value,
      weightNet: `${qty * 1000 - 150} Kgs`,
      weightGross: `${qty * 1000} Kgs`,
      additionalNotes: 'Commercial Invoice created by Trader for Customs verification.'
    }
  },
  {
    id: `doc-${shipmentId}-3`,
    shipmentId,
    type: 'Packing List',
    code: `PL/NGL-${shipmentId.slice(-4).toUpperCase()}/236`,
    title: 'Packing List',
    status: 'Issued',
    createdBy: 'usr-trader',
    createdAt: '2026-06-03T10:15:00Z',
    updatedAt: '2026-06-18T11:00:00Z',
    issuedDate: '2026-06-18',
    details: {
      exporter: 'PT Multi Raksa Madani\nSudirman Central Business District, Jakarta, Indonesia',
      importer: 'Tokyo Coffee Trading Co.\nKaiserstraße 12, Frankfurt am Main, Germany',
      portOfLoading: 'Tanjung Priok, Jakarta',
      portOfDischarge: 'Port of Tokyo, Germany',
      vesselName: 'MV Samudera Pasifik V.204',
      shippingMark: 'EF / NUTMEG / FRANKFURT\nNO. 1 - 250\nMADE IN INDONESIA',
      items: [
        {
          description: prodName + ' packed in 250 Double PP Gunny Bags',
          hsCode: hsCode,
          quantity: qty,
          unit: unit,
          unitPrice: value / qty,
          totalPrice: value,
        }
      ],
      totalAmount: value,
      weightNet: `${qty * 1000 - 150} Kgs`,
      weightGross: `${qty * 1000} Kgs`,
      additionalNotes: 'Total cargo packing container: 1x20 Feet Dry Cargo Container.'
    }
  },
  {
    id: `doc-${shipmentId}-4`,
    shipmentId,
    type: 'Bill of Lading',
    code: `BL/NGL/SITI-9018A`,
    title: 'Ocean Bill of Lading (B/L)',
    status: 'Draft',
    createdBy: 'usr-forwarder',
    createdAt: '2026-06-17T09:00:00Z',
    updatedAt: '2026-06-18T17:00:00Z',
    details: {
      exporter: 'PT Multi Raksa Madani\nSudirman Central Business District, Jakarta, Indonesia',
      importer: 'Tokyo Coffee Trading Co.\nKaiserstraße 12, Frankfurt am Main, Germany',
      portOfLoading: 'Tanjung Priok, Jakarta (IDTPP)',
      portOfDischarge: 'Port of Tokyo, Germany (DEHAM)',
      vesselName: 'MV Samudera Pasifik V.204',
      paymentTerms: 'Ocean Freight Prepaid',
      shippingMark: 'EF / NUTMEG / FRANKFURT\nCONTAINER NO: TGBU-918231-0 / SEAL NO: ID-912838',
      items: [
        {
          description: `1 x 20 FCL Container containing ${qty} ${unit} of ${prodName}`,
          hsCode: hsCode,
          quantity: qty,
          unit: unit,
          unitPrice: value / qty,
          totalPrice: value,
        }
      ],
      totalAmount: value,
      weightNet: `${qty * 1000 - 150} Kgs`,
      weightGross: `${qty * 1000} Kgs`,
      additionalNotes: 'Shipped in apparent good order. To order of Buyer. Carrier is Samudera Logistik.'
    }
  }
];

export const initialShipments = (): ExportShipment[] => [];

export const initialAlerts: RealTimeAlert[] = [];

export const WORKFLOW_STEPS: Array<{
  step: ShipmentStep;
  label: string;
  description: string;
  actor: UserRole;
  expectedDuration: string;
}> = [
  {
    step: 'Draft',
    label: 'Negosiasi & Kontrak',
    description: 'Meja perundingan draf kontrak (LOI, FCO, MoU), penyesuaian klausul secara interaktif secara real-time, dan penandatanganan bilateral Proforma Invoice (PI).',
    actor: 'Trader',
    expectedDuration: '3-7 Hari'
  },
  {
    step: 'Shipping',
    label: 'Proses Logistik & Pencairan L/C',
    description: 'Rangkaian proses terintegrasi mulai dari Sourcing komoditas tani, Kepabeanan Ekspor (COO/PEB), Pelayaran Samudra (B/L), hingga pencairan dana Letter of Credit (L/C).',
    actor: 'Trader',
    expectedDuration: '20-35 Hari'
  },
  {
    step: 'Completed',
    label: 'Selesai & Serah Terima',
    description: 'Kapal berlabuh, barang diclearance di port tujuan (Tokyo), serah terima kargo fisik, dan transaksi ditutup sempurna.',
    actor: 'Buyer',
    expectedDuration: '2-3 Hari'
  }
];
