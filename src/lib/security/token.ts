import crypto from 'crypto';

export class SecurityUtils {
  /**
   * Generates a cryptographically strong 256-bit random hex string.
   */
  public static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hashes a raw token with SHA-256 for persistent safe storage.
   */
  public static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Hashes a password with salt.
   */
  public static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const activeSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, activeSalt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: activeSalt };
  }

  /**
   * Verifies a password against hash and salt.
   */
  public static verifyPassword(password: string, storedHash: string, salt: string): boolean {
    const { hash } = this.hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
  }

  /**
   * Formats a human-readable unique reference number.
   * e.g. ENR-2026-000101
   */
  public static formatReferenceNumber(year: number, sequenceNumber: number): string {
    const padded = String(sequenceNumber).padStart(6, '0');
    return `ENR-${year}-${padded}`;
  }
}
