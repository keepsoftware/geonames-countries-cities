## geonames-countries-cities

Output geonames countries, states and main cities on a multiple json files;

Add support to deepstream.io ;)

## Installation

1. `npm install`
2. `mkdir {input,output}`
3. [Download countryInfo.txt](http://download.geonames.org/export/dump/countryInfo.txt) and copy to `input` dir
4. [Download cities1000.zip](http://download.geonames.org/export/dump/cities1000.zip), extract and copy to `input` dir
5. [Download admin1CodesASCII.txt](http://download.geonames.org/export/dump/admin1CodesASCII.txt), extract and copy to `input` dir

## Usage

`node index.js`

## Customize output

Edit `geonames.js`, comment/uncomment fields

## Field info

http://download.geonames.org/export/dump/
