import * as express from "express"

import { ConfigurationServiceNS } from "@common/config/interface";
import Container from "./container";

const main = async () => {
    const server = express()
    const container = await Container
    const {bookshelf: { port }} = container.get<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type)
    console.log("Start listening on port: port")
    server.listen(port)
}
main()