/**
 * Web form
 *
 * @module  captainscraper/modules/FormHandler
 * @class   Form
 */

import { Parameters } from '../../framework/Configuration/Configuration';
import { Config } from '../../framework/Configuration/Configuration';
import { Controller } from '../../framework/Controller/Controller';
import { Module } from '../../framework/Module/Module';

class Form {

    public inputs: any    = {};
    public method: string = 'GET';
    public action: string = '';

    constructor() {

    }

    public setInput( key, value ) {

        this.inputs[ key ] = value;

    }

}

export { Form };