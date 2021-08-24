import {Provider} from 'nconf'

export interface ILoggerConfiguration {
    path: string
    level: string
    logtofile: boolean
}

export class LoggerConfiguration implements ILoggerConfiguration {
    constructor(private readonly config: Provider) {
    }

    get path(): string {
        let path = process.env.LOG_PATH
        if(path !== undefined) return String(path).toLowerCase()
        path = this.config.get('logger:path')
        if(path !== undefined) return String(path).toLowerCase()
        return './'
    }

    get level(): string {
        let level = process.env.LOG_LEVEL
        if(level !== undefined) return String(level).toLowerCase()
        level = this.config.get('logger:level')
        if(level !== undefined) return String(level).toLowerCase()
        return 'info'
    }

    get logtofile(): boolean {
        let opt = process.env.LOG_TO_FILE
        if(opt !== undefined) return opt == 'true'
        opt = this.config.get('logger:logtofile')
        if(opt !== undefined) return opt == 'true'
        return true
    }
}