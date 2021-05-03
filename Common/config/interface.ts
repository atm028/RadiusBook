import { IBookerAppConfiguration } from "@app/Booker/config/service"
import { ISequelizeConfiguration } from "@persist/sequelize/config/service";

export namespace ConfigurationServiceNS {
    export const Type = Symbol.for('IConfigurationService')
    export interface Implementation {
        "booker": IBookerAppConfiguration,
        "db": ISequelizeConfiguration
    }
}