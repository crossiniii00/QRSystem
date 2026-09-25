import { Requirement } from '../domain/requirement.entity';

export interface IRequirementRepository {
  findAll(): Promise<Requirement[]>;
  findById(id: string): Promise<Requirement | null>;
  findByCode(code: string): Promise<Requirement | null>;
  getRequirementsForProgram(programId: string): Promise<Requirement[]>;
}

export class InMemoryRequirementRepository implements IRequirementRepository {
  private requirements: Map<string, Requirement> = new Map();

  constructor() {
    this.seedRequirements();
  }

  public async findAll(): Promise<Requirement[]> {
    return Array.from(this.requirements.values());
  }

  public async findById(id: string): Promise<Requirement | null> {
    return this.requirements.get(id) || null;
  }

  public async findByCode(code: string): Promise<Requirement | null> {
    for (const req of this.requirements.values()) {
      if (req.code.toLowerCase() === code.toLowerCase()) {
        return req;
      }
    }
    return null;
  }

  public async getRequirementsForProgram(programId: string): Promise<Requirement[]> {
    return Array.from(this.requirements.values()).filter((req) => {
      if (!req.applicableProgramIds || req.applicableProgramIds.length === 0) {
        return true;
      }
      return req.applicableProgramIds.includes(programId);
    });
  }

  private seedRequirements() {
    const list: Requirement[] = [
      {
        id: 'req-birth-cert',
        code: 'BIRTH_CERTIFICATE',
        title: 'Official PSA / Certified Birth Certificate',
        description: 'Clear scanned copy or photograph of your government-registered Birth Certificate.',
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxFileSizeBytes: 5 * 1024 * 1024,
        isMandatory: true,
      },
      {
        id: 'req-report-card',
        code: 'REPORT_CARD_FORM_138',
        title: 'Official Academic Report Card / Form 138',
        description: 'Latest Grade Report Card or Certified Transcript of Records from the most recent academic year.',
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxFileSizeBytes: 5 * 1024 * 1024,
        isMandatory: true,
      },
      {
        id: 'req-good-moral',
        code: 'GOOD_MORAL_CERT',
        title: 'Certificate of Good Moral Character',
        description: 'Signed certificate from principal, guidance counselor, or dean of previous institution.',
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxFileSizeBytes: 5 * 1024 * 1024,
        isMandatory: true,
      },
      {
        id: 'req-id-photo',
        code: 'ID_PHOTO_2X2',
        title: 'Recent 2x2 Formal ID Photograph',
        description: 'Plain white background, clear frontal portrait, wearing appropriate attire.',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFileSizeBytes: 3 * 1024 * 1024,
        isMandatory: true,
      },
      {
        id: 'req-valid-id',
        code: 'STUDENT_OR_GUARDIAN_ID',
        title: 'Valid ID of Student or Parent/Guardian',
        description: 'Government ID, passport, or current school identification card.',
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxFileSizeBytes: 5 * 1024 * 1024,
        isMandatory: false,
      },
    ];

    for (const req of list) {
      this.requirements.set(req.id, req);
    }
  }
}

export const defaultRequirementRepository = new InMemoryRequirementRepository();
