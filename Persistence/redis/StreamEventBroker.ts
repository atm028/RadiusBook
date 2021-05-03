import { EventEmitter } from "events"
import { Redis } from "ioredis"
import { map, last } from "ramda"

export type Subscription = {
    lastId: string
    channel: string
}

export default class StreamEventBroker extends EventEmitter {
    private readonly _redisService: Redis
    private readonly _channelNamePrefix: string
    private _subscribtions: Map<string, Subscription>

    constructor(redisService: Redis, channelNamePrefix: string) {
        super()
        this._redisService = redisService.duplicate()
        //TODO: add prefix usage
        this._channelNamePrefix = channelNamePrefix
        this._redisService.client('id')

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

    async publish(channel: string, message: string, messageId: string = "*") {
        console.log("XADD: ", channel)
        const r = await this._redisService.xadd(channel, 'MAXLEN', '~', 500, messageId, 'e', message)
        console.log("XADD: res: ", r)
    }

    async subscrube(channel): Promise<void> {
        await this._subscribtions.set(channel, {lastId: "0", channel: channel})
    }
}