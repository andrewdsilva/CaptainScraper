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

                let m: Module = new ( classImport )( this );

                if( typeof m.moduleName === 'undefined' ) {
                    throw new Error( 'Please define a name for your module with the moduleName property.' );
                }

                this.modules.push( m );
            } catch( err ) {
                console.log( ( 'Error: Can\'t import module ' + moduleName + ' in vendor/captainscraper/modules/' + moduleName + '/' + moduleName + '.' ).red );
                console.log( err.toString().red );
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

        return null;

    }

}

export { Controller };