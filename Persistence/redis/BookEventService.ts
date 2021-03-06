import "reflect-metadata"
import { EventEmitter } from "events"
import StreamEventBroker from "./StreamEventBroker"
import IORedis from "ioredis"
import { ConfigurationServiceNS } from "@common/config/interface";
import { decorate, injectable, inject } from "inversify"
import Book from "@domains/Book/Book";
import {ILogger, LoggerType} from "@common/logger";
decorate(injectable(), EventEmitter)

import * as bunyan from 'bunyan'

export const BookEventServiceType = Symbol.for('BookEventService')

export interface IBookEventService extends EventEmitter{
    subscribe(channel: string): Promise<void>
    postNewBook(message: Book): Promise<void>
    ack(id: string): Promise<boolean>
    //TODO: remove this method and do subscribtion to "book-stream" configurable
    startGroupStream(): Promise<void>
}

//TODO: implement disaster recovery
/*
Resources:
XPENDING book-stream book-parsers - + 10 parser1

0.0.0.0:6379> XPENDING book-stream book-parsers
1) (integer) 40
2) "1622045731639-0"
3) "1622110837796-0"
4) 1) 1) "parser1"
      2) "40"
0.0.0.0:6379> XPENDING book-stream book-parsers - + 40 parser1
 */
//TODO: implement reconnetions to redis and sequelize and error handling


@injectable()
export class BookEventService extends EventEmitter implements IBookEventService {
    private readonly _redis: IORedis
    private readonly _broker: StreamEventBroker
    private readonly _logger: bunyan.Logger

    constructor(
        @inject(ConfigurationServiceNS.Type) private readonly config: ConfigurationServiceNS.Implementation,
        @inject(LoggerType) private readonly logger: ILogger,
    ) {
        super()
        this._logger = logger.getLogger("BokEventService")
        this._redis = new IORedis(this.config.redis.port, this.config.redis.host)
        //TODO: get prefix and channel name from config
        this._broker = new StreamEventBroker(this._redis, this.config.redis, logger)
        //TODO use channel from config
        this._broker.on("RB_SERVICE", (data) => this.emit("RB_SERVICE", data))
        this._broker.on("BOOK_PARSERS", (data) => this.emit("BOOK_PARSERS", data))
        const _deactivate = async err => console.log("DEACTIVATE: ", err)
        this.subscribe("RB_SERVICE")
        this._broker.readStream().then(_deactivate).catch(_deactivate)
    }

    startGroupStream = async(): Promise<void> => {
        this._logger.trace("startGroupStream")
        const _deactivate = async err => console.log("DEACTIVATE: ", err)
        this._logger.trace("Subscribe to group book-stream")
        this._broker.readGroupStream().then(_deactivate).catch(_deactivate)
    }
    postNewBook = async (message: Book): Promise<void>  => this._broker.publish("book-stream", JSON.stringify(message), "*")
    subscribe = async (channel: string): Promise<void> => this._broker.subscribe(channel)
    ack = async (id: string): Promise<boolean> => this._broker.ack(id)
}
