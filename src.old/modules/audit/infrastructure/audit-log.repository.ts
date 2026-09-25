import { AuditLog } from '../domain/audit-log.entity';

export interface IAuditLogRepository {
  create(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  findAll(limit?: number): Promise<AuditLog[]>;
}

export class InMemoryAuditLogRepository implements IAuditLogRepository {
  private logs: AuditLog[] = [];

  public async create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      ...data,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date(),
    };
    this.logs.unshift(newLog); // Newest first
    return newLog;
  }

  public async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.logs.filter(
      (l) => l.entityType === entityType && l.entityId === entityId
    );
  }

  public async findAll(limit = 100): Promise<AuditLog[]> {
    return this.logs.slice(0, limit);
  }
}

export const defaultAuditLogRepository = new InMemoryAuditLogRepository();
