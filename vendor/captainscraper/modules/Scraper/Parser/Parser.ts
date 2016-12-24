/**
 * Parse a web page or something else
 *
 * @module  captainscraper/modules/Scraper/Parser
 * @class   Parser
 */

import { Parameters } from '../../../framework/Configuration/Configuration';
import { Config } from '../../../framework/Configuration/Configuration';
import { Module } from '../../../framework/Module/Module';
import { Scraper } from '../Scraper';

class Parser {

    /* List of parsers for each scraper */
    static list = {};

    public name: string;
    public parent: Scraper;

    constructor( parentScraper: any ) {

        /* If scraper haven't yet parser */
        if( !Parser.list.hasOwnProperty( parentScraper.scraperId.toString() ) ) {
            Parser.list[ parentScraper.scraperId.toString() ] = [];
        }

        Parser.list[ parentScraper.scraperId.toString() ].push( this );

        /* Saving parent */
        this.parent = parentScraper;

    }

    public readContent( body: string, parameters: any ): void {

        throw new Error( 'Undefined parser readContent.' );

    }

    public parse( content: any, parameters: any ): void {

        throw new Error( 'Please define the parse function of your parser.' );

    }

    /**
     * @function    get
     * @memberof    Parser
     * @description Find a module (scraper, orm...)
     */
    public get( name: string ): Module {

        return this.parent.getController().get( name );

    }

    /**
     * @function    get
     * @memberof    Parser
     * @description Find a parser by his name and scraper id
     * @static
     */
    public static get( scraperId: number, name: string ): Parser {

        if( Parser.list.hasOwnProperty( scraperId.toString() ) ) {

            for( let i:number = 0; i < Parser.list[ scraperId ].length; i++ ) {
                if( Parser.list[ scraperId ][i].name == name ) {
                    return Parser.list[ scraperId ][i];
                }
            }

        }

    }

}

export { Parser };