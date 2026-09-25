import { FileUploadError, NotFoundError, UnauthorizedError, ValidationError } from '../../../lib/errors/domain-errors';
import { Logger } from '../../../lib/logging/logger';
import { SecurityUtils } from '../../../lib/security/token';
import { IStorageService } from '../../../lib/storage/storage.service';
import { ApplicationStatus } from '../../applications/domain/application-status.enum';
import { IApplicationRepository } from '../../applications/infrastructure/application.repository';
import { IAuditLogRepository } from '../../audit/infrastructure/audit-log.repository';
import { IRequirementRepository } from '../../requirements/infrastructure/requirement.repository';
import { DocumentRecord } from '../domain/document.entity';
import { IDocumentRepository } from '../infrastructure/document.repository';

const logger = new Logger('UploadDocumentUseCase');

export interface UploadDocumentInput {
  applicationId: string;
  accessToken: string;
  requirementId: string;
  filename: string;
  mimeType: string;
  fileBuffer: Buffer;
}

export class UploadDocumentUseCase {
  constructor(
    private readonly applicationRepo: IApplicationRepository,
    private readonly requirementRepo: IRequirementRepository,
    private readonly documentRepo: IDocumentRepository,
    private readonly storageService: IStorageService,
    private readonly auditLogRepo: IAuditLogRepository
  ) {}

  public async execute(input: UploadDocumentInput): Promise<DocumentRecord> {
    const app = await this.applicationRepo.findById(input.applicationId);
    if (!app) {
      throw new NotFoundError(`Application ${input.applicationId} not found.`);
    }

    // Verify token
    const tokenHash = SecurityUtils.hashToken(input.accessToken);
    if (app.accessTokenHash !== tokenHash) {
      throw new UnauthorizedError('Unauthorized access to application documents.');
    }

    // Only allow document upload in DRAFT or NEEDS_REVISION
    if (
      app.status !== ApplicationStatus.DRAFT &&
      app.status !== ApplicationStatus.NEEDS_REVISION
    ) {
      throw new ValidationError(
        `Documents cannot be uploaded while application status is '${app.status}'. Uploads are only permitted in DRAFT or NEEDS_REVISION.`
      );
    }

    // Verify requirement
    const requirement = await this.requirementRepo.findById(input.requirementId);
    if (!requirement) {
      throw new NotFoundError(`Requirement ${input.requirementId} not found.`);
    }

    // Validate size
    if (input.fileBuffer.length > requirement.maxFileSizeBytes) {
      const maxMb = (requirement.maxFileSizeBytes / (1024 * 1024)).toFixed(1);
      throw new FileUploadError(`File size exceeds the allowed limit of ${maxMb}MB.`);
    }

    // Validate MIME type with normalization
    const normalizedMime = input.mimeType.toLowerCase().replace('image/jpg', 'image/jpeg');
    const isMimeAllowed = requirement.allowedMimeTypes.some((m) => {
      const allowed = m.toLowerCase();
      return (
        normalizedMime === allowed ||
        (allowed === 'image/jpeg' && (normalizedMime === 'image/jpeg' || normalizedMime === 'image/jpg')) ||
        normalizedMime.includes(allowed) ||
        allowed.includes(normalizedMime)
      );
    });
    if (!isMimeAllowed) {
      throw new FileUploadError(
        `Invalid file type (${input.mimeType}) for ${requirement.title}. Allowed formats: ${requirement.allowedMimeTypes.join(', ')}`
      );
    }

    // Upload to private object storage
    const stored = await this.storageService.upload(
      input.fileBuffer,
      input.filename,
      input.mimeType
    );

    // Persist document record
    const documentRecord = await this.documentRepo.create({
      applicationId: app.id,
      requirementId: requirement.id,
      storageKey: stored.storageKey,
      originalFilename: input.filename,
      mimeType: input.mimeType,
      fileSizeBytes: stored.sizeBytes,
      fileHashSha256: stored.sha256,
      verificationStatus: 'PENDING',
    });

    // Audit log
    await this.auditLogRepo.create({
      actorType: 'STUDENT',
      actorId: app.applicantId,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'DOCUMENT',
      entityId: documentRecord.id,
      metadata: {
        requirementCode: requirement.code,
        filename: input.filename,
        fileSizeBytes: stored.sizeBytes,
      },
    });

    logger.info(`Uploaded document for ${requirement.code} on application ${app.referenceNumber}`);
    return documentRecord;
  }
}
