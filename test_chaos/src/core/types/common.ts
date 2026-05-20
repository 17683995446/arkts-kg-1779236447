// src/core/types/common.ts - 基础类型定义
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface User extends BaseEntity {
    username: string;
    email: string;
    profile: UserProfile;
    settings: UserSettings;
}

export interface UserProfile {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    socialLinks: SocialLinks;
}

export interface UserSettings {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: NotificationSettings;
}

export interface NotificationSettings {
    email: boolean;
    push: boolean;
    sms: boolean;
}

export interface SocialLinks {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
}

export type EntityStatus = 'active' | 'inactive' | 'pending' | 'deleted';

export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    timestamp: number;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

export interface SearchParams extends PaginationParams {
    query?: string;
    filters?: Record<string, any>;
}

export interface ValidationRule {
    field: string;
    rules: ValidationRuleItem[];
}

export interface ValidationRuleItem {
    type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
    value?: any;
    message: string;
}

export type Callback<T = any> = (error?: Error, result?: T) => void;
export type AsyncCallback<T = any> = (error?: Error, result?: T) => Promise<void>;

export interface EventEmitter {
    on(event: string, handler: Function): void;
    off(event: string, handler: Function): void;
    emit(event: string, ...args: any[]): void;
}

export interface Logger {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
}

export interface Config {
    apiUrl: string;
    wsUrl: string;
    timeout: number;
    retries: number;
}

export const DEFAULT_CONFIG: Config = {
    apiUrl: 'https://api.example.com',
    wsUrl: 'wss://ws.example.com',
    timeout: 30000,
    retries: 3
};
