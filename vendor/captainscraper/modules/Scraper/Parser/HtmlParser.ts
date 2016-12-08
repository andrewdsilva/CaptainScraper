/**
 * Parse html web page
 *
 * @module  captainscraper/modules/Scraper/Parser
 * @class   HtmlParser
 *
 * @requires colors
 * @requires cheerio
 */

declare function require( name:string );

import { Parameters } from '../../../framework/Configuration/Configuration';
import { Config } from '../../../framework/Configuration/Configuration';
import { Parser } from './Parser';

let colors: any      = require( Parameters.dir.modules + '/colors' );
let cheerio: any      = require( Parameters.dir.modules + '/cheerio' );

class HtmlParser extends Parser {

    public readContent( body: string, parameters: any ): void {

        let jQueryData: any = null;

        try {
            jQueryData = cheerio.load( body );

            try {
                this.parse( jQueryData, parameters );
            } catch( e ) {
                console.log( ( '[' + this.name + '] Error : ' + e ).red );
            }
        } catch( e ) {
            console.log( 'Error : Cannot parse HTML page!'.red );
        }

    }

}

export { HtmlParser };