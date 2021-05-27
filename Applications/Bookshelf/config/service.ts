import { Provider } from "nconf"

export interface IBookshelfAppConfiguration {
    port: number
    level: string
}

export class BookshelfConfiguration implements IBookshelfAppConfiguration {
    constructor(private readonly config: Provider) {
    }

    get port(): number { return 9091 }

    get level(): string { return "DEBUG" }
}
