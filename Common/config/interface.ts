import { IBookerAppConfiguration } from "@app/Booker/config/service"
import { IBookshelfAppConfiguration } from "@app/Bookshelf/config/service";
import { ISequelizeConfiguration } from "@persist/sequelize/config/service";

export namespace ConfigurationServiceNS {
    export const Type = Symbol.for('IConfigurationService')
    export interface Implementation {
        "booker": IBookerAppConfiguration,
        "bookshelf": IBookshelfAppConfiguration,
        "db": ISequelizeConfiguration
    }
}