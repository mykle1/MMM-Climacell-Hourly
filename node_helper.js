/* Magic Mirror
 * Module: MMM-Climacell-Hourly
 *
 * By Mykle1
 *
 * MIT Licensed
 */
const NodeHelper = require('node_helper');
const request = require('request');


module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getWeather: function(url) {
        var options = {
            method: 'GET',
            url: 'https://api.climacell.co/v3/weather/forecast/hourly',
            qs: {
                apikey: this.config.apiKey,
                fields: [
                    'temp',
                    'feels_like',
                    'precipitation',
                    'wind_speed',
                    'wind_direction',
                    'humidity',
                    'sunrise',
                    'sunset',
                    'weather_code'
                ],
                unit_system: this.config.tempUnits,
                lat: this.config.lat,
                lon: this.config.lon
            }
        };

        var self = this;

        request(options, function(error, response, body) {
            if (error) throw new Error(error);
            var result = JSON.parse(body);
             var items = result.slice(0,7); // Start at 0, give me 7 objects
            // console.log(response.statusCode); // for checking
            self.getCurrent();
            self.sendSocketNotification('WEATHER_RESULT', items);
            // console.log(items);
        });

    },

    getCurrent: function(url) {
        var self = this;
        var options = {
            method: 'GET',
            url: 'https://api.climacell.co/v3/weather/nowcast',
            qs: {
                apikey: this.config.apiKey,
                fields: [
                    'temp',
                    'feels_like',
                    'precipitation',
                    'wind_speed',
                    'wind_direction',
                    'humidity',
                    'sunrise',
                    'sunset',
                    'weather_code'
                ],
                unit_system: this.config.tempUnits,
                lat: this.config.lat,
                lon: this.config.lon
            }
        };
        request(options, function(error, response, body) {
            if (error) throw new Error(error);
            //var current = []; //this.current[0] instead of just this.current
            var result = JSON.parse(body);
            var items = result.slice(0, 1); // // Start at 0, give me 1 object from the array
            console.log(response.statusCode); // for checking
            self.sendSocketNotification('CURRENT_RESULT', items);
            // console.log(items);
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_WEATHER') {
            this.getWeather(payload);
        }
        if (notification === 'CONFIG') {
            this.config = payload;
        }
    }
});
