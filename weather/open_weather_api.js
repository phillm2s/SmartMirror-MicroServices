//Bonn: lat=50.73, lon=7.09

function allInOneForecast(latitude, longitude, apiKey) {
    var url = "https://api.openweathermap.org/data/2.5/onecall"+
        "?lat=" + latitude +
        "&lon=" + longitude +
        "&exclude=minutely,alerts" +
        "&lang=de" + 
        "&units=metric" +
        "&appid=" + apiKey;

    return fetch(url, {mode: 'cors'});
}

function getCoordinatesFromCityName(cityName, apiKey) {
    var url = "http://api.openweathermap.org/geo/1.0/direct"+
        "?q=" +  cityName +
        "&limit=1" + 
        "&appid=" +apiKey;

    return fetch(url, {mode: 'cors'});
}
