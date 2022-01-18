import * as weatherAPI from './open_weather_api.mjs';
import {IForecastData} from './open_weather_api.mjs';
import * as helperMethods from './../sharedContent/helperMethods.mjs';

// ================================================
const updateEveryXSeconds = 60*20; // 20 minutes
// ================================================

var urlParameters;

// scale service on resizing parent item
document.body.onresize = ()=>{ helperMethods.scaleElementToParentSize(document.getElementById("content"), document.body);};

(async() => {
    // check url parameter
    try {
        urlParameters = validateUrlParameters();
    } catch(err) {
        showErrorMessage(err.message);
        
        //send success callback because the parameter will not change in fourther calls.
        helperMethods.sendIframeLoadedCallback();

        // End programm
        throw err;
    }

    let latitude = urlParameters.latitude;
    let longitude= urlParameters.longitude;


    // if a city name is given instead of longitude/atitude, load longitude/atitude from weather api by city name
    if (urlParameters.city != null) {
        let data = await resolveCityNameAndHandelExceptions(urlParameters.city, urlParameters.apiKey);
        console.log(data);
        latitude = data.latitude;
        longitude = data.longitude;
    }


    // load weatherdata once
    try{
        var forecastData = await weatherAPI.allInOneForecast(latitude, longitude, urlParameters.apiKey);
        helperMethods.sendIframeLoadedCallback();
    } catch(err){
        if (err instanceof weatherAPI.UnauthorizedError){
            // in case of an invalid api key dont load again
            helperMethods.sendIframeLoadedCallback();
            showErrorMessage("Invalid API Key.");
        }

        //end Programm and wait for parent timeout
        throw err;
    }

    // wait with rescaling until the dom events have changed
    displayWeather(forecastData).then(()=>{ helperMethods.scaleElementToParentSize(document.getElementById("content"), document.body); });

    // Set visibility of main content window
    document.getElementById("content").style.visibility = "visible";
    

    let refresh = () => {
        helperMethods.circuitBreaker(async ()=>{

            //Load actual weather data
            let forecastData =  await weatherAPI.allInOneForecast(latitude, longitude, urlParameters.apiKey);
            
            // update Dom with the loaded data
            displayWeather(forecastData).then(()=>{ helperMethods.scaleElementToParentSize(document.getElementById("content"), document.body); });

        },[5*1000, 10*1000, 30*1000, 2*60*1000, 5*60*1000, 5*60*1000, 10*60*1000], true,
        (retry, err)=>{
            // On each error
            console.log("Weater Service Circuit Breaker: "+ retry+ ", "+ err.message);
        }).then(()=>{
            // On success
            console.log("Weater Service sucessfully updated");

            // try again after timeout
            console.log("Refresh Weather content in " + updateEveryXSeconds + " seconds.");
            window.setTimeout(()=>{
                refresh();
            },updateEveryXSeconds*1000);
        })
    }

    

    
})();


// //neither coordinates or city
// //else {window.location.replace("./../wrongParameters.html");}



// ==================== METHODS ==========================

/**
 * This Method updates all relevant DOM elements with the given content
 * @param {IForecastData} forecastData
 */
