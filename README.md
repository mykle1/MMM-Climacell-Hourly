## MMM-Climacell-Hourly

* Hourly weather module using the Climacell api

## Good-bye bottom_bar (Well, not really)

* This was designed for use in the bottom_bar position of your MagicMirror
* Can share bottom bar position with any module via Hello-Lucy
* Five minute updates for current conditions
* CSS provided for coloring and sizing. Make it your own.

## Examples

* Default white

![](images/1.png)

## Installation and requirements

* `git clone https://github.com/mykle1/MMM-Climacell-Hourly` into the `~/MagicMirror/modules` directory.

* Free API key at `https://www.climacell.co/weather-api/pricing/` (Required)

* No dependencies needed! No kidding!

## Config.js entry and options

```
{
    disabled: false,
    module: "MMM-Climacell-Hourly",
    position: "bottom_bar", // designed for bottom_bar(best) thirds should be good too
    config: {
        apiKey: "Your FREE api key", // Get at https://www.climacell.co/weather-api/pricing/
        ownTitle: "Current Condition is ",
        tempUnits: "us", // us = F or si = C
        lat: '42.123456', // Your latitude
        lon: '-72.123456', // Your longitude
        css: "2", // 1-6
        playSounds: "no",
        useHeader: false, // true if you want a header
        header: "Your header",
        maxWidth: "100%",
        updateInterval: 5 * 60 * 1000,
    }
},
```

## Thanks to @cowboysdude for perpetual tech support!
