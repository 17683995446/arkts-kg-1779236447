// src/core/modules/auth/sessionManager.ts - 会话管理（依赖userManager）
import { User } from '../../../core/types/common';
import { UserManager, userManager } from './userManager';
import { TokenService } from './tokenService';
import { EventEmitter } from '../../../core/types/common';

export interface Session {
    id: string;
    userId: string;
    token: string;
    refreshToken: string;
    expiresAt: Date;
    createdAt: Date;
    lastActivity: Date;
    ipAddress?: string;
    userAgent?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface AuthResult {
    success: boolean;
    session?: Session;
    user?: User;
    error?: string;
}

export class SessionManager implements EventEmitter {
    private sessions: Map<string, Session> = new Map();
    private userSessions: Map<string, Set<string>> = new Map();
    private tokenService: TokenService;
    private userManager: UserManager;
    private eventHandlers: Map<string, Function[]> = new Map();

    constructor() {
        this.tokenService = new TokenService();
        this.userManager = userManager;
        this.initializeCleanup();
    }

    private initializeCleanup(): void {
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 60000);
    }

    private cleanupExpiredSessions(): void {
        const now = new Date();
        const expiredSessions: string[] = [];

        this.sessions.forEach((session, sessionId) => {
            if (session.expiresAt < now) {
                expiredSessions.push(sessionId);
            }
        });

        expiredSessions.forEach(sessionId => {
            this.invalidateSession(sessionId);
        });
    }

    public async login(credentials: LoginCredentials): Promise<AuthResult> {
        try {
            const user = await this.userManager.getUserByEmail(credentials.email);
            if (!user) {
                return { success: false, error: 'Invalid credentials' };
            }

            const session = await this.createSession(user, {
                userAgent: credentials.rememberMe ? 'remembered' : 'default'
            });

            this.emit('login', user, session);

            return {
                success: true,
                session,
                user
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Login failed'
            };
        }
    }

    public async logout(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }

        const user = await this.userManager.getUser(session.userId);
        await this.invalidateSession(sessionId);

        if (user) {
            this.emit('logout', user, session);
        }
    }

    public async validateSession(token: string): Promise<Session | null> {
        const session = Array.from(this.sessions.values()).find(s => s.token === token);

        if (!session) {
            return null;
        }

        if (session.expiresAt < new Date()) {
            await this.invalidateSession(session.id);
            return null;
        }

        session.lastActivity = new Date();
        return session;
    }

    public async refreshSession(refreshToken: string): Promise<Session> {
        const session = Array.from(this.sessions.values()).find(s => s.refreshToken === refreshToken);

        if (!session) {
            throw new Error('Invalid refresh token');
        }

        if (session.expiresAt < new Date()) {
            await this.invalidateSession(session.id);
            throw new Error('Session expired');
        }

        const newTokens = this.tokenService.generateTokens();
        session.token = newTokens.token;
        session.refreshToken = newTokens.refreshToken;
        session.expiresAt = newTokens.expiresAt;
        session.lastActivity = new Date();

        this.emit('sessionRefreshed', session);

        return session;
    }

    private async createSession(user: User, options: { userAgent?: string }): Promise<Session> {
        const tokens = this.tokenService.generateTokens();

        const session: Session = {
            id: this.generateSessionId(),
            userId: user.id,
            token: tokens.token,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
            createdAt: new Date(),
            lastActivity: new Date(),
            userAgent: options.userAgent
        };

        this.sessions.set(session.id, session);

        if (!this.userSessions.has(user.id)) {
            this.userSessions.set(user.id, new Set());
        }
        this.userSessions.get(user.id)!.add(session.id);

        return session;
    }

    private async invalidateSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (session) {
            const userSessions = this.userSessions.get(session.userId);
            if (userSessions) {
                userSessions.delete(sessionId);
                if (userSessions.size === 0) {
                    this.userSessions.delete(session.userId);
                }
            }

            this.sessions.delete(sessionId);
            this.emit('sessionInvalidated', session);
        }
    }

    public getUserSessions(userId: string): Session[] {
        const sessionIds = this.userSessions.get(userId);
        if (!sessionIds) {
            return [];
        }

        return Array.from(sessionIds)
            .map(id => this.sessions.get(id))
            .filter((s): s is Session => s !== undefined);
    }

    public async invalidateAllUserSessions(userId: string): Promise<void> {
        const sessions = this.getUserSessions(userId);
        for (const session of sessions) {
            await this.invalidateSession(session.id);
        }
    }

    private generateSessionId(): string {
        return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    }

    // EventEmitter implementation
    public on(event: string, handler: Function): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event)!.push(handler);
    }

    public off(event: string, handler: Function): void {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    public emit(event: string, ...args: any[]): void {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(...args);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }
}

export const sessionManager = new SessionManager();
