#!/bin/bash

path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/"

mkdir -p "$path/cache/database/captainScraperV2"
mongod --dbpath="$path/cache/database/captainScraperV2" --port=27142 > /dev/null &
