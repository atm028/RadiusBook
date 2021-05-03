import { Container } from "inversify"

import BookQueryResolver from "./queries/BookQueryResolver";
import { BookRepositorySequelize, IBookRepository, BookRepositorySequelizeType } from "@persist/sequelize/BookRepositorySequelize";
import ConfigurationService from "@common/config"
import { ConfigurationServiceNS } from "@common/config/interface"
import { BookEventService, BookEventServiceType, IBookEventService } from "@persist/redis/BookEventService"

export default async (): Promise<Container> => {
    const container = new Container()
    container.bind<IBookEventService>(BookEventServiceType).to(BookEventService).inSingletonScope()
    container.bind<IBookRepository>(BookRepositorySequelizeType).to(BookRepositorySequelize).inSingletonScope()
    container.bind<BookQueryResolver>(BookQueryResolver).toSelf()
    container.bind<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type).toConstantValue(ConfigurationService)
    return container
}