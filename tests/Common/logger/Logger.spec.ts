import {assert, expect} from 'chai'
import {ILoggerConfiguration, LoggerConfiguration} from "@common/logger/config";
import {Container} from 'inversify'
import {ConfigurationServiceNS} from "@common/config/interface";
import ConfigurationService from "@common/config";
import {ILogger, Logger, LoggerType} from "@common/logger"
import base = Mocha.reporters.base;

const container = new Container()
container.bind<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type).toConstantValue((ConfigurationService))
container.bind<ILogger>(LoggerType).to(Logger).inSingletonScope()

describe('LoggerConfiguration', () => {
    let loggerConfig

    beforeEach(() => {
        loggerConfig = container.get<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type).logger
    })

    it('should provide correct  default path of the log', async () => {
        assert.equal(loggerConfig.path, './')
    })

    it('should provide correct log path from env variable', async () => {
        const path = "new_log_path"
        const tmp = process.env.LOG_PATH
        process.env.LOG_PATH = path
        assert.equal(loggerConfig.path, path)
        process.env.LOG_PATH = tmp
    })

    it('should provide correct default log level', async () => {
        assert.equal(loggerConfig.level, 'info')
    })

    it('should provide correct log level from env variable', async () => {
        const tmp = process.env.LOG_LEVEL
        const level = 'trace'
        process.env.LOG_LEVEL = level
        assert.equal(loggerConfig.level, level)
        delete process.env.LOG_LEVEL
    })

    it('should provide correct logtofile default value', async () => {
        assert.equal(loggerConfig.logtofile, true)
    })

    it('should provide correct logtofile value from env variable', async () => {
        const tmp = process.env.LOG_TO_FILE
        const v = false
        // @ts-ignore
        process.env.LOG_TO_FILE = v
        const r = loggerConfig.logtofile
        assert.equal(r, v)
        process.env.LOG_TO_FILE = tmp
    })
})

describe('Logger', () => {
    let loggerConfig
    let baseLogger

    beforeAll(() => {
        loggerConfig = container.get<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type).logger
        baseLogger = container.get<ILogger>(LoggerType)
    })

    it('should create child logger', async () => {
        expect(baseLogger.children.has('test')).to.be.false
        const logger = baseLogger.getLogger('test')
        expect(baseLogger.children.has('test')).to.be.true
    })

    it('should log with configured level', async () => {
        assert(baseLogger.getLevel(), loggerConfig.level)
    })

    it('should log with changed level', async () => {
        const new_level = "trace"
        await baseLogger.setLevel(undefined, new_level)

        let levels = await baseLogger.getLevel()
        assert.equal(levels.get('base')[0], 10)
        await baseLogger.setLevel(undefined, 'info')
    })

    it('should support separate levels for each logger', async () => {
        baseLogger.getLogger('test')
        await baseLogger.setLevel("test", "trace")
        const levels = await baseLogger.getLevel()
        assert.equal(levels.get('base')[0], 10)
        assert.equal(levels.get('test'), 10)
        await baseLogger.setLevel(undefined, 'info')
    })
})