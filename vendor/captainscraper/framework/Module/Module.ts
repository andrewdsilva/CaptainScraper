/**
 * Module simple implementation that provides methods and features needed in captainScraper modules
 *
 * @module   captainscraper/framework/Module
 * @class    Module
 * @abstract
 * @author   Nathan Lopez
 */

import { Parameters } from '../Configuration/Configuration';
import { Controller } from '../Controller/Controller';

abstract class Module {

    public moduleName;

    protected controller: Controller;

    constructor( controller: Controller ) {

        this.controller = controller;

    }

    public getController(): Controller {
        return this.controller;
    }

}

export { Module };