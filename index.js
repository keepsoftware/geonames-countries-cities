var fs     = require('fs');
var _      = require('lodash');
var deepstream = require('deepstream.io-client-js');

var geonames = require('./geonames');
var data = {};
var deepstr = true;
var writefile = false;

var errorCallback = function(err) {
    if (err) return console.log(err);
}

geonames
    .read_countries()
    .then(function(countries) {
        console.log('Processed ' + countries.length + ' countries');

        data.countries = countries;
        return geonames.read_states();
    })
    .then(function(states) {
        console.log('Processed ' + states.length + ' cities');

        data.states = states;
        return geonames.read_cities();
    })
    .then(function(cities) {
        console.log('Processing ' + cities.length + ' cities');

        data.orderStates = {};
        data.orderCities = {};
        var loading = 0;

        _.each(data.states, function(state) {
            var iso = state.state_id.split('.')[0];
            var code = state.state_id.split('.')[1];

            state.state_id = state.state_id.toString().replace('.','');
            // console.log('put state: ', iso, code, state.name);
            if (data.orderStates[iso] == undefined) {
                data.orderStates[iso] = [];
            }
            data.orderStates[iso].push(state);

            var cityCode = _.filter(cities, {country_code: iso, admin1_code: code});
            if (cityCode) {
                data.orderCities[iso+code] = cityCode;

            }

            switch (loading) {
                case 0: process.stdout.write('\r|'); loading++; break;
                case 1: process.stdout.write('\r/'); loading++; break;
                case 2: process.stdout.write('\r-'); loading++; break;
                case 3: process.stdout.write('\r\\'); loading=0;break;
                default:loading=0;
            }
        });

        // console.log('orderCountries:', data.countries);
        // console.log('orderStates:', data.orderStates);
        // console.log('orderCities:', data.orderCities);
        const client = deepstream('localhost:6020')
            .login({username: "your_username", password: "your_password"}, (success, data) => {
                if (success) {
                    console.log('Auth deepstream ok!');
                } else {
                    console.log(data)
                }
            });

        console.log('Processed ' + cities.length + ' cities');

        if (writefile) {
            fs.writeFile('output/countries.json', JSON.stringify(data.countries),
                'utf8', errorCallback );
        }

        if (deepstr) {
            client.record.getRecord('geonames/countries').set(data.countries);
        }

        if (deepstr || writefile) {
            console.log('Write all countries');
        }

        for (s in data.orderStates) {
            if (deepstr) {
                client.record.getRecord('geonames/'+s).set(data.orderStates[s]);
            }
            if (writefile) {
                fs.writeFile('output/state-'+s+'.json', JSON.stringify(data.orderStates[s]),
                    'utf8', errorCallback );
            }
        }

        if (deepstr || writefile) {
            console.log('Write all states of country');
        }

        for (c in data.orderCities) {
            if (deepstr) {
                client.record.getRecord('geonames/'+c).set(data.orderCities[c]);
            }
            if (writefile) {
                fs.writeFile('output/city-'+c+'.json', JSON.stringify(data.orderCities[c]),
                    'utf8', errorCallback );
            }
        }
        if (deepstr || writefile) {
            console.log('Write all cities of states');
        }

        if (deepstr) {
            console.log('Exported data to deepstream.io');
        }
        if (writefile) {
            console.log('Exported data to output/data.json');
        }
    });
