import { DocumentRecord } from '../domain/document.entity';

export interface IDocumentRepository {
  findById(id: string): Promise<DocumentRecord | null>;
  findByApplicationId(applicationId: string): Promise<DocumentRecord[]>;
  findByRequirement(applicationId: string, requirementId: string): Promise<DocumentRecord | null>;
  create(doc: Omit<DocumentRecord, 'id' | 'uploadedAt'>): Promise<DocumentRecord>;
  update(id: string, updates: Partial<DocumentRecord>): Promise<DocumentRecord | null>;
  delete(id: string): Promise<boolean>;
  deleteByApplicationId(applicationId: string): Promise<number>;
}

export class InMemoryDocumentRepository implements IDocumentRepository {
  private documents: Map<string, DocumentRecord> = new Map();

  constructor() {
    this.seedDemoDocuments();
  }

  public async findById(id: string): Promise<DocumentRecord | null> {
    return this.documents.get(id) || null;
  }

  public async findByApplicationId(applicationId: string): Promise<DocumentRecord[]> {
    return Array.from(this.documents.values()).filter(
      (d) => d.applicationId === applicationId
    );
  }

  public async findByRequirement(
    applicationId: string,
    requirementId: string
  ): Promise<DocumentRecord | null> {
    for (const d of this.documents.values()) {
      if (d.applicationId === applicationId && d.requirementId === requirementId) {
        return d;
      }
    }
    return null;
  }

  public async create(data: Omit<DocumentRecord, 'id' | 'uploadedAt'>): Promise<DocumentRecord> {
    // If an existing document exists for this requirement, replace it
    const existing = await this.findByRequirement(data.applicationId, data.requirementId);
    if (existing) {
      this.documents.delete(existing.id);
    }

    const id = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newDoc: DocumentRecord = {
      ...data,
      id,
      uploadedAt: new Date(),
    };
    this.documents.set(id, newDoc);
    return newDoc;
  }

  public async update(id: string, updates: Partial<DocumentRecord>): Promise<DocumentRecord | null> {
    const doc = this.documents.get(id);
    if (!doc) return null;
    const updated = { ...doc, ...updates };
    this.documents.set(id, updated);
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  public async deleteByApplicationId(applicationId: string): Promise<number> {
    let count = 0;
    for (const [id, doc] of this.documents.entries()) {
      if (doc.applicationId === applicationId) {
        this.documents.delete(id);
        count++;
      }
    }
    return count;
  }

  private seedDemoDocuments() {
    const seeds: DocumentRecord[] = [
      {
        id: 'doc-demo-001',
        applicationId: 'appl-demo-001',
        requirementId: 'req-birth-cert',
        storageKey: 'documents/2026/birth-cert-reyes.pdf',
        originalFilename: 'PSA_Birth_Certificate_Reyes.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 1024 * 720,
        fileHashSha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        verificationStatus: 'PENDING',
        uploadedAt: new Date(Date.now() - 3600000 * 25),
      },
      {
        id: 'doc-demo-002',
        applicationId: 'appl-demo-001',
        requirementId: 'req-report-card',
        storageKey: 'documents/2026/report-card-reyes.pdf',
        originalFilename: 'Form138_Gr12_Final_Reyes.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 1024 * 950,
        fileHashSha256: 'b2c3d4e5f6a17890123456789abcdef0123456789abcdef0123456789abcdef1',
        verificationStatus: 'PENDING',
        uploadedAt: new Date(Date.now() - 3600000 * 25),
      },
      {
        id: 'doc-demo-003',
        applicationId: 'appl-demo-001',
        requirementId: 'req-good-moral',
        storageKey: 'documents/2026/good-moral-reyes.pdf',
        originalFilename: 'Good_Moral_Certificate_NorthValley.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 1024 * 480,
        fileHashSha256: 'c3d4e5f6a1b27890123456789abcdef0123456789abcdef0123456789abcdef2',
        verificationStatus: 'PENDING',
        uploadedAt: new Date(Date.now() - 3600000 * 25),
      },
      {
        id: 'doc-demo-004',
        applicationId: 'appl-demo-001',
        requirementId: 'req-id-photo',
        storageKey: 'documents/2026/photo-reyes.jpg',
        originalFilename: '2x2_Formal_Photo_Alexander.jpg',
        mimeType: 'image/jpeg',
        fileSizeBytes: 1024 * 310,
        fileHashSha256: 'd4e5f6a1b2c37890123456789abcdef0123456789abcdef0123456789abcdef3',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(Date.now() - 3600000 * 2),
        verifiedByUserId: 'usr-staff-001',
        uploadedAt: new Date(Date.now() - 3600000 * 25),
      },
      {
        id: 'doc-demo-005',
        applicationId: 'appl-demo-002',
        requirementId: 'req-birth-cert',
        storageKey: 'documents/2026/birth-cert-santos.jpg',
        originalFilename: 'IMG_20260901_BirthCert_Photo.jpg',
        mimeType: 'image/jpeg',
        fileSizeBytes: 1024 * 820,
        fileHashSha256: 'e5f6a1b2c3d47890123456789abcdef0123456789abcdef0123456789abcdef4',
        verificationStatus: 'REJECTED',
        rejectionReason: 'The photograph is blurry, partially cut off at the registry seal, and difficult to read. Please provide an official high-resolution scan.',
        verifiedAt: new Date(Date.now() - 3600000 * 5),
        verifiedByUserId: 'usr-staff-001',
        uploadedAt: new Date(Date.now() - 3600000 * 19),
      },
      {
        id: 'doc-demo-006',
        applicationId: 'appl-demo-002',
        requirementId: 'req-report-card',
        storageKey: 'documents/2026/report-card-santos.pdf',
        originalFilename: 'Saint_Jude_Grade10_Card.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 1024 * 650,
        fileHashSha256: 'f6a1b2c3d4e57890123456789abcdef0123456789abcdef0123456789abcdef5',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(Date.now() - 3600000 * 5),
        verifiedByUserId: 'usr-staff-001',
        uploadedAt: new Date(Date.now() - 3600000 * 19),
      },
      {
        id: 'doc-demo-007',
        applicationId: 'appl-demo-003',
        requirementId: 'req-birth-cert',
        storageKey: 'documents/2026/birth-cert-cruz.pdf',
        originalFilename: 'PSA_Official_JulianCruz.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 1024 * 790,
        fileHashSha256: 'a2b3c4d5e6f77890123456789abcdef0123456789abcdef0123456789abcdef6',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(Date.now() - 3600000 * 6),
        verifiedByUserId: 'usr-admin-001',
        uploadedAt: new Date(Date.now() - 3600000 * 49),
      },
    ];

    for (const d of seeds) {
      this.documents.set(d.id, d);
    }
  }
}

export const defaultDocumentRepository = new InMemoryDocumentRepository();
