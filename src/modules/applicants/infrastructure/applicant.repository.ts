import { Applicant, ApplicantInput } from '../domain/applicant.entity';

export interface IApplicantRepository {
  findById(id: string): Promise<Applicant | null>;
  findByEmail(email: string): Promise<Applicant[]>;
  create(data: ApplicantInput): Promise<Applicant>;
  update(id: string, data: Partial<ApplicantInput>): Promise<Applicant | null>;
}

export class InMemoryApplicantRepository implements IApplicantRepository {
  private applicants: Map<string, Applicant> = new Map();

  constructor() {
    this.seedDemoApplicants();
  }

  public async findById(id: string): Promise<Applicant | null> {
    return this.applicants.get(id) || null;
  }

  public async findByEmail(email: string): Promise<Applicant[]> {
    const list: Applicant[] = [];
    const clean = email.toLowerCase().trim();
    for (const a of this.applicants.values()) {
      if (a.email.toLowerCase() === clean) {
        list.push(a);
      }
    }
    return list;
  }

  public async create(data: ApplicantInput): Promise<Applicant> {
    const id = `applt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const applicant: Applicant = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.applicants.set(id, applicant);
    return applicant;
  }

  public async update(id: string, data: Partial<ApplicantInput>): Promise<Applicant | null> {
    const existing = this.applicants.get(id);
    if (!existing) return null;
    const updated: Applicant = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.applicants.set(id, updated);
    return updated;
  }

  private seedDemoApplicants() {
    const seeds: Applicant[] = [
      {
        id: 'applt-demo-001',
        firstName: 'Alexander',
        middleName: 'James',
        lastName: 'Reyes',
        dateOfBirth: '2008-04-12',
        sex: 'MALE',
        civilStatus: 'Single',
        email: 'alexander.reyes@example.com',
        mobileNumber: '+1 (555) 234-5678',
        addressStreet: '142 Emerald Boulevard',
        addressCity: 'Highland Park',
        addressProvince: 'Metro State',
        addressPostalCode: '90042',
        emergencyContactName: 'Maria Teresa Reyes',
        emergencyContactRelationship: 'Mother',
        emergencyContactPhone: '+1 (555) 234-9901',
        createdAt: new Date(Date.now() - 3600000 * 28),
        updatedAt: new Date(Date.now() - 3600000 * 28),
      },
      {
        id: 'applt-demo-002',
        firstName: 'Sophia',
        middleName: 'Marie',
        lastName: 'Santos',
        dateOfBirth: '2010-09-22',
        sex: 'FEMALE',
        civilStatus: 'Single',
        email: 'sophia.santos@example.com',
        mobileNumber: '+1 (555) 345-6789',
        addressStreet: '88 Magnolia Way',
        addressCity: 'Maplewood',
        addressProvince: 'Northern County',
        addressPostalCode: '07040',
        emergencyContactName: 'Gabriel Santos',
        emergencyContactRelationship: 'Father',
        emergencyContactPhone: '+1 (555) 345-9922',
        createdAt: new Date(Date.now() - 3600000 * 20),
        updatedAt: new Date(Date.now() - 3600000 * 20),
      },
      {
        id: 'applt-demo-003',
        firstName: 'Julian',
        middleName: 'Patrick',
        lastName: 'Cruz',
        dateOfBirth: '2005-11-03',
        sex: 'MALE',
        civilStatus: 'Single',
        email: 'julian.cruz@example.com',
        mobileNumber: '+1 (555) 456-7890',
        addressStreet: '512 Cedar Crest Drive',
        addressCity: 'Riverside',
        addressProvince: 'Western Valley',
        addressPostalCode: '92501',
        emergencyContactName: 'Elena Cruz',
        emergencyContactRelationship: 'Guardian',
        emergencyContactPhone: '+1 (555) 456-9933',
        createdAt: new Date(Date.now() - 3600000 * 50),
        updatedAt: new Date(Date.now() - 3600000 * 50),
      },
    ];

    for (const a of seeds) {
      this.applicants.set(a.id, a);
    }
  }
}

export const defaultApplicantRepository = new InMemoryApplicantRepository();
