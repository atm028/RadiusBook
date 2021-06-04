import { EventEmitter } from "events"
import { Redis } from "ioredis"
import { map, last } from "ramda"
import {IRedisConfiguration} from "@persist/redis/config/service";

export type Subscription = {
    lastId: string
    channel: string
}

export default class StreamEventBroker extends EventEmitter {
    private readonly _redisService: Redis
    private readonly _redisConfiguration: IRedisConfiguration
    private _subscribtions: Map<string, Subscription>

    constructor(
        redisService: Redis,
        cfg: IRedisConfiguration
    ) {
        super()
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

            const messages = await this._redisService.xread(
                'COUNT',
                100,
                'BLOCK',
                10,
                'STREAMS',
                ...streamIds,
                ...streamOffset
            )

            if(messages) {
                const channels = Object.keys(messages)
                channels.map(c => {
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

    async readGrouStream(): Promise<void> {
        console.log("started readGrouStream")
        try {
            await this._redisService.xgroup('CREATE', 'book-stream', 'book-parsers', '$', 'MKSTREAM')
        } catch (err) {
            console.log('readGrouStream: xgroup: create: ', err)
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
            if(message) {
                //TODO: avoid magic indexes
                const channel = message[0][0]
                console.log("emit to ", channel)
                this.emit("BOOK_PARSERS", message[0][1][0])
            }
        }
    }

    async ack(id:string): Promise<boolean> {
        return this._redisService.xack("book-stream", "book-parsers", id)
    }

    async publish(channel: string, message: string, messageId: string = "*") {
        console.log("XADD: ", channel)
        const r = await this._redisService.xadd(channel, 'MAXLEN', '~', 500, messageId, 'e', message)
        console.log("XADD: res: ", r)
    }

    async subscrube(channel): Promise<void> {
        await this._subscribtions.set(channel, {lastId: "0", channel: channel})
    }
}