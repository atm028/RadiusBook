import { IBook } from './index'
import { ObjectType, Field } from "type-graphql"

@ObjectType()
export default class Book implements IBook {
    private readonly _name: string
    private readonly _author: string
    private readonly _source: string
    private readonly _size: number

    constructor({
        name,
        author,
        source
    }: { name: string, author: string, source: string }
    ) {
        this._name = name
        this._author = author
        this._source = source
        this._size = 0
    }

    @Field()
    get name(): string { return this._name }
    @Field()
    get author(): string { return this._author }
    @Field()
    get source(): string { return this._source }
    @Field()
    get size(): number { return this._size }
}