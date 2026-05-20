// src/core/modules/auth/tokenService.ts - Token服务
export class TokenService {
    public generateTokens(): { token: string; refreshToken: string; expiresAt: Date } {
        return {
            token: this.generateRandomString(32),
            refreshToken: this.generateRandomString(64),
            expiresAt: new Date(Date.now() + 3600000)
        };
    }

    private generateRandomString(length: number): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
