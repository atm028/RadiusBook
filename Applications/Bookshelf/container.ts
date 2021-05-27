import { Container } from "inversify"

import { ConfigurationServiceNS } from "@common/config/interface";
import {ConfigurationService} from "@common/config/configuration";

export default async (): Promise<Container> => {
    const container = new Container()
    container.bind<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type).toConstantValue(ConfigurationService)
    return container
}