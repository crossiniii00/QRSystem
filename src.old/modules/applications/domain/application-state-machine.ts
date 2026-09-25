import { InvalidStateTransitionError } from '../../../lib/errors/domain-errors';
import { ApplicationStatus } from './application-status.enum';

export interface TransitionContext {
  performedByRole: 'STUDENT' | 'STAFF' | 'ADMIN' | 'SYSTEM';
  hasAllMandatoryDocuments?: boolean;
  allDocumentsVerified?: boolean;
  revisionNotes?: string;
  rejectionReason?: string;
}

export class ApplicationStateMachine {
  /**
   * Finite state machine valid transition map.
   */
  private static readonly VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
    [ApplicationStatus.DRAFT]: [ApplicationStatus.SUBMITTED],
    [ApplicationStatus.SUBMITTED]: [ApplicationStatus.UNDER_REVIEW],
    [ApplicationStatus.UNDER_REVIEW]: [
      ApplicationStatus.NEEDS_REVISION,
      ApplicationStatus.APPROVED,
      ApplicationStatus.REJECTED,
    ],
    [ApplicationStatus.NEEDS_REVISION]: [ApplicationStatus.SUBMITTED],
    [ApplicationStatus.APPROVED]: [ApplicationStatus.ENROLLED],
    [ApplicationStatus.REJECTED]: [], // Terminal state
    [ApplicationStatus.ENROLLED]: [], // Terminal state
  };

  /**
   * Checks if a transition from currentStatus to targetStatus is syntactically permitted.
   */
  public static canTransition(current: ApplicationStatus, target: ApplicationStatus): boolean {
    const allowed = this.VALID_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  /**
   * Validates and executes state transition according to business rules and role authorization.
   */
  public static validateTransition(
    current: ApplicationStatus,
    target: ApplicationStatus,
    context: TransitionContext
  ): void {
    if (!this.canTransition(current, target)) {
      throw new InvalidStateTransitionError(
        `Cannot transition application from status '${current}' to '${target}'.`,
        {
          currentStatus: current,
          targetStatus: target,
          allowedTargets: this.VALID_TRANSITIONS[current],
        }
      );
    }

    // Guard rules per target state
    switch (target) {
      case ApplicationStatus.SUBMITTED:
        if (context.hasAllMandatoryDocuments === false) {
          throw new InvalidStateTransitionError(
            'Cannot submit application: one or more mandatory documents are missing.',
            { requiredAction: 'Upload all mandatory documents' }
          );
        }
        break;

      case ApplicationStatus.UNDER_REVIEW:
        if (context.performedByRole !== 'STAFF' && context.performedByRole !== 'ADMIN' && context.performedByRole !== 'SYSTEM') {
          throw new InvalidStateTransitionError('Only staff or admin can mark application as under review.');
        }
        break;

      case ApplicationStatus.NEEDS_REVISION:
        if (context.performedByRole !== 'STAFF' && context.performedByRole !== 'ADMIN') {
          throw new InvalidStateTransitionError('Only admissions staff or admin can request revision.');
        }
        if (!context.revisionNotes || context.revisionNotes.trim().length < 5) {
          throw new InvalidStateTransitionError('Specific revision instructions are required when requesting revision.');
        }
        break;

      case ApplicationStatus.APPROVED:
        if (context.performedByRole !== 'ADMIN') {
          throw new InvalidStateTransitionError('Only administrators have authority to approve applications.');
        }
        if (context.allDocumentsVerified === false) {
          throw new InvalidStateTransitionError(
            'Cannot approve application: not all required documents have been verified by staff.'
          );
        }
        break;

      case ApplicationStatus.REJECTED:
        if (context.performedByRole !== 'ADMIN') {
          throw new InvalidStateTransitionError('Only administrators have authority to reject applications.');
        }
        if (!context.rejectionReason || context.rejectionReason.trim().length < 3) {
          throw new InvalidStateTransitionError('A formal rejection reason is required.');
        }
        break;

      case ApplicationStatus.ENROLLED:
        if (context.performedByRole !== 'ADMIN') {
          throw new InvalidStateTransitionError('Only administrators can finalize student matriculation into enrolled status.');
        }
        break;
    }
  }

  public static getAllowedNextStatuses(current: ApplicationStatus): ApplicationStatus[] {
    return this.VALID_TRANSITIONS[current] || [];
  }
}
