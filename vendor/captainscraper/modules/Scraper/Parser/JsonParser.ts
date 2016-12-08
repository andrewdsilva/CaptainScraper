/**
 * Parse json
 *
 * @module  captainscraper/modules/Scraper/Parser
 * @class   JsonParser
 *
 * @requires colors
 * @requires cheerio
 */

declare function require( name:string );

import { Parameters } from '../../../framework/Configuration/Configuration';
import { Config } from '../../../framework/Configuration/Configuration';
import { Parser } from './Parser';

let colors: any      = require( Parameters.dir.modules + '/colors' );

class JsonParser extends Parser {

    public readContent( body: string, parameters: any ): void {

        let jsonData: any   = {};

        try {
            jsonData = JSON.parse( data );

            this.parse( jsonData, parameters );
        } catch( e ) {
            console.log( 'Error : Cannot parse json document!'.red );
        }

    }

}

export { JsonParser };