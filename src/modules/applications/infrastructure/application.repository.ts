import { SecurityUtils } from '../../../lib/security/token';
import { ApplicationStatus } from '../domain/application-status.enum';
import { Application } from '../domain/application.entity';

export interface ApplicationFilterOptions {
  status?: ApplicationStatus;
  programId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface IApplicationRepository {
  findById(id: string): Promise<Application | null>;
  findByReferenceNumber(referenceNumber: string): Promise<Application | null>;
  findByTokenHash(tokenHash: string): Promise<Application | null>;
  findByApplicantId(applicantId: string): Promise<Application[]>;
  findAll(options?: ApplicationFilterOptions): Promise<{ applications: Application[]; total: number }>;
  countByStatus(): Promise<Record<ApplicationStatus, number>>;
  create(data: Omit<Application, 'id' | 'referenceNumber' | 'accessToken' | 'accessTokenHash' | 'createdAt' | 'updatedAt'> & {
    customToken?: string;
  }): Promise<{ application: Application; plainToken: string }>;
  update(id: string, updates: Partial<Application>): Promise<Application | null>;
}

export class InMemoryApplicationRepository implements IApplicationRepository {
  private applications: Map<string, Application> = new Map();
  private sequenceCounter = 101;

  constructor() {
    this.seedRealisticApplications();
  }

  public async findById(id: string): Promise<Application | null> {
    return this.applications.get(id) || null;
  }

  public async findByReferenceNumber(referenceNumber: string): Promise<Application | null> {
    const clean = referenceNumber.trim().toUpperCase();
    for (const app of this.applications.values()) {
      if (app.referenceNumber.toUpperCase() === clean) {
        return app;
      }
    }
    return null;
  }

  public async findByTokenHash(tokenHash: string): Promise<Application | null> {
    for (const app of this.applications.values()) {
      if (app.accessTokenHash === tokenHash) {
        return app;
      }
    }
    return null;
  }

  public async findByApplicantId(applicantId: string): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (a) => a.applicantId === applicantId
    );
  }

  public async findAll(
    options: ApplicationFilterOptions = {}
  ): Promise<{ applications: Application[]; total: number }> {
    let list = Array.from(this.applications.values());

    if (options.status) {
      list = list.filter((a) => a.status === options.status);
    }

    if (options.programId) {
      list = list.filter((a) => a.programId === options.programId);
    }

    if (options.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter((a) => a.referenceNumber.toLowerCase().includes(q));
    }

    // Sort by created/submitted desc
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = list.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    const paginated = list.slice(offset, offset + limit);

    return { applications: paginated, total };
  }

  public async countByStatus(): Promise<Record<ApplicationStatus, number>> {
    const counts: Record<ApplicationStatus, number> = {
      [ApplicationStatus.DRAFT]: 0,
      [ApplicationStatus.SUBMITTED]: 0,
      [ApplicationStatus.UNDER_REVIEW]: 0,
      [ApplicationStatus.NEEDS_REVISION]: 0,
      [ApplicationStatus.APPROVED]: 0,
      [ApplicationStatus.REJECTED]: 0,
      [ApplicationStatus.ENROLLED]: 0,
    };

    for (const app of this.applications.values()) {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    }

    return counts;
  }

  public async create(
    data: Omit<Application, 'id' | 'referenceNumber' | 'accessToken' | 'accessTokenHash' | 'createdAt' | 'updatedAt'> & {
      customToken?: string;
    }
  ): Promise<{ application: Application; plainToken: string }> {
    const id = `appl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const referenceNumber = SecurityUtils.formatReferenceNumber(2026, this.sequenceCounter++);
    const plainToken = data.customToken || SecurityUtils.generateSecureToken();
    const accessTokenHash = SecurityUtils.hashToken(plainToken);

    const newApp: Application = {
      ...data,
      id,
      referenceNumber,
      accessToken: plainToken,
      accessTokenHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.applications.set(id, newApp);
    return { application: newApp, plainToken };
  }

  public async update(id: string, updates: Partial<Application>): Promise<Application | null> {
    const app = this.applications.get(id);
    if (!app) return null;
    const updated: Application = {
      ...app,
      ...updates,
      updatedAt: new Date(),
    };
    this.applications.set(id, updated);
    return updated;
  }

  private seedRealisticApplications() {
    // We'll populate some realistic seed applications in development
    const sampleToken1 = 'sample-demo-token-applicant-001';
    const app1: Application = {
      id: 'appl-demo-001',
      referenceNumber: 'ENR-2026-000101',
      accessToken: sampleToken1,
      accessTokenHash: SecurityUtils.hashToken(sampleToken1),
      applicantId: 'applt-demo-001',
      programId: 'prog-bscs',
      qrCampaignId: 'camp-college-caravan',
      applicantType: 'FRESHMAN',
      academicYear: '2026-2027',
      semesterTerm: '1st Semester',
      previousSchool: 'North Valley Science High School',
      previousSchoolAddress: 'Metro Science District',
      previousGpa: '94.5',
      status: ApplicationStatus.UNDER_REVIEW,
      submittedAt: new Date(Date.now() - 3600000 * 24),
      createdAt: new Date(Date.now() - 3600000 * 28),
      updatedAt: new Date(Date.now() - 3600000 * 2),
    };

    const sampleToken2 = 'sample-demo-token-applicant-002';
    const app2: Application = {
      id: 'appl-demo-002',
      referenceNumber: 'ENR-2026-000102',
      accessToken: sampleToken2,
      accessTokenHash: SecurityUtils.hashToken(sampleToken2),
      applicantId: 'applt-demo-002',
      programId: 'prog-shs-stem',
      qrCampaignId: 'camp-shs-booth',
      applicantType: 'FRESHMAN',
      academicYear: '2026-2027',
      semesterTerm: '1st Semester',
      previousSchool: 'Saint Jude Memorial Academy',
      previousSchoolAddress: 'East Sector',
      previousGpa: '91.0',
      status: ApplicationStatus.NEEDS_REVISION,
      revisionNotes: 'The submitted birth certificate photograph is blurry and partially cropped. Please upload a clear scanned copy of the official PSA certified copy.',
      submittedAt: new Date(Date.now() - 3600000 * 18),
      createdAt: new Date(Date.now() - 3600000 * 20),
      updatedAt: new Date(Date.now() - 3600000 * 5),
    };

    const sampleToken3 = 'sample-demo-token-applicant-003';
    const app3: Application = {
      id: 'appl-demo-003',
      referenceNumber: 'ENR-2026-000103',
      accessToken: sampleToken3,
      accessTokenHash: SecurityUtils.hashToken(sampleToken3),
      applicantId: 'applt-demo-003',
      programId: 'prog-bsn',
      qrCampaignId: 'camp-main-2026',
      applicantType: 'TRANSFEREE',
      academicYear: '2026-2027',
      semesterTerm: '1st Semester',
      previousSchool: 'Metropolitan Health Sciences College',
      previousSchoolAddress: 'Downtown Medical Row',
      previousGpa: '95.2',
      status: ApplicationStatus.APPROVED,
      submittedAt: new Date(Date.now() - 3600000 * 48),
      reviewedAt: new Date(Date.now() - 3600000 * 6),
      reviewedByUserId: 'usr-admin-001',
      createdAt: new Date(Date.now() - 3600000 * 50),
      updatedAt: new Date(Date.now() - 3600000 * 6),
    };

    this.applications.set(app1.id, app1);
    this.applications.set(app2.id, app2);
    this.applications.set(app3.id, app3);
  }
}

export const defaultApplicationRepository = new InMemoryApplicationRepository();
