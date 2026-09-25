export type BankAccountType = 
  | 'TUITION_MATRICULATION'
  | 'APPLICATION_FEES'
  | 'GENERAL_OPERATING'
  | 'SCHOLARSHIP_ESCROW';

export type BankAccountStatus = 'ACTIVE' | 'INACTIVE';

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: BankAccountType;
  branchName?: string;
  swiftCode?: string;
  qrPhData?: string;
  status: BankAccountStatus;
  isDefault: boolean;
  depositInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettlementGatewayConfig {
  merchantId: string;
  merchantName: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  secretKeyMasked: string;
  primarySettlementBankId: string;
  autoSettlementFrequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  minimumPayoutThreshold: number;
  lastSettlementAt?: Date;
  nextScheduledSettlementAt?: Date;
  notifyFinanceEmail: string;
}
