import "reflect-metadata"
import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { inject, injectable } from "inversify";

import { BookEventServiceType, IBookEventService } from "@persist/redis/BookEventService"
import {BookRepositorySequelizeType, IBookRepository } from "@persist/sequelize/BookRepositorySequelize";
import Book from "@domains/Book/Book"

@Resolver()
@injectable()
export default class BookQueryResolver {
    constructor(
        @inject(BookRepositorySequelizeType) private readonly repo: IBookRepository,
        @inject(BookEventServiceType) private readonly cache: IBookEventService
    ) {
    }

    @Query(returns => Book)
    async BookInfo(@Arg("id") id: string): Promise<Book> {
        console.log("Requested Info for book id: ", id)
        const book = await this.repo.findOne({id: id})
        // @ts-ignore
        return new Book(book.dataValues)
    }

    @Mutation(returns => Number)
    async CreateBook(
        @Arg("name") name: string,
        @Arg("author") author: string,
        @Arg("source") source: string
    ): Promise<Number> {
        console.log("Book created: ", name, author, source)
        const book = new Book({ name, author, source })
        this.cache.postNewBook(JSON.stringify(book))
        return 0
    }
}