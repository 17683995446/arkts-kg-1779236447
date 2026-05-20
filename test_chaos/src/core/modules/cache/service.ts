// src/core/modules/cache/service.ts - 缓存服务
export class CacheService {
    private cache: Map<string, { value: any; expiry: number }> = new Map();

    public set(key: string, value: any, ttl?: number): void {
        const expiry = ttl ? Date.now() + ttl : Date.now() + 3600000;
        this.cache.set(key, { value, expiry });
    }

    public get<T>(key: string): T | undefined {
        const item = this.cache.get(key);
        if (!item) return undefined;
        if (item.expiry < Date.now()) {
            this.cache.delete(key);
            return undefined;
        }
        return item.value as T;
    }

    public delete(key: string): void {
        this.cache.delete(key);
    }

    public clear(): void {
        this.cache.clear();
    }
}
