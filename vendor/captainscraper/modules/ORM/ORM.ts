/**
 * Manage ORM
 *
 * @module  captainscraper/modules
 * @class   ORM
 * @extends Module
 *
 * @requires colors
 * @requires mongodb
 * @requires fs
 * @requires child_process
 */

declare var process;
declare function require( name:string );

import { Parameters } from '../../framework/Configuration/Configuration';
import { Config } from '../../framework/Configuration/Configuration';
import { Module } from '../../framework/Module/Module';
import { Controller } from '../../framework/Controller/Controller';
import { Manager } from '../../framework/Manager/Manager';

let nodeOrm: any      = require( Parameters.dir.modules + '/orm' );
let colors: any       = require( Parameters.dir.modules + '/colors' );
let fs: any           = require( 'fs' );

class ORM extends Module {

    public moduleName: string = 'ORM';

    public param: any = {
        log : Config.logs.ORM
    };

    constructor( controller: Controller ) {

        super( controller );

        // throw new Error( 'Not yet usable...' );

    }

    public log( message: string, color: string = 'cyan' ): void {

        if( this.param.log || color === 'red' ) console.log( '[' + this.controller.name + '] ' + ( message )[color] );

    }

}

export { ORM };