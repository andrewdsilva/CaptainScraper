CaptainScraper
==============

CaptainScraper is a NodeJs web scraper framework. It allows developers to build simple or complex scrapers in a minimum of time. Take the time to discover these features!

## Table of contents

- [Features](#features)
- [Installation](#installation)
    - [Classique](#classique)
    - [With Docker](#with-docker)
- [Usage](#usage)
- [Example of use](#example-of-use)
- [All Available Options](#all-available-options)

## Features

Coming soon...

## Installation

### Classique

Install the following:

- NodeJs (>=5)
- MongoDb
- Typescript (npm)
- ts-node (npm)

Clone the repository and install the required modules :

    $ git clone git@github.com:andrewdsilva/CaptainScraper.git
    $ cd vendor/
    $ npm install
    $ cd ..

### With Docker

Install the following:

- Docker : https://docs.docker.com/engine/installation/
- Docker Compose : https://docs.docker.com/compose/install/

Build an image of CaptainScraper from the Dockerfile :

*At the command line, make sure the current directory is the root of CaptainScraper project, where the Dockerfile is.*

    $ docker build -t captainscraper:2.0 .
    
Now you can run a terminal on the Docker with Docker Compose :

    $ docker-compose run app bash

## Usage

Start mongo database :

    $ bash app/startDatabase.sh

Execute your controller :

    $ ts-node app/console script:run Sample/Allocine/AllocineCinemas

## Example of use

Coming soon...

## Best Practices

#### Organizing your project

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

## All Available Options

Coming soon...