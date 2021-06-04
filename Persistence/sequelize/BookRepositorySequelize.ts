import { IBookFindParams, IBookFilter } from "./IBookResource";
import Book from "@domains/Book/Book";
import factoryBookModel from "./BookModel"
import { injectable, inject } from "inversify"
import { ConfigurationServiceNS } from "@common/config/interface";

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
    constructor(@inject(ConfigurationServiceNS.Type) private readonly config: ConfigurationServiceNS.Implementation) {
    }

    async findAll(params: IBookFindParams): Promise<Book[]> {
        return null
    }

    async findOne(where: IBookFilter): Promise<Book> {
        const { db: { host, port, dialect, dbname, username, password, schema } } = this.config
        console.log('sequielize.findOne params: ', host, port, dialect, dbname, username, password, schema)
        // @ts-ignore
        const Model = factoryBookModel({ host, port, dialect, dbname, username, password, tablename, schema })
        return Model.findOne(where)
    }

    async count(where: IBookFilter): Promise<number> {
        return 0
    }

    async save(book: Book): Promise<boolean> {
        try {
            //TODO: fix misstyping
            // @ts-ignore
            const { db: { host, port, dialect, dbname, username, password, schema } } = this.config
            const Model = factoryBookModel({ host, port, dialect, dbname, username, password, tablename, schema })
            const model = new Model({ name: book.name, author: book.author, source: book.source })
            await model.save()
            return true
        } catch (e) {
           console.log(e)
           return false
        }
    }
}