/**
 * CaptainScraper console
 *
 * @module captainscraper/framework/Console
 * @class  Application
 * @author Nathan Lopez
 *
 * @requires colors
 * @requires yargonaut
 * @requires yargs
 * @requires fs
 */

declare var process;
declare function require( name:string );

import { Parameters } from '../Configuration/Configuration';
import { Config } from '../Configuration/Configuration';
import { RunConfig } from '../Configuration/Configuration';

import { ScriptAutoCommand } from '../Command/ScriptAutoCommand';
import { ScriptRunCommand } from '../Command/ScriptRunCommand';

let colors: any    = require( Parameters.dir.modules + '/colors' );
let fs: any        = require( 'fs' );

class Application {

    /**
     * @function    handleArgs
     * @memberof    Application
     * @description Handle args with the yargs node module and call the write command
     */
    static handleArgs(): void {

        /* If no arguments, show help */

        if( process.argv.length < 3 ) {
            process.argv.push('--help');
        }

        let yargonaut: any = require( Parameters.dir.modules + '/yargonaut' )
        let yargs: any     = require( Parameters.dir.modules + '/yargs' );

        /* Command and args */

        yargs.usage(
            'CaptainScraper'.blue + ' version 1.3\n' +
            '\n' +
            'Usage:\n'.yellow +
            '  ts-node app/console.ts <cmd> [args]'
        );

        new ScriptRunCommand( yargs );
        new ScriptAutoCommand( yargs );

        yargonaut.style('yellow');

        yargs.help('help')
            .alias('help', 'h')
            .argv;

    }

    /**
     * @function    readConfig
     * @memberof    Application
     * @param       {string} fileName
     * @description Read config file and complete Config and RunConfig objects
     */
    static readConfig( fileName: string ): Object {

        try {
            let json: any   = fs.readFileSync( Parameters.dir.config + '/' + fileName );
            let config: any = JSON.parse( json.toString() );

            return config;
        } catch( err ) {
            Application.log( 'Can not read configuration file..', 'red' );
            Application.log( err, 'red' );

            process.exit();
        }

    }

    /**
     * @function    log
     * @memberof    Application
     * @param       message
     * @param       {string} color
     * @description Display log for this class
     */
    static log( message: any, color: string ): void {

        if( typeof color === 'undefined' ) color = 'grey';
        if( typeof message === 'object' ) message = JSON.stringify( message );

        console.log( ('[run] ' + message )[color] );

    }

    /**
     * @function    start
     * @memberof    Application
     * @description Main function the class
     */
    static start(): void {

        /* Reading config */

        let config: Object = Application.readConfig( 'config.json' );
        let run: Object    = Application.readConfig( 'run.json' );

        Config.setConfig( config );
        RunConfig.setConfig( run );

        /* Handle commands */

        Application.handleArgs();

    }

}

export { Application };