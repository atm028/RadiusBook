//jest.mock('ioredis', () => require('ioredis-mock/jest'))
import IORedis from 'ioredis'
import {assert, expect} from 'chai'
import {Container} from 'inversify'

import StreamEventBroker from "@persist/redis/StreamEventBroker";
import {ILogger, Logger, LoggerType} from "@common/logger";
import {ConfigurationServiceNS} from "@common/config/interface";
import ConfigurationService from "@common/config";

const container = new Container()
container.bind<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type).toConstantValue(ConfigurationService)
container.bind<ILogger>(LoggerType).to(Logger).inSingletonScope()
const BaseLogger = container.get<ILogger>(LoggerType)
BaseLogger.setLevel(undefined, 'DEBUG')

describe('StreamEventBroker tests', () => {
    let redisEventBroker
    let logger
    let redisService
    let redis

    beforeEach(async () => {
        logger = BaseLogger.getLogger('StreamEventBrokerTests')
        redisService = new IORedis()
        redis = container.get<ConfigurationServiceNS.Implementation>(ConfigurationServiceNS.Type)
        redisEventBroker = new StreamEventBroker(redisService, redis, BaseLogger)
    })

    afterEach(() => {})

    it('should create instance of StreamEventBroker with default parameters', async () => {
        assert.isTrue(redisEventBroker !== null)
    })

    it('should subscribe tnd unsubscribe any channel without errors', async () => {
        const channel = 'testChannel'
        await redisEventBroker.subscribe(channel)
        assert.isTrue(redisEventBroker._subscribtions.has(channel))
        await redisEventBroker.unsubscribe(channel)
        assert.isFalse(redisEventBroker._subscribtions.has(channel))
    })

    it('should be able to send message to custm stream and read it from the one',  (done) => {
        const channel = 'testChannel'
        const message = {'body': 'this is a test message', 'id': 1}
        redisEventBroker.on(channel, data => {
            logger.debug(data)
            assert.deepEqual(JSON.parse(data[0][1]), message)
            done()
        })

        redisEventBroker.once('ready', async () => {
            try {
                await redisEventBroker.subscribe(channel)
                redisEventBroker.readStream()
                await redisEventBroker.publish(channel, JSON.stringify(message))
            } catch (e) {
                done(e)
            }
        })
        redisEventBroker.on('error', async err => {
            done(err)
        })
    })

    //TODO: implement message parser and avoid magic indexes
    it.skip('should not throw any errors if cannot parse event payload', async () => {

    });

    it('should emit error if connection error', (done) => {
        redisService = new IORedis(8110, "wrong_host")
        redisEventBroker = new StreamEventBroker(redisService, redis, BaseLogger)

        const channel = 'testChannel'
        const message = {'body': 'this is a test message', 'id': 1}
        redisEventBroker.on('ready', async () => {
            await redisEventBroker.subscribe(channel)
            //TODO: implement start/stop reading
            redisEventBroker.readStream()
            await redisEventBroker.publish(channel, JSON.stringify(message))
        })
        redisEventBroker.on('error', async err => {
            logger.debug(`Received error: ${err}`)
            assert.equal(err, "Error: getaddrinfo ENOTFOUND wrong_host")
            done()
        })
        redisEventBroker.publish(channel, JSON.stringify(message))
            .catch(err => { logger.error(err) })
    }, 30000);

    it('should restore stream group when no group', done => {
        const channel = "book-stream"
        const msg = {'body': "test: should restore stream group when no group"}

        redisEventBroker.on('BOOK_PARSERS', async data => {
            logger.debug(`Data received: ${data}`)
            const keys = await redisEventBroker._redisService.keys("*")
            assert.equal(keys.length, 1)
            logger.debug(`Keys: ${keys}`)
            assert.equal(keys, "book-stream")
            expect(msg).to.be.deep.equal(JSON.parse(data[1][1]))
            const ack_res = await redisEventBroker.ack(data[0])
            assert.equal(ack_res, 1)
            done()
        })

        redisEventBroker.once('ready', async () => {
            logger.debug("Redis ready...")
            await redisEventBroker._redisService.flushall()
            logger.debug("Redis flushall done")
            const keys = await redisEventBroker._redisService.keys("*")
            logger.debug("Received keys after flushall")
            assert.equal(keys.length, 0)
            try {
                logger.debug("Starting group read stream")
                redisEventBroker.readGroupStream()
                logger.debug("Publish message to group stream")
                redisEventBroker.publish(channel, JSON.stringify(msg))
            } catch (e) {
                logger.error(`Error received: ${e}`)
                done(e)
            }
        })

        redisEventBroker.on('error', async err => {
            logger.error(`Error on broker: ${err}`)
            done(err)
        })
    }, 30000);
})