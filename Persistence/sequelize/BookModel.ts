import {
    Model,
    Sequelize,
    literal,
    UUID,
    STRING
} from "sequelize"
import { IBook } from "@domains/Book";

interface IBookModel extends Model {
    name: string
    author: string
    source: string
}

type BookModel = typeof Model & {
    new (values?: object): IBook
}

// @ts-ignore
const factory: BookModel<IBookModel> = (
    {
        dialect,
        db,
        username,
        password ,
        tablename,
        schema
    }: {
        dialect: string;
        db: string;
        username: string;
        password: string;
        tablename: string;
        schema: string;
    }) => {
    try {
        // @ts-ignore
        const sequelize = new Sequelize(db, username, password, {dialect: dialect})
        return sequelize.define(
            'BookModel',
            {
                id: {
                    type: UUID,
                    primaryKey: true,
                    defaultValue: literal('gen_random_uuid()')
                },
                name: {
                    type: STRING(128),
                    allowNull: false
                },
                author: {
                    type: STRING(128),
                    allowNull: false
                },
                source: {
                    type: STRING(256),
                    allowNull: false
                }
            },
            {
                timestamps: false,
                tableName: tablename,
                schema: schema
            }
        )
    } catch (e) {
       console.log(e)
       return null
    }
}

export default factory as BookModel