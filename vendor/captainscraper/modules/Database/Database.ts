/**
 * Manage mongo databases for scrapers data
 *
 * @module  captainscraper/modules
 * @class   Database
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

let colors: any       = require( Parameters.dir.modules + '/colors' );
let mongodb: any      = require( Parameters.dir.modules + '/mongodb' );
let childProcess: any = require( 'child_process' );
let fs: any           = require( 'fs' );

class MongoRequest {

    func: string;
    args: Array<string>;

}

class Database extends Module {

    private manager: Manager                  = null;
    private requestTable: Array<MongoRequest> = [];

    public totalRequests: number              = 0;
    public moduleName: string                 = 'Database';

    public param: any = {
        tables : [
            { name : 'scraper', index : { 'url': 1, 'parser': 1 }, persistent : false },
        ],
        waitingByFunc : {},
        maxInstance   : 10,
        frequency     : 50,
        log           : Config.logs.database,
        maxAttempt    : 3,
        lastRequest   : 0,
        waitBeforeEnd : 1000
    };

    private data: any = {
        databaseConnected : false,
        databaseStarted   : false,
        databaseStarting  : false,
        schemaChecking    : false,
        schemaCheck       : false,
        serverUrl         : '',
        connectionAttempt : 1,
        db                : false,
        users             : 0
    };

    constructor( controller: Controller ) {

        super( controller );

        /* Initialisation de la base de donnée */
        let self: any = this;

        this.clearBase(function() {
            if( self.manager === null && self.requestTable.length === 0 ) {
                self.closeDatabase( self );
            }
        });

    }

    private connectDatabase( callback: Function ): void {

        let MongoClient: any = mongodb.MongoClient;
        let self: any        = this;

        this.data.serverUrl = 'mongodb://localhost:27142/' + this.controller.name;

        MongoClient.connect( this.data.serverUrl , function ( err, db ) {

          if(err) {

            self.log( 'Unable to connect database, attempt ' + self.data.connectionAttempt + '/' + self.param.maxAttempt, 'yellow' );

            self.data.connectionAttempt++;

            if( self.data.connectionAttempt <= self.param.maxAttempt ) {
                setTimeout(function() { self.connectDatabase( callback ); }, 1000)
            } else {
                self.log( 'Canot connect database :(', 'red' );
                self.data.databaseStarting = false;
                process.exit();
            }

          } else {

            self.data.databaseConnected = true;
            self.data.databaseStarting  = false;
            self.log( 'Connection established to ' + self.data.serverUrl, 'green' );

            self.data.db = db;

            if( self.data.schemaCheck ) {
                callback( db );
            } else {
                self.schemaCheck( db, callback );
            }

          }

        });

    }

    private getDb( callback: Function ): void {

        let self: any = this;

        if( this.data.db ) {
            callback( this.data.db );
        } else if( !this.data.databaseStarting ) {
            this.data.databaseStarting = true;

            this.log( 'Connecting to database...' );
            this.connectDatabase( callback );
        } else {
            setTimeout( function() { self.getDb( callback ) }, 2000 );
        }

    }

    private clearBase( callback: Function ): void {

        let self: any            = this;
        this.data.schemaChecking = true;

        this.getDb(function( db ) {

            self.log( 'Clearing database...' );
            self._plus();

            let callbacks: Array<Function> = [];
            let actionsCall: number        = 0;
            let tmpTables: Array<any>      = self.param.tables.slice();

            for( let i: number = 0; i < self.param.tables.length ; i++ ) {
                callbacks.push( function() {
                    let tab: any = tmpTables.shift();

                    if( !tab.persistent ) {
                        clearTable( tab );
                    }
                });
            }

            let caller: any = setInterval(function() {
                if( actionsCall === 0 && callbacks.length === 0 ) {
                    clearInterval( caller );

                    self._moins();
                    self.data.schemaChecking = false;
                    if( typeof callback !== 'undefined' ) {
                        callback();
                    }
                } else if( callbacks.length > 0 ) {
                    let func: Function = callbacks.shift();
                    func();
                }
            }, 500);

            let clearTable: Function = function( tableParam ) {
                actionsCall++;

                db.collection( tableParam.name ).count(function(err, count) {
                    if( err ) {
                        self.log( err, 'red' );
                    } else {
                        self.log( 'Deleting ' + count.toString() + ' elements in ' + tableParam.name );

                        if( parseInt( count.toString(), 10 ) > 0 ) {
                            db.collection( tableParam.name ).deleteMany(
                                  {},
                                  function(err, results) {
                                     actionsCall--;
                                  }
                            );
                        } else {
                            actionsCall--;
                        }
                    }
                });
            };

        });

    }

    private schemaCheck( db: any, callback: Function ): void {

        let self: any                  = this;
        let callbacks: Array<Function> = [];
        let actionsCall: number        = 0;
        let tmpTables: Array<any>      = self.param.tables.slice();

        self.log( 'Checking schema' );

        this.data.schemaChecking = true;

        for( let i: number = 0; i < this.param.tables.length ; i++ ) {
            callbacks.push( function() {
                tableExists( tmpTables.shift() );
            });
        }

        let caller: any = setInterval(function() {
            if( actionsCall === 0 && callbacks.length === 0 ) {
                clearInterval( caller );
                endCheck();
            } else if( callbacks.length > 0 ) {
                let func: Function = callbacks.shift();
                func();
            }
        }, 500);

        let tableExists: Function = function( tableParam ) {
            actionsCall++;

            db.listCollections( { name: tableParam.name } )
                .next(function( err, collinfo ) {
                    if( collinfo ) {

                        actionsCall--;
                        self.log( '. Table \'' + tableParam.name + '\' exists' );

                    } else {

                        callbacks.push( function() { createTable( tableParam ) } );
                        actionsCall--;

                    }
                });
        };

        let createTable: Function = function( tableParam ) {
            actionsCall++;
            self.log( '. Creating table ' + tableParam.name + '...' );

            db.createCollection( tableParam.name, function( err, collection ){
                if( err ) {
                    self.log( '. Collection error : ' + err, 'red' );
                    actionsCall--;
                } else {
                    collection.createIndex(
                        tableParam.index,
                        null,
                        function( err, results ) {
                            actionsCall--;
                        }
                    );
                }
            });
        };

        let endCheck: Function = function() {
            self.data.schemaCheck = true;
            callback( db );
        };

    }

    public closeDatabase( self ): void {
        if( self.data.db ) {
            self.data.db.close();
        }

        self.data.db                = false;
        self.data.databaseStarting  = false;
        self.data.connectionAttempt = 0;

        self.manager                = null;

    }

    public addTable( param: any ): void {

        this.param.tables.push( param );

        this.data.schemaCheck = false;

    }

    /* Use database */

    public insert( collection: string, doc: any, callback: Function = function() {} ): void {

        this._newRequest(
            'insert',
            [ collection, doc ],
            callback
        );

    }

    public updateOne( collection: string, selector: any, set: any, callback: Function = function() {} ): void {

        this._newRequest(
            'updateOne',
            [ collection, selector, set ],
            callback
        );

    }

    public replace( collection: string, selector: any, document: any, callback: Function = function() {} ) {

        this._newRequest(
            'replace',
            [ collection, selector, document ],
            callback
        );

    }

    public upsert( collection: string, selector: any, doc: any, callback: Function = function() {} ): void {

        this._newRequest(
            'upsert',
            [ collection, selector, doc ],
            callback
        );

    }

    public getCollection( collection: string, max: number, remove: boolean = false, callback: Function = function() {} ): void {

        this._newRequest(
            'getCollection',
            [ collection, max, remove ],
            callback
        );

    }

    public getMultiple( collection: string, primary: any, idTable: any, callback: Function ): void {

        this._newRequest(
            'getMultiple',
            [ collection, primary, idTable ],
            callback
        );

    }

    public getOne( collection: string, primary: any, value: any, callback: Function ): void {

        this._newRequest(
            'getOne',
            [ collection, primary, value ],
            callback
        );

    }

    public count( collection: string, selector: any, callback: Function ): void {

        this._newRequest(
            'count',
            [ collection, selector ],
            callback
        );

    }

    /* Requesting database (PRIVATE) */

    private _insert( collection: string, doc: any, callback: Function ): void {

        let self: any = this;

        this.data.totalRequests++;
        this.getDb(function( db ) {

            db.collection( collection ).insertOne( doc, function(err, result) {
                if( !err ) {
                    if( typeof callback !== 'undefined' ) {
                        if( self.param.log ) self.log( 'ADD IN ' + collection + ' : ' + JSON.stringify( doc ) );

                        callback();
                    }
                } else {
                    callback();
                }
            });

        });

    }

    private _updateOne( collection: string, selector: any, set: any, callback: Function ): void {

        this.data.totalRequests++;
        this.getDb(function( db ) {

            db.collection( collection ).updateOne(
                selector,
                {
                    $set: set
                },
                function(err, result) {
                    callback();
                }
            );

        });

    }

    private _replace( collection: string, selector: any, document: any, callback: Function ): void {

        this.data.totalRequests++;
        this.getDb(function( db ) {

            db.collection( collection ).replaceOne(
                selector,
                document,
                function(err, result) {
                    if( err ) console.log( JSON.stringify( err ) );

                    callback();
                }
            );

        });

    }

    private _upsert( collection: string, selector: any, doc: any, callback: Function ): void {

        let self: any = this;

        this.data.totalRequests++;
        this.getDb(function( db ) {

            db.collection( collection ).updateOne(
                selector,
                doc,
                { upsert: true },
                function(err, result) {
                    if( !err ) {
                        if( typeof callback !== 'undefined' ) {
                            if( self.param.log ) self.log( 'UPSERT IN ' + collection + ' : ' + JSON.stringify( doc ) );
                            if( self.param.log ) self.log( JSON.stringify( result ) );

                            callback();
                        }
                    } else {
                        callback();
                    }
                }
            );

        });

    }

    private _getCollection( collection: string, max: number, remove: boolean, callback: Function ): void {

        let self: any = this;

        this.data.totalRequests++;
        this.getDb(function( db ) {

            let max: any;
            if( max > 0 ) {
                max = {
                    "limit": max
                };
            } else {
                max = {};
            }

            db.collection( collection ).find(
                {},
                max
            ).toArray(function( err, results ) {
                if( !err ) {
                    let idsArray: Array<any> = [];

                    if( results.length > 0 ) {
                        for( let i: number = 0; i < results.length; i++ ) {
                            idsArray.push( mongodb.ObjectID( results[i]._id ) )
                        }

                        if( self.param.log ) self.log( 'FOUND ' + idsArray );

                        if( remove ) {
                            db.collection( collection ).remove(
                                { _id: { $in: idsArray } },
                                function(err, result) {

                                    callback( results );

                                }
                            );
                        } else {
                            callback( results );
                        }
                    } else {
                        callback( results );
                    }
                } else {
                    self.log( err, 'red' );

                    callback( false );
                }
            });

        });

    }

    private _getMultiple( collection: string, primary: any, idTable: any, callback: Function ): void {

        this.data.totalRequests++;

        let orTable: Array<any> = [];
        let self: any           = this;

        for( let i: number = 0; i < idTable.length; i++ ) {
            orTable.push({ primary : idTable[i] });
        }

        this.getDb(function( db ) {

            db.collection( collection ).find(
                { $or: orTable }
            ).toArray(function( err, results ) {
                if( !err ) {
                    callback( results );
                } else {
                    self.log( JSON.stringify( err ) );
                    callback( [] );
                }
            });

        });

    }

    private _getOne( collection: string, primary: any, value: any, callback: Function ): void {

        let self: any = this;

        this.data.totalRequests++;
        this.getDb(function( db ) {

            let selector: any = {};

            selector[ primary ] = value;

            db.collection( collection ).findOne(
                selector,
                function( err, result ) {
                    if( !err ) {
                        callback( result );
                    } else {
                        self.log( JSON.stringify( err ) );
                        callback( [] );
                    }
                }
            );

        });

    }

    private _count( collection: string, selector: any, callback: Function ): void {

        let self: any = this;

        this.data.totalRequests++;

        if( selector ) {
            this.getDb(function( db ) {

                db.collection( collection ).count(
                    selector,
                    function( err, count ) {
                        if( err ) {
                            self.log( 'COUNT ERROR', 'red' );
                        } else {
                            callback( count.toString() );
                        }
                    }
                );

            });
        } else {
            this.getDb(function( db ) {

                db.collection( collection ).count(
                    function( err, count ) {
                        if( err ) {
                            self.log( 'COUNT ERROR', 'red' );
                        } else {
                            callback( count.toString() );
                        }
                    }
                );

            });
        }

    }

    /* Database manager (PRIVATE) */

    private _newRequest( func: string, args: Array<any>, callback: Function ): void {

        let self: any = this;

        if( this.manager === null ) {
            this._createManager( this.closeDatabase );
        }

        if( typeof callback !== 'undefined' ) {
            args.push(function( arg1 ) {

                self.manager.decreaseDataWaitingElements();
                self.manager.decreaseDataNbInstances();
                self.manager.increaseDataTotalExec();
                callback( arg1 );
            });
        } else {
            args.push(function() {
                self.manager.decreaseDataWaitingElements();
                self.manager.decreaseDataNbInstances();
                self.manager.increaseDataTotalExec();
            });
        }

        if( !this.param.waitingByFunc.hasOwnProperty( func ) ) {
            this.param.waitingByFunc[ func ] = 0;
        }
        this.param.waitingByFunc[ func ]++;

        this.manager.increaseDataWaitingElements();
        this.requestTable.push(
            {
                func : func,
                args : args
            }
        );

        if( this.manager.getState() === 'end' || this.manager.getState() === 'neverStart' ) {
            this._startManager( this.closeDatabase );
        }

    }

    private _createManager( atEnd: Function = null ): void {

        let main: Function = function( db ) {
            let dbCheck: boolean = !db.data.schemaChecking && db.data.schemaCheck;

            if( db.requestTable.length > 0 && dbCheck ) {
                db.param.lastRequest = ( new Date() ).getTime();

                /* Récupération d'un élément dans la file d'attente */
                let element: any = db.requestTable.shift();

                // console.log( JSON.stringify(element) );

                db.manager.increaseDataNbInstances();
                db[ '_' + element.func ].apply( db, element.args );

                setTimeout(function(){
                    db.param.waitingByFunc[ element.func ]--;
                }, 2000);
            } else if( dbCheck ) {
                db.manager.setState( 'sleeping' );
            }
        };

        let otherCondition: Function = function( db ) {
            return db.requestTable.length === 0 &&
                db.data.databaseStarting == false &&
                db.data.schemaChecking == false &&
                ( ( new Date() ).getTime() - db.param.lastRequest ) > db.param.waitBeforeEnd &&
                db._isEnd();
        };

        let parameters: any = {
            id             : 'DATABASE',
            maxInstance    : this.param.maxInstance,
            frequency      : this.param.frequency,
            main           : main,
            otherCondition : otherCondition
        };

        if( atEnd !== null ) {
            parameters.atEnd = atEnd;
        }

        this.manager = new Manager( this, parameters );

        this.manager.setStopCondition({
        });

    }

    private _startManager( atEnd: Function ): void {

        if( this.manager === null ) {
            this._createManager( atEnd );
        } else if( typeof atEnd !== 'undefined' ) {
            this.manager.setAtEnd( atEnd );
        }

        this.manager.start();

    }

    /* Database running process */

    private _plus(): void {

        this.data.users++;

    }

    private _moins(): void {

        let self: any = this;

        setTimeout(function() {
            self.data.users--;
        }, 500);

    }

    private _isEnd(): boolean {

        return this.data.users === 0;

    }

    /* Others */

    public log( message: string, color: string = 'cyan' ): void {

        if( this.param.log || color === 'red' ) console.log( '[' + this.controller.name + '] ' + ( message )[color] );

    }

}

export { Database };