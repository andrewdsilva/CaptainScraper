/**
 * Run scripts with config
 *
 * @namespace app/commands
 * @class     ScriptAutoCommand
 * @extends   Command
 */

import { Command } from './Command';
import { YargsParameter } from './Command';
import { Parameters } from '../../framework/Configuration/Configuration';

let colors: any      = require( Parameters.dir.modules + '/colors' );

class ScriptAutoCommand extends Command {

    getCommand(): YargsParameter {

        return {
            command : 'script:auto',
            desc    : 'Run scripts depending on the config file',
            param   : {},
            action  : function( argv ){

                console.log( 'Not yet implemented ScriptAutoCommand'.red );

            }
        };

    }

}

export { ScriptAutoCommand };