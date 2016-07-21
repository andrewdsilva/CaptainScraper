# CaptainScraper

Simple web scraper library in NODE JS.

## Dependency

CaptainScraper is dependent MongoDB. If you got any error when you try to start database, try the following:

```bash
# Ubuntu/Debian:
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

## Usage
  
You can clone the repository and install the required modules:
  
    $ git clone git@github.com:andrewdsilva/CaptainScraper.git
    $ cd lib/
    $ npm install

Require and instantiate the module:

    require( __dirname + '/lib/captainScraper.js' );

    var captainScraper = new CaptainScraper( 'myScraper' );

Define a parser for one or more pages:

    captainScraper.scraper.parser.movieList = function( $ ) {
        var nbMovies = $('.movie').length;
    
        console.log('There is ' + nbMovies + ' movies on this page.');
    });
    
Add a page to the queue specifying the parser:

    var parameters = {
        url    : 'http://google.com/movies',
        parser : 'movieList'
    };

    captainScraper.scraper.addPage( parameters );
