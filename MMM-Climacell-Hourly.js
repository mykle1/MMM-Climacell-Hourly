/* Magic Mirror
 * Module: MMM-Climacell-Hourly
 * By Mykle1
 * MIT Licensed
 */
Module.register("MMM-Climacell-Hourly", {

    // Module config defaults.
    defaults: {
        apiKey: "", // Get FREE API key from ClimaCell.com
        tempUnits: "", // imperial or metric
        lat: "", // Your latitude
        lon: "", // Your longitude
        css: "1", // 1=default, 2=Clean, 3=Lord of the Rings, 4=handwriting, 5=Julee, 6=Englebert
        ownTitle: "Current Conditions", // Default = Current Conditions
        playSounds: "yes", // yes or no. May not reinstate this option. TBD
        useHeader: false, // true if you want a header
        header: "Your Header", // Any text you want. useHeader must be true
        maxWidth: "100%",
        animationSpeed: 0,
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 5 * 60 * 1000,

        // icon mapping
        weatherCode: {
            "0": "unknown",
            "1000": "clear",
            "1001": "cloudy",
            "1100": "mostlyclear",
            "1101": "partly_cloudy",
            "1102": "mostly_cloudy",
            "2000": "fog",
            "2100": "fog",
            "3000": "wind",
            "3001": "wind",
            "3002": "wind",
            "4000": "drizzle",
            "4001": "rain",
            "4200": "rain",
            "4201": "rain",
            "5000": "snow",
            "5001": "flurries",
            "5100": "snow",
            "5101": "snow_heavy",
            "6000": "sleet",
            "6001": "sleet",
            "6200": "sleet",
            "6201": "sleet",
            "7000": "sleet",
            "7101": "sleet",
            "7102": "sleet",
            "8000": "tstorms"
        },
    },

    // Gets correct css file from config.js
    getStyles: function() {
        if (this.config.css != "") {
            return ["modules/MMM-Climacell-Hourly/css/MMM-Climacell-Hourly" + this.config.css + ".css"];
        } else {
            return ["modules/MMM-Climacell-Hourly/css/MMM-Climacell-Hourly1.css"]; // default.css
        }
    },

    getScripts: function() {
        return ["moment.js"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification('CONFIG', this.config);
        this.config.lang = this.config.lang || config.language;
        this.current = [],
            this.scheduleUpdate();
    },


    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = "Climacell data . . .";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "light");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }


        if (this.current) {
            dir = this.current.timelines[0].intervals[0].values.weatherCode;

            function degToDir(deg) {
                return ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
                    [Math.round(dir / 22.5) % 16];
            }

            // requires new source as Climacell no longer includes this info in the data.
            // I may leave this out. TBD at my leisure.

            // // This is the top line of the display.  Sunrise/image/sunset
            // var sunrise = document.createElement("div");
            // sunrise.classList.add("small", "bright", "sunrise");
            // sunrise.innerHTML =
            //     "Sunrise " + moment(current[0].sunrise.value).format('h:mm a') + " &nbsp " +
            //     '<img class = photo src=./modules/MMM-Climacell-Hourly/icons/test.png height="100px" width="100px">' + " &nbsp " +
            //     "Sunset " + moment(current[0].sunset.value).format('h:mm a');
            // }
            // wrapper.appendChild(sunrise);


            var current = this.current;

            // current conditions - Top line of the display
            if (this.current) {
                var current = this.current.timelines[0].intervals[0].values;

                var now = document.createElement("div");
                now.classList.add("small", "bright", "now");
                now.innerHTML =
                    this.config.ownTitle + " &nbsp" +
                    "<img class = image src=modules/MMM-Climacell-Hourly/icons/" + this.config.weatherCode[current.weatherCode] + ".png>" +
                    "&nbsp" +
                    Math.round(current.temperature) + "°" +
                    " &nbsp &nbsp &nbsp &nbsp " +
                    " Feels like " + Math.round(current.temperatureApparent) +
                    "°" + " &nbsp &nbsp &nbsp &nbsp " + degToDir(current.windDirection) +
                    " Wind @ " + Math.round(current.windSpeed) +
                    " &nbsp &nbsp &nbsp &nbsp " +
                    "Humidity @ " + Math.round(current.humidity) +
                    "%";

                wrapper.appendChild(now);
            }

            // https://devhints.io/moment Very useful to me. :-)

            // This is the bottom line of the display. (hourly conditions)
            var allHours = document.createElement("div");
            allHours.classList.add("small", "bright", "allHours");
            allHours.innerHTML =

                // This hour
                moment(this.current.timelines.startTime).format('h a') + " " +
                "<img class = image src=modules/MMM-Climacell-Hourly/icons/" +
                this.config.weatherCode[current.weatherCode] + ".png>" + " " +
                Math.round(current.temperature) + "°" +
                " &nbsp &nbsp &nbsp &nbsp &nbsp" +

                // Hour 2
                moment(this.current.timelines[0].intervals[1].startTime).format('h a') + " " +
                "<img class = image src=modules/MMM-Climacell-Hourly/icons/" +
                this.config.weatherCode[this.current.timelines[0].intervals[1].values.weatherCode] + ".png>" + " " +
                Math.round(current.temperature) + "°" +
                " &nbsp &nbsp &nbsp &nbsp &nbsp" +

                // // Hour 3
                moment(this.current.timelines[0].intervals[2].startTime).format('h a') + " " +
                "<img class = image src=modules/MMM-Climacell-Hourly/icons/" +
                this.config.weatherCode[this.current.timelines[0].intervals[2].values.weatherCode] + ".png>" + " " +
                Math.round(current.temperature) + "°" +
                " &nbsp &nbsp &nbsp &nbsp &nbsp" +

                // // Hour 4
                moment(this.current.timelines[0].intervals[3].startTime).format('h a') + " " +
                "<img class = image src=modules/MMM-Climacell-Hourly/icons/" +
                this.config.weatherCode[this.current.timelines[0].intervals[3].values.weatherCode] + ".png>" + " " +
                Math.round(current.temperature) + "°" +
                " &nbsp &nbsp &nbsp &nbsp &nbsp" +

                // // Hour 5
                moment(this.current.timelines[0].intervals[4].startTime).format('h a') + " " +
                "<img class = image src=modules/MMM-Climacell-Hourly/icons/" +
                this.config.weatherCode[this.current.timelines[0].intervals[4].values.weatherCode] + ".png>" + " " +
                Math.round(current.temperature) + "°" +
                " &nbsp &nbsp &nbsp &nbsp &nbsp" +

                // // Hour 6
                moment(this.current.timelines[0].intervals[5].startTime).format('h a') + " " +
                "<img class = image src=modules/MMM-Climacell-Hourly/icons/" +
                this.config.weatherCode[this.current.timelines[0].intervals[5].values.weatherCode] + ".png>" + " " +
                Math.round(current.temperature) + "°" +
                " &nbsp &nbsp &nbsp &nbsp &nbsp" +

                // // Hour 7
                moment(this.current.timelines[0].intervals[6].startTime).format('h a') + " " +
                "<img class = image src=modules/MMM-Climacell-Hourly/icons/" +
                this.config.weatherCode[this.current.timelines[0].intervals[6].values.weatherCode] + ".png>" + " " +
                Math.round(current.temperature) + "°" +
                " &nbsp &nbsp &nbsp &nbsp &nbsp";

            wrapper.appendChild(allHours);


            // Sound for rain, wind, thunder, etc.
            if (this.config.weatherCode[current.weatherCode] == "rain" && this.config.playSounds == "yes") {
                var sound = new Audio()
                sound.src = 'modules/MMM-Climacell-Hourly/sounds/rain.mp3'
                sound.play()
            } else if (this.config.weatherCode[current.weatherCode] == "tstorms" && this.config.playSounds == "yes") {
                var sound = new Audio();
                sound.src = 'modules/MMM-Climacell-Hourly/sounds/thunder.mp3';
                sound.play();
            } else if (this.config.weatherCode[current.weatherCode] == "wind" && this.config.playSounds == "yes") {
                var sound = new Audio();
                sound.src = 'modules/MMM-Climacell-Hourly/sounds/wind.mp3';
                sound.play();
            }

        }

        return wrapper;

    },

    processCurrent: function(data) {
        this.current = data;
        // console.log(this.current);
        this.loaded = true;
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getCurrent();
        }, this.config.updateInterval);
        this.getCurrent(this.config.initialLoadDelay);
    },

    getCurrent: function() {
        this.sendSocketNotification('GET_CURRENT');
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "CURRENT_RESULT") {
            this.processCurrent(payload);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
