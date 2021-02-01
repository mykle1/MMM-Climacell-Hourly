/* Magic Mirror
 * Module: MMM-BMW=CC
 *
 * By Mykle1
 *
 */
const NodeHelper = require('node_helper');
const request = require('request');

module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getCurrent: function(url) { // hourly
        request({
            method: 'GET',
            url: "https://data.climacell.co/v4/timelines?timesteps=1h&units=" + this.config.tempUnits + "&location=" + this.config.lat + "," + this.config.lon + "&fields=temperature,temperatureApparent,precipitationType,humidity,windSpeed,windDirection,weatherCode&apikey=" + this.config.apiKey
        }, (error, response, body) => {
            var result = JSON.parse(body).data;
            //var items = result.slice(0,1); // Start at 0, give me 7 objects
            console.log(result); // check
            var self = this;
            self.sendSocketNotification('CURRENT_RESULT', result);
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "CONFIG") {
            this.config = payload;
        }
        if (notification === 'GET_CURRENT') {
            this.getCurrent(payload);
        }
    }
});
