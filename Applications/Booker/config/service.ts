import { Provider } from "nconf"

export interface IBookerAppConfiguration {
    port: number
    level: string
}

export class BookerAppConfiguration implements IBookerAppConfiguration {
    constructor(private readonly config: Provider) {}

    get port(): number { return Number(this.config.get("booker:port")) }

    get level(): string {
        let level = process.env.DEBUG_LEVEL
        if( level !== undefined ) return String(level).toLowerCase()
        level = this.config.get("book.level")
        if( level !== undefined ) return String(level).toLowerCase()
        return "info"
    }

    set level(level: string) { this.config.set("book.level", level.toLowerCase()) }
}
