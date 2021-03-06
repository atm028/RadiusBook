import { Container } from "inversify"
import {
    BookRepositorySequelize,
    BookRepositorySequelizeType,
    IBookRepository
} from "@persist/sequelize/BookRepositorySequelize";
import PersistContainer from "@persist/container"
import ConfigurationService from "@common/config"
import {ConfigurationServiceNS} from "@common/config/interface";
import BookCacheHandler from "@app/BookParser/queries/BookCacheHandler";
import {BookEventService, BookEventServiceType, IBookEventService} from "@persist/redis/BookEventService";

export default async (): Promise<Container> => {
    let container = new Container()
    container = await PersistContainer(container)

    container.bind<IBookEventService>(BookEventServiceType).to(BookEventService).inSingletonScope()
    container.bind<IBookRepository>(BookRepositorySequelizeType).to(BookRepositorySequelize).inSingletonScope()
    container.bind<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type).toConstantValue(ConfigurationService)
    container.bind<BookCacheHandler>(BookCacheHandler).toSelf()
    return container
}