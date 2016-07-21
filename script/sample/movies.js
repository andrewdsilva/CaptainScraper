/* Imports */

require( __dirname + '/../../lib/captainScraper.js' );

/* Instanciation */

var captainScraper = new CaptainScraper( 'myGoogleMoviesScraper' );

/* Script */

function startScraper() {

    /* Setting default domain name for relative url */
    captainScraper.scraper.param.websiteDomain = 'https://www.google.com';

    /* First page parameters */
    parameters = {
        url    : '/movies?near=toulouse',    /* Url (can be absolute) */
        parser : 'homePage'                  /* Name of the parser function */
    };

    /* Adding page to the queue */
    captainScraper.scraper.addPage( parameters );

}

/* Home page scraper */
captainScraper.scraper.parser.homePage = function( $, jsonData, parameters ) {
    var nbCinemas = $('.movie_results .theater').length;

    console.log('Url loaded ' + parameters.url);
    console.log('There is ' + nbCinemas + ' cinemas on this page.');

    /* Adding each cinema to the queue */
    $('.movie_results .theater').each(function() {

        parameters = {
            url    : $( this ).find('a').first().attr('href'),
            parser : 'cinemaPage'
        };

        /* Adding page to the queue */
        captainScraper.scraper.addPage( parameters );

    });
};

/* Home page scraper */
captainScraper.scraper.parser.cinemaPage = function( $, jsonData, parameters ) {
    var nbMovies = $('.movie').length;

    console.log('Url loaded ' + parameters.url);
    console.log('There is ' + nbMovies + ' movies on this page.');
};

startScraper();