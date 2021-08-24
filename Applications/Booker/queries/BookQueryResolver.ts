import "reflect-metadata"
import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { inject, injectable } from "inversify";

import * as bunyan from 'bunyan'
import { BookEventServiceType, IBookEventService } from "@persist/redis/BookEventService"
import {BookRepositorySequelizeType, IBookRepository } from "@persist/sequelize/BookRepositorySequelize";
import Book from "@domains/Book/Book"
import {ILogger, LoggerType} from "@common/logger";

@Resolver()
@injectable()
export default class BookQueryResolver {
    private readonly _logger: bunyan.Logger
    constructor(
        @inject(BookRepositorySequelizeType) private readonly repo: IBookRepository,
        @inject(BookEventServiceType) private readonly cache: IBookEventService,
        @inject(LoggerType) private readonly logger: ILogger
    ) {
        this._logger = logger.getLogger("BookQueryResolver")
    }

    @Query(returns => Book)
    async BookInfo(@Arg("id") id: string): Promise<Book> {
        this._logger.debug("Requested Info for book id: ", id)
        const book = await this.repo.findOne({id: id})
        // @ts-ignore
        return new Book(book.dataValues)
    }

    @Mutation(returns => Number)
    async CreateBook(
        @Arg("name") name: string,
        @Arg("author") author: string,
        @Arg("source") source: string
    ): Promise<number> {
        this._logger.debug("Book created: ", name, author, source)
        const book = new Book({ name, author, source })
        this.cache.postNewBook(book)
        return 0
    }
}