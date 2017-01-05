import { HtmlParser } from '../../../../app/importer';

class CinemaListParser extends HtmlParser {

    public name: string = 'CinemaListParser';

    public parse( $: any, parameters: any ): void {

        /* Read the data passed by the other parser  */
        let cityName: string = parameters.other.data.city;

        /* Search data in the web page */
        let zipCode: string = $('.titlebar h1').text().match(/\(([0-9]+)\)/)[1] || '';

        /* Find cinemas on this city */
        let cinemas: Array<any> = [];

        $('.theaterblock .titlebar').each(function() {
            let url: string  = $( this ).find('h2 a').attr('href');
            let name: string = $( this ).find('h2 a').text().trim();
            let id: string   = $( this ).data('entities').entityId;

            cinemas.push({
                url  : url,
                name : name,
                id   : id
            });
        });

        /* Show city and cinema list */
        console.log( 'City : ' + cityName + ' (' + zipCode + ')' );
        console.log( 'Cinemas :' );

        for( let i = 0; i < cinemas.length; i++ ) {
            console.log( '- ' + cinemas[i].name );
        }

        console.log('-----');

    }

}

export { CinemaListParser };