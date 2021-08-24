//TODO: in case of deployment via containers each application

import { IBookerAppConfiguration, BookerAppConfiguration } from "@app/Booker/config/service";
import { ISequelizeConfiguration, SequelizeConfiguration } from "@persist/sequelize/config/service";
import {BookParserAppConfiguration, IBookParserConfiguration} from "@app/BookParser/config/service";
import { ConfigurationServiceNS } from "@common/config/interface";
import { Provider } from "nconf"
import {IBookshelfAppConfiguration} from "@app/Bookshelf/config/service";
import {IRedisConfiguration, RedisConfiguration} from "@persist/redis/config/service";
import {ILoggerConfiguration, LoggerConfiguration} from "@common/logger/config";

export class ConfigurationService implements ConfigurationServiceNS.Implementation {
    private readonly bookSection: IBookerAppConfiguration
    private readonly dbSection: ISequelizeConfiguration
    private readonly bookparserSection: IBookParserConfiguration
    private readonly redisSection: IRedisConfiguration
    private readonly loggerSection: ILoggerConfiguration

    constructor(private readonly config: Provider) {
        this.bookSection = new BookerAppConfiguration(config)
        this.bookparserSection = new BookParserAppConfiguration(config)
        this.dbSection = new SequelizeConfiguration(config)
        this.redisSection = new RedisConfiguration(config)
        this.loggerSection = new LoggerConfiguration(config)
    }

    get booker(): IBookerAppConfiguration { return this.bookSection }
    get bookparser(): IBookParserConfiguration { return this.bookparserSection }
    get bookshelf(): IBookshelfAppConfiguration { return undefined }
    get db(): ISequelizeConfiguration { return this.dbSection }
    get redis(): IRedisConfiguration { return this.redisSection }
    get logger(): ILoggerConfiguration { return this.loggerSection }
}