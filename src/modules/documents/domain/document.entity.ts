export type DocumentVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface DocumentRecord {
  id: string;
  applicationId: string;
  requirementId: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  fileHashSha256: string;
  verificationStatus: DocumentVerificationStatus;
  rejectionReason?: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  verifiedByUserId?: string;
}
