// 产品模型和业务逻辑
import { User } from './user'

export interface Product {
    id: string
    name: string
    description: string
    price: number
    category: ProductCategory
    tags: string[]
    images: string[]
    inventory: Inventory
    seller: ProductSeller
    rating: ProductRating
    isFeatured: boolean
    createdAt: Date
}

export enum ProductCategory {
    ELECTRONICS = 'electronics',
    CLOTHING = 'clothing',
    FOOD = 'food',
    BOOKS = 'books',
    HOME = 'home'
}

export interface Inventory {
    quantity: number
    reserved: number
    available: number
}

export interface ProductSeller {
    id: string
    name: string
    rating: number
}

export interface ProductRating {
    average: number
    count: number
    reviews: Review[]
}

export interface Review {
    id: string
    userId: string
    rating: number
    comment: string
    createdAt: Date
}

type ProductFilter = {
    category?: ProductCategory
    minPrice?: number
    maxPrice?: number
    tags?: string[]
}

type SortOption = 'price' | 'rating' | 'newest'

export class ProductService {
    private products: Map<string, Product> = new Map()
    private reviewService: ReviewService

    constructor() {
        this.reviewService = new ReviewService()
        this.initializeProducts()
    }

    private initializeProducts(): void {
        const sampleProducts: Product[] = [
            this.createSampleProduct('1', 'Laptop', ProductCategory.ELECTRONICS, 999.99),
            this.createSampleProduct('2', 'T-Shirt', ProductCategory.CLOTHING, 29.99),
            this.createSampleProduct('3', 'Book', ProductCategory.BOOKS, 19.99)
        ]
        sampleProducts.forEach(p => this.products.set(p.id, p))
    }

    private createSampleProduct(
        id: string,
        name: string,
        category: ProductCategory,
        price: number
    ): Product {
        return {
            id,
            name,
            description: `High quality ${name.toLowerCase()}`,
            price,
            category,
            tags: [category],
            images: [],
            inventory: {
                quantity: 100,
                reserved: 10,
                available: 90
            },
            seller: {
                id: 'seller1',
                name: 'Default Seller',
                rating: 4.5
            },
            rating: {
                average: 4.2,
                count: 50,
                reviews: []
            },
            isFeatured: false,
            createdAt: new Date()
        }
    }

    public getProduct(id: string): Product | undefined {
        return this.products.get(id)
    }

    public getAllProducts(): Product[] {
        return Array.from(this.products.values())
    }

    public searchProducts(filter: ProductFilter): Product[] {
        let results = this.getAllProducts()

        if (filter.category) {
            results = results.filter(p => p.category === filter.category)
        }
        if (filter.minPrice !== undefined) {
            results = results.filter(p => p.price >= filter.minPrice)
        }
        if (filter.maxPrice !== undefined) {
            results = results.filter(p => p.price <= filter.maxPrice)
        }
        if (filter.tags && filter.tags.length > 0) {
            results = results.filter(p =>
                filter.tags!.some(tag => p.tags.includes(tag))
            )
        }

        return results
    }

    public sortProducts(products: Product[], option: SortOption): Product[] {
        const sorted = [...products]
        switch (option) {
            case 'price':
                return sorted.sort((a, b) => a.price - b.price)
            case 'rating':
                return sorted.sort((a, b) => b.rating.average - a.rating.average)
            case 'newest':
                return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            default:
                return sorted
        }
    }

    public createProduct(data: Omit<Product, 'id' | 'createdAt' | 'rating'>): Product {
        const product: Product = {
            ...data,
            id: this.generateProductId(),
            rating: {
                average: 0,
                count: 0,
                reviews: []
            },
            createdAt: new Date()
        }
        this.products.set(product.id, product)
        return product
    }

    public addReview(productId: string, review: Omit<Review, 'id' | 'createdAt'>): boolean {
        const product = this.products.get(productId)
        if (!product) return false

        const newReview = this.reviewService.createReview(review)
        product.rating.reviews.push(newReview)
        this.updateProductRating(product)

        return true
    }

    private updateProductRating(product: Product): void {
        if (product.rating.reviews.length === 0) {
            product.rating.average = 0
            product.rating.count = 0
        } else {
            const total = product.rating.reviews.reduce((sum, r) => sum + r.rating, 0)
            product.rating.average = total / product.rating.reviews.length
            product.rating.count = product.rating.reviews.length
        }
    }

    private generateProductId(): string {
        return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    public async processOrder(productId: string, quantity: number): Promise<boolean> {
        const product = this.products.get(productId)
        if (!product) return false

        if (product.inventory.available < quantity) {
            return false
        }

        await this.delay(100)
        product.inventory.reserved += quantity
        product.inventory.available -= quantity

        return true
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

class ReviewService {
    private reviews: Map<string, Review> = new Map()

    public createReview(data: Omit<Review, 'id' | 'createdAt'>): Review {
        const review: Review = {
            ...data,
            id: `review_${Date.now()}`,
            createdAt: new Date()
        }
        this.reviews.set(review.id, review)
        return review
    }

    public getReview(id: string): Review | undefined {
        return this.reviews.get(id)
    }
}
