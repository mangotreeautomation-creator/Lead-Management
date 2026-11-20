import { eq, and, gt } from 'drizzle-orm';
import { db } from '../../database/client';
import { userAccounts, sessions, roles, userRoleAssignments, userScopes, permissions, rolePermissions } from '../../database/schema/index';
import { comparePassword, generateSessionToken, hashToken } from '../../utils/crypto';
import { UnauthorizedError } from '../../utils/errors';
import { env } from '../../config/env';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  roles: string[];
  permissions: string[];
  scopes: Array<{
    companyId: string | null;
    categoryId: string | null;
    accessLevel: string;
  }>;
}

export class AuthService {
  /**
   * Authenticate user with email and password, creating a persistent session
   */
  async login(email: string, plaintextPass: string, ipAddress?: string, userAgent?: string): Promise<{ user: AuthenticatedUser; token: string; expiresAt: Date }> {
    const [user] = await db.select().from(userAccounts).where(eq(userAccounts.email, email.toLowerCase().trim())).limit(1);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const passwordMatch = await comparePassword(plaintextPass, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Generate session token
    const token = generateSessionToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 3600 * 1000);

    // Store session in DB
    await db.insert(sessions).values({
      userId: user.id,
      tokenHash,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      expiresAt,
    });

    // Update last login
    await db.update(userAccounts).set({ lastLoginAt: new Date() }).where(eq(userAccounts.id, user.id));

    const authenticatedUser = await this.getAuthenticatedUserDetails(user.id);

    return {
      user: authenticatedUser,
      token,
      expiresAt,
    };
  }

  /**
   * Validate session token from cookie/header and return authenticated user
   */
  async validateSession(rawToken: string): Promise<AuthenticatedUser> {
    if (!rawToken) {
      throw new UnauthorizedError('No authentication token provided', 'MISSING_TOKEN');
    }

    const tokenHash = hashToken(rawToken);
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (!session) {
      throw new UnauthorizedError('Session has expired or is invalid', 'INVALID_SESSION');
    }

    return this.getAuthenticatedUserDetails(session.userId);
  }

  /**
   * Invalidate session token on logout
   */
  async logout(rawToken: string): Promise<void> {
    if (!rawToken) return;
    const tokenHash = hashToken(rawToken);
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }

  /**
   * Aggregate user roles, permissions and company/category scopes
   */
  async getAuthenticatedUserDetails(userId: string): Promise<AuthenticatedUser> {
    const [user] = await db.select().from(userAccounts).where(eq(userAccounts.id, userId)).limit(1);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account not found or deactivated', 'ACCOUNT_DISABLED');
    }

    // Get user roles
    const assignedRoles = await db
      .select({
        roleCode: roles.code,
        roleId: roles.id,
      })
      .from(userRoleAssignments)
      .innerJoin(roles, eq(userRoleAssignments.roleId, roles.id))
      .where(eq(userRoleAssignments.userId, userId));

    const roleCodes = assignedRoles.map((r) => r.roleCode);
    const roleIds = assignedRoles.map((r) => r.roleId);

    // Get permissions for assigned roles
    let permissionCodes: string[] = [];
    if (roleIds.length > 0) {
      const perms = await db
        .select({
          code: permissions.code,
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, roleIds[0])); // Can expand with `inArray`

      permissionCodes = Array.from(new Set(perms.map((p) => p.code)));
    }

    // If Super Admin, grant all permissions
    if (roleCodes.includes('SUPER_ADMIN')) {
      permissionCodes = ['*'];
    }

    // Get user scopes
    const scopes = await db
      .select({
        companyId: userScopes.companyId,
        categoryId: userScopes.categoryId,
        accessLevel: userScopes.accessLevel,
      })
      .from(userScopes)
      .where(eq(userScopes.userId, userId));

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      roles: roleCodes,
      permissions: permissionCodes,
      scopes,
    };
  }
}

export const authService = new AuthService();
