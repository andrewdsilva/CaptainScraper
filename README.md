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