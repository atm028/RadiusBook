import { Provider } from "nconf"
import { uuid } from 'uuidv4'

export interface IRedisConfiguration {
    host: string
    port: number
    cluster: boolean
    tls: boolean
    username: string
    password: string
    consumer: string
    prefix: string
}

export class RedisConfiguration implements IRedisConfiguration {
    constructor(private readonly config: Provider) {}

    get prefix(): string {
        return "BOOKER_"
    }

    get consumer(): string {
        return "booker-"+uuid()
    }

    get host(): string {
        let host = this.config.get('REDIS_HOST')
        if(host !== undefined) {
            return String(host).toLowerCase()
        }
        host = this.config.get('redis:host')
        if(host !== undefined) {
            return String(host).toLowerCase()
        }
        return "0.0.0.0"
    }

    get port(): number { return 6379 }

    get cluster(): boolean { return false }

    get tls(): boolean { return false }

    get username(): string { return "" }

    get password(): string  { return "" }
}