declare var __dirname;

/**
 * Application parameters
 * @class    Parameters
 * @property {object} dir - Paths of the directories
 */
class Parameters {

    static dir: any = {
        'root'      : __dirname + '/../../../..',
        'vendor'    : __dirname + '/../../..',
        'modules'   : __dirname + '/../../../node_modules',
        'source'    : __dirname + '/../../../../src',
        'config'    : __dirname + '/../../../../app/config',
        'commands'  : __dirname + '/../Command',
        'framework' : __dirname + '/..'
    };

}

class DatabaseParameters {

    id: string;
    host: string;
    port: string;
    user: string;
    password: string;
    database: string;

}

/**
 * Application configuration
 * @class    Config
 * @property {Array<string>}             imports  - Modules to import
 * @property {Array<DatabaseParameters>} database - Databases connections parameters
 * @property {object}                    logs     - Logs configuration
 */
class Config {

    static imports: Array<string>              = [];
    static database: Array<DatabaseParameters> = [];
    static logs: any = {
        'database' : false,
        'scraper'  : true,
        'manager'  : false,
        'orm'      : false
    };

    static setConfig( config: any ): void {

        /* Reading imports */

        if( config.hasOwnProperty( 'imports' ) ) {
            for( let i: number = 0; i < config.imports.length; i++ ) {
                this.imports.push( config.imports[i] );
            }
        }

        /* Reading databases */

        if( config.hasOwnProperty( 'database' ) ) {
            for( let i: number = 0; i < config.database.length; i++ ) {
                this.database.push( config.database[i] );
            }
        }

        /* Reading logs parameters */

        if( config.hasOwnProperty( 'logs' ) ) {
            if( config.logs.hasOwnProperty( 'database' ) ) this.logs.database = config.logs.database;
            if( config.logs.hasOwnProperty( 'scraper' ) ) this.logs.scraper = config.logs.scraper;
            if( config.logs.hasOwnProperty( 'manager' ) ) this.logs.manager = config.logs.manager;
            if( config.logs.hasOwnProperty( 'orm' ) ) this.logs.orm = config.logs.orm;
        }

    }

}

class ScriptConfig {

    path: string;
    runFrequency: number;
    test: boolean;

}

/**
 * Auto run configuration
 * @class    RunConfig
 * @property {Array<object>} scripts - Scripts configurations
 */
class RunConfig {

    static scripts: Array<ScriptConfig> = [];

    static setConfig( config: any ): void {

        if( config.hasOwnProperty( 'scripts' ) ) {
            for( let i: number = 0; i < config.scripts.length ; i++ ) {
                let scr: any = config.scripts[i];

                if( scr.hasOwnProperty('path') &&
                    scr.hasOwnProperty('test') ) {
                    let newScr: ScriptConfig = new ScriptConfig();

                    if( scr.hasOwnProperty('path') )         newScr.path         = scr.path;
                    if( scr.hasOwnProperty('runFrequency') ) newScr.runFrequency = scr.runFrequency;
                    if( scr.hasOwnProperty('test') )         newScr.test         = scr.test;

                    this.scripts.push( newScr );
                }
            }
        }

    }

}

export { Parameters };
export { Config };
export { RunConfig };