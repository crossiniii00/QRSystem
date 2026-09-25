import { NotFoundError, ValidationError } from '../../../lib/errors/domain-errors';
import { Logger } from '../../../lib/logging/logger';
import { IAuditLogRepository } from '../../audit/infrastructure/audit-log.repository';
import { AdminUser } from '../../authentication/domain/user.entity';
import { DocumentRecord, DocumentVerificationStatus } from '../domain/document.entity';
import { IDocumentRepository } from '../infrastructure/document.repository';

const logger = new Logger('VerifyDocumentUseCase');

export interface VerifyDocumentInput {
  documentId: string;
  action: 'VERIFY' | 'REJECT';
  actor: AdminUser;
  rejectionReason?: string;
}

export class VerifyDocumentUseCase {
  constructor(
    private readonly documentRepo: IDocumentRepository,
    private readonly auditLogRepo: IAuditLogRepository
  ) {}

  public async execute(input: VerifyDocumentInput): Promise<DocumentRecord> {
    const doc = await this.documentRepo.findById(input.documentId);
    if (!doc) {
      throw new NotFoundError(`Document ${input.documentId} not found.`);
    }

    let newStatus: DocumentVerificationStatus;
    let reason: string | undefined = undefined;

    if (input.action === 'VERIFY') {
      newStatus = 'VERIFIED';
    } else {
      newStatus = 'REJECTED';
      if (!input.rejectionReason || input.rejectionReason.trim().length < 3) {
        throw new ValidationError('A rejection reason is required when marking a document as rejected.');
      }
      reason = input.rejectionReason;
    }

    const updated = await this.documentRepo.update(doc.id, {
      verificationStatus: newStatus,
      rejectionReason: reason,
      verifiedAt: new Date(),
      verifiedByUserId: input.actor.id,
    });

    if (!updated) {
      throw new Error('Failed to update document status.');
    }

    await this.auditLogRepo.create({
      actorType: input.actor.role,
      actorId: input.actor.id,
      actorEmail: input.actor.email,
      action: newStatus === 'VERIFIED' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
      entityType: 'DOCUMENT',
      entityId: updated.id,
      metadata: {
        applicationId: doc.applicationId,
        requirementId: doc.requirementId,
        filename: doc.originalFilename,
        rejectionReason: reason,
      },
    });

    logger.info(`Document ${doc.id} marked as ${newStatus} by ${input.actor.email}`);
    return updated;
  }
}
