import * as express from "express"

import { ConfigurationServiceNS } from "@common/config/interface";
import Container from "./container";
import {ILogger, LoggerType} from "@common/logger";

const main = async () => {
    const server = express()
    const container = await Container
    const {bookshelf: { port }} = container.get<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type)
    const logger = await container.get<ILogger>(LoggerType).getLogger("Bookshelf")
    logger.info("Start listening on port: port")
    server.listen(port)
}
main()