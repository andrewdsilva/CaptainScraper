CaptainScraper
==============

CaptainScraper is a NodeJs web scraper framework. It allows developers to build simple or complex scrapers in a minimum of time. Take the time to discover these features!

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Get started](#get-started)
- [Load a page](#load-a-page)
- [Submit a form](#load-a-page)
- [Best Practices](#best-practices)
- [All available options](#all-available-options)

## Installation

### Simple

Install the following:

- NodeJs (>=5)
- MongoDb
- Typescript (npm)
- ts-node (npm)

Clone the repository and install the required modules:

```sh
git clone git@github.com:andrewdsilva/CaptainScraper.git
cd vendor/
npm install
cd ..
```

### With Docker

Install the following:

- Docker: https://docs.docker.com/engine/installation/
- Docker Compose: https://docs.docker.com/compose/install/

Build an image of CaptainScraper from the Dockerfile:

*At the command line, make sure the current directory is the root of CaptainScraper project, where the docker-compose.yml is.*

```sh
docker-compose build
```

Now you can run a terminal on the Docker with Docker Compose:

```sh
docker-compose run app bash
```

## Usage

### Simple

```sh
# Manually start mongo database
bash app/startDatabase.sh

# Execute a script located at /src/Sample/Allocine/Controller/AllocineCinemas.ts
ts-node app/console script:run Sample/Allocine/AllocineCinemas

# Equivalent
ts-node app/console script:run Sample/Allocine/Controller/AllocineCinemas
```

### With Docker

```sh
# Execute a script using docker-compose
docker-compose run app script:run Sample/Allocine/AllocineCinemas

# Use docker-compose in dev environment (with no entrypoint)
docker-compose -f docker-compose.dev.yml run app bash
```

## Get started

#### Controller

A controller is a class with a function **execute** that contains the main logic of your program. Every scraper has a controller. This is an example of controller declaration:

```ts
import { Controller } from '../../../../app/importer';

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
import { HtmlParser } from '../../../../app/importer';

class MyFirstParser extends HtmlParser {

    public name: string = 'MyFirstParser';

    public parse( $: any, parameters: any ): void {

        /* Finding users on the page */
        $( 'div.user' ).each(function() {
            console.log( 'User found: ' + $( this ).text() );
        });

    }

}

export { MyFirstParser };
```

#### Load a page

To load a page we use the **addPage** function of the **Scraper** module. In a controller you can get a module like this:

```ts
let scraperModule: any = this.get( 'Scraper' );
```

In a parser you can get the **Scraper** module with the **parent** attribute of the class. This attribute references the instance of Scraper that call the parser.

```ts
let scraperModule: any = this.parent;
```

Then you can call the **addPage** function with some parameters. This operation will be queued!

```ts
let listPageParameters: any = {
    url   : 'https://www.google.fr',
    parser: MyParser
};

scraperModule.addPage( listPageParameters );
```

#### Submit a form

To handle a form make sure the FormHandler module is imported in *app/config/config.json*.

First, load the page that contains the form you want to submit. Then, in the parser you can get the **FormHandler** module like that:
```ts
let formHandler: any = this.get('FormHandler');
```

Use the **getForm** function from the **formHandler** module to create a new **Form** object based on the form present in the page. The **Form** will be automatically filled with all the inputs presents of the HTML form.
```ts
let form: any = formHandler.getForm( '.auth-form form', $ );
```

Then you can set your values in the **Form** like this:
```ts
form.setInput( 'login', 'Robert1234' );
```

Call the **submit** function from the **formHandler** module to send your form. The secound parameter is the **Parser** that will be called with the server answer.
```ts
formHandler.submit( form, LoggedParser );
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

#### Add custom config parameters

You can make your own custom parameters file and access these values from your scripts. First create the json file *app/config/parameters.json* and initialize it with a json object.
```json
{
    "sample" : {
        "github" : {
            "login"    : "MyLogin",
            "password" : "MyPassword"
        }
    }
}
```

Then call the **get** function from the **Parameters** class to get a data.
```ts
Parameters.get('sample').github.password
```

You can import the **Parameters** class in your *Controller* or *Parser* like this:
```ts
import { Parameters } from '../../../../app/importer';
```

*I know it's a little bit tricky, it will be simplified.*

#### The Scraper module

Module parameters can be modified like this:
```ts
let scraperModule: any = this.get('Scraper');

scraperModule.param.websiteDomain = 'https://github.com';
```

Parameters:
- `websiteDomain` domain name of the website you want to scrap, this parameter is important because it is used to complete relative URL
- `basicAuth` if your website need basic authentication, set this parameter like this: **user:password**
- `enableCookies` enable cookies like a real navigator, necessary for form handling, default: false
- `frequency` maximum page loading frequency
- `maxLoadingPages` maximum number of pages load in the same time
- `maxFailPerPage` number of time that loading the same page can fail before giving up
- `timeout` request timeout in millisecond

Parameters for the **addPage** function:
- `url` requested url
- `header` request headers (Object)
- `param` data transmits to the **Parser**
- `parser` **Parser** class used for this page
- `noDoublon` if you want to check for duplicate request, default false
- `form` form data for **POST** request
- `method` request method (GET, POST...), default GET

#### The FormHandler module

Methods:
- `createEmptyForm()` create and return an empty **Form**
- `getForm( selector, $ )` create **Form** from HTML
- `submit( form, parser )` submit **Form** and call **Parser**

Form object methods:
- `setInput( key, value )` set the value of key in the **Form**

Form object parameters:
- `inputs` all inputs and values of the form
- `method` form method (GET, POST...)
- `action` form action url

#### The Logs module

Sample:
```ts
let logger: any = this.get('Logs');

logger.log( 'My log !' );
```

Methods:
- `log( message, [ display = true ] )` save your log in a file and display on the console

Logs are saved in **app/logs/{ CONTROLLER_NAME }.log**.