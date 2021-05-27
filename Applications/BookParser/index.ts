import "reflect-metadata"
import * as express from "express"
import Container from "./container"
import { ConfigurationServiceNS } from "@common/config/interface";
import { BookEventServiceType, IBookEventService } from "@persist/redis/BookEventService"
import BookCacheHandler from "@app/BookParser/queries/BookCacheHandler";

//TODO: add data recovery from own PEL after disaster
/*
1. get number of pending messages
0.0.0.0:6379> XPENDING book-stream book-parsers
1) (integer) 40
2) "1622045731639-0"
3) "1622110837796-0"
4) 1) 1) "parser1"
      2) "40"

2. Then using received number get the whole list of records(may be with pagination if records too mach)
0.0.0.0:6379> XPENDING book-stream book-parsers - + 40 parser1

3. Read each message and handle it
0.0.0.0:6379> xrange book-stream ID ID
 */
const main = async () => {
    const server = express()
    const container = await Container()
    const { booker: { port }} = container.get<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type)
    const cache = container.get<IBookEventService>(BookEventServiceType)
    await cache.startGroupStream()

    cache.on("BOOK_PARSERS", async (data) => {
        const handler = container.get(BookCacheHandler)
        const id  = await handler.NewBookHandler(data)
        if(id !== undefined) {
            const res = await cache.ack(id)
            if(res) {
                console.log("ACK: ", id)
            }
        } else {
            console.log("NewBookHandler: error")
        }
    })

    server.get('/health', async (req, res) => {
        res.sendStatus(200)
    })

    console.log("Start listening on port: ", port+1)
    server.listen(port+1)
}
main()
