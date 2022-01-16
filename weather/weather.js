import * as weatherAPI from './open_weather_api.mjs';
import {IForecastData} from './open_weather_api.mjs';
import * as helperMethods from './../sharedContent/helperMethods.mjs';

// ================================================
const updateEveryXSeconds = 60*20; // 20 minutes
// ================================================

var urlParameters;

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

    displayWeather(forecastData);

    // Set visibility of main content window
    document.getElementById("content").style.visibility = "visible";

    while(true){
        // wait x seconds
        await new Promise(resolve => setTimeout(resolve,5*1000));
        console.log("A")
        await helperMethods.circuitBreaker(()=>{
            console.log("try...");
            throw new Error("TEST ERRRO");
        },[5*1000, 10*1000, 30*1000, 2*60*1000, 5*60*1000, 5*60*1000, 10*60*1000], true,
        (retry, err)=>{console.log(retry+ ", "+ err.message)});

    }
    
})();


// //neither coordinates or city
// //else {window.location.replace("./../wrongParameters.html");}



// ==================== METHODS ==========================

/**
 * 
 * @param {IForecastData} forecastData
 */
function displayWeather(forecastData){

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


// function loadImage(imgElement, name) { //without file extention
//     //try hierarch first gif then png
//     imgElement.src= name + ".gif";
//     var last=false;
//     imgElement.onerror = (()=>{
//         if (last == false) {
//             last=true;
//             imgElement.src= name + ".png";
//         } else {
//             imgElement.parentNode.removeChild(imgElement);
//         }
//     });

// }


// function updateValue(id, value){
//     try {
//         document.getElementById(id).textContent = value;
//     }catch(e){
//         console.log(e);
//     }
// }
   

function updateWeather(latitude, longitude, apiKey){
    allInOneForecast(latitude, longitude, apiKey)
    .then(response => response.json())
    .then(data => {
        if (data.cod !=null && data.cod == 401) { window.location.replace("./../invalidApiKey.html");}

        updateValue("headline", (city || "Wetter") );

        let tos = 0;//data.timezone_offset; //no offset needed? //api gets time in seconds instead millis
        currentTimeInMillis = (data["current"].dt + tos)*1000 
        updateValue("current_time", new Date(currentTimeInMillis).toLocaleDateString("de-DE",
        {hour:"numeric", minute:"numeric", weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })+" Uhr");
                                            

        updateValue("current_temperature", Math.round(data["current"].temp));
        updateValue("description", data["current"].weather[0].description);

        updateValue("min_temperature", Math.round(data["daily"][0].temp.min));
        updateValue("max_temperature", Math.round(data["daily"][0].temp.max));

        //Main image
        loadImage(document.getElementById("weather_img"), "images/"+data.current.weather[0].icon);

        //5x 2hours rain forecast
        for (let i=1;i<6 ;i++) {
            let t = new Date( (data.hourly[2*(i-1)].dt + tos)*1000 );
            updateValue("precipitation_time"+i, ("0"+t.getHours()).slice(-2)+":"+("0"+t.getMinutes()).slice(-2));
            try{
                document.getElementById("precipitation_bar"+i).style.height= Math.round(data.hourly[2*(i-1)].pop*100) +"px";
            }catch(e){console.log(e)}
            updateValue("precipitation"+i, Math.round(data.hourly[2*(i-1)].pop*100) +"%");
        }

        //5 Days Daily forecast
        var mainDiv = document.getElementById("day_forecast");
        for (let i=1;i<6;i++) { // index 0 is today
            let dayDiv = document.createElement("div");
            dayDiv.className = "forecast";
            dayDiv
            mainDiv.appendChild(dayDiv);

            let nameDiv = document.createElement("div");
            nameDiv.style.textAlign="center";
            nameDiv.style.marginBottom ="3px";
            nameDiv.textContent = new Date( (data.daily[i].dt + tos)*1000 ).toLocaleDateString("de-DE",{weekday: 'long'}).slice(0,2); //xx
            dayDiv.appendChild(nameDiv);

            let img = document.createElement("img");
            //https://www.pinterest.de/pin/414823815662066595/
            img.src = "images/icons/"+ data.daily[i].weather[0].icon+".png" //xx
            img.style.width = "50px";
            dayDiv.appendChild(img);

            let temperatureDiv = document.createElement("div");
            temperatureDiv.style.width = "100%";
            temperatureDiv.style.fontSize = "0.8em";
            let spanMin = document.createElement("span");
            spanMin.textContent =  Math.round(data.daily[i].temp.min)+""; //xx
            temperatureDiv.appendChild(spanMin);
            let spanMax = document.createElement("span");
            spanMax.style.float = "right";
            spanMax.textContent = Math.round(data.daily[i].temp.max)+""; //xx
            temperatureDiv.appendChild(spanMax);
            dayDiv.appendChild(temperatureDiv);

            //<div id="dayn+1" class="forecast">
            //     <div style="text-align: center; margin-bottom: 3px;">Mo</div>
            //     <img src="images/sonne.jpg" width="50px">
            //     <div style="width: 100%;"><span id="min">?</span> <span id="df_max_n+1" style="float: right;">?</span></div>
            // </div>
        }

        useDefaultCallbackAndReziseHandler({expirationTimeSec: 30*60});
    }).
    catch((error) => {//todo: exception handling
        console.log(error);
    });
}