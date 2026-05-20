// 示例 ArkTS 文件

import { User, getUserInfo } from './user'
import { formatDate } from './utils'

class ExampleService {
    private name: string
    private count: number = 0

    constructor(name: string) {
        this.name = name
    }

    public initialize(): void {
        console.log(`Initializing ${this.name}`)
        this.count = 0
    }

    public getCount(): number {
        return this.count
    }
}

function greet(name: string): string {
    return `Hello, ${name}!`
}

const add = (a: number, b: number): number => {
    return a + b
}

async function fetchData(url: string): Promise<any> {
    const response = await fetch(url)
    return await response.json()
}

export { ExampleService, greet, add, fetchData }
