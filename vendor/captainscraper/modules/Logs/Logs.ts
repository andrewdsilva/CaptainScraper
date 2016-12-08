/**
 * Display and save logs and errors
 *
 * @module  captainscraper/modules
 * @class   Logs
 * @extends Module
 *
 * @requires colors
 * @requires fs
 */

declare function require( name:string );

import { Parameters } from '../../framework/Configuration/Configuration';
import { Module } from '../../framework/Module/Module';

let colors: any    = require( Parameters.dir.modules + '/colors' );
let fs: any        = require( 'fs' );

class Logs extends Module {

    public moduleName: string = 'Logs';

}

export { Logs };