import { BankAccount, BankAccountType, SettlementGatewayConfig } from '../domain/bank-account.entity';

export interface CreateBankAccountDTO {
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: BankAccountType;
  branchName?: string;
  swiftCode?: string;
  qrPhData?: string;
  depositInstructions?: string;
  isDefault?: boolean;
}

export interface UpdateBankAccountDTO {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  accountType?: BankAccountType;
  branchName?: string;
  swiftCode?: string;
  qrPhData?: string;
  depositInstructions?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  isDefault?: boolean;
}

export interface IBankAccountRepository {
  getAll(): Promise<BankAccount[]>;
  getActive(): Promise<BankAccount[]>;
  findById(id: string): Promise<BankAccount | null>;
  create(data: CreateBankAccountDTO): Promise<BankAccount>;
  update(id: string, data: UpdateBankAccountDTO): Promise<BankAccount | null>;
  delete(id: string): Promise<boolean>;
  getGatewayConfig(): Promise<SettlementGatewayConfig>;
  updateGatewayConfig(data: Partial<SettlementGatewayConfig>): Promise<SettlementGatewayConfig>;
}

export class InMemoryBankAccountRepository implements IBankAccountRepository {
  private accounts: Map<string, BankAccount> = new Map();
  private gatewayConfig: SettlementGatewayConfig;

  constructor() {
    // Seed initial institutional bank accounts for St. Francis College
    const initialAccounts: BankAccount[] = [
      {
        id: 'bank-bdo-01',
        bankName: 'BDO Unibank, Inc.',
        accountName: 'St. Francis College, Inc.',
        accountNumber: '0045-8812-9901',
        accountType: 'TUITION_MATRICULATION',
        branchName: 'Academic Heights - Remsen Branch',
        swiftCode: 'BNORPHMM',
        status: 'ACTIVE',
        isDefault: true,
        depositInstructions: 'State student reference number on the deposit slip or online transfer remarks field.',
        qrPhData: '00020101021226580015ph.ppmi.qrph0111BDO_PH02150045881299015204601653036085802PH5924ST FRANCIS COLLEGE INC6007MANILA6304C92A',
        createdAt: new Date('2026-01-10T08:00:00Z'),
        updatedAt: new Date('2026-01-10T08:00:00Z'),
      },
      {
        id: 'bank-bpi-02',
        bankName: 'Bank of the Philippine Islands (BPI)',
        accountName: 'St. Francis College - Admissions & Assessment',
        accountNumber: '3021-9984-12',
        accountType: 'APPLICATION_FEES',
        branchName: 'Heights Central Branch',
        swiftCode: 'BOPIPHMM',
        status: 'ACTIVE',
        isDefault: false,
        depositInstructions: 'For application and assessment fees. Please write student name on the bank validation.',
        qrPhData: '00020101021226580015ph.ppmi.qrph0111BPI_PH021530219984125204601653036085802PH5924ST FRANCIS COLLEGE INC6007MANILA6304FA1B',
        createdAt: new Date('2026-01-15T08:00:00Z'),
        updatedAt: new Date('2026-01-15T08:00:00Z'),
      },
      {
        id: 'bank-landbank-03',
        bankName: 'Land Bank of the Philippines',
        accountName: 'St. Francis College - Depository Fund',
        accountNumber: '1402-1088-45',
        accountType: 'SCHOLARSHIP_ESCROW',
        branchName: 'Main Government Center Branch',
        swiftCode: 'TLBPHMM',
        status: 'ACTIVE',
        isDefault: false,
        depositInstructions: 'Dedicated account for government tertiary education subsidy (TES) and academic scholarship grants.',
        createdAt: new Date('2026-02-01T08:00:00Z'),
        updatedAt: new Date('2026-02-01T08:00:00Z'),
      },
      {
        id: 'bank-gcash-04',
        bankName: 'GCash Enterprise Merchant QR',
        accountName: 'St. Francis College Admissions',
        accountNumber: '0917-882-9900',
        accountType: 'APPLICATION_FEES',
        branchName: 'Digital Merchant Services',
        status: 'ACTIVE',
        isDefault: false,
        depositInstructions: 'Scan QR Ph code using GCash, Maya, or any InstaPay banking app.',
        qrPhData: '00020101021226580015ph.ppmi.qrph0111GXI_PH0215091788299005204601653036085802PH5924ST FRANCIS COLLEGE INC6007MANILA6304EE71',
        createdAt: new Date('2026-02-10T08:00:00Z'),
        updatedAt: new Date('2026-02-10T08:00:00Z'),
      },
    ];

    initialAccounts.forEach((acc) => this.accounts.set(acc.id, acc));

    this.gatewayConfig = {
      merchantId: 'SFC_DRAGONPAY_LIVE_092',
      merchantName: 'St. Francis College, Inc.',
      environment: 'PRODUCTION',
      secretKeyMasked: 'dp_live_••••••••••••942F',
      primarySettlementBankId: 'bank-bdo-01',
      autoSettlementFrequency: 'DAILY',
      minimumPayoutThreshold: 1000,
      lastSettlementAt: new Date('2026-09-24T18:00:00Z'),
      nextScheduledSettlementAt: new Date('2026-09-25T18:00:00Z'),
      notifyFinanceEmail: 'finance@stfrancis.edu',
    };
  }

  public async getAll(): Promise<BankAccount[]> {
    return Array.from(this.accounts.values()).sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  public async getActive(): Promise<BankAccount[]> {
    return (await this.getAll()).filter((a) => a.status === 'ACTIVE');
  }

  public async findById(id: string): Promise<BankAccount | null> {
    return this.accounts.get(id) || null;
  }

  public async create(data: CreateBankAccountDTO): Promise<BankAccount> {
    const id = `bank-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (data.isDefault) {
      for (const [key, acc] of this.accounts.entries()) {
        if (acc.isDefault) {
          this.accounts.set(key, { ...acc, isDefault: false, updatedAt: new Date() });
        }
      }
    }

    const newAccount: BankAccount = {
      id,
      bankName: data.bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      accountType: data.accountType,
      branchName: data.branchName,
      swiftCode: data.swiftCode,
      qrPhData: data.qrPhData,
      depositInstructions: data.depositInstructions,
      status: 'ACTIVE',
      isDefault: !!data.isDefault,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.accounts.set(id, newAccount);
    return newAccount;
  }

  public async update(id: string, data: UpdateBankAccountDTO): Promise<BankAccount | null> {
    const existing = this.accounts.get(id);
    if (!existing) return null;

    if (data.isDefault) {
      for (const [key, acc] of this.accounts.entries()) {
        if (acc.id !== id && acc.isDefault) {
          this.accounts.set(key, { ...acc, isDefault: false, updatedAt: new Date() });
        }
      }
    }

    const updated: BankAccount = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };

    this.accounts.set(id, updated);
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    return this.accounts.delete(id);
  }

  public async getGatewayConfig(): Promise<SettlementGatewayConfig> {
    return { ...this.gatewayConfig };
  }

  public async updateGatewayConfig(data: Partial<SettlementGatewayConfig>): Promise<SettlementGatewayConfig> {
    this.gatewayConfig = {
      ...this.gatewayConfig,
      ...data,
    };
    return { ...this.gatewayConfig };
  }
}

export const defaultBankAccountRepository = new InMemoryBankAccountRepository();
