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

    private stream: any       = false;

    protected getDate(): string {

        let date: any       = new Date();
        let strDate: string = date.getFullYear()
            + '-'
            + ( (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1) )
            + '-'
            + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
            + ' '
            + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours())
            + ':'
            + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());

        return strDate;

    }

    public log( message: string, display: boolean = true ): void {

        if( this.stream === false ) {
            this.stream = fs.createWriteStream( Parameters.dir.logs + '/' + this.controller.name + '.log', { flags : 'a' } );
        }

        if( typeof message === 'object' ) message = JSON.stringify( message );

        if( display ) console.log( message );

        this.stream.write( '[' + this.getDate() + '] ' + message + '\n' );

    }

}

export { Logs };