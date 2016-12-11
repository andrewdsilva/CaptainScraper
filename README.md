CaptainScraper
==============

CaptainScraper is a NodeJs web scraper framework. It allows developers to build simple or complex scrapers in a minimum of time. Take the time to discover these features!

## Table of contents

- [Installation](#installation)
    - [Simple](#simple)
    - [With Docker](#with-docker)
- [Usage](#usage)
- [Get started](#get-started)
- [Best Practices](#best-practices)
- [All available options](#all-available-options)

## Installation

### Simple

Install the following:

- NodeJs (>=5)
- MongoDb
- Typescript (npm)
- ts-node (npm)

Clone the repository and install the required modules :

```sh
git clone git@github.com:andrewdsilva/CaptainScraper.git
cd vendor/
npm install
cd ..
```

### With Docker

Install the following:

- Docker : https://docs.docker.com/engine/installation/
- Docker Compose : https://docs.docker.com/compose/install/

Build an image of CaptainScraper from the Dockerfile :

*At the command line, make sure the current directory is the root of CaptainScraper project, where the Dockerfile is.*

```sh
docker build -t captainscraper:2.0 .
```

Now you can run a terminal on the Docker with Docker Compose :

```sh
docker-compose run app bash
```

## Usage

```sh
# Manually start mongo database (if you are not using docker)
bash app/startDatabase.sh

# Execute a script located at /src/Sample/Allocine/Controller/AllocineCinemas.ts
ts-node app/console script:run Sample/Allocine/AllocineCinemas

# Equivalent
ts-node app/console script:run Sample/Allocine/Controller/AllocineCinemas

# Execute a script using docker-compose
docker-compose run app ts-node app/console script:run Sample/Allocine/AllocineCinemas
```

## Get started

#### Controller

A controller is a class with a function **execute** that contains the main logic of your program. Every scraper has a controller. This is an example of controller declaration :

```ts
import { Controller } from '../../../../vendor/captainscraper/framework/Controller/Controller';

class MyFirstController extends Controller {

    public execute(): void {
        console.log( 'Hello world!' );
    }

}

export { MyFirstController };
```

#### Parser

A parser is a function you create that reads information from a web page. There is several kind of parsers, for example **HtmlParser** allow you to parse the page with cheerio that is an equivalent of jQuery.

```ts
import { HtmlParser } from '../../../../vendor/captainscraper/modules/Scraper/Parser/HtmlParser';

class MyFirstParser extends HtmlParser {

    public name: string = 'MyFirstParser';

    public parse( $: any, parameters: any ): void {

        /* Finding users on the page */
        $( 'div.user' ).each(function() {
            console.log('User found : ' + $( this ).text();
        });

    }

}

export { MyFirstParser };
```

#### Load a page

To load a page we use the **addPage** function of the **Scraper** module. In a controller you can get a module like this :

```ts
let scraperModule : any = this.get('Scraper');
```

In a parser you can get the **Scraper** module with the **parent** attribut of the class. This attribut references the instance of Scraper that call the parser.

```ts
let scraperModule : any = this.parent;
```

Then you can call the **addPage** function with some parameters. This operation will be queued!

```ts
let listPageParameters: any = {
    url    : 'https://www.google.fr',
    parser : MyParser
};

scraperModule.addPage( listPageParameters );
```

## Best Practices

#### Organizing your project

This is a suggestion to organize your project, with separate folder for controllers and parsers.

```
captainscraper/
├─ app/
├─ src/
│  └─ MyProject/
│     └─ Controller/
│        └─ MyController.ts
│     └─ Parser/
│        └─ MyFirstParser.ts
│        └─ MySecondParser.ts
├─ vendor/
```

## All available options

Coming soon...