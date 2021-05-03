import * as express from "express"
import Container from "../container"
import { ConfigurationServiceNS } from "@common/config/interface";
import { BookEventServiceType, IBookEventService } from "@persist/redis/BookEventService"


const main = async () => {
    const server = express()
    const container = await Container()
    const { booker: { port }} = container.get<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type)
    const cache = container.get<IBookEventService>(BookEventServiceType)

    const createNewBook = async (data): Promise<void> => {
        data.map(r => {})
        console.log(data)
    }

    cache.on("BOOKER_TEST", async (data) => {
        await createNewBook(data)
    })

    console.log("Start listening on port: ", port+1)
    server.listen(port+1)
}
main()
