
/**
 * Able to reject: UnauthorizedError, HttpResponseError, Error
 * @param {*} latitude 
 * @param {*} longitude 
 * @param {*} apiKey 
 * @returns {Promise<IForecastData>}
 */
export async function allInOneForecast(latitude, longitude, apiKey) {
    var url = "https://api.openweathermap.org/data/2.5/onecall"+
        "?lat=" + latitude +
        "&lon=" + longitude +
        "&exclude=minutely,alerts" +
        "&lang=de" + 
        "&units=metric" +
        "&appid=" + apiKey;

    
    let data = await fetch(url, {mode: 'cors'}).then(res => {
        if (!res.ok){
            if (res.status == 401){ throw new UnauthorizedError("Invalid API key."); }
            throw new HttpResponseError(res.statusText);
        }
        return res.json();
    });
    
    let iForeCastData = new IForecastData();
    iForeCastData = Object.assign(iForeCastData, data);
    return iForeCastData;

}

/**
 * Reject with NotFoundError if no city with the given name is found.
 * 
 * Reject with HttpResponseError for all responses != ok, (code: 2xx)
 * 
 * Reject with Error in all other error cases.
 * @param {*} cityName 
 * @param {*} apiKey 
 * @returns {Promise<{name: string, latitude: number, longitude:number}>}
 */
export function getCoordinatesFromCityName(cityName, apiKey) {
    return new Promise((resolve,reject) => {
        var url = "https://api.openweathermap.org/geo/1.0/direct"+
        "?q=" +  cityName +
        "&limit=1" + 
        "&appid=" +apiKey;

        fetch(url, {mode: 'cors'})
        .then(res => {
            if (!res.ok){ // Dont response with code 200, => fetching failed
                reject(new HttpResponseError(res));
                return;
            }
            // get json content
            res.json().then(res => {
                if(res.length == 0){ // open weather api response looks lik '[]' if no city is found
                    reject(new NotFoundError("No City with name '" + cityName + "' found."));
                    return;
                }
                resolve({
                    name: res[0].name,
                    latitude: res[0].lat,
                    longitude: res[0].lon
                });
            }).catch((err)=> {
                reject(err);
            })
        })
        .catch(err => {
            reject(err);
        })
        
    });
}

// ========= Interfaces ==========

/**
 * Use this class as Interface for the returned Forecast data object
 */
export class IForecastData{

    current = {
        /** current date Time in seconds*/
        dt: null,
        
        /** temperature */
        temp: null,

        /** feeled temperature */
        feels_like: null,

        /** Array of size 1 */
        weather: [{
            description: null,
            icon: null
        }]
    }

    /** Array with an element for each day */
    daily = [{
        temp: {
            min: null,
            max: null
        },

        /** Array of size 1 */
        weather: [{
            icon: null
        }],

        /**Date time of that day */
        dt: null
    }]

    hourly = [{
        /**Date time of this hour */
        dt: null,

        /**precipitation propability as decimal value, e.g 0.3 */
        pop: null
    }]




}

// ============ Errors ============

export class NotFoundError extends Error {}

export class HttpResponseError extends Error {}

export class UnauthorizedError extends Error {}

// =================================