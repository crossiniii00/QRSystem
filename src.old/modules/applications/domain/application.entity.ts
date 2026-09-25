import { ApplicationStatus } from './application-status.enum';

export type ApplicantType = 'FRESHMAN' | 'TRANSFEREE' | 'RETURNEE' | 'CROSS_ENROLLEE';

export interface Application {
  id: string;
  referenceNumber: string;
  accessToken: string;
  accessTokenHash: string;
  applicantId: string;
  programId: string;
  qrCampaignId?: string;
  applicantType: ApplicantType;
  academicYear: string;
  semesterTerm: string;
  previousSchool?: string;
  previousSchoolAddress?: string;
  previousGpa?: string;
  status: ApplicationStatus;
  revisionNotes?: string;
  rejectionReason?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}
