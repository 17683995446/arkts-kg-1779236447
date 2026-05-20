// 认证服务
import { User, UserModel } from '../models/user'
import { ValidationUtils } from '../utils/helpers'

export interface AuthCredentials {
    email: string
    password: string
}

export interface AuthToken {
    accessToken: string
    refreshToken: string
    expiresIn: number
}

export interface AuthState {
    isAuthenticated: boolean
    user: User | null
    token: AuthToken | null
}

export class AuthService {
    private userModel: UserModel
    private currentToken: AuthToken | null = null
    private refreshTimer: any = null

    constructor() {
        this.userModel = new UserModel()
    }

    public async login(credentials: AuthCredentials): Promise<AuthState> {
        if (!ValidationUtils.isEmail(credentials.email)) {
            throw new Error('Invalid email format')
        }

        if (credentials.password.length < 6) {
            throw new Error('Password must be at least 6 characters')
        }

        await this.simulateNetworkDelay()

        const user = this.userModel.findByEmail(credentials.email)
        if (!user) {
            throw new Error('Invalid credentials')
        }

        const token = this.generateToken()
        this.currentToken = token
        this.scheduleTokenRefresh(token.expiresIn)

        return {
            isAuthenticated: true,
            user,
            token
        }
    }

    public async register(data: {
        name: string
        email: string
        password: string
        confirmPassword: string
    }): Promise<AuthState> {
        if (!ValidationUtils.isEmail(data.email)) {
            throw new Error('Invalid email format')
        }

        if (!ValidationUtils.isStrongPassword(data.password)) {
            throw new Error('Password does not meet requirements')
        }

        if (data.password !== data.confirmPassword) {
            throw new Error('Passwords do not match')
        }

        const existingUser = this.userModel.findByEmail(data.email)
        if (existingUser) {
            throw new Error('Email already registered')
        }

        await this.simulateNetworkDelay()

        const user = this.userModel.createUser({
            name: data.name,
            email: data.email,
            isActive: true,
            roles: ['user'],
            profile: {
                socialLinks: {}
            }
        })

        const token = this.generateToken()
        this.currentToken = token
        this.scheduleTokenRefresh(token.expiresIn)

        return {
            isAuthenticated: true,
            user,
            token
        }
    }

    public async logout(): Promise<void> {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer)
        }
        this.currentToken = null
    }

    public async refreshToken(): Promise<AuthToken> {
        if (!this.currentToken?.refreshToken) {
            throw new Error('No refresh token available')
        }

        await this.simulateNetworkDelay()

        const newToken = this.generateToken()
        this.currentToken = newToken
        this.scheduleTokenRefresh(newToken.expiresIn)

        return newToken
    }

    public getCurrentUser(): User | null {
        if (!this.currentToken) return null

        const userData = this.decodeToken(this.currentToken.accessToken)
        if (!userData) return null

        return this.userModel.getUser(userData.userId) || null
    }

    public isAuthenticated(): boolean {
        if (!this.currentToken) return false

        const tokenData = this.decodeToken(this.currentToken.accessToken)
        if (!tokenData) return false

        return tokenData.exp > Date.now() / 1000
    }

    private generateToken(): AuthToken {
        const accessToken = this.createJWT({
            type: 'access',
            exp: Math.floor(Date.now() / 1000) + 3600
        })

        const refreshToken = this.createJWT({
            type: 'refresh',
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600
        })

        return {
            accessToken,
            refreshToken,
            expiresIn: 3600
        }
    }

    private createJWT(payload: any): string {
        const header = { alg: 'HS256', typ: 'JWT' }
        const base64Header = btoa(JSON.stringify(header))
        const base64Payload = btoa(JSON.stringify(payload))
        const signature = btoa(`${base64Header}.${base64Payload}`)
        return `${base64Header}.${base64Payload}.${signature}`
    }

    private decodeToken(token: string): any | null {
        try {
            const parts = token.split('.')
            if (parts.length !== 3) return null

            const payload = JSON.parse(atob(parts[1]))
            return payload
        } catch {
            return null
        }
    }

    private scheduleTokenRefresh(expiresIn: number): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer)
        }

        const refreshTime = (expiresIn - 60) * 1000
        if (refreshTime > 0) {
            this.refreshTimer = setTimeout(() => {
                this.refreshToken().catch(err => {
                    console.error('Token refresh failed:', err)
                    this.logout()
                })
            }, refreshTime)
        }
    }

    private async simulateNetworkDelay(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
    }
}

export class PermissionService {
    private roles: Map<string, string[]> = new Map()

    constructor() {
        this.initializeRoles()
    }

    private initializeRoles(): void {
        this.roles.set('admin', [
            'users:read',
            'users:write',
            'users:delete',
            'products:read',
            'products:write',
            'products:delete',
            'orders:read',
            'orders:write',
            'settings:manage'
        ])

        this.roles.set('moderator', [
            'users:read',
            'products:read',
            'products:write',
            'orders:read'
        ])

        this.roles.set('user', [
            'users:read:own',
            'products:read',
            'orders:read:own',
            'orders:write'
        ])
    }

    public hasPermission(userRoles: string[], permission: string): boolean {
        return userRoles.some(role => {
            const rolePermissions = this.roles.get(role) || []
            return rolePermissions.includes(permission) ||
                   rolePermissions.some(p => {
                       if (p.endsWith('*')) {
                           const prefix = p.slice(0, -1)
                           return permission.startsWith(prefix)
                       }
                       return false
                   })
        })
    }

    public getPermissions(roles: string[]): string[] {
        const permissions = new Set<string>()
        roles.forEach(role => {
            const rolePermissions = this.roles.get(role) || []
            rolePermissions.forEach(p => permissions.add(p))
        })
        return Array.from(permissions)
    }
}
