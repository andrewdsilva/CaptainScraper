/**
 * Run one script
 *
 * @namespace app/commands
 * @class     ScriptRunCommand
 * @extends   Command
 */

import { Parameters } from '../Configuration/Configuration';
import { Controller } from '../Controller/Controller';
import { Command } from './Command';
import { YargsParameter } from './Command';

declare function require( name:string );
declare var global;

class ScriptRunCommand extends Command {

    getCommand(): YargsParameter {

        return {
            command : 'script:run <path>',
            desc    : 'Run a single script',
            param   : {},
            action  : function( argv: any ){

                let match: any = argv.path.match(/([0-9A-Za-z]+)$/i);

                if( !match ) {
                    console.log( 'Wrong path! Sample : Project/Script'.red );

                    return false;
                }

                let className: string = match[1];
                let success: boolean  = false;
                let classImport: any;

                try {
                    classImport = require( Parameters.dir.source + '/' + argv.path )[ className ];

                    success = true;
                } catch( err ) {
                    try {
                        let pathController: string = argv.path.replace(/\/([a-zA-Z0-9]+$)/, '/Controller/$1');

                        classImport = require( Parameters.dir.source + '/' + pathController )[ className ];

                        success = true;
                    } catch( err ) {
                        console.log( ( 'Error : Can\'t find class ' + className + ' in ' + argv.path ).red );
                        console.log( err );
                    }
                }

                if( success ) {
                    let script: Controller = new ( classImport )( className );

                    script.execute();
                }

            }
        };

    }

}

export { ScriptRunCommand };