import "reflect-metadata"
import {inject, injectable} from "inversify";
import {BookRepositorySequelizeType, IBookRepository} from "@persist/sequelize/BookRepositorySequelize";
import { without, pathOr } from "ramda"
import Book from "@domains/Book/Book";
import {ILogger, LoggerType} from "@common/logger";
import * as bunyan from 'bunyan'
@injectable()
export default class BookCacheHandler {
    private readonly _logger: bunyan.Logger
    constructor(
        @inject(BookRepositorySequelizeType) private readonly repo: IBookRepository,
        @inject(LoggerType) private readonly logger: ILogger
    ) {
        this._logger = logger.getLogger("BookCacheHandler")
    }

    async NewBookHandler(data: string): Promise<string> {
        //data.map(r => {})

        const id = data[0]
        const rawBook = JSON.parse(without("e", data[1]))
        const name = pathOr(undefined, ['_name'], rawBook)
        const author = pathOr(undefined, ['_author'], rawBook)
        const source = pathOr(undefined, ['_source'], rawBook)
        this._logger.debug(name, author, source)
        if(
            name !== undefined &&
            author !== undefined &&
            source !== undefined
        ) {
            const book = new Book({name, author, source})
            //TODO: check if the book already exist
            const res = await this.repo.save(book)
            if(res) {
                this._logger.debug("NewBookHandler: book saved: ", res)
                return id
            }
        } else {
            this._logger.error("ERROR: incomplete book: ", data)
        }
        return undefined
    }
}