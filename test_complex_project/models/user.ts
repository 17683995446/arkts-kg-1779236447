// 用户模型
export interface User {
    id: string
    name: string
    email: string
    age?: number
    isActive: boolean
    roles: string[]
    profile: UserProfile
    createdAt: Date
    updatedAt: Date
}

export interface UserProfile {
    bio?: string
    avatar?: string
    location?: string
    website?: string
    socialLinks: SocialLinks
}

export interface SocialLinks {
    github?: string
    twitter?: string
    linkedin?: string
}

export class UserModel {
    private users: Map<string, User> = new Map()

    constructor() {
        this.initialize()
    }

    private initialize(): void {
        const defaultUser: User = {
            id: '1',
            name: 'Default User',
            email: 'default@example.com',
            isActive: true,
            roles: ['user'],
            profile: {
                bio: 'Default bio',
                socialLinks: {}
            },
            createdAt: new Date(),
            updatedAt: new Date()
        }
        this.users.set(defaultUser.id, defaultUser)
    }

    public getUser(id: string): User | undefined {
        return this.users.get(id)
    }

    public getAllUsers(): User[] {
        return Array.from(this.users.values())
    }

    public createUser(data: Partial<User>): User {
        const user: User = {
            id: this.generateId(),
            name: data.name || '',
            email: data.email || '',
            age: data.age,
            isActive: data.isActive ?? true,
            roles: data.roles || ['user'],
            profile: data.profile || {
                socialLinks: {}
            },
            createdAt: new Date(),
            updatedAt: new Date()
        }
        this.users.set(user.id, user)
        return user
    }

    public updateUser(id: string, data: Partial<User>): User | null {
        const user = this.users.get(id)
        if (!user) return null

        const updatedUser: User = {
            ...user,
            ...data,
            id: user.id,
            updatedAt: new Date()
        }
        this.users.set(id, updatedUser)
        return updatedUser
    }

    public deleteUser(id: string): boolean {
        return this.users.delete(id)
    }

    private generateId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    public findByEmail(email: string): User | undefined {
        return Array.from(this.users.values()).find(u => u.email === email)
    }

    public findByRole(role: string): User[] {
        return Array.from(this.users.values()).filter(u => u.roles.includes(role))
    }
}

// Test modification

// Test modification
