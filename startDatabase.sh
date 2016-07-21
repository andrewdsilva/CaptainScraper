#!/bin/bash

mkdir -p database/captainScraper_1
mongod --dbpath=database/captainScraper_1 --port=27142 > /dev/null &