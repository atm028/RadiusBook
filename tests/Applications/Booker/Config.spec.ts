import {assert, expect} from "chai"
import {Container} from "inversify"
import {ConfigurationServiceNS} from "@common/config/interface";
import ConfigurationService from "@common/config";

const container = new Container()
container.bind<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type).toConstantValue(ConfigurationService)

describe("Booker Application configuration", () => {
    let appConfig

    beforeEach(() => {
        appConfig = container.get<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type).booker
    })

    it("should provide correct defualt application configuration", async () => {
        assert.equal(appConfig.name, "booker")
        assert.equal(appConfig.port, 9090)
    })
})