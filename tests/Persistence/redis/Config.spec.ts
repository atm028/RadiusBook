import {assert, expect} from "chai"
import {Container} from "inversify"

import ConfigurationService from "@common/config";
import {ConfigurationServiceNS} from "@common/config/interface";

const container = new Container()
container.bind<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type).toConstantValue(ConfigurationService)

describe('Redis configurton', () => {
    let redisConfig

    beforeEach(() => {
        redisConfig = container.get<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type).redis
    })

    it('shoud provide correct default configuration options', async () => {
        assert.equal(redisConfig.host, "0.0.0.0")
        assert.equal(redisConfig.port, 6379)
        assert.equal(redisConfig.cluster, false)
        assert.equal(redisConfig.tls, false)
        assert.equal(redisConfig.username, "")
        assert.equal(redisConfig.password, "")
    })
})