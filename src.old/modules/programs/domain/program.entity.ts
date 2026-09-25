export type AcademicLevel = 'K12_SHS' | 'COLLEGE' | 'TVET' | 'GRADUATE';

export interface Program {
  id: string;
  code: string;
  name: string;
  description: string;
  department: string;
  academicLevel: AcademicLevel;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
