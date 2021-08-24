import "reflect-metadata"
import * as bunyan from 'bunyan'
import BunyanFormatWritable from 'bunyan-format'
import {inject, injectable} from "inversify";
import {ConfigurationServiceNS} from "@common/config/interface";

export const LoggerType = Symbol.for('Logger')

const formatOut = BunyanFormatWritable({outputMode: 'bunyan', levelInString: true, color: true}, process.stdout)
const componentName = 'booker'
/*
Use cases:
* get logger with entering module name
* get logger level for all and for logger of special module
* set logger level for all and for special module
*/

export interface ILogger {
    getLogger(module: string): Promise<bunyan.Logger>
    getLevel(module: string): Promise< Map<string, string> >
    setLevel(module: string, level: string): Promise<void>
}

@injectable()
export class Logger implements ILogger {
    private readonly logger: bunyan.Logger
    private readonly children: Map<string, bunyan.Logger>

    constructor(
        @inject(ConfigurationServiceNS.Type) private readonly config: ConfigurationServiceNS.Implementation
    ) {
        let streams = [{
            level: config.logger.level,
            stream: formatOut
        }]

        //TODO: Get logging to file back to life
//        if(this.config.logger.logtofile) {
//            const fullName = path.join(this.config.logger.path, `${componentName}_%Y%m%dT%H%M%S%L.log`)
//            const fileStream = new RotatingFileStream({
//                path: fullName,
//                period: '1d',
//                totalFiles: 10,
//                rotateExisting: true,
//                threshold: '100m',
//                totalSize: 0,
//                gzip: false,
//                startNewFile: true
//            })
//            streams.push({
//                level: this.config.logger.level,
//                stream: fileStream
//            })
//        }

        this.logger = bunyan.createLogger({
            streams,
            name: componentName
        })
        this.children = new Map()
    }

    getLogger = (module: string): Promise<bunyan.Logger> => {
        if(this.children.has(module)) {
            return this.children.get(module)
        }

        const l = this.logger.child({mod: module}, true)
        this.children.set(module, l)
        return l
    }

    getLevel = async (): Promise< Map<string, string> > => {
        const levels = new Map()
        levels.set('base', this.logger.levels())

        for(const k of this.children.keys()) {
            levels.set(k, this.children.get(k).level())
        }
        return levels
    }

    setLevel = async (level: string, module: string = undefined): Promise<void> => {
        if(module !== undefined && this.children.has(module)) {
            const log = this.children.get(module)
            log.level(level.toLowerCase())
            //TODO: check should we rewrite logger or it's enough just to update level of local const
            this.children.set(module, log)
        }
        if(module === undefined) {
            this.children.forEach(l => l.level(level.toLowerCase()) )
            this.logger.level(level.toLowerCase())
        }
    }
}