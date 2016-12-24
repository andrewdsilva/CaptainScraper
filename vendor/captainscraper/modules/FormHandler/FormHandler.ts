/**
 * Handle web form in scraper
 *
 * @module  captainscraper/modules/FormHandler
 * @class   FormHandler
 * @extends Module
 *
 * @requires colors
 */

declare function require( name:string );

import { Parameters } from '../../framework/Configuration/Configuration';
import { Config } from '../../framework/Configuration/Configuration';
import { Controller } from '../../framework/Controller/Controller';
import { Module } from '../../framework/Module/Module';
import { Scraper } from '../Scraper/Scraper';
import { Parser } from '../Scraper/Parser/Parser';
import { Form } from './Form';

let colors: any = require( Parameters.dir.modules + '/colors' );

class FormHandler extends Module {

    public moduleName: string = 'FormHandler';

    private scraper: Scraper;

    constructor( controller: Controller ) {

        super( controller );

        /* Dependency */
        if( controller.get('Scraper') === null ) {
            throw new Error('FormHandler does not work without the Scraper module.');
        }

        this.scraper = <Scraper>controller.get('Scraper');

    }

    public createEmptyForm(): Form {

        return new Form();

    }

    public getForm( selector: string, $: any ): Form {

        let newForm: Form = this.createEmptyForm();
        let $form: any    = $( selector );

        /* Reading the form's action */
        if( $form.attr('ACTION') || $form.attr('action') ) {
            newForm.action = $form.attr('ACTION') || $form.attr('action');
        }

        /* Reading the form's method */
        if( $form.attr('METHOD') || $form.attr('method') ) {
            newForm.method = $form.attr('METHOD') || $form.attr('method');
        }

        /* Reading the form's inputs */
        $form.find('input').each(function() {
            newForm.inputs[ $( this ).attr('name') ] = $( this ).val() || '';
        });

        return newForm;

    }

    public submit( form: Form, parser: Parser ): void {

        let formSubmit: any = {
            method : form.method,
            url    : form.action,
            form   : form.inputs,
            parser : parser
        };

        this.scraper.addPage( formSubmit );

    }

}

export { FormHandler };