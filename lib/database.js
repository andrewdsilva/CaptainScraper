/*
    @namespace CaptainScraper
    @module    Database
    @author    Nathan Lopez
    @version   1.0
*/

/* Imports */
var mongodb       = require('mongodb');
var child_process = require('child_process');
var fs            = require('fs');
var colors        = require('colors');

Database = function( capS ) {

    this.cs             = capS;
    this.runner         = null;
    this.requestTable   = [];

    /* Internal data */
    this.data = {
        totalRequests : 0
    };

    /* Parameters */
    this.param = {
        tables : [
            { name : 'scraper', index : { 'url': 1, 'parser': 1 }, persistent : false },
        ],
        waitingByFunc : {},
        maxInstance   : 10,
        frequency     : 50,
        log           : false,
        maxAttempt    : 3
    };

    /* Private data */
    this._private = {
        databaseConnected : false,
        databaseStarted   : false,
        databaseStarting  : false,
        schemaChecking    : false,
        schemaCheck       : false,
        serverUrl         : '',
        connectionAttempt : 1,
        db                : false,
        users             : 0,
        runner            : null
    };

    /* Initialisation de la base de donnée */
    this.clearBase();

};

/* Database managment */

Database.prototype.connectDatabase = function( callback ) {
    var MongoClient = mongodb.MongoClient;
    var self        = this;

    self._private.serverUrl = 'mongodb://localhost:27142/' + self.cs.param.id;

    MongoClient.connect(this._private.serverUrl , function ( err, db ) {

      if(err) {

        self.log( 'Unable to connect database, attempt ' + self._private.connectionAttempt + '/' + self.param.maxAttempt, 'yellow' );

        self._private.connectionAttempt++;

        if( self._private.connectionAttempt <= self.param.maxAttempt ) {
            setTimeout(function() { self.connectDatabase( callback ); }, 1000)
        } else {
            self.log( 'Canot connect database :(', 'red' );
            self._private.databaseStarting = false;
            process.exit();
        }

      } else {

        self._private.databaseConnected = true;
        self._private.databaseStarting  = false;
        self.log( 'Connection established to ' + self._private.serverUrl, 'green' );

        self._private.db = db;
        // self._startRunner( self.closeDatabase );

        if( self._private.schemaCheck ) {
            callback( db );
        } else {
            self.schemaCheck( db, callback );
        }

      }

    });
};

Database.prototype.getDb = function( callback ) {
    if( this._private.db ) {
        callback( this._private.db );
    } else if( !this._private.databaseStarting ) {
        this._private.databaseStarting = true;

        this.log( 'Connecting to database...' );
        this.connectDatabase( callback );
    } else {
        var self = this;

        setTimeout( function() { self.getDb( callback ) }, 2000 );
    }
};

Database.prototype.schemaCheck = function( db, callback) {
    var self = this;

    self.log( 'Checking schema' );

    this._private.schemaChecking = true;

    var callbacks   = [];
    var actionsCall = 0;
    var tmpTables   = this.param.tables.slice();

    for( var i = 0; i < this.param.tables.length ; i++ ) {
        callbacks.push( function() {
            tableExists( tmpTables.shift() );
        });
    }

    var caller = setInterval(function() {
        if( actionsCall === 0 && callbacks.length === 0 ) {
            clearInterval( caller );
            endCheck();
        } else if( callbacks.length > 0 ) {
            var func = callbacks.shift();
            func();
        }
    }, 500);

    var tableExists = function( tableParam ) {
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
    }

    var createTable = function( tableParam ) {
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
    }

    var endCheck = function() {
        self._private.schemaCheck    = true;
        callback( db );
    }
};

Database.prototype.clearBase = function( callback ) {
    var self = this;

    self._private.schemaChecking = true;

    self.getDb(function( db ) {

        self.log( 'Clearing database...' );
        self._plus();

        var callbacks   = [];
        var actionsCall = 0;
        var tmpTables   = self.param.tables.slice();

        for( var i = 0; i < self.param.tables.length ; i++ ) {
            callbacks.push( function() {
                var tab = tmpTables.shift();

                if( !tab.persistent ) {
                    clearTable( tab );
                }
            });
        }

        var caller = setInterval(function() {
            if( actionsCall === 0 && callbacks.length === 0 ) {
                clearInterval( caller );

                self._moins();
                self._private.schemaChecking = false;
                if( typeof callback !== 'undefined' ) {
                    callback();
                }
            } else if( callbacks.length > 0 ) {
                var func = callbacks.shift();
                func();
            }
        }, 500);

        var clearTable = function( tableParam ) {
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
        }

    });
};

Database.prototype.closeDatabase = function( owner ) {
    if( owner._private.db ) {
        owner._private.db.close();
    }

    owner._private.db                = false;
    owner._private.databaseStarting  = false;
    owner._private.connectionAttempt = 0;

    owner.runner                     = null;
};

Database.prototype.addTable = function( param ) {
    this.param.tables.push( param );

    this._private.schemaCheck = false;
};

/* Use database */

Database.prototype.insert = function( collection, doc, callback ) {
    this._newRequest(
        'insert',
        [ collection, doc ],
        callback
    );
};

Database.prototype.update = function( collection, selector, set, callback ) {
    this._newRequest(
        'update',
        [ collection, selector, set ],
        callback
    );
};

