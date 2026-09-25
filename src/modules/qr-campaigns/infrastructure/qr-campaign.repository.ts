import { QRCampaign } from '../domain/qr-campaign.entity';

export interface IQRCampaignRepository {
  findAll(): Promise<QRCampaign[]>;
  findById(id: string): Promise<QRCampaign | null>;
  findByCode(code: string): Promise<QRCampaign | null>;
  create(campaign: Omit<QRCampaign, 'id' | 'scanCount' | 'createdAt' | 'updatedAt'>): Promise<QRCampaign>;
  incrementScanCount(id: string): Promise<void>;
  update(id: string, updates: Partial<QRCampaign>): Promise<QRCampaign | null>;
}

export class InMemoryQRCampaignRepository implements IQRCampaignRepository {
  private campaigns: Map<string, QRCampaign> = new Map();

  constructor() {
    this.seedCampaigns();
  }

  public async findAll(): Promise<QRCampaign[]> {
    return Array.from(this.campaigns.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  public async findById(id: string): Promise<QRCampaign | null> {
    return this.campaigns.get(id) || null;
  }

  public async findByCode(code: string): Promise<QRCampaign | null> {
    const cleanCode = code.trim().toLowerCase();
    for (const c of this.campaigns.values()) {
      if (c.code.toLowerCase() === cleanCode) {
        return c;
      }
    }
    return null;
  }

  public async create(
    data: Omit<QRCampaign, 'id' | 'scanCount' | 'createdAt' | 'updatedAt'>
  ): Promise<QRCampaign> {
    const id = `qr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newCamp: QRCampaign = {
      ...data,
      id,
      scanCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.campaigns.set(id, newCamp);
    return newCamp;
  }

  public async incrementScanCount(id: string): Promise<void> {
    const camp = this.campaigns.get(id);
    if (camp) {
      camp.scanCount += 1;
      camp.updatedAt = new Date();
    }
  }

  public async update(id: string, updates: Partial<QRCampaign>): Promise<QRCampaign | null> {
    const camp = this.campaigns.get(id);
    if (!camp) return null;
    const updated = { ...camp, ...updates, updatedAt: new Date() };
    this.campaigns.set(id, updated);
    return updated;
  }

  private seedCampaigns() {
    const seeds: Omit<QRCampaign, 'createdAt' | 'updatedAt'>[] = [
      {
        id: 'camp-main-2026',
        code: '2026-enrollment',
        name: 'Official Campus Posters & Entrance Banners',
        description: 'Main admissions QR code displayed at the school entrance and front lobby desk.',
        destinationPath: '/apply',
        scanCount: 42,
        isActive: true,
      },
      {
        id: 'camp-shs-booth',
        code: 'shs',
        name: 'Senior High School Admissions Fair Booth',
        description: 'Promotional QR flyers handed out at junior high school transition open houses.',
        destinationPath: '/apply?level=K12_SHS',
        defaultProgramId: 'prog-shs-stem',
        scanCount: 28,
        isActive: true,
      },
      {
        id: 'camp-college-caravan',
        code: 'college',
        name: 'College Caravan & Social Media Promo',
        description: 'Instagram/Facebook digital campaign targeting incoming college freshmen.',
        destinationPath: '/apply?level=COLLEGE',
        defaultProgramId: 'prog-bscs',
        scanCount: 65,
        isActive: true,
      },
      {
        id: 'camp-campus-main',
        code: 'campus-main',
        name: 'Registrar Front Desk Kiosk',
        description: 'Placed at the registrar customer service counter for walk-in applicants.',
        destinationPath: '/apply',
        scanCount: 19,
        isActive: true,
      },
    ];

    for (const c of seeds) {
      this.campaigns.set(c.id, {
        ...c,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}

export const defaultQRCampaignRepository = new InMemoryQRCampaignRepository();
