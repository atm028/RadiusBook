import {assert, expect} from "chai"
import {Container} from "inversify"

import ConfigurationService from "@common/config"
import { ConfigurationServiceNS } from "@common/config/interface"

const container = new Container()
container.bind<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type).toConstantValue(ConfigurationService)

describe('Sequelize configuration', () => {
    let dbConfig

    beforeEach(() => {
        dbConfig = container.get<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type).db
    })

    it('should create correct default config', async () => {
        assert.equal(dbConfig.host, "0.0.0.0")
        assert.equal(dbConfig.port, 5432)
        assert.equal(dbConfig.dialect, "postgres")
        assert.equal(dbConfig.dbname, "booker")
        assert.equal(dbConfig.username, "booker")
        assert.equal(dbConfig.password, "booker")
        assert.equal(dbConfig.schema, "booker")
    })
})