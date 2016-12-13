/**
 * Manage scraper's cookies
 *
 * @module  captainscraper/modules/Scraper
 * @class   Cookies
 */

import { Parameters } from '../../framework/Configuration/Configuration';
import { Config } from '../../framework/Configuration/Configuration';
import { Controller } from '../../framework/Controller/Controller';
import { Module } from '../../framework/Module/Module';

class Cookies {

    private cookies: any = {};

    constructor() {

    }

    public toString(): string {

        let str: string    = '';
        let first: boolean = true;

        for( let key in this.cookies ) {
            if( first ) {
                first = false;
            } else {
                str += '; '
            }

            str += key + '=' + encodeURIComponent( this.cookies[ key ] );
        }

        return str;

    }

    public set( key: string, value: string ): void {

        this.cookies[ key ] = value;

    }

    public get( key: string ): string {

        return this.cookies[ key ] || null;

    }

    public clear(): void {

        this.cookies = {};

    }

}

export { Cookies };