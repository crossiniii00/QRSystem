export type PaymentStatus = 'PENDING' | 'PAID' | 'VERIFIED' | 'CANCELLED';
export type PaymentType = 'APPLICATION_ASSESSMENT' | 'MATRICULATION_DEPOSIT';
export type PaymentChannel = 
  | 'GCASH' 
  | 'MAYA' 
  | 'DRAGONPAY_ONLINE_BANKING' 
  | 'DRAGONPAY_OTC_NON_BANK' 
  | 'DRAGONPAY_7ELEVEN' 
  | 'BANK_TRANSFER_MANUAL';

export interface PaymentTransaction {
  id: string;
  referenceNumber: string; // matches application reference e.g. ENR-2026-000101
  applicationId: string;
  paymentType: PaymentType;
  channel: PaymentChannel;
  amount: number;
  currency: 'PHP' | 'USD';
  status: PaymentStatus;
  gatewayRefNo: string; // Dragonpay style txn ref e.g. DRP-8924194
  description: string;
  payerName: string;
  payerEmail: string;
  payerMobile?: string;
  instructionsHtml?: string;
  depositSlipFilename?: string;
  depositSlipData?: string; // base64 receipt
  paidAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
