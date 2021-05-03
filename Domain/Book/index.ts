
export const IBookType = Symbol.for('IBook')

export interface IBook {
    name: string
    author: string
    source: string
    size: number
}
