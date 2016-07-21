/*
    @namespace CaptainScraper
    @module    CaptainScraper
    @author    Nathan Lopez
    @version   1.0
*/

/* Imports */
require( __dirname + '/runners/runner' );
require( __dirname + '/runners/runnerDatabase' );
require( __dirname + '/database' );
require( __dirname + '/scraper' );

CaptainScraper = function( id ) {

    /* Paramètres */

    this.param = {

        root       : __dirname + '/..',
        tmpRoot    : root + '/tmp',
        dbRoot     : root + '/database',

        id         : id,

        logRunner  : false

    };

    /* Modules */

    this.database = new Database( this );
    this.scraper  = new Scraper( this );

};