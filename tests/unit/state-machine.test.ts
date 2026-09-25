import { describe, expect, it } from 'vitest';
import { InvalidStateTransitionError } from '../../src/lib/errors/domain-errors';
import { SecurityUtils } from '../../src/lib/security/token';
import { ApplicationStateMachine } from '../../src/modules/applications/domain/application-state-machine';
import { ApplicationStatus } from '../../src/modules/applications/domain/application-status.enum';

describe('Application Finite State Machine', () => {
  it('should allow valid transition from DRAFT to SUBMITTED when mandatory documents exist', () => {
    expect(() =>
      ApplicationStateMachine.validateTransition(
        ApplicationStatus.DRAFT,
        ApplicationStatus.SUBMITTED,
        {
          performedByRole: 'STUDENT',
          hasAllMandatoryDocuments: true,
        }
      )
    ).not.toThrow();
  });

  it('should reject submission from DRAFT if mandatory documents are missing', () => {
    expect(() =>
      ApplicationStateMachine.validateTransition(
        ApplicationStatus.DRAFT,
        ApplicationStatus.SUBMITTED,
        {
          performedByRole: 'STUDENT',
          hasAllMandatoryDocuments: false,
        }
      )
    ).toThrow(InvalidStateTransitionError);
  });

  it('should reject illegal jump from DRAFT to APPROVED', () => {
    expect(() =>
      ApplicationStateMachine.validateTransition(
        ApplicationStatus.DRAFT,
        ApplicationStatus.APPROVED,
        {
          performedByRole: 'ADMIN',
          allDocumentsVerified: true,
        }
      )
    ).toThrow(InvalidStateTransitionError);
  });

  it('should allow transition from SUBMITTED to UNDER_REVIEW by STAFF or ADMIN', () => {
    expect(() =>
      ApplicationStateMachine.validateTransition(
        ApplicationStatus.SUBMITTED,
        ApplicationStatus.UNDER_REVIEW,
        {
          performedByRole: 'STAFF',
        }
      )
    ).not.toThrow();
  });

  it('should reject transition to NEEDS_REVISION if notes are empty', () => {
    expect(() =>
      ApplicationStateMachine.validateTransition(
        ApplicationStatus.UNDER_REVIEW,
        ApplicationStatus.NEEDS_REVISION,
        {
          performedByRole: 'STAFF',
          revisionNotes: '',
        }
      )
    ).toThrow(InvalidStateTransitionError);
  });

  it('should allow transition to NEEDS_REVISION if detailed instructions are provided', () => {
    expect(() =>
      ApplicationStateMachine.validateTransition(
        ApplicationStatus.UNDER_REVIEW,
        ApplicationStatus.NEEDS_REVISION,
        {
          performedByRole: 'STAFF',
          revisionNotes: 'Please re-upload clear birth certificate.',
        }
      )
    ).not.toThrow();
  });

  it('should reject APPROVAL by STAFF (requires ADMIN)', () => {
    expect(() =>
      ApplicationStateMachine.validateTransition(
        ApplicationStatus.UNDER_REVIEW,
        ApplicationStatus.APPROVED,
        {
          performedByRole: 'STAFF',
          allDocumentsVerified: true,
        }
      )
    ).toThrow(InvalidStateTransitionError);
  });

  it('should reject APPROVAL by ADMIN if unverified documents exist', () => {
    expect(() =>
      ApplicationStateMachine.validateTransition(
        ApplicationStatus.UNDER_REVIEW,
        ApplicationStatus.APPROVED,
        {
          performedByRole: 'ADMIN',
          allDocumentsVerified: false,
        }
      )
    ).toThrow(InvalidStateTransitionError);
  });

  it('should allow APPROVAL by ADMIN when all documents are verified', () => {
    expect(() =>
      ApplicationStateMachine.validateTransition(
        ApplicationStatus.UNDER_REVIEW,
        ApplicationStatus.APPROVED,
        {
          performedByRole: 'ADMIN',
          allDocumentsVerified: true,
        }
      )
    ).not.toThrow();
  });

  it('should reject transitions out of terminal REJECTED state', () => {
    expect(
      ApplicationStateMachine.canTransition(
        ApplicationStatus.REJECTED,
        ApplicationStatus.SUBMITTED
      )
    ).toBe(false);
  });
});

describe('Reference Number and Security Generation', () => {
  it('should format predictable reference numbers with 6-digit zero padding', () => {
    const ref = SecurityUtils.formatReferenceNumber(2026, 42);
    expect(ref).toBe('ENR-2026-000042');
  });

  it('should generate high-entropy 256-bit hex tokens and hash deterministically', () => {
    const token = SecurityUtils.generateSecureToken();
    expect(token).toHaveLength(64);

    const hash1 = SecurityUtils.hashToken(token);
    const hash2 = SecurityUtils.hashToken(token);
    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
  });
});
