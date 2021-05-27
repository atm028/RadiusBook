import "reflect-metadata"
import {inject, injectable} from "inversify";
import {BookRepositorySequelizeType, IBookRepository} from "@persist/sequelize/BookRepositorySequelize";
import { map, without, pathOr } from "ramda"
import Book from "@domains/Book/Book";

@injectable()
export default class BookCacheHandler {
    constructor(
        @inject(BookRepositorySequelizeType) private readonly repo: IBookRepository
    ) {}

    async NewBookHandler(data: string): Promise<string> {
        data.map(r => {})

        const id =data[0]
        const rawBook = JSON.parse(without("e", data[1]))
        const name = pathOr(undefined, ['_name'], rawBook)
        const author = pathOr(undefined, ['_author'], rawBook)
        const source = pathOr(undefined, ['_source'], rawBook)
        console.log(name, author, source)
        if(
            name !== undefined &&
            author !== undefined &&
            source !== undefined
        ) {
            const book = new Book({name, author, source})
            //TODO: check if the book already exist
            const res = await this.repo.save(book)
            if(res) {
                console.log("NewBookHandler: book saved: ", res)
                return id
            }
        } else {
            console.log("ERROR: incomplete book: ", data)
        }
        return undefined
    }
}