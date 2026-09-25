import { SecurityUtils } from '../../../lib/security/token';
import { AdminUser, UserRole } from '../domain/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<AdminUser | null>;
  findByEmail(email: string): Promise<AdminUser | null>;
  findAll(): Promise<AdminUser[]>;
  create(user: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser>;
}

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, AdminUser> = new Map();

  constructor() {
    this.seedDefaultUsers();
  }

  public async findById(id: string): Promise<AdminUser | null> {
    return this.users.get(id) || null;
  }

  public async findByEmail(email: string): Promise<AdminUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === cleanEmail) {
        return u;
      }
    }
    return null;
  }

  public async findAll(): Promise<AdminUser[]> {
    return Array.from(this.users.values());
  }

  public async create(data: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> {
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newUser: AdminUser = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  private seedDefaultUsers() {
    const adminCreds = SecurityUtils.hashPassword('AdminPass2026!');
    const staffCreds = SecurityUtils.hashPassword('StaffPass2026!');

    const adminUser: AdminUser = {
      id: 'usr-admin-001',
      email: 'admin@stfrancis.edu',
      passwordHash: adminCreds.hash,
      passwordSalt: adminCreds.salt,
      fullName: 'Dr. Eleanor Vance (Dean of Admissions)',
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const staffUser: AdminUser = {
      id: 'usr-staff-001',
      email: 'staff@stfrancis.edu',
      passwordHash: staffCreds.hash,
      passwordSalt: staffCreds.salt,
      fullName: 'Marcus Aurel (Admissions Officer)',
      role: 'STAFF',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Also support augustine.edu aliases for compatibility
    const legacyAdmin: AdminUser = { ...adminUser, id: 'usr-admin-legacy', email: 'admin@augustine.edu' };
    const legacyStaff: AdminUser = { ...staffUser, id: 'usr-staff-legacy', email: 'staff@augustine.edu' };

    this.users.set(adminUser.id, adminUser);
    this.users.set(staffUser.id, staffUser);
    this.users.set(legacyAdmin.id, legacyAdmin);
    this.users.set(legacyStaff.id, legacyStaff);
  }
}

export const defaultUserRepository = new InMemoryUserRepository();
