import { Parameters } from '../../../../vendor/captainscraper/framework/Configuration/Configuration';
import { HtmlParser } from '../../../../vendor/captainscraper/modules/Scraper/Parser/HtmlParser';

class LoggedParser extends HtmlParser {

    public name: string = 'LoggedParser';

    public parse( $: any, parameters: any ): void {

        /* Getting scraper and form handler modules */
        let scraperModule : any     = this.parent;
        let formHandler : any = this.get('FormHandler');

        /* Cookies */
        console.log( 'Cookies:' );
        console.log( JSON.stringify( scraperModule.cookies.cookies ) );

        if( scraperModule.cookies.cookies.logged_in === 'yes' ) {
            console.log( 'Connection successful !' );
        } else {
            console.log( 'Connection fail !' );
        }

    }

}

export { LoggedParser };