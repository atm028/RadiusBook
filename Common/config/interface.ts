import { IBookerAppConfiguration } from "@app/Booker/config/service"
import { IBookshelfAppConfiguration } from "@app/Bookshelf/config/service";
import { ISequelizeConfiguration } from "@persist/sequelize/config/service";
import { IBookParserConfiguration } from "@app/BookParser/config/service";
import { IRedisConfiguration } from "@persist/redis/config/service";
import { ILoggerConfiguration} from "@common/logger/config";

//TODO: it brokes the dependency inversion principle - because common configuration interface depends of implementation of each service

export namespace ConfigurationServiceNS {
    export const Type = Symbol.for('IConfigurationService')
    export interface Implementation {
        "booker": IBookerAppConfiguration,
        "bookparser": IBookParserConfiguration,
        "bookshelf": IBookshelfAppConfiguration,
        "db": ISequelizeConfiguration,
        "redis": IRedisConfiguration,
        'logger': ILoggerConfiguration
    }
}