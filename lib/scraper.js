/*
    @namespace CaptainScraper
    @module    Scraper
    @author    Nathan Lopez
    @version   1.0
*/

/* Imports */
var request   = require('request');
var iconv     = require('iconv-lite');
var colors    = require('colors');
var cheerio   = require('cheerio');

Scraper = function( capS ) {

    this.cs             = capS;
    this.runner         = null;
    this.requestTable   = [];

    /* Internal data */
    this.data = {};

    /* Parameters */
    this.param = {
        maxFailPerPage  : 3,
        maxLoadingPages : 3,
        maxPagesInRam   : 200,
        frequency       : 100,
        auto            : true,
        log             : true,
        timeout         : 20000,

        basicAuth       : false,
        websiteDomain   : 'http://xxx.xx'
    };

    /* Private data */
    this._private = {
        urlFail : {}
    };

    /* Parsers */
    this.parser = {};

};

/* Usage */

Scraper.prototype.addPage = function( parameters ) {
    var url       = parameters.url || this.param.websiteDomain;
    var header    = parameters.header || {};
    var param     = parameters.param || {};
    var parser    = parameters.parser || function() {};
    var noDoublon = parameters.noDoublon || false;

    /* Pas d'url */
    if( !parameters.hasOwnProperty( 'url' ) ) {
        this.log( 'Error addPage : URL NOT DEFINED', 'red' );

        return;
    }

    /* Url relatif */
    if( url.charAt(0) === '/' && url.charAt(1) !== '/' ) {
        url = this.param.websiteDomain + url;
    }

    /* Basic authentification */
    if( this.param.basicAuth ) {
        url = url.replace( '://', '://' + this.param.basicAuth + '@' );
    }

    if( noDoublon ) {
        this.cs.database.upsert(
            'scraper',
            {
                url   : url,
                param : param
            },
            {
                url      : url,
                parser   : parser,
                header   : header,
                param    : param
            }
        );
    } else {
        this.cs.database.insert(
            'scraper',
            {
                url      : url,
                parser   : parser,
                header   : header,
                param    : param
            }
        );
    }

    if( this.runner === null ) {
        this.createCrawler();
    }

    if( this.param.auto && ( this.runner.getState() === 'end' || this.runner.getState() === 'neverStart' ) ) {
        this.startCrawler();
    }

    this.runner.increaseDataWaitingElements();
};

/* Private */

Scraper.prototype.loadPage = function( url, callback, header ) {
    var self = this;

    self.log( 'LOADING PAGE : ' + url );

    self.runner.increaseDataNbInstances();

    var options = {
        url               : url,
        headers           : {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36'
        },
        timeout           : self.param.timeout,
        rejectUnauthorized: false
    };

    if( !( typeof header === 'undefined' ) ) {
        for( key in header ) {
            options.headers[ key ] = header[ key ];
        }
    }

    if( self.param.encodage ) {
        options.encoding = null;
    }

    request(
        options,
        function (error, response, body) {
            self.runner.decreaseDataNbInstances();
            self.runner.increaseDataTotalExec();
            self.runner.decreaseDataWaitingElements();

            if( !error ) {
                if( self.param.encodage ) {
                    body = iconv.decode( new Buffer(body), scrapper.param.encodage );
                }

                var headers = {};

                if( typeof response !== 'undefined' && response.hasOwnProperty( 'headers' ) ) {
                    headers = response.headers;
                }

                callback( body, headers );
            } else {
                self.log( 'Error : ' + error, 'red' );

                if( !self._private.urlFail.hasOwnProperty( url ) || self._private.urlFail[ url ] < self.param.maxFailPerPage ) {
                    if( !self._private.urlFail.hasOwnProperty( url ) ) {
                        self._private.urlFail[ url ] = 1;
                    } else {
                        self._private.urlFail[ url ]++;
                    }

                    self.loadPage( url, callback, header );
                } else {
                    callback( '', {} );
                }
            }
        }
    );
};

Scraper.prototype.createCrawler = function() {
    self = this;

    var main = function( page ) {
        self.loadPage(
            page.url,
            function( data, headers ) {
                var jsonData   = {};
                var jQueryData = null;

                try {
                    jsonData = JSON.parse( data );
                } catch( e ) {}
                try {
                    jQueryData = cheerio.load( data );
                } catch( e ) {}

                var parameters = {
                    url    : page.url,
                    header : headers,
                    body   : data,
                    param  : page.param
                };

                try {
                    self.parser[ page.parser ]( jQueryData, jsonData, parameters );
                } catch( e ) {
                    self.log( 'Parsing error! ' + page.parser + ' : ' + e, 'red' );
                }
            },
            page.header
        );
    };

    var otherCondition = function() {
        return true;
    }

    var sleepCondition = function() {
        return false;
    }

    var parameters = {
        id             : 'SCRAPER',
        maxInstance    : self.param.maxLoadingPages,
        frequency      : self.param.frequency,
        main           : main,
        otherCondition : otherCondition,
        sleepCondition : sleepCondition,
        specificParam  : {
            collection : 'scraper'
        }
    };

    self.runner = new RunnerDatabase( self, parameters );
};

Scraper.prototype.startCrawler = function() {
    if( this.runner === null ) {
        this.createCrawler();
    }

    this.runner.data.isLastRequestEmpty = false;

    this.runner.start();
};

/* Others */

Scraper.prototype.log = function( message, color ) {
    if( typeof color === 'undefined' ) color = 'blue';

    if( this.param.log || color === 'red' ) console.log( '[' + this.cs.param.id + '] ' + ( message )[color] );
};