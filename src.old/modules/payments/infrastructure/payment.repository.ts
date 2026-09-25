import { PaymentTransaction, PaymentStatus, PaymentChannel, PaymentType } from '../domain/payment.entity';

export interface CreatePaymentDTO {
  applicationId: string;
  referenceNumber: string;
  paymentType: PaymentType;
  channel: PaymentChannel;
  amount: number;
  currency?: 'PHP' | 'USD';
  payerName: string;
  payerEmail: string;
  payerMobile?: string;
  depositSlipFilename?: string;
  depositSlipData?: string;
}

export interface IPaymentRepository {
  findById(id: string): Promise<PaymentTransaction | null>;
  findByApplicationId(applicationId: string): Promise<PaymentTransaction[]>;
  findByReferenceNumber(ref: string): Promise<PaymentTransaction[]>;
  findByGatewayRef(gatewayRef: string): Promise<PaymentTransaction | null>;
  findAll(limit?: number): Promise<PaymentTransaction[]>;
  create(data: CreatePaymentDTO): Promise<PaymentTransaction>;
  updateStatus(id: string, status: PaymentStatus, verifiedBy?: string): Promise<PaymentTransaction | null>;
}

export class InMemoryPaymentRepository implements IPaymentRepository {
  private transactions: Map<string, PaymentTransaction> = new Map();

  constructor() {
    this.seedSamplePayments();
  }

  public async findById(id: string): Promise<PaymentTransaction | null> {
    return this.transactions.get(id) || null;
  }

  public async findByApplicationId(applicationId: string): Promise<PaymentTransaction[]> {
    return Array.from(this.transactions.values()).filter((t) => t.applicationId === applicationId);
  }

  public async findByReferenceNumber(ref: string): Promise<PaymentTransaction[]> {
    const clean = ref.trim().toUpperCase();
    return Array.from(this.transactions.values()).filter((t) => t.referenceNumber.toUpperCase() === clean);
  }

  public async findByGatewayRef(gatewayRef: string): Promise<PaymentTransaction | null> {
    const clean = gatewayRef.trim().toUpperCase();
    for (const t of this.transactions.values()) {
      if (t.gatewayRefNo.toUpperCase() === clean) return t;
    }
    return null;
  }

  public async findAll(limit = 100): Promise<PaymentTransaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  public async create(data: CreatePaymentDTO): Promise<PaymentTransaction> {
    const id = `txn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    const gatewayRefNo = `DRP-${randomHex}`;

    const isInstantChannel = data.channel === 'GCASH' || data.channel === 'MAYA';
    const initialStatus: PaymentStatus = isInstantChannel ? 'PAID' : data.depositSlipData ? 'PAID' : 'PENDING';

    const tx: PaymentTransaction = {
      id,
      applicationId: data.applicationId,
      referenceNumber: data.referenceNumber,
      paymentType: data.paymentType,
      channel: data.channel,
      amount: data.amount,
      currency: data.currency || 'PHP',
      status: initialStatus,
      gatewayRefNo,
      description: data.paymentType === 'APPLICATION_ASSESSMENT' 
        ? 'Admissions Assessment & Entrance Processing Fee' 
        : 'Official Matriculation & Downpayment Fee',
      payerName: data.payerName,
      payerEmail: data.payerEmail,
      payerMobile: data.payerMobile,
      depositSlipFilename: data.depositSlipFilename,
      depositSlipData: data.depositSlipData,
      paidAt: initialStatus === 'PAID' ? new Date() : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.transactions.set(id, tx);
    return tx;
  }

  public async updateStatus(id: string, status: PaymentStatus, verifiedBy?: string): Promise<PaymentTransaction | null> {
    const tx = this.transactions.get(id);
    if (!tx) return null;

    tx.status = status;
    tx.updatedAt = new Date();
    if (status === 'PAID' && !tx.paidAt) {
      tx.paidAt = new Date();
    }
    if (status === 'VERIFIED') {
      tx.verifiedAt = new Date();
      tx.verifiedBy = verifiedBy;
    }

    this.transactions.set(id, tx);
    return tx;
  }

  private seedSamplePayments() {
    // Seed verified application fee for approved candidate ENR-2026-000103
    const seededTx: PaymentTransaction = {
      id: 'txn-seed-001',
      applicationId: 'app-seed-003',
      referenceNumber: 'ENR-2026-000103',
      paymentType: 'APPLICATION_ASSESSMENT',
      channel: 'GCASH',
      amount: 500,
      currency: 'PHP',
      status: 'VERIFIED',
      gatewayRefNo: 'DRP-918234',
      description: 'Admissions Assessment & Entrance Processing Fee',
      payerName: 'Carlos Miguel Santos',
      payerEmail: 'carlos.santos@gmail.com',
      payerMobile: '+63 917 555 4321',
      paidAt: new Date(Date.now() - 3600000 * 24),
      verifiedAt: new Date(Date.now() - 3600000 * 20),
      verifiedBy: 'usr-admin-001',
      createdAt: new Date(Date.now() - 3600000 * 24),
      updatedAt: new Date(Date.now() - 3600000 * 20),
    };
    this.transactions.set(seededTx.id, seededTx);
  }
}

export const defaultPaymentRepository = new InMemoryPaymentRepository();
