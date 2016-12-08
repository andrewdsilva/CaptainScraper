/**
 * Abstract class for run commands
 *
 * @module   captainscraper/framework/Command
 * @class    Command
 * @param    {Object} yargs
 * @abstract
 * @author   Nathan Lopez
 */

import { Parameters } from '../Configuration/Configuration';

class YargsParameter {

    command: string;
    desc: string;
    param: Object;
    action: Function;

}

/**
 * @function    getCommand
 * @memberof    Command
 * @description Get yargs command parameters
 * @return      {YargsParameter} Parameters for the yargs command
 */
abstract class Command {

    constructor( yargs: any ) {

        let c: YargsParameter = this.getCommand();

        yargs.command( c.command, c.desc, c.param, c.action );

    }

    abstract getCommand(): YargsParameter;

}

export { Command };
export { YargsParameter };