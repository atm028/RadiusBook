import { IBookFindParams, IBookFilter } from "./IBookResource";
import Book from "@domains/Book/Book";
import factoryBookModel from "./BookModel"
import { injectable, inject } from "inversify"
import { ConfigurationServiceNS } from "@common/config/interface";
import {ILogger, LoggerType} from "@common/logger";

import * as bunyan from 'bunyan'
const tablename = "books"

export const BookRepositorySequelizeType = Symbol.for('BookRepositorySequelize')

export interface IBookRepository {
    findAll(params: IBookFindParams): Promise<Book[]>
    findOne(where: IBookFilter): Promise<Book>
    count(where: IBookFilter): Promise<number>
    save(book: Book): Promise<boolean>
}

//TODO: implement migration
/*
Resources: https://sequelize.org/v4/manual/tutorial/migrations.html
CREATE USER booker WITH PASSWORD 'booker';

CREATE SCHEMA IF NOT EXISTS booker AUTHORIZATION booker

CREATE TABLE IF NOT EXISTS booker.books (
      id          uuid PRIMARY KEY,
      name        text,
      author      text,
      source      text
)

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA booker TO booker;
 */

@injectable()
export class BookRepositorySequelize implements IBookRepository {
    private readonly _model: any
    private readonly _logger: bunyan.Logger
    constructor(
        @inject(ConfigurationServiceNS.Type) private readonly config: ConfigurationServiceNS.Implementation,
        @inject(LoggerType) private readonly logger: ILogger) {
        const { db: { host, port, dialect, dbname, username, password, schema } } = this.config
        // @ts-ignore
        this._model = factoryBookModel({ host, port, dialect, dbname, username, password, tablename, schema })
        this._logger = logger.getLogger("BookRepositorySequelize")
    }

    async findAll(params: IBookFindParams): Promise<Book[]> {
        return null
    }

    async findOne(where: IBookFilter): Promise<Book> {
        return this._model.findOne(where)
    }

    async count(where: IBookFilter): Promise<number> {
        return 0
    }

    async save(book: Book): Promise<boolean> {
        try {
            const model = new this._model({ name: book.name, author: book.author, source: book.source })
            await model.save()
            return true
        } catch (e) {
            this._logger.error(e)
            return false
        }
    }
}