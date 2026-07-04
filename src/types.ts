export type UserRole = 'Superadmin' | 'Trader' | 'Buyer' | 'Forwarder' | 'Supplier';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  companyName: string;
  phone?: string;
  address?: string;
  country?: string;
  isApproved?: boolean;
}

export type DocumentType = 
  | 'Sales Contract'
  | 'Commercial Invoice'
  | 'Packing List'
  | 'Bill of Lading'
  | 'Certificate of Origin'
  | 'Customs Declaration'
  | 'Shipping Instruction'
  | 'Phytosanitary Certificate'
  | 'Halal Certificate';

export interface ExportDocument {
  id: string;
  shipmentId: string;
  type: DocumentType;
  code: string;
  title: string;
  status: 'Draft' | 'Issued' | 'Approved' | 'Rejected';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  issuedDate?: string;
  details: {
    exporter: string;
    importer: string;
    shippingMark?: string;
    portOfLoading?: string;
    portOfDischarge?: string;
    vesselName?: string;
    paymentTerms?: string;
    items: Array<{
      description: string;
      hsCode: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalPrice: number;
    }>;
    totalAmount: number;
    weightNet?: string;
    weightGross?: string;
    additionalNotes?: string;
  };
}

export interface Certification {
  id: string;
  name: string;
  code: string;
  description: string;
  authority: string;
  requiredFor: string;
  status: 'Pending' | 'In Progress' | 'Verified' | 'Expired';
  expiryDate?: string;
  uploadedUrl?: string;
  updatedAt: string;
}

export type ShipmentStep = 
  | 'Draft'                  // Kontrak penjualan & Proforma Invoice disepakati
  | 'Shipping'               // Proses Logistik Terpadu (Sourcing, Customs, Pelayaran, L/C)
  | 'Completed';             // Selesai Serah Terima oleh Buyer

export interface ShipmentStepInfo {
  step: ShipmentStep;
  label: string;
  description: string;
  actor: UserRole;
  expectedDuration: string;
}

export interface ExportShipment {
  id: string;
  contractNumber: string;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  supplierId: string;
  supplierName: string;
  supplierCompany: string;
  forwarderId: string;
  forwarderName: string;
  forwarderCompany: string;
  traderId: string;
  traderName: string;
  productName: string;
  quantity: number;
  unit: string;
  totalValue: number;
  currency: string;
  hsCode: string;
  portOfLoading: string;
  portOfDischarge: string;
  vesselName: string;
  voyageNumber: string;
  etd: string; // Estimated Time of Departure
  eta: string; // Estimated Time of Arrival
  trackingNumber: string;
  incoterms?: string;
  paymentTerms?: string;
  currentStep: ShipmentStep;
  stepHistory: Array<{
    step: ShipmentStep;
    timestamp: string;
    updatedBy: string;
    comments?: string;
  }>;
  documents: ExportDocument[];
  certifications: Certification[];
}

export interface ExportProduct {
  id: string;
  name: string;
  category: string;
  hsCode: string;
  price: string;
  unit: string;
  specification: string;
  image: string;
  supplierName: string;
  origin: string;
  minOrder: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface RealTimeAlert {
  id: string;
  shipmentId?: string;
  contractNumber?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  readBy: string[]; // User IDs who have read this alert
}
