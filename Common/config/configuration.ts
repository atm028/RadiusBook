import { IBookerAppConfiguration, BookerAppConfiguration } from "@app/Booker/config/service";
import { ISequelizeConfiguration, SequelizeConfiguration } from "@persist/sequelize/config/service";
import { ConfigurationServiceNS } from "@common/config/interface";
import { Provider } from "nconf"

export class ConfigurationService implements ConfigurationServiceNS.Implementation {
    private readonly bookSection: IBookerAppConfiguration
    private readonly dbSection: ISequelizeConfiguration

    constructor(private readonly config: Provider) {
        this.bookSection = new BookerAppConfiguration(config)
        this.dbSection = new SequelizeConfiguration(config)
    }

    get booker(): IBookerAppConfiguration { return this.bookSection }
    get db(): ISequelizeConfiguration { return this.dbSection }
}