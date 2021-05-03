import "reflect-metadata"
import { Container } from "inversify"
import { GraphQLSchema } from "graphql";
import { buildSchema } from "type-graphql"

import BookQueryResolver from "./queries/BookQueryResolver";

export default async (container: Container): Promise<GraphQLSchema> => {

    return buildSchema({
        resolvers: [
            BookQueryResolver
        ],
        container
    })
}