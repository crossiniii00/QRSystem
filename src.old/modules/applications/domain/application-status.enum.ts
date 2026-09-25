export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  NEEDS_REVISION = 'NEEDS_REVISION',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ENROLLED = 'ENROLLED',
}

export type ApplicationStatusType = `${ApplicationStatus}`;

export const APPLICATION_STATUS_METADATA: Record<
  ApplicationStatus,
  { label: string; color: string; description: string }
> = {
  [ApplicationStatus.DRAFT]: {
    label: 'Draft',
    color: 'slate',
    description: 'Application started but not yet submitted by student.',
  },
  [ApplicationStatus.SUBMITTED]: {
    label: 'Submitted',
    color: 'blue',
    description: 'Application submitted and awaiting admissions committee review.',
  },
  [ApplicationStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    color: 'amber',
    description: 'Admissions staff is actively verifying documents and records.',
  },
  [ApplicationStatus.NEEDS_REVISION]: {
    label: 'Needs Revision',
    color: 'orange',
    description: 'Student has been requested to provide updated documents.',
  },
  [ApplicationStatus.APPROVED]: {
    label: 'Approved',
    color: 'emerald',
    description: 'Application approved for admission.',
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Rejected',
    color: 'rose',
    description: 'Application not accepted for the current academic cycle.',
  },
  [ApplicationStatus.ENROLLED]: {
    label: 'Enrolled',
    color: 'purple',
    description: 'Student is officially matriculated in the student registry.',
  },
};
