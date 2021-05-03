import Book from "../../Domain/Book/Book"

export interface IBookFilter {
    id?: string | string[]
    name? : string
    author?: string
}

export interface IBookFindParams {
    where?: IBookFilter
    limit?: number
}
