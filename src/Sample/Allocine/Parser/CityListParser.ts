import { HtmlParser } from '../../../../app/importer';

/* My parsers */
import { CinemaListParser } from './CinemaListParser';

class CityListParser extends HtmlParser {

    public name: string = 'CityListParser';

    public parse( $: any, parameters: any ): void {

        let self: any = this;

        /* Finding cinemas by city */
        $( '.colcontent .rubric>div[id] a.underline' ).each(function() {

            let url: string = $( this ).attr( 'href' );

            /* If the url haven't the right format */
            if( !/^\/salle\//.test( url ) ) return;

            /* Adding the page to the queue */
            let listPageParameters: any = {
                url    : url,
                parser : CinemaListParser,
                param  : {
                    data : {
                        'city' : $( this ).text().trim()
                    }
                }
            };

            self.parent.addPage( listPageParameters );

        });

    }

}

export { CityListParser };