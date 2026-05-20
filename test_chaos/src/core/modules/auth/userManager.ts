// src/core/modules/auth/userManager.ts - 用户管理（循环依赖测试）
import { User, UserProfile, UserSettings } from '../../types/common';
import { ValidationService } from '../../modules/validation/validator';
import { DatabaseService } from '../database/service';
import { CacheService } from '../cache/service';
import { EventEmitter } from '../../types/common';

export class UserManager implements EventEmitter {
    private users: Map<string, User> = new Map();
    private validationService: ValidationService;
    private databaseService: DatabaseService;
    private cacheService: CacheService;
    private eventHandlers: Map<string, Function[]> = new Map();

    constructor() {
        this.validationService = new ValidationService();
        this.databaseService = new DatabaseService();
        this.cacheService = new CacheService();
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.loadUsersFromDatabase();
        this.setupEventHandlers();
    }

    private async loadUsersFromDatabase(): Promise<void> {
        const users = await this.databaseService.getAllUsers();
        users.forEach(user => {
            this.users.set(user.id, user);
        });
    }

    private setupEventHandlers(): void {
        this.on('userCreated', (user: User) => {
            this.cacheService.set(`user:${user.id}`, user);
        });

        this.on('userUpdated', (user: User) => {
            this.cacheService.set(`user:${user.id}`, user);
        });

        this.on('userDeleted', (userId: string) => {
            this.cacheService.delete(`user:${userId}`);
        });
    }

    public async createUser(data: Partial<User>): Promise<User> {
        const validation = this.validationService.validateUser(data);
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        const user: User = {
            id: this.generateId(),
            username: data.username || '',
            email: data.email || '',
            profile: data.profile || this.createDefaultProfile(),
            settings: data.settings || this.createDefaultSettings(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await this.databaseService.saveUser(user);
        this.users.set(user.id, user);
        this.emit('userCreated', user);

        return user;
    }

    public async updateUser(id: string, data: Partial<User>): Promise<User> {
        const user = this.users.get(id);
        if (!user) {
            throw new Error(`User not found: ${id}`);
        }

        const validation = this.validationService.validateUser(data);
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        const updatedUser: User = {
            ...user,
            ...data,
            id: user.id,
            updatedAt: new Date()
        };

        await this.databaseService.saveUser(updatedUser);
        this.users.set(id, updatedUser);
        this.emit('userUpdated', updatedUser);

        return updatedUser;
    }

    public async deleteUser(id: string): Promise<void> {
        const user = this.users.get(id);
        if (!user) {
            throw new Error(`User not found: ${id}`);
        }

        await this.databaseService.deleteUser(id);
        this.users.delete(id);
        this.emit('userDeleted', id);
    }

    public getUser(id: string): User | undefined {
        const cached = this.cacheService.get<User>(`user:${id}`);
        if (cached) {
            return cached;
        }

        return this.users.get(id);
    }

    public getAllUsers(): User[] {
        return Array.from(this.users.values());
    }

    public async searchUsers(query: string): Promise<User[]> {
        const lowerQuery = query.toLowerCase();
        return this.getAllUsers().filter(user =>
            user.username.toLowerCase().includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery)
        );
    }

    public async getUserByEmail(email: string): Promise<User | undefined> {
        return this.getAllUsers().find(user => user.email === email);
    }

    private createDefaultProfile(): UserProfile {
        return {
            firstName: '',
            lastName: '',
            socialLinks: {}
        };
    }

    private createDefaultSettings(): UserSettings {
        return {
            theme: 'auto',
            language: 'en',
            timezone: 'UTC',
            notifications: {
                email: true,
                push: true,
                sms: false
            }
        };
    }

    private generateId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

export const userManager = new UserManager();
