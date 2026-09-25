export type AuditActorType = 'SYSTEM' | 'STUDENT' | 'ADMIN' | 'STAFF';

export interface AuditLog {
  id: string;
  actorType: AuditActorType;
  actorId: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}
