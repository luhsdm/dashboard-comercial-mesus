import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'SUPERADMIN' | 'AGENCY' | 'CLIENT';
  tenantId: string;
  tenantName: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function requireRole(roles: string[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) throw new Error('Forbidden');
  return user;
}

export function canManageClients(role: string): boolean {
  return ['SUPERADMIN', 'AGENCY'].includes(role);
}

export function canManageUsers(role: string): boolean {
  return ['SUPERADMIN', 'AGENCY'].includes(role);
}

export function canAccessIntegrations(role: string): boolean {
  return ['SUPERADMIN', 'AGENCY'].includes(role);
}
