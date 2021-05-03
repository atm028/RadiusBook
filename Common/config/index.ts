import { argv, Provider } from "nconf"
import * as nconfYaml from "nconf-yaml"
import { resolve } from "path"
import { ConfigurationService } from "./configuration"

const config: Provider = argv().env().file({
    file: process.env.SETTINGS_FILE === undefined
        ? resolve(__dirname, 'default.yaml')
        : resolve(process.env.SETTINGS_FILE),
    format: nconfYaml
})
export default new ConfigurationService(config)