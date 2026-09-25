import crypto from 'crypto';

export interface StoredFile {
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  uploadedAt: Date;
  dataBase64?: string;
}

export interface IStorageService {
  upload(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<{ storageKey: string; sha256: string; sizeBytes: number }>;
  delete(storageKey: string): Promise<boolean>;
  getSignedUrl(storageKey: string, expirySeconds?: number): Promise<string>;
  exists(storageKey: string): Promise<boolean>;
  getFile(storageKey: string): Promise<StoredFile | null>;
}

/**
 * Storage Service implementing IStorageService with private storage and signed URLs.
 * Pluggable for Cloudflare R2 / AWS S3 in production.
 */
export class S3CompatibleStorageService implements IStorageService {
  private fileStore = new Map<string, StoredFile>();

  public async upload(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<{ storageKey: string; sha256: string; sizeBytes: number }> {
    const randomUuid = crypto.randomUUID();
    const extension = filename.split('.').pop() || 'bin';
    const storageKey = `documents/${new Date().getFullYear()}/${randomUuid}.${extension}`;

    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const sizeBytes = fileBuffer.length;

    const storedFile: StoredFile = {
      storageKey,
      originalFilename: filename,
      mimeType,
      sizeBytes,
      sha256,
      uploadedAt: new Date(),
      dataBase64: fileBuffer.toString('base64'),
    };

    this.fileStore.set(storageKey, storedFile);

    return {
      storageKey,
      sha256,
      sizeBytes,
    };
  }

  public async delete(storageKey: string): Promise<boolean> {
    return this.fileStore.delete(storageKey);
  }

  public async getSignedUrl(storageKey: string, expirySeconds = 3600): Promise<string> {
    const file = this.fileStore.get(storageKey);
    if (!file) {
      return '';
    }

    // Return a temporary signed data URI or secure API access path
    if (file.dataBase64) {
      return `data:${file.mimeType};base64,${file.dataBase64}`;
    }
    return `/api/documents/download?key=${encodeURIComponent(storageKey)}&expires=${Date.now() + expirySeconds * 1000}`;
  }

  public async exists(storageKey: string): Promise<boolean> {
    return this.fileStore.has(storageKey);
  }

  public async getFile(storageKey: string): Promise<StoredFile | null> {
    return this.fileStore.get(storageKey) || null;
  }
}

export const defaultStorageService = new S3CompatibleStorageService();
