/**
 * Used to manage queues with databases
 *
 * @module   captainscraper/framework/Manager
 * @class    ManagerDatabase
 *
 * @author   Nathan Lopez
 */

import { Parameters } from '../Configuration/Configuration';
import { Config } from '../Configuration/Configuration';
import { Module } from '../Module/Module';
import { Database } from '../../modules/Database/Database';
import { Manager } from './Manager';

class ManagerDatabase extends Manager {

    protected database: Database;

    private tmpMain: Function;
    private tmpIsEnd: Function;
    private sleepCondition: Function;

    constructor( owner: Module, parameters: any ) {

        super( owner, parameters );

        this.data.elementsTable      = [];
        this.data.gettingElements    = false;
        this.data.isLastRequestEmpty = false;

        let self: any = this;

        this.database = <Database>owner.getController().get('Database');

        this.tmpMain  = parameters.main;
        this.tmpIsEnd = Manager.prototype.isEnd;

        /* Table max elements */

        if( !this.specificParam.hasOwnProperty( 'maxElementsTableSize' ) ) {
            this.specificParam.maxElementsTableSize = 100;
        }

        let callback: Function = function( elements: Array<any> = null ) {
            if( elements !== null ) {
                for( let i: number = 0; i < elements.length; i++ ) {
                    this.data.elementsTable.push( elements[i] );
                }

                if( elements.length === 0 ) {
                    this.data.isLastRequestEmpty = true;
                } else {
                    this.data.isLastRequestEmpty = false;
                }
            }

            this.data.gettingElements = false;
        }

        /* Fonction principale exécuté */

        if( parameters.hasOwnProperty( 'sleepCondition' ) ) {
            this.sleepCondition = parameters.sleepCondition;
        } else {
            this.sleepCondition = function() { return false };
        }

        this.main = function() {
            if( this.data.elementsTable.length > 0 && !this.sleepCondition() ) {
                /* Récupération d'un élément dans la file d'attente */
                let element: any = this.data.elementsTable.pop();

                this.tmpMain( element );
            } else if( !this.data.gettingElements && this.database.requestTable.length < 1000 && !this.sleepCondition() ) {
                this.data.gettingElements = true;

                this.database.getCollection( this.specificParam.collection, this.specificParam.maxElementsTableSize, true, function( elements ) {
                    callback.call( self, elements );
                });
            } else if( this.data.isLastRequestEmpty || this.data.waitingElements === 0 ) {
                this.setState( 'sleeping' );
            }
        }

    }

    isEnd(): boolean {
        let baseCond: boolean = this.tmpIsEnd();
        let dbCond: boolean   = this.data.isLastRequestEmpty && this.data.waitingElements === 0;
        let elements: boolean = this.data.elementsTable.length === 0;

        // this.log( 'baseCond ' + baseCond + ' dbCond ' + dbCond + ' elements ' + elements );

        return baseCond && dbCond && elements;
    }

    updateDataWaitingElements(): void {
        if( typeof this.specificParam.collection === 'string' ) {

            let self: any = this;

            this.database.count(this.specificParam.collection, null, function( count ) {
                self.data.waitingElements = parseInt( count, 10 ) + self.data.elementsTable.length;
                // this.log( 'UPDATE DWE : ' + count + ' for ' + self.specificParam.collection );
            });

        } else {

            this.log( 'ERROR : COLLECTION NAME MUST BE A STRING : ' + JSON.stringify( this.specificParam.collection ) + ' : ' + this.param.id );

        }
    }

}

export { ManagerDatabase };