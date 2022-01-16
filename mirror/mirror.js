import {ServiceComponent} from "./service-component/service-component.mjs"

// ++++++++++++++++++++++++++++++++++++++++++
var version = "v1.0.2d";
var url = "http://127.0.0.1:8081";
// ++++++++++++++++++++++++++++++++++++++++++


// load the services and manage its position
loadServices();


function loadServices() {
    
    let removeLogo = showLogoUntilServicesAreLoaded(version);

    loadMirrorServiceConfigurations().then((services) => {
        displayServices(services).then(()=>{
            console.log("All services loaded.")
            removeLogo();
        });
    });
}

/**
 * Display the mirrro logo until invoking the returned method, or the max duration timeout expired.
 * @param {number} maxWaitDuration timeout in milli seconds
 * @param {number} minWaitingDuration minimum displayed time in milli seconds
 * @returns {Function} Call this function to remove the logo
 */
function showLogoUntilServicesAreLoaded(version="", maxWaitDuration=30*1000, minWaitingDuration=6*1000) {
    var logo = document.getElementById("logo");

    logo.setVersion(version);

    let removeRequested = false;
    let minWaitingTimeExpired = false;

    let tryRemove = ()=> {
        if(minWaitingTimeExpired && removeRequested){
            logo.remove(); 
        }
    };

    // max waiting Duration
    setTimeout(()=>{
        removeRequested = true;
        tryRemove();
    },maxWaitDuration);

    // min waiting Duration
    setTimeout(()=>{
        minWaitingTimeExpired = true;
        tryRemove();
    }, minWaitingDuration);

    
    return (() => {
            removeRequested = true;
            tryRemove();
        });
}


/**
 * Fetch the mirror Configuration from local webserver
 * @returns {Promise<any>}
 */
function loadMirrorServiceConfigurations() {

    return new Promise((resolve, reject) => {
        fetch(url+"/api/services")
        .then((response) => response.json())
        .then((jsonServiceConfigurations) => {
            console.log("services configurations loaded.");
            resolve(jsonServiceConfigurations.services);
        }).catch((err) => { reject(err)});
    });
}

/**
 * Load and display all services defined in the given list of configurations.
 * If a service cant load correctly, it gets loaded later managed by circuit breaker.
 * This method can only called once!
 * @param {ServiceConfiguration[]} serviceConfigurations 
 * @returns {Prmise<void>} Reject when All services are loaded
 */
function displayServices(serviceConfigurations) {
    var executed = false;
    return (() =>{

        // make sure the method is only callable once
        if (executed) { throw new Error("This method is callable only once.");}
        executed = true;

        var body = document.getElementsByTagName("body")[0];

        // Create all HTML service components
        var services = []; // HTMLElement 
        for (let serviceConfiguration of serviceConfigurations) {
            try {
                let serviceComponent = document.createElement("service-component");
                
                // Set attributes of service component
                serviceComponent.setAttribute(
                    "name", serviceConfiguration.name || (()=>{ throw new Error("Missing 'name' in service configuration") })());
                serviceComponent.setAttribute(
                    "url", serviceConfiguration.url || (()=>{ throw new Error("Missing 'url' in service '"+serviceConfiguration.name+"' configuration'") })());
                serviceComponent.setAttribute(
                    "width", serviceConfiguration.width || (()=>{ throw new Error("Missing 'width' in service '"+serviceConfiguration.name+"' configuration'") })());
                serviceComponent.setAttribute(
                    "height", serviceConfiguration.height || (()=>{ throw new Error("Missing 'height' in service '"+serviceConfiguration.name+"' configuration'") })());
                serviceComponent.setAttribute(
                    "top", serviceConfiguration.top || (()=>{ throw new Error("Missing 'top' in service '"+serviceConfiguration.name+"' configuration'") })());
                serviceComponent.setAttribute(
                    "left", serviceConfiguration.left || (()=>{ throw new Error("Missing 'left' in service '"+serviceConfiguration.name+"' configuration'") })());
                
                // add new service to the list of services
                services.push(serviceComponent);
            } catch(err) { console.error(err); console.info(serviceConfiguration.name + " service will be ignored."); }
        }

        let loadingServicesPromises = [];
        for (let service of services){

            body.appendChild(service);
            
            let prom = loadServiceUsingCircuitBreaker(service);
            prom.then(loadedService => { console.log("Service: " + service.serviceName +" loaded.") })

            loadingServicesPromises.push(prom);
        }

        // resolve if ALL promises are resolves.
        return Promise.allSettled(loadingServicesPromises);

    })();
}

/**
 * Try repeadly loading the given service.
 * Resolve the Promise containing the given Service if loaded successfully.
 * Never reject the Promise.
 * @param {ServiceComponent} service 
 * @returns {Promise<ServiceComponent>} 
 */
function loadServiceUsingCircuitBreaker(service) {
    
    return new Promise((resolve, reject) => {
        (function nextTry(failCounter) {
        
            service.loadContent()
            .then(() => { // component loaded successfully
                resolve(service);
            })
            .catch((err) => { // failure while loading component. Retry after timeout
                console.warn(err);
    
                failCounter ++;
                let randomOffset = Math.floor(Math.random() * 20)*1000; // 0 - 20 seconds in case multible serives have trouble
                let wait = 1;
                if (failCounter > 9){ wait = 20*60*1000 } 
                else if (failCounter > 6){ wait = 2*60*1000 + randomOffset }
                else if (failCounter > 4){ wait = 30*1000 + randomOffset }
                else { wait = 5*1000 + randomOffset }
    
                console.info("Retry after " + wait/1000 + " seconds")
    
                window.setTimeout(() => {
                    nextTry(failCounter);
                }, wait);
            })
    
        })();
    });
}