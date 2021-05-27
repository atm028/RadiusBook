import { Provider } from "nconf"

export interface IBookParserConfiguration {
    port: number
    level: string
}

export class BookParserAppConfiguration implements IBookParserConfiguration {
    constructor(private readonly config: Provider) {}

    get port(): number { return 9092 }

    get level(): string { return "DEBUG" }
}