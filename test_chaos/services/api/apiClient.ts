// test_chaos/services/api/apiClient.ts - 包含特殊字符的混乱代码

/**
 * API Client with special characters and edge cases
 * Testing parser's ability to handle: 🎯 ⚠️ ✅ ❌ 🚀 💡
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT, API_KEY } from '../../configs/dev/env';

interface ApiClientConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
    authToken?: string;
}

class ApiClient {
    private client: AxiosInstance;
    private requestQueue: Array<() => Promise<any>> = [];
    private isProcessing: boolean = false;
    private retryCount: number = 3;
    private retryDelay: number = 1000;

    constructor(config: ApiClientConfig = {}) {
        this.client = axios.create({
            baseURL: config.baseURL || API_BASE_URL,
            timeout: config.timeout || API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY,
                ...config.headers
            }
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        this.client.interceptors.request.use(
            (config) => {
                console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error(`❌ [API] Request Error:`, error);
                return Promise.reject(error);
            }
        );

        this.client.interceptors.response.use(
            (response) => {
                console.log(`✅ [API] Response:`, response.status);
                return response;
            },
            async (error) => {
                const originalRequest = error.config;

                if (!originalRequest._retryCount) {
                    originalRequest._retryCount = 0;
                }

                if (originalRequest._retryCount < this.retryCount) {
                    originalRequest._retryCount += 1;

                    console.warn(`⚠️ [API] Retrying request (${originalRequest._retryCount}/${this.retryCount})`);

                    await this.delay(this.retryDelay * originalRequest._retryCount);
                    return this.client(originalRequest);
                }

                console.error(`❌ [API] Request failed after ${this.retryCount} retries`);
                return Promise.reject(error);
            }
        );
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.get(url, config);
        return response.data;
    }

    public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.post(url, data, config);
        return response.data;
    }

    public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.put(url, data, config);
        return response.data;
    }

    public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.patch(url, data, config);
        return response.data;
    }

    public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.delete(url, config);
        return response.data;
    }

    public async request<T = any>(config: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.request(config);
        return response.data;
    }

    public setAuthToken(token: string): void {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    public clearAuthToken(): void {
        delete this.client.defaults.headers.common['Authorization'];
    }

    public setHeader(key: string, value: string): void {
        this.client.defaults.headers.common[key] = value;
    }

    public removeHeader(key: string): void {
        delete this.client.defaults.headers.common[key];
    }
}

export const apiClient = new ApiClient();

export default apiClient;

// 特殊字符测试: émoji 🎉 中文测试 日本語テスト 한국어테스트
