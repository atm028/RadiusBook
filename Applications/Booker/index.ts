import * as express from "express"
import { graphqlHTTP } from "express-graphql";

import Container from "./container"
import GraphQLSchema from "./schema"

import { ConfigurationServiceNS } from "@common/config/interface";

const main = async () => {
    const server = express()
    const container = await Container()
    const schema = await GraphQLSchema(container)
    server.use('/graphql', graphqlHTTP({ schema, graphiql: true } ) )
    const { booker: { port }} = container.get<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type)
    console.log("Start listening on port: ", port)
    server.listen(port)
}
main()
