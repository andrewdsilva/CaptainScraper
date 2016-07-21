/*
    @namespace CaptainScraper
    @module    RunnerDatabase
    @extends   Runner
    @author    Nathan Lopez
    @version   1.0
*/

/* EXTENDS */

function extend(base, sub) {
    var origProto = sub.prototype;
    sub.prototype = Object.create(base.prototype);

    for (var key in origProto)  {
        sub.prototype[key] = origProto[key];
    }

    sub.prototype.constructor = sub;

    Object.defineProperty(sub.prototype, 'constructor', { 
        enumerable: false, 
        value: sub 
    });
}

/* CONSTRUCTEUR */

RunnerDatabase = function( owner, parameters ) {
    Runner.call( this, owner, parameters );

    var self = this;

    /* Init */
    this.data.elementsTable      = [];
    this.data.gettingElements    = false;
    this.data.isLastRequestEmpty = false;

    this.database = owner.cs.database;

    /* Fonction principale */
    this.tmpMain  = parameters.main;
    this.tmpIsEnd = Runner.prototype.isEnd;

    /* Table max elements */
    if( !this.specificParam.hasOwnProperty( 'maxElementsTableSize' ) ) {
        this.specificParam.maxElementsTableSize = 100;
    }

    function callback( elements ) {
        if( typeof elements !== 'undefined' ) {
            for( var i = 0; i < elements.length; i++ ) {
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
            var element = this.data.elementsTable.pop();

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

};

RunnerDatabase.prototype.isEnd = function() {
    var baseCond = this.tmpIsEnd();
    var dbCond   = this.data.isLastRequestEmpty && this.data.waitingElements === 0;
    var elements = this.data.elementsTable.length === 0;

    // this.log( 'baseCond ' + baseCond + ' dbCond ' + dbCond + ' elements ' + elements );

    return baseCond && dbCond && elements;
};

RunnerDatabase.prototype.updateDataWaitingElements = function() {
    if( typeof this.specificParam.collection === 'string' ) {

        var self = this;

        this.database.count(this.specificParam.collection, null, function( count ) {
            self.data.waitingElements = parseInt( count, 10 ) + self.data.elementsTable.length;
            // console.log( 'UPDATE DWE : ' + count + ' for ' + self.specificParam.collection );
        });

    } else {

        console.log( 'ERROR : COLLECTION NAME MUST BE A STRING : ' + JSON.stringify( this.specificParam.collection ) + ' : ' + this.param.id );

    }
};

extend( Runner, RunnerDatabase );