import { Provider } from "nconf"

export interface IRedisConfiguration {
    hotst: string
    port: number
    cluster: boolean
    tls: boolean
    username: string
    password: string
}

export class RedisConfiguration implements IRedisConfiguration {
    constructor(private readonly config: Provider) {}

    get hotst(): string { return "0.0.0.0"}
    get port(): number { return 6379 }
    get cluster(): boolean { return false }
    get tls(): boolean { return false }
    get username(): string { return "" }
    get password(): string  { return "" }
}