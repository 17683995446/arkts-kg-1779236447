// 工具函数库
export class StringUtils {
    public static capitalize(str: string): string {
        if (!str) return ''
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    public static truncate(str: string, maxLength: number): string {
        if (str.length <= maxLength) return str
        return str.slice(0, maxLength - 3) + '...'
    }

    public static slugify(str: string): string {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    public static formatCurrency(amount: number, currency: string = 'USD'): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount)
    }

    public static parseQueryString(query: string): Record<string, string> {
        const params = new URLSearchParams(query)
        const result: Record<string, string> = {}
        params.forEach((value, key) => {
            result[key] = value
        })
        return result
    }

    public static maskEmail(email: string): string {
        const [username, domain] = email.split('@')
        if (!domain) return email

        const maskedUsername = username.length > 2
            ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
            : username

        return `${maskedUsername}@${domain}`
    }
}

export class DateUtils {
    public static formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')

        return format
            .replace('YYYY', String(year))
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds)
    }

    public static getTimeAgo(date: Date): string {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ]

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds)
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`
            }
        }

        return 'just now'
    }

    public static isValidDate(date: any): boolean {
        return date instanceof Date && !isNaN(date.getTime())
    }

    public static addDays(date: Date, days: number): Date {
        const result = new Date(date)
        result.setDate(result.getDate() + days)
        return result
    }

    public static diffDays(date1: Date, date2: Date): number {
        const diffTime = Math.abs(date2.getTime() - date1.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
}

export class ValidationUtils {
    public static isEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    public static isUrl(url: string): boolean {
        try {
            new URL(url)
            return true
        } catch {
            return false
        }
    }

    public static isPhone(phone: string): boolean {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
    }

    public static isStrongPassword(password: string): boolean {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password)
        )
    }

    public static validateRequired(value: any): boolean {
        if (value === null || value === undefined) return false
        if (typeof value === 'string') return value.trim().length > 0
        if (Array.isArray(value)) return value.length > 0
        return true
    }

    public static validateRange(value: number, min: number, max: number): boolean {
        return value >= min && value <= max
    }
}

export class ArrayUtils {
    public static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
        return array.reduce((result, item) => {
            const group = String(item[key])
            if (!result[group]) {
                result[group] = []
            }
            result[group].push(item)
            return result
        }, {} as Record<string, T[]>)
    }

    public static unique<T>(array: T[]): T[] {
        return Array.from(new Set(array))
    }

    public static chunk<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = []
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size))
        }
        return chunks
    }

    public static shuffle<T>(array: T[]): T[] {
        const result = [...array]
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]]
        }
        return result
    }

    public static sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
        return [...array].sort((a, b) => {
            const aVal = a[key]
            const bVal = b[key]

            if (aVal < bVal) return order === 'asc' ? -1 : 1
            if (aVal > bVal) return order === 'asc' ? 1 : -1
            return 0
        })
    }
}

export class ObjectUtils {
    public static deepClone<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') return obj
        if (obj instanceof Date) return new Date(obj.getTime()) as any
        if (obj instanceof Array) return obj.map(item => this.deepClone(item)) as any

        const clonedObj = {} as T
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = this.deepClone(obj[key])
            }
        }
        return clonedObj
    }

    public static merge<T extends object>(target: T, ...sources: Partial<T>[]): T {
        for (const source of sources) {
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    const targetValue = target[key]
                    const sourceValue = source[key]

                    if (
                        typeof targetValue === 'object' &&
                        typeof sourceValue === 'object' &&
                        targetValue !== null &&
                        sourceValue !== null
                    ) {
                        target[key] = this.deepMerge(targetValue, sourceValue as any)
                    } else {
                        target[key] = sourceValue as any
                    }
                }
            }
        }
        return target
    }

    private static deepMerge<T extends object>(target: T, source: any): T {
        return this.merge(target, source)
    }

    public static pick<T extends object, K extends keyof T>(
        obj: T,
        keys: K[]
    ): Pick<T, K> {
        const result = {} as Pick<T, K>
        keys.forEach(key => {
            if (key in obj) {
                result[key] = obj[key]
            }
        })
        return result
    }

    public static omit<T extends object, K extends keyof T>(
        obj: T,
        keys: K[]
    ): Omit<T, K> {
        const result = { ...obj }
        keys.forEach(key => delete result[key])
        return result
    }
}
