// HTTP 和 API 工具
export interface HttpRequest {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    headers?: Record<string, string>
    body?: any
    params?: Record<string, string>
}

export interface HttpResponse<T = any> {
    data: T
    status: number
    statusText: string
    headers: Record<string, string>
}

export class HttpClient {
    private baseURL: string
    private defaultHeaders: Record<string, string>

    constructor(baseURL: string = '') {
        this.baseURL = baseURL
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }

    public setAuthToken(token: string): void {
        this.defaultHeaders['Authorization'] = `Bearer ${token}`
    }

    public setHeader(key: string, value: string): void {
        this.defaultHeaders[key] = value
    }

    public async request<T>(config: HttpRequest): Promise<HttpResponse<T>> {
        const url = this.buildURL(config.url, config.params)
        const headers = { ...this.defaultHeaders, ...config.headers }

        const options: RequestInit = {
            method: config.method || 'GET',
            headers
        }

        if (config.body && !['GET', 'HEAD'].includes(options.method!)) {
            options.body = JSON.stringify(config.body)
        }

        try {
            const response = await fetch(url, options)
            const data = await response.json()

            return {
                data,
                status: response.status,
                statusText: response.statusText,
                headers: this.parseHeaders(response.headers)
            }
        } catch (error) {
            throw new Error(`HTTP request failed: ${error}`)
        }
    }

    public async get<T>(url: string, params?: Record<string, string>): Promise<HttpResponse<T>> {
        return this.request<T>({ url, method: 'GET', params })
    }

    public async post<T>(url: string, body?: any): Promise<HttpResponse<T>> {
        return this.request<T>({ url, method: 'POST', body })
    }

    public async put<T>(url: string, body?: any): Promise<HttpResponse<T>> {
        return this.request<T>({ url, method: 'PUT', body })
    }

    public async delete<T>(url: string): Promise<HttpResponse<T>> {
        return this.request<T>({ url, method: 'DELETE' })
    }

    public async patch<T>(url: string, body?: any): Promise<HttpResponse<T>> {
        return this.request<T>({ url, method: 'PATCH', body })
    }

    private buildURL(url: string, params?: Record<string, string>): string {
        const fullURL = this.baseURL ? `${this.baseURL}${url}` : url
        if (!params) return fullURL

        const searchParams = new URLSearchParams(params)
        return `${fullURL}?${searchParams.toString()}`
    }

    private parseHeaders(headers: Headers): Record<string, string> {
        const result: Record<string, string> = {}
        headers.forEach((value, key) => {
            result[key] = value
        })
        return result
    }
}

export class ApiService {
    private http: HttpClient

    constructor(baseURL: string) {
        this.http = new HttpClient(baseURL)
    }

    public setAuthToken(token: string): void {
        this.http.setAuthToken(token)
    }

    public async getUsers(): Promise<any[]> {
        const response = await this.http.get('/users')
        return response.data
    }

    public async getUserById(id: string): Promise<any> {
        const response = await this.http.get(`/users/${id}`)
        return response.data
    }

    public async createUser(data: any): Promise<any> {
        const response = await this.http.post('/users', data)
        return response.data
    }

    public async updateUser(id: string, data: any): Promise<any> {
        const response = await this.http.put(`/users/${id}`, data)
        return response.data
    }

    public async deleteUser(id: string): Promise<void> {
        await this.http.delete(`/users/${id}`)
    }

    public async getProducts(params?: Record<string, string>): Promise<any[]> {
        const response = await this.http.get('/products', params)
        return response.data
    }

    public async searchProducts(query: string, filters?: any): Promise<any[]> {
        const params = { q: query, ...filters }
        const response = await this.http.get('/products/search', params)
        return response.data
    }
}

class RetryHelper {
    public static async retry<T>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        delay: number = 1000
    ): Promise<T> {
        let lastError: Error | undefined

        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn()
            } catch (error) {
                lastError = error as Error
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
                }
            }
        }

        throw lastError || new Error('Retry failed')
    }

    public static async timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
        const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), ms)
        )
        return Promise.race([promise, timeout])
    }
}

export class CacheManager {
    private cache: Map<string, { data: any; expiry: number }> = new Map()
    private defaultTTL: number = 5 * 60 * 1000

    public set(key: string, data: any, ttl?: number): void {
        const expiry = Date.now() + (ttl || this.defaultTTL)
        this.cache.set(key, { data, expiry })
    }

    public get<T>(key: string): T | null {
        const item = this.cache.get(key)
        if (!item) return null

        if (Date.now() > item.expiry) {
            this.cache.delete(key)
            return null
        }

        return item.data as T
    }

    public delete(key: string): void {
        this.cache.delete(key)
    }

    public clear(): void {
        this.cache.clear()
    }

    public has(key: string): boolean {
        return this.get(key) !== null
    }
}
