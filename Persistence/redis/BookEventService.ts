import { EventEmitter } from "events"
import StreamEventBroker from "./StreamEventBroker"
import IORedis from "ioredis"
import { ConfigurationServiceNS } from "@common/config/interface";
import { decorate, injectable, inject } from "inversify"
decorate(injectable(), EventEmitter)

export const BookEventServiceType = Symbol.for('BookEventService')

export interface IBookEventService extends EventEmitter{
    subscribe(channel: string): void
    postNewBook(message: string): Promise<void>
}

@injectable()
export class BookEventService extends EventEmitter implements IBookEventService {
    private readonly _redis: IORedis
    private readonly _broker: StreamEventBroker

    constructor(
        @inject(ConfigurationServiceNS.Type) private readonly config: ConfigurationServiceNS.Implementation
    ) {
        super()
        this._redis = new IORedis()
        //TODO: get prefix and channel name from config
        this._broker = new StreamEventBroker(this._redis, "BOOKER_")
        //TODO use channel from config
        this._broker.on("BOOKER_TEST", (data) => this.emit("BOOKER_TEST", data))
        const _deactivate = async err => console.log("DEACTIVATE: ", err)
        this.subscribe("BOOKER_TEST")
        this._broker.readStream().then(_deactivate).catch(_deactivate)
    }

    postNewBook = async (message: string): Promise<void>  => this._broker.publish("BOOKER_TEST", message, "*")
    subscribe = async (channel: string): Promise<void> => this._broker.subscrube(channel)
}
