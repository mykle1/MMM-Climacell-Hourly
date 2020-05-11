/* Magic Mirror
 * Module: MMM-Climacell-Hourly
 * By Mykle1 & Jim
 * MIT Licensed
 */
Module.register("MMM-Climacell-Hourly", {

    // Module config defaults.
    // Overly documented by the King of comments
    defaults: {
        apiKey: "", // Get FREE API key from ClimaCell.com
        tempUnits: "", // us or si
        lat: "", // Latitude
        lon: "", // Longitude
        css: "1", // 1=default, 2=Clean, 3=Lord of the Rings, 4=handwriting, 5=Julee, 6=Englebert
        ownTitle: "Current Conditions", // Default = Current Conditions
        playSounds: "yes", // yes = weather sounds, no = no weather sounds
        useHeader: false, // true if you want a header
        header: "Your Header", // Any text you want. useHeader must be true
        maxWidth: "100%",
        animationSpeed: 0,
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 5 * 60 * 1000,
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
            this.hourly = [];
        this.scheduleUpdate();
    },


    getDom: function() {
        var hourly = this.hourly;

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
            // Modified a python function to work in JS. Gets direction from degrees. Fucking awesome! :-)
            dir = this.current[0].wind_direction.value;
            function degToDir(deg) {
                return ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
                    [Math.round(dir / 22.5) % 16];
            }



            var current = this.current;
            // This is the top line of the display.  Sunrise/image/sunset
            var sunrise = document.createElement("div");
            sunrise.classList.add("small", "bright", "sunrise");
            sunrise.innerHTML =
                "Sunrise " + moment(current[0].sunrise.value).format('h:mm a') + " &nbsp " +
                '<img class = photo src=./modules/MMM-Climacell-Hourly/icons/test.png height="100px" width="100px">' + " &nbsp " +
                "Sunset " + moment(current[0].sunset.value).format('h:mm a');
        }
        wrapper.appendChild(sunrise);



        // This is the middle line of the display. Current conditions.
        var currentConditions = document.createElement("div");
        currentConditions.classList.add("small", "bright", "currentConditions");

        for (i = 0; i < current.length; i++) {
            var cur = current[i];
            var title = this.config.ownTitle;
            var replace = cur.weather_code.value.replace("_", " ") + " &nbsp &nbsp ";
            var icon = "<img class = image src=./modules/MMM-Climacell-Hourly/icons/" + cur.weather_code.value + ".png>&nbsp ";
            var temp = Math.round(cur.temp.value) + "°" + cur.temp.units + " &nbsp &nbsp &nbsp &nbsp ";
            var feelsLike = " Feels like " + Math.round(cur.feels_like.value) + "°" + cur.feels_like.units;
            var wind = " &nbsp &nbsp &nbsp &nbsp Wind " + Math.round(current[0].wind_speed.value);
            var speedDir = cur.wind_speed.units + "  " + degToDir() + " &nbsp &nbsp &nbsp &nbsp";
            var humidity = "Humidity " + Math.round(cur.humidity.value) + cur.humidity.units;
            var total = title + replace + icon + temp + feelsLike + wind + speedDir + humidity;
            currentConditions.innerHTML += total;
        }
        wrapper.appendChild(currentConditions);

        // https://devhints.io/moment

        // This is the bottom line of the display. (hourly conditions)
        var allHours = document.createElement("div");
        allHours.classList.add("small", "bright", "allHours");

        for (i = 0; i < hourly.length; i++) {
            var hours = hourly[i];
            var TodayDay = moment().format('H');
            var DateDay = moment(hours.observation_time.value).format('H');
            var time = moment(hours.observation_time.value).format('h:mm a');
            var report = (TodayDay == DateDay) ? "Now" : time;
            var icon = "<img class = image src=./modules/MMM-Climacell-Hourly/icons/" + hours.weather_code.value + ".png>";
            var temp = Math.round(hours.temp.value) + "°" + hours.temp.units + " &nbsp &nbsp &nbsp &nbsp ";
            var total = report + " " + icon + " " + temp;
            allHours.innerHTML += total;
        }

        wrapper.appendChild(allHours);


        // Sound for rain, wind, thunder, etc.
        if (hourly[0].weather_code.value == "rain" && this.config.playSounds == "yes") {
            var sound = new Audio()
            sound.src = 'modules/MMM-Climacell-Hourly/sounds/rain.mp3'
            sound.play()
        } else if (hourly[0].weather_code.value == "thunder" && this.config.playSounds == "yes") {
            var sound = new Audio();
            sound.src = 'modules/MMM-Climacell-Hourly/sounds/thunder.mp3';
            sound.play();
        } else if (hourly[0].weather_code.value == "wind" && this.config.playSounds == "yes") {
            var sound = new Audio();
            sound.src = 'modules/MMM-Climacell-Hourly/sounds/wind.mp3';
            sound.play();
        }

        return wrapper;

    },


    processWeather: function(data) {
        this.hourly = data;
        // console.log(this.hourly);
        //   this.loaded = true; Can't use this here. Tries to load the data before the next process function loads
    },

    processCurrent: function(data) {
        this.current = data;
        console.log(this.current);
        console.log(this.hourly);
        this.loaded = true;
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getWeather();
        }, this.config.updateInterval);
        this.getWeather(this.config.initialLoadDelay);
    },

    getWeather: function() {
        this.sendSocketNotification('GET_WEATHER');
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "WEATHER_RESULT") {
            this.processWeather(payload);
        }
        if (notification === "CURRENT_RESULT") {
            this.processCurrent(payload);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
