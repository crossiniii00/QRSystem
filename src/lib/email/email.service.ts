import { Logger } from '../logging/logger';

const logger = new Logger('EmailNotificationService');

export interface EmailParams {
  recipientEmail: string;
  recipientName: string;
  referenceNumber: string;
  magicLinkUrl: string;
  programName: string;
  notes?: string;
}

export interface SentEmailRecord {
  id: string;
  recipientEmail: string;
  subject: string;
  htmlContent: string;
  sentAt: Date;
  status: 'SENT' | 'FAILED';
}

export interface IEmailNotificationService {
  sendApplicationSubmitted(params: EmailParams): Promise<boolean>;
  sendRevisionRequested(params: EmailParams & { revisionNotes: string }): Promise<boolean>;
  sendApplicationApproved(params: EmailParams): Promise<boolean>;
  sendApplicationRejected(params: EmailParams & { reason: string }): Promise<boolean>;
  getSentEmails(recipientEmail?: string): SentEmailRecord[];
}

export class ResendEmailNotificationService implements IEmailNotificationService {
  private sentEmailsHistory: SentEmailRecord[] = [];

  constructor(private readonly apiKey?: string) {}

  public async sendApplicationSubmitted(params: EmailParams): Promise<boolean> {
    const subject = `Application Received — Ref: ${params.referenceNumber}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid #D8CEBE; background-color: #ffffff;">
        <div style="height: 4px; background: linear-gradient(to right, #D97706, #F59E0B); margin: -24px -24px 20px -24px;"></div>
        <h2 style="color: #2E2016; margin-top: 0; text-transform: uppercase; letter-spacing: 0.5px;">Enrollment Application Received</h2>
        <p>Dear ${params.recipientName},</p>
        <p>Thank you for submitting your enrollment application for <strong>${params.programName}</strong> at St. Francis College.</p>
        <div style="background-color: #FAF6EE; border-left: 4px solid #D97706; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #855D1E;">Your Official Reference Number:</p>
          <p style="margin: 4px 0 0 0; font-size: 22px; font-weight: 900; color: #2E2016; font-family: monospace; letter-spacing: 1px;">${params.referenceNumber}</p>
        </div>
        <p>Our Admissions and Records Committee has received your uploaded documents and will begin evaluation shortly.</p>
        <p>You can track the live progress of your application at any time using your secure link below:</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${params.magicLinkUrl}" style="background-color: #382B20; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; display: inline-block; border: 1px solid #D97706;">Check Application Status</a>
        </p>
        <hr style="border: none; border-top: 1px solid #EBE3D5; margin: 24px 0;" />
        <p style="font-size: 11px; color: #7A6A59;">Please keep this email for your records. If you did not initiate this application, please contact admissions@stfrancis.edu immediately.</p>
      </div>
    `;

    return this.recordEmail(params.recipientEmail, subject, html);
  }

  public async sendRevisionRequested(params: EmailParams & { revisionNotes: string }): Promise<boolean> {
    const subject = `Action Required: Document Revision Needed for Application ${params.referenceNumber}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid #D8CEBE; background-color: #ffffff;">
        <div style="height: 4px; background: #D97706; margin: -24px -24px 20px -24px;"></div>
        <h2 style="color: #92400e; margin-top: 0; text-transform: uppercase;">Document Revision Requested</h2>
        <p>Dear ${params.recipientName},</p>
        <p>The Admissions Committee at St. Francis College has reviewed your application (<strong>${params.referenceNumber}</strong>) for <strong>${params.programName}</strong>.</p>
        <div style="background-color: #FEF9C3; border-left: 4px solid #D97706; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #854D0E; text-transform: uppercase; font-size: 11px;">Instructions from Admissions Officer:</p>
          <p style="margin: 8px 0 0 0; color: #713F12;">${params.revisionNotes}</p>
        </div>
        <p>Please log in using the secure link below to re-upload the required document(s) so we can proceed with your enrollment:</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${params.magicLinkUrl}" style="background-color: #D97706; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; display: inline-block;">Update Application Documents</a>
        </p>
      </div>
    `;

    return this.recordEmail(params.recipientEmail, subject, html);
  }

  public async sendApplicationApproved(params: EmailParams): Promise<boolean> {
    const subject = `Congratulations! Application Approved — ${params.referenceNumber}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid #D8CEBE; background-color: #ffffff;">
        <div style="height: 4px; background: #16A34A; margin: -24px -24px 20px -24px;"></div>
        <h2 style="color: #15803d; margin-top: 0; text-transform: uppercase;">Congratulations on Your Admission!</h2>
        <p>Dear ${params.recipientName},</p>
        <p>We are thrilled to inform you that your application (<strong>${params.referenceNumber}</strong>) for <strong>${params.programName}</strong> has been officially <strong>APPROVED</strong>!</p>
        <p>Welcome to St. Francis College. Our registrar will contact you with enrollment orientation schedules and student portal setup.</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${params.magicLinkUrl}" style="background-color: #15803d; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; display: inline-block;">View Admission Slip</a>
        </p>
      </div>
    `;

    return this.recordEmail(params.recipientEmail, subject, html);
  }

  public async sendApplicationRejected(params: EmailParams & { reason: string }): Promise<boolean> {
    const subject = `Enrollment Application Update — ${params.referenceNumber}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid #D8CEBE; background-color: #ffffff;">
        <div style="height: 4px; background: #DC2626; margin: -24px -24px 20px -24px;"></div>
        <h2 style="color: #374151; margin-top: 0; text-transform: uppercase;">Application Status Update</h2>
        <p>Dear ${params.recipientName},</p>
        <p>Thank you for your interest in St. Francis College. After careful evaluation of your application (<strong>${params.referenceNumber}</strong>) for <strong>${params.programName}</strong>, we regret to inform you that we are unable to offer admission at this time.</p>
        <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #991B1B;"><strong>Reason:</strong> ${params.reason}</p>
        </div>
        <p>We appreciate the time you took to apply and wish you every success in your academic journey.</p>
      </div>
    `;

    return this.recordEmail(params.recipientEmail, subject, html);
  }

  public getSentEmails(recipientEmail?: string): SentEmailRecord[] {
    if (!recipientEmail) {
      return [...this.sentEmailsHistory];
    }
    return this.sentEmailsHistory.filter((e) => e.recipientEmail.toLowerCase() === recipientEmail.toLowerCase());
  }

  private async recordEmail(recipientEmail: string, subject: string, htmlContent: string): Promise<boolean> {
    const record: SentEmailRecord = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      recipientEmail,
      subject,
      htmlContent,
      sentAt: new Date(),
      status: 'SENT',
    };

    this.sentEmailsHistory.unshift(record);
    logger.info(`Transactional email sent to ${recipientEmail}: "${subject}"`);
    return true;
  }
}

export const defaultEmailService = new ResendEmailNotificationService();