async function displayWeather(forecastData){
    let subPromises = []

    var tryToSetElementText = (elementName, text) => {
        try{
            document.getElementById(elementName).textContent = text;
        } catch(err){
            console.warn(err);
        }
    }

    tryToSetElementText("headline", urlParameters.city || "Wetter");

    tryToSetElementText("current_time", new Date(forecastData.current.dt*1000).toLocaleDateString("de-DE",
        {hour:"numeric", minute:"numeric", weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        +" Uhr");
    
    tryToSetElementText("current_temperature", Math.round(forecastData.current.temp));

    tryToSetElementText("description", forecastData.current.weather[0].description); 

    tryToSetElementText("min_temperature", Math.round(forecastData.daily[0].temp.min));

    tryToSetElementText("max_temperature", Math.round(forecastData.daily[0].temp.max));

    tryToSetElementText("feels_like", "Gefühlt: " + Math.round(forecastData.current.feels_like));

    let loadWeatherImageProm =( async ()=> { // load weather specific image.
        //TODO: cool gifs on that page: https://giphy.com/gifs/flaticons-U23jW3n2KIcdNaA3IB
        try{
            let imagesFolderPath = "images";
            let imageName = forecastData.current.weather[0].icon;
            // if there is a gif for this weather, load it.
            let imgElement = document.getElementById("weather_img");
            
            let alreadyTried = false;

            
            imgElement.onerror= ()=>{ // define fallback image
                if(!alreadyTried){ alreadyTried=true; imgElement.src = imagesFolderPath +"/"+ imageName +".png"; }
                else { imgElement.parentNode.removeChild(imgElement); } 
            }

            // try to laod gif
            imgElement.src = imagesFolderPath +"/"+ imageName +".gif";
        } catch(err) {console.warn(err);}
        
    })();
    subPromises.push(loadWeatherImageProm);
    
    for (let i=1;i<6 ;i++) { //5x 2hours rain forecast
        let hourTime = new Date( (forecastData.hourly[2*(i-1)].dt)*1000 );
        tryToSetElementText("precipitation_time"+i, ("0"+hourTime.getHours()).slice(-2)+":"+("0"+hourTime.getMinutes()).slice(-2));
        try{
            document.getElementById("precipitation_bar"+i).style.height= Math.round(forecastData.hourly[2*(i-1)].pop*100) +"px";
        }catch(e){console.warn(e)}
        tryToSetElementText("precipitation"+i, Math.round(forecastData.hourly[2*(i-1)].pop*100) +"%");
    }

    
    let loadDailyForecastImagesProm = ( async ()=> { //5 Days Daily forecast. As smal previews
        let nextDaysDiv = document.getElementById("day_forecast");
        for (let i=1;i<6;i++) { // index 0 is today

            let dayDiv = document.createElement("div");
            dayDiv.className = "forecast";
            nextDaysDiv.appendChild(dayDiv);

            let nameDiv = document.createElement("div");
            nameDiv.style.textAlign="center";
            nameDiv.style.marginBottom ="3px";
            // Cut the both first letters: eg Mo, Di
            nameDiv.textContent = new Date( (forecastData.daily[i].dt)*1000 ).toLocaleDateString("de-DE",{weekday: 'long'}).slice(0,2);
            dayDiv.appendChild(nameDiv);

            // load icon
            let img = document.createElement("img");
            // icon source: https://www.pinterest.de/pin/414823815662066595/
            img.src = "images/icons/"+ forecastData.daily[i].weather[0].icon+".png" //xx
            img.style.width = "50px";
            dayDiv.appendChild(img);

            // min and max temprature
            let temperatureDiv = document.createElement("div");
            temperatureDiv.style.width = "100%";
            temperatureDiv.style.fontSize = "0.8em";
            let spanMin = document.createElement("span");
            spanMin.textContent =  Math.round(forecastData.daily[i].temp.min)+""; //xx
            temperatureDiv.appendChild(spanMin);
            let spanMax = document.createElement("span");
            spanMax.style.float = "right";
            spanMax.textContent = Math.round(forecastData.daily[i].temp.max)+""; //xx
            temperatureDiv.appendChild(spanMax);
            dayDiv.appendChild(temperatureDiv);

            // === HTML template for the next x day predictions
            /** 
            <div id="dayn+1" class="forecast">
                <div style="text-align: center; margin-bottom: 3px;">Mo</div>
                <img src="images/sonne.jpg" width="50px">
                <div style="width: 100%;"><span id="min">?</span> <span id="df_max_n+1" style="float: right;">?</span></div>
            </div>
            */
            // ==================================================
        }
    })();
    subPromises.push(loadDailyForecastImagesProm);
    
    return await Promise.all(subPromises);
}


/**
 * Include error handling, parentIframe callback and End the Programm
 * 
 * IMPORTANT: To keep this feature dont catch this functions errors!
 * @return {Promise<{name: string, latitude: number, longitude:number}>}
 */
async function resolveCityNameAndHandelExceptions(cityName, apiKey){
    try{
        let data = weatherAPI.getCoordinatesFromCityName(cityName, apiKey);

        console.log("Longitude/Latitude loaded from city name '" + cityName + "'.");
        return data
    } catch(err){
        if (err instanceof weatherAPI.NotFoundError){
            showErrorMessage("Can't resolve city name");
            
            // don't try again
            helperMethods.sendIframeLoadedCallback();
        
        } else {
            // all other errors, try again
        }

        // End Program in all Error cases, => wait for timeout from parent
        throw new Error(err.message);
    }

}


/**
 * Check for all requiered url encoded parameters.
 * 
 * If a requiered parameter is missing Throws an Error with missing parameters.
 * @returns Anonym Object with apiKeay, latitude, longitude and city
 */
function validateUrlParameters(){
    const urlParams = new URLSearchParams(window.location.search);

    let apiKey = urlParams.get("key");
    let latitude = urlParams.get("lat");
    let longitude = urlParams.get("lon");
    let city = urlParams.get("city");

    let missingErrors = [];

    if(apiKey==null) { missingErrors.push("API key missing.") }
    if(city==null && (latitude==null || longitude==null)){ missingErrors.push("City name or (latitude and longitude) is requiered.") }

    if (missingErrors.length > 0) {
        console.warn("See documentation for requiered inputs");
        throw Error(missingErrors);
    }
    return {apiKey, latitude, longitude, city};
}


/**
 * Clear the whole service content and display an error message.
 * This message as like the whole body content automaticaly disaper after 1 minute.
 * @param {string} message An alternative Error text instead the default.
 */
function showErrorMessage(message){

    let msg = `
    <div class="errorMsg">
        <p>`+message+`</p>
        <p>The Service and this message will disapper in 1 minute.</p>
    </div>
    `;

    // override whole body contet with error
    document.body.innerHTML = msg;

    // remove the whole bodycontent adter 1 minute so the service is invisible
    setTimeout(()=>{
        document.body.innerHTML="";
    },60*1000);
}
