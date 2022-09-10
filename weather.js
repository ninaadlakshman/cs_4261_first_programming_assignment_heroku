require('dotenv').config();
const http = require('http');

weather_api_key = process.env.WEATHER_API_KEY;


function get_weather(location, callback) {
    url = "http://api.openweathermap.org/data/2.5/find?q=" + location + "&units=imperial&type=accurate&mode=json&APPID=" + weather_api_key
    http.get(url, (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        let weather_description = ""

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            const weather_data = JSON.parse(data);
            if(weather_data.list.length > 0) {
                const weather_data_val = weather_data.list[0].main
                weather_description = "The current temperature is " + weather_data_val.temp + " degrees. Expect a low of " + weather_data_val.temp_min + " degrees and a high of " + weather_data_val.temp_max + " degrees today.";
            } else {
                weather_description = "Cannot find temperature data for this location.";
            }
            callback(weather_description)
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

module.exports = get_weather