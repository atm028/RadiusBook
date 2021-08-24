import "reflect-metadata"
import * as express from "express"
import Container from "./container"
import { ConfigurationServiceNS } from "@common/config/interface";
import { BookEventServiceType, IBookEventService } from "@persist/redis/BookEventService"
import BookCacheHandler from "@app/BookParser/queries/BookCacheHandler";
import {ILogger, LoggerType} from "@common/logger"

//TODO: add data recovery from own PEL after disaster

const main = async () => {
    const server = express()
    const container = await Container()
    const { bookparser: { port }} = container.get<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type)
    const logger = await container.get<ILogger>(LoggerType).getLogger("BookParser")
    const cache = container.get<IBookEventService>(BookEventServiceType)
    await cache.startGroupStream()

    cache.on("BOOK_PARSERS", async (data) => {
        const handler = container.get(BookCacheHandler)
        const id  = await handler.NewBookHandler(data)
        if(id !== undefined) {
            const res = await cache.ack(id)
            if(res) {
                logger.debug("ACK: ", id)
            }
        } else {
            logger.debug("NewBookHandler: error")
        }
    })

    server.get('/health', async (req, res) => {
        res.sendStatus(200)
    })

    logger.info("Start listening on port: ", port+1)
    server.listen(port+1)
}
main()
