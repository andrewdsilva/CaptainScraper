import { Parameters } from '../../../../vendor/captainscraper/framework/Configuration/Configuration';
import { HtmlParser } from '../../../../vendor/captainscraper/modules/Scraper/Parser/HtmlParser';
import { LoggedParser } from './LoggedParser';

class LoginParser extends HtmlParser {

    public name: string = 'LoginParser';

    public parse( $: any, parameters: any ): void {

        /* Getting scraper and form handler modules */
        let scraperModule: any  = this.parent;
        let formHandler: any    = this.get('FormHandler');

        /* Getting form*/
        let form: any = formHandler.getForm( '.auth-form form', $ );

        form.setInput( 'login', Parameters.get('sample').github.login );
        form.setInput( 'password', Parameters.get('sample').github.password );

        /* Sending form */
        formHandler.submit( form, LoggedParser );

        /* Form */
        console.log( form );

    }

}

export { LoginParser };