Database.prototype.upsert = function( collection, selector, doc, callback ) {
    if( typeof callback === 'undefined' ) callback = function() {};

    this._newRequest(
        'upsert',
        [ collection, selector, doc ],
        callback
    );
};

Database.prototype.getCollection = function( collection, max, remove, callback ) {
    if( typeof remove === 'undefined' )   remove   = false;
    if( typeof callback === 'undefined' ) callback = function() {};

    this._newRequest(
        'getCollection',
        [ collection, max, remove ],
        callback
    );
};

Database.prototype.getMultiple = function( collection, primary, idTable, callback ) {
    this._newRequest(
        'getMultiple',
        [ collection, primary, idTable ],
        callback
    );
};

Database.prototype.getOne = function( collection, primary, value, callback ) {
    this._newRequest(
        'getOne',
        [ collection, primary, value ],
        callback
    );
};

Database.prototype.count = function( collection, selector, callback ) {
    this._newRequest(
        'count',
        [ collection, selector ],
        callback
    );
};

/* Requesting database (PRIVATE) */

Database.prototype._insert = function( collection, doc, callback ) {
    var self = this;

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
};

Database.prototype._update = function( collection, selector, set, callback ) {
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
};

Database.prototype._upsert = function( collection, selector, doc, callback ) {
    var self = this;

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
};

Database.prototype._getCollection = function( collection, max, remove, callback ) {
    var self = this;

    this.data.totalRequests++;
    this.getDb(function( db ) {

        var max;
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
                var idsArray = [];

                if( results.length > 0 ) {
                    for( var i = 0; i < results.length; i++ ) {
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
};

Database.prototype._getMultiple = function( collection, primary, idTable, callback ) {
    this.data.totalRequests++;

    var orTable = [];

    for( var i = 0; i < idTable.length; i++ ) {
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
};

Database.prototype._getOne = function( collection, primary, value, callback ) {
    var self = this;

    this.data.totalRequests++;
    this.getDb(function( db ) {

        var selector = {};

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
};

Database.prototype._count = function( collection, selector, callback ) {
    var self = this;

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
};

/* Database runner (PRIVATE) */

Database.prototype._newRequest = function( func, args, callback ) {
    var self = this;

    if( this._private.runner === null ) {
        this._createRunner();
    }

    if( typeof callback !== 'undefined' ) {
        args.push(function( arg1 ) {
            self._private.runner.decreaseDataWaitingElements();
            self._private.runner.decreaseDataNbInstances();
            self._private.runner.increaseDataTotalExec();
            callback( arg1 );
        });
    } else {
        args.push(function() {
            self._private.runner.decreaseDataWaitingElements();
            self._private.runner.decreaseDataNbInstances();
            self._private.runner.increaseDataTotalExec();
        });
    }

    if( !this.param.waitingByFunc.hasOwnProperty( func ) ) {
        this.param.waitingByFunc[ func ] = 0;
    }
    this.param.waitingByFunc[ func ]++;

    this._private.runner.increaseDataWaitingElements();
    this.requestTable.push(
        {
            func : func,
            args : args
        }
    );

    if( this._private.runner.getState() === 'end' || this._private.runner.getState() === 'neverStart' ) {
        this._startRunner( this.closeDatabase );
    }
};

Database.prototype._createRunner = function( atEnd ) {
    var main = function( db ) {
        var dbCheck = !db._private.schemaChecking && db._private.schemaCheck;

        if( db.requestTable.length > 0 && dbCheck ) {
            /* Récupération d'un élément dans la file d'attente */
            var element = db.requestTable.shift();

            // console.log( JSON.stringify(element) );

            db._private.runner.increaseDataNbInstances();
            db[ '_' + element.func ].apply( db, element.args );

            setTimeout(function(){
                db.param.waitingByFunc[ element.func ]--;
            }, 2000);
        } else if( dbCheck ) {
            db._private.runner.setState( 'sleeping' );
        }
    }

    var otherCondition = function( db ) {
        return db.requestTable.length === 0 &&
            db._private.databaseStarting == false &&
            db._private.schemaChecking == false &&
            db._isEnd();
    }

    var parameters = {
        id             : 'DATABASE',
        maxInstance    : this.param.maxInstance,
        frequency      : this.param.frequency,
        main           : main,
        otherCondition : otherCondition
    };

    if( typeof atEnd !== 'undefined' ) {
        parameters.atEnd = atEnd;
    }

    this._private.runner = new Runner( this, parameters );

    this._private.runner.setStopCondition({
    });
};

Database.prototype._startRunner = function( atEnd ) {
    if( this._private.runner === null ) {
        this._createRunner( atEnd );
    } else if( typeof atEnd !== 'undefined' ) {
        this._private.runner.setAtEnd( atEnd );
    }

    this._private.runner.start();
};

/* Database running process */

Database.prototype._plus = function() {
    this._private.users++;
};

Database.prototype._moins = function() {
    var self = this;

    setTimeout(function() {
        self._private.users--;
    }, 500);
};

Database.prototype._isEnd = function() {
    return this._private.users === 0;
};

/* Others */

Database.prototype.log = function( message, color ) {
    if( typeof color === 'undefined' ) color = 'cyan';

    if( this.param.log || color === 'red' ) console.log( '[' + this.cs.param.id + '] ' + ( message )[color] );
};