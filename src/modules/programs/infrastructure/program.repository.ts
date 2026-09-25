import { Program } from '../domain/program.entity';

export interface IProgramRepository {
  findAll(activeOnly?: boolean): Promise<Program[]>;
  findById(id: string): Promise<Program | null>;
  findByCode(code: string): Promise<Program | null>;
  create(program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<Program>;
}

export class InMemoryProgramRepository implements IProgramRepository {
  private programs: Map<string, Program> = new Map();

  constructor() {
    this.seedDefaultPrograms();
  }

  public async findAll(activeOnly = true): Promise<Program[]> {
    const list = Array.from(this.programs.values());
    if (activeOnly) {
      return list.filter((p) => p.isActive);
    }
    return list;
  }

  public async findById(id: string): Promise<Program | null> {
    return this.programs.get(id) || null;
  }

  public async findByCode(code: string): Promise<Program | null> {
    for (const p of this.programs.values()) {
      if (p.code.toLowerCase() === code.toLowerCase()) {
        return p;
      }
    }
    return null;
  }

  public async create(data: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<Program> {
    const id = `prog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newProg: Program = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.programs.set(id, newProg);
    return newProg;
  }

  private seedDefaultPrograms() {
    const seed: Omit<Program, 'createdAt' | 'updatedAt'>[] = [
      {
        id: 'prog-shs-stem',
        code: 'SHS-STEM',
        name: 'Senior High School: STEM Strand (Science, Technology, Engineering, Mathematics)',
        description: 'Rigorous preparatory curriculum for careers in computer science, software engineering, medicine, and pure sciences.',
        department: 'Basic Education & Senior High School',
        academicLevel: 'K12_SHS',
        isActive: true,
      },
      {
        id: 'prog-shs-abm',
        code: 'SHS-ABM',
        name: 'Senior High School: ABM Strand (Accountancy, Business & Management)',
        description: 'Comprehensive business foundations covering financial accounting, entrepreneurship, and economics.',
        department: 'Basic Education & Senior High School',
        academicLevel: 'K12_SHS',
        isActive: true,
      },
      {
        id: 'prog-shs-humss',
        code: 'SHS-HUMSS',
        name: 'Senior High School: HUMSS Strand (Humanities & Social Sciences)',
        description: 'Focus on communication, public governance, psychology, pre-law, and sociological discourse.',
        department: 'Basic Education & Senior High School',
        academicLevel: 'K12_SHS',
        isActive: true,
      },
      {
        id: 'prog-bscs',
        code: 'BSCS',
        name: 'Bachelor of Science in Computer Science',
        description: 'Accredited undergraduate degree specializing in algorithms, full-stack systems engineering, and AI.',
        department: 'College of Computing & Information Technologies',
        academicLevel: 'COLLEGE',
        isActive: true,
      },
      {
        id: 'prog-bsba',
        code: 'BSBA-MKTG',
        name: 'Bachelor of Science in Business Administration (Digital Marketing)',
        description: 'Modern commerce, brand strategy, e-business analytics, and modern leadership.',
        department: 'College of Business & Management',
        academicLevel: 'COLLEGE',
        isActive: true,
      },
      {
        id: 'prog-bsn',
        code: 'BSN',
        name: 'Bachelor of Science in Nursing',
        description: 'High-standard healthcare training with clinical simulation and hospital rotations.',
        department: 'College of Nursing & Allied Health',
        academicLevel: 'COLLEGE',
        isActive: true,
      },
    ];

    for (const item of seed) {
      this.programs.set(item.id, {
        ...item,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}

export const defaultProgramRepository = new InMemoryProgramRepository();
