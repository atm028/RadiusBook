import { EventEmitter } from "events"
import { Redis } from "ioredis"
import { map, last } from "ramda"
import {IRedisConfiguration} from "@persist/redis/config/service";
import {ILogger} from "@common/logger";
import * as bunyan from 'bunyan'

export type Subscription = {
    lastId: string
    channel: string
}

export default class StreamEventBroker extends EventEmitter {
    private readonly _logger: bunyan.Logger
    private readonly _redisService: Redis
    private readonly _redisConfiguration: IRedisConfiguration
    private _subscribtions: Map<string, Subscription>

    constructor(
        redisService: Redis,
        cfg: IRedisConfiguration,
        logger: ILogger
    ) {
        super()
        this._logger = logger.getLogger('StreamEventBroker')
        this._redisService = redisService.duplicate()
        //TODO: add prefix usage
        this._redisService.client('id')
        this._redisConfiguration = cfg
        this._subscribtions = new Map<string, Subscription>()

        this._redisService.on( "error", err => this.emit("error", err) )
        this._redisService.on( "ready", () => this.emit("ready"))
        this._redisService.on( "connect", async () => {} )
    }

    async readStream(): Promise<void> {
        while (true) {
            if (this._redisService === undefined) return

            const streamIds: string[] = []
            const streamOffset: string[] = []

            if (this._subscribtions.size < 1) return

            this._subscribtions.forEach((v: Subscription, k: string) => {
                streamIds.push(k)
                streamOffset.push(v.lastId)
            })

            this._logger.trace('XREAD COUNT 1 BLOCK 10 STREAM %s %s', streamIds.join(' '), streamOffset.join(' '))

            const messages = await this._redisService.xread(
                'COUNT',
                1,
                'BLOCK',
                10,
                'STREAMS',
                ...streamIds,
                ...streamOffset
            )

            if(messages) {
                const channels = Object.keys(messages)
                channels.map(c => {
                    this._logger.debug(`readStream: channel: ${c}: record: ${messages[c]}`)
                    const channel = messages[c][0]
                    const subscribtion = this._subscribtions.get(channel)
                    if(subscribtion) {
                        const eventMessages = messages[c][1]
                        subscribtion.lastId = last(eventMessages)[0]
                        this._subscribtions.set(channel, subscribtion)
                        this.emit(subscribtion.channel, map(s => last(s), eventMessages))
                    }
                })
            }
        }
    }

    async readGroupStream(): Promise<void> {
        this._logger.info("starting readGrouStream")
        try {
            this._logger.debug('CREATE', 'book-stream', 'book-parsers', '$', 'MKSTREAM')
            await this._redisService.xgroup('CREATE', 'book-stream', 'book-parsers', '$', 'MKSTREAM')
        } catch (err) {
            this._logger.debug('readGrouStream: xgroup: create: ', err)
        }

        while (true) {
            const message = await this._redisService.xreadgroup(
                'GROUP',
                'book-parsers', //TODO: get group name from config
                this._redisConfiguration.consumer,
                'COUNT',
                1,
                'BLOCK',
                10,
                'STREAMS',
                'book-stream', //TODO: get stream name from config
                '>'
            )
            this._logger.debug(message)
            if(message) {
                //TODO: avoid magic indexes
                const channel = message[0][0]
                this._logger.debug("emit to ", channel)
                this.emit("BOOK_PARSERS", message[0][1][0])
            }
        }
    }

    async ack(id:string): Promise<boolean> {
        return this._redisService.xack("book-stream", "book-parsers", id)
    }

    async publish(channel: string, message: string, messageId: string = "*") {
        try {
            this._logger.debug("XADD: ", channel)
            const r = await this._redisService.xadd(channel, 'MAXLEN', '~', 500, messageId, 'e', message)
            this._logger.debug("XADD: res: ", r)
        } catch (e) {
            this._logger.error(`Publish was broken with error: ${e}`)
            this.emit('error', e)
        }
    }

    async subscribe(channel): Promise<void> {
        await this._subscribtions.set(channel, {lastId: "0", channel: channel})
    }

    async unsubscribe(channel): Promise<void> {
        await this._subscribtions.delete(channel)
    }
}