// src/core/modules/validation/validator.ts - 验证服务（创建循环依赖）
import { User, UserProfile, UserSettings } from '../../types/common';
import { SessionManager } from '../auth/sessionManager';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export class ValidationService {
    private sessionManager: SessionManager;

    constructor() {
        this.sessionManager = new SessionManager();
    }

    public validateUser(data: Partial<User>): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (!data.username || data.username.trim().length === 0) {
            result.errors.push('Username is required');
            result.isValid = false;
        } else if (data.username.length < 3) {
            result.errors.push('Username must be at least 3 characters');
            result.isValid = false;
        } else if (data.username.length > 50) {
            result.errors.push('Username must be less than 50 characters');
            result.isValid = false;
        }

        if (!data.email || data.email.trim().length === 0) {
            result.errors.push('Email is required');
            result.isValid = false;
        } else if (!this.isValidEmail(data.email)) {
            result.errors.push('Invalid email format');
            result.isValid = false;
        }

        if (data.profile) {
            const profileValidation = this.validateProfile(data.profile);
            if (!profileValidation.isValid) {
                result.errors.push(...profileValidation.errors);
                result.isValid = false;
            }
            result.warnings.push(...profileValidation.warnings);
        }

        if (data.settings) {
            const settingsValidation = this.validateSettings(data.settings);
            if (!settingsValidation.isValid) {
                result.errors.push(...settingsValidation.errors);
                result.isValid = false;
            }
        }

        return result;
    }

    public validateProfile(profile: Partial<UserProfile>): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (profile.firstName && profile.firstName.length > 100) {
            result.errors.push('First name is too long');
            result.isValid = false;
        }

        if (profile.lastName && profile.lastName.length > 100) {
            result.errors.push('Last name is too long');
            result.isValid = false;
        }

        if (profile.avatar && !this.isValidUrl(profile.avatar)) {
            result.warnings.push('Avatar URL may be invalid');
        }

        if (profile.bio && profile.bio.length > 500) {
            result.warnings.push('Bio is very long, consider shortening it');
        }

        return result;
    }

    public validateSettings(settings: Partial<UserSettings>): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (settings.theme && !['light', 'dark', 'auto'].includes(settings.theme)) {
            result.errors.push('Invalid theme');
            result.isValid = false;
        }

        if (settings.language && settings.language.length > 10) {
            result.errors.push('Invalid language code');
            result.isValid = false;
        }

        if (settings.timezone && !this.isValidTimezone(settings.timezone)) {
            result.warnings.push('Timezone may not be valid');
        }

        return result;
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    private isValidTimezone(timezone: string): boolean {
        try {
            Intl.DateTimeFormat(undefined, { timeZone: timezone });
            return true;
        } catch {
            return false;
        }
    }

    public validatePassword(password: string): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (password.length < 8) {
            result.errors.push('Password must be at least 8 characters');
            result.isValid = false;
        }

        if (!/[A-Z]/.test(password)) {
            result.warnings.push('Password should contain uppercase letters');
        }

        if (!/[a-z]/.test(password)) {
            result.warnings.push('Password should contain lowercase letters');
        }

        if (!/[0-9]/.test(password)) {
            result.warnings.push('Password should contain numbers');
        }

        if (!/[^A-Za-z0-9]/.test(password)) {
            result.warnings.push('Password should contain special characters');
        }

        return result;
    }

    public async validateSession(token: string): Promise<ValidationResult> {
        const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: []
        };

        const session = await this.sessionManager.validateSession(token);
        if (!session) {
            result.errors.push('Invalid or expired session');
            result.isValid = false;
        }

        return result;
    }
}
