export type UserRole = 'ADMIN' | 'STAFF';

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
