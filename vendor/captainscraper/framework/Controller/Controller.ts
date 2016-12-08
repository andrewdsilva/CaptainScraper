/**
 * Controller simple implementation that provides methods and features needed in controllers
 *
 * @module   captainscraper/framework/Controller
 * @class    Controller
 * @abstract
 * @author   Nathan Lopez
 */

import { Parameters } from '../Configuration/Configuration';
import { Config } from '../Configuration/Configuration';
import { Module } from '../Module/Module';

declare function require( name:string );
declare var global;

abstract class Controller {

    public name: string;

    protected modules: Array<Module> = [];

    constructor( name: string ) {

        this.name = name;

        /* Modules */

        for( let moduleIndice in Config.imports ) {
            let moduleName: string = Config.imports[ moduleIndice ];

            try {
                /* Import */

                let classImport: any = require( Parameters.dir.vendor + '/captainscraper/modules/' + moduleName + '/' + moduleName )[ moduleName ];

                /* Instanciation */

                this.modules.push( new ( classImport )( this ) );
            } catch( err ) {
                console.log( ( 'Error : Can\'t find class ' + moduleName + ' in vendor/captainscraper/modules/' + moduleName + '/' + moduleName ).red );
                console.log( err );
            }
        }

    }

    public execute(): void {

        throw new Error( 'Please define the execute function of your controller' );

    }

    public get( name: string ): Module {

        for( let i:number = 0; i < this.modules.length; i++ ) {
            if( this.modules[i].moduleName == name ) {
                return this.modules[i];
            }
        }

    }

}

export { Controller };