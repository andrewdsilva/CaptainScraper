/**
 * Make your scraper
 *
 * @module  captainscraper/modules/Scraper
 * @class   Scraper
 * @extends Module
 *
 * @requires request
 * @requires iconv
 * @requires colors
 * @requires cheerio
 */

declare var process;
declare function require( name:string );

import { Parameters } from '../../framework/Configuration/Configuration';
import { Config } from '../../framework/Configuration/Configuration';
import { Module } from '../../framework/Module/Module';
import { Database } from '../../modules/Database/Database';
import { Controller } from '../../framework/Controller/Controller';
import { ManagerDatabase } from '../../framework/Manager/ManagerDatabase';
import { Parser } from './Parser/Parser';
import { Cookies } from './Cookies';

let request: any       = require( Parameters.dir.modules + '/request' );
let iconv: any         = require( Parameters.dir.modules + '/iconv-lite' );
let colors: any        = require( Parameters.dir.modules + '/colors' );
let cheerio: any       = require( Parameters.dir.modules + '/cheerio' );
let querystring: any   = require( Parameters.dir.modules + '/querystring' );

class Scraper extends Module {

    static currentId: number = 0;

    private manager: ManagerDatabase = null;
    private cookies: Cookies         = null;
    private logger: any              = null;

    public param: any = {
        websiteDomain   : 'http://xxx.xx',
        basicAuth       : false,
        enableCookies   : false,

        frequency       : 100,
        maxLoadingPages : 3,
        maxPagesInRam   : 200,
        maxFailPerPage  : 3,

        auto            : true,
        timeout         : 20000,

        log             : Config.logs.scraper
    };

    public moduleName: string = 'Scraper';
    public scraperId: number;

    public data: any = {
        urlFail : {}
    };

    constructor( controller: Controller ) {

        super( controller );

        /* Dependency */
        if( controller.get('Database') === null ) {
            throw new Error( 'FormHandler does not work without the Scraper module.' );
        }

        /* Logger */
        if( controller.get('Logs') !== null ) {
            this.logger = controller.get('Logs');
        }

        Scraper.currentId++;

        this.scraperId = Scraper.currentId;
        this.cookies   = new Cookies();

    }

    /* Usage */

    public addPage( parameters: any ): void {

        let url: string        = parameters.url || this.param.websiteDomain;
        let header: any        = parameters.header || {};
        let param: any         = parameters.param || {};
        let parser: any        = parameters.parser;
        let noDoublon: boolean = parameters.noDoublon || false;
        let form: any          = parameters.form || {};
        let method: string     = parameters.method || 'GET';
        let database: Database = <Database>this.controller.get('Database');

        /* Pas d'url */
        if( !parameters.hasOwnProperty( 'url' ) ) {
            this.log( 'Error addPage : URL NOT DEFINED', 'red' );

            return;
        }

        /* Cookies */
        if( this.param.enableCookies ) {
            header[ 'Cookie' ] = this.cookies.toString();
        }

        /* Url relatif */
        if( url.charAt(0) === '/' && url.charAt(1) !== '/' ) {
            url = this.param.websiteDomain + url;
        }

        /* Basic authentification */
        if( this.param.basicAuth ) {
            url = url.replace( '://', '://' + this.param.basicAuth + '@' );
        }

        /* Si le parser n'est pas dans la liste on l'ajoute */
        if( !Parser.get( this.scraperId, parser.name ) ) {
            new ( parser )( this );
        }

        if( noDoublon ) {
            database.upsert(
                'scraper',
                {
                    url    : url,
                    method : method,
                    parameters : {
                        header : header,
                        form   : form,
                        data   : param
                    }
                },
                {
                    url        : url,
                    method     : method,
                    parser     : parser.name,
                    parameters : {
                        header : header,
                        form   : form,
                        data   : param
                    }
                }
            );
        } else {
            database.insert(
                'scraper',
                {
                    url        : url,
                    method     : method,
                    parser     : parser.name,
                    parameters : {
                        header : header,
                        form   : form,
                        data   : param
                    }
                }
            );
        }

        if( this.manager === null ) {
            this.createCrawler();
        }

        if( this.param.auto && ( this.manager.getState() === 'end' || this.manager.getState() === 'neverStart' ) ) {
            this.startCrawler();
        }

        this.manager.increaseDataWaitingElements();

    }

    /* Private */

    public loadPage( url: string, method:string, callback: Function, parameters: any ): void {

        let self: any = this;

        self.log( 'LOADING PAGE : ' + url );

        self.manager.increaseDataNbInstances();

        let options: any = {
            method             : method.toUpperCase(),
            url                : url,
            headers            : {
                'Accept'                    : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language'           : 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
                'Cache-Control'             : 'max-age=0',
                'Connection'                : 'keep-alive',
                'Cookie'                    : '',
                'DNT'                       : '1',
                'Host'                      : self.param.websiteDomain.replace(/http[s]*:\/\//gi, ''),
                'Referer'                   : self.param.websiteDomain,
                'Upgrade-Insecure-Requests' : '1',
                'User-Agent'                : 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36'
            },
            timeout            : self.param.timeout,
            rejectUnauthorized : false,
            followRedirect     : true
        };

        let key: string;
        for( key in parameters.header ) {
            options.headers[ key ] = parameters.header[ key ];
        }

        if( self.param.encodage ) {
            options.encoding = null;
        }

        /* Form */
        if( Object.keys( parameters.form ).length > 0 ) {
            options.form = parameters.form;
        }

        // console.log( options );

        request(
            options,
            function (error, response, body) {
                self.loadPageCallback( error, response, body, options, parameters, callback );
            }
        );

    }

    public loadPageCallback( error: any, response: any, body: string, options: any, parameters: any, callback: Function ): void {

        this.manager.decreaseDataNbInstances();
        this.manager.increaseDataTotalExec();
        this.manager.decreaseDataWaitingElements();

        if( !error ) {

            // console.log(response.headers);

            /* Cookies */
            if( response.headers.hasOwnProperty( 'set-cookie' ) && this.param.enableCookies ) {
                let cookieData: Array<string> = response.headers[ 'set-cookie' ];

                for( let i: number = 0; i < cookieData.length; i++ ) {
                    this.cookies.applySetCookie( cookieData[i] );
                }
            }

            /* Encodage */
            if( this.param.encodage ) {
                body = iconv.decode( new Buffer(body), this.param.encodage );
            }

            let headers: any = {};

            if( typeof response !== 'undefined' && response.hasOwnProperty( 'headers' ) ) {
                headers = response.headers;
            }

            callback( body, headers );

        } else {

            this.log( 'Error : ' + error, 'red' );

            if( !this.data.urlFail.hasOwnProperty( options.url ) || this.data.urlFail[ options.url ] < this.param.maxFailPerPage ) {
                if( !this.data.urlFail.hasOwnProperty( options.url ) ) {
                    this.data.urlFail[ options.url ] = 1;
                } else {
                    this.data.urlFail[ options.url ]++;
                }

                this.loadPage( options.url, options.method, callback, parameters );
            } else {
                callback( '', {} );
            }

        }

    }

    public createCrawler(): void {

        let self: any = this;

        let main: Function = function( page ) {
            self.loadPage(
                page.url,
                page.method,
                function( data, headers ) {
                    let parameters: any = {
                        url    : page.url,
                        header : headers,
                        body   : data,
                        other  : page.parameters.data
                    };

                    try {
                        Parser.get( self.scraperId, page.parser ).readContent( data, parameters );
                    } catch( e ) {
                        self.log( 'Parsing error! ' + page.parser + ' : ' + e, 'red' );
                    }
                },
                page.parameters
            );
        };

        let otherCondition: Function = function() {
            return true;
        };

        let sleepCondition: Function = function() {
            return false;
        };

        let parameters: any = {
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

        self.manager = new ManagerDatabase( self, parameters );

    }

    public startCrawler(): void {

        if( this.manager === null ) {
            this.createCrawler();
        }

        this.manager.data.isLastRequestEmpty = false;

        this.manager.start();

    }

    /* Others */

    public log( message, color = 'blue' ): void {

        if( this.param.log || color === 'red' ) {
            if( this.logger !== null ) {
                this.logger.log( '[' + this.controller.name + '] ' + ( message ), false );
            }

            console.log( '[' + this.controller.name + '] ' + ( message )[color] );
        }

    }

}

export { Scraper };