import { Provider } from "nconf"

export interface ISequelizeConfiguration {
    dialect: string
    dbname: string
    username: string
    password: string
    schema: string
}

export class SequelizeConfiguration implements  ISequelizeConfiguration {
    constructor(private readonly config: Provider) {}

    get dialect(): string { return String(this.config.get("db:dialect")) }
    get dbname(): string { return String(this.config.get("db:dbname")) }
    get username(): string { return String(this.config.get("db:username")) }
    get password(): string { return String(this.config.get("db:password")) }
    get schema(): string { return String(this.config.get("db:schema")) }
}