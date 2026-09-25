export interface QRCampaign {
  id: string;
  code: string;
  name: string;
  description?: string;
  destinationPath: string;
  defaultProgramId?: string;
  scanCount: number;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
