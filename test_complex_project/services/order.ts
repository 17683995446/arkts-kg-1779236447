// 订单服务
import { ProductService, Product } from '../models/product'
import { User } from '../models/user'

export interface Order {
    id: string
    userId: string
    items: OrderItem[]
    status: OrderStatus
    total: number
    shippingAddress: Address
    paymentMethod: PaymentMethod
    createdAt: Date
    updatedAt: Date
}

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

export interface OrderItem {
    productId: string
    product: Product
    quantity: number
    price: number
    discount?: number
}

export interface Address {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
}

export enum PaymentMethod {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    PAYPAL = 'paypal',
    BANK_TRANSFER = 'bank_transfer'
}

type OrderFilter = {
    userId?: string
    status?: OrderStatus
    startDate?: Date
    endDate?: Date
}

type SortField = 'createdAt' | 'total' | 'status'

export class OrderService {
    private orders: Map<string, Order> = new Map()
    private productService: ProductService

    constructor(productService: ProductService) {
        this.productService = productService
    }

    public async createOrder(
        userId: string,
        items: Array<{ productId: string; quantity: number }>,
        shippingAddress: Address,
        paymentMethod: PaymentMethod
    ): Promise<Order> {
        const orderItems: OrderItem[] = []
        let total = 0

        for (const item of items) {
            const product = this.productService.getProduct(item.productId)
            if (!product) {
                throw new Error(`Product not found: ${item.productId}`)
            }

            if (product.inventory.available < item.quantity) {
                throw new Error(`Insufficient inventory for product: ${product.name}`)
            }

            const orderItem: OrderItem = {
                productId: product.id,
                product,
                quantity: item.quantity,
                price: product.price
            }

            orderItems.push(orderItem)
            total += product.price * item.quantity

            const success = await this.productService.processOrder(product.id, item.quantity)
            if (!success) {
                throw new Error(`Failed to reserve product: ${product.name}`)
            }
        }

        const order: Order = {
            id: this.generateOrderId(),
            userId,
            items: orderItems,
            status: OrderStatus.PENDING,
            total,
            shippingAddress,
            paymentMethod,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        this.orders.set(order.id, order)
        await this.processPayment(order)

        return order
    }

    public getOrder(id: string): Order | undefined {
        return this.orders.get(id)
    }

    public getOrdersByUser(userId: string): Order[] {
        return Array.from(this.orders.values())
            .filter(order => order.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

    public getOrders(filter?: OrderFilter): Order[] {
        let results = Array.from(this.orders.values())

        if (filter?.userId) {
            results = results.filter(o => o.userId === filter.userId)
        }
        if (filter?.status) {
            results = results.filter(o => o.status === filter.status)
        }
        if (filter?.startDate) {
            results = results.filter(o => o.createdAt >= filter.startDate!)
        }
        if (filter?.endDate) {
            results = results.filter(o => o.createdAt <= filter.endDate!)
        }

        return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

    public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
        const order = this.orders.get(orderId)
        if (!order) return null

        const validTransitions = this.getValidStatusTransitions(order.status)
        if (!validTransitions.includes(status)) {
            throw new Error(
                `Invalid status transition from ${order.status} to ${status}`
            )
        }

        order.status = status
        order.updatedAt = new Date()

        if (status === OrderStatus.SHIPPED) {
            await this.sendShippingNotification(order)
        }

        return order
    }

    public async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
        const order = this.orders.get(orderId)
        if (!order) return false

        if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
            throw new Error('Cannot cancel order in current status')
        }

        for (const item of order.items) {
            await this.productService.processOrder(item.productId, -item.quantity)
        }

        order.status = OrderStatus.CANCELLED
        order.updatedAt = new Date()

        return true
    }

    private async processPayment(order: Order): Promise<void> {
        await this.delay(100)
        order.status = OrderStatus.CONFIRMED
        order.updatedAt = new Date()
    }

    private getValidStatusTransitions(currentStatus: OrderStatus): OrderStatus[] {
        const transitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
            [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
            [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
            [OrderStatus.DELIVERED]: [],
            [OrderStatus.CANCELLED]: []
        }
        return transitions[currentStatus]
    }

    private async sendShippingNotification(order: Order): Promise<void> {
        console.log(`Shipping notification sent for order ${order.id}`)
        await this.delay(50)
    }

    private generateOrderId(): string {
        return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    public getOrderStatistics(): OrderStatistics {
        const orders = Array.from(this.orders.values())
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
        const totalOrders = orders.length
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        const statusCounts = Object.values(OrderStatus).reduce((acc, status) => {
            acc[status] = orders.filter(o => o.status === status).length
            return acc
        }, {} as Record<OrderStatus, number>)

        return {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            statusCounts
        }
    }
}

interface OrderStatistics {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    statusCounts: Record<OrderStatus, number>
}
