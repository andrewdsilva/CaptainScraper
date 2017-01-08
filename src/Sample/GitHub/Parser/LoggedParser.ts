import { Parameters } from '../../../../app/importer';
import { HtmlParser } from '../../../../app/importer';

class LoggedParser extends HtmlParser {

    public name: string = 'LoggedParser';

    public parse( $: any, parameters: any ): void {

        /* Getting scraper and form handler modules */
        let scraperModule: any = this.parent;
        let formHandler: any   = this.get('FormHandler');
        let logger: any        = this.get('Logs');

        /* Cookies */
        logger.log( 'Cookies:' );
        logger.log( JSON.stringify( scraperModule.cookies.cookies ) );

        if( scraperModule.cookies.cookies.logged_in === 'yes' ) {
            logger.log( 'Connection successful !' );
        } else {
            logger.log( 'Connection fail !' );
        }

    }

}

export { LoggedParser };