import { Provider } from "nconf"

export interface ISequelizeConfiguration {
    host: string
    port: number
    dialect: string
    dbname: string
    username: string
    password: string
    schema: string
}

export class SequelizeConfiguration implements  ISequelizeConfiguration {
    constructor(private readonly config: Provider) {}

    get host(): string {
        let host = this.config.get('POSTGRES_HOST')
        if(host !== undefined) {
            return String(host).toLowerCase()
        }
        host = this.config.get("postgres:host")
        if(host !== undefined) {
            return String(host).toLowerCase()
        }
        return "0.0.0.0"
    }

    get port(): number {
        return 5432
    }

    get dialect(): string { return String(this.config.get("db:dialect")) }

    get dbname(): string { return String(this.config.get("db:dbname")) }

    get username(): string { return String(this.config.get("db:username")) }

    get password(): string { return String(this.config.get("db:password")) }

    get schema(): string { return String(this.config.get("db:schema")) }
}