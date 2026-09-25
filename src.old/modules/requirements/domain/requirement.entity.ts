export interface Requirement {
  id: string;
  code: string;
  title: string;
  description: string;
  allowedMimeTypes: string[];
  maxFileSizeBytes: number;
  isMandatory: boolean;
  applicableProgramIds?: string[]; // Empty means applicable to all programs
}
