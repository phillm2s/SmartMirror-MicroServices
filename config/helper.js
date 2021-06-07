/**
 * Load the Mirrorconfiguration from session Storrage or if not available from webserver
 * @param forceReload if set to true onfig gets load from webserver end overrides current session storage
 * @return Promise
*/
async function loadConfig(endpoint, forceReload=false) {
    return new Promise((resolve,reject) => {
        if (forceReload ||
                sessionStorage.getItem("config") == null ||
                sessionStorage.getItem("config") == "undefined") {
                // fetch config file from webserver
            
            fetch(endpoint + "/api/get-services", {mode: 'cors'})
            .then(response => response.json())
            .then(configJson => {
                // update session storage
                sessionStorage.setItem("config",JSON.stringify(configJson));
                resolve(configJson);
            })
            .catch(error => {
                reject(error);
            });
        } else {
            var data = JSON.parse(sessionStorage.getItem("config"));
            return resolve(data);
        }
    });
}
// async function loadConfig(forceReload=false) {
//     return new Promise((resolve,reject)=>{
//         (async () => {
//             if (forceReload || sessionStorage.getItem("config") == null){ // fetch config file from webserver
//                 await loadDeviceUrl()
//                     .then(url => {
//                         fetch(url + "/get-config", {mode: 'cors'})
//                         .then(response => response.json())
//                         .catch((error)=>{
//                             reject(error);
//                         })
//                         .then(data => {
//                             // update session storage
//                             sessionStorage.setItem("config",JSON.stringify(data));
//                             resolve(data);
//                         });
//                     })
//                     .catch(error => {
//                         reject(error);
//                     });
//                 return;
//             }
//             var data = JSON.parse(sessionStorage.getItem("config"));
//             resolve(data);
//         })();
//     });
// }


/**
 * Load the FQDN of the target Device and update the session storage.
 * If no device is given ass URL parameter the method loads it from session storage.
 * @return Promise
*/
async function loadDeviceUrl(forceReload=false) {
    return new Promise((resolve,reject)=>{

        if (forceReload) {
            sessionStorage.removeItem("device");
        }

        // check url parameter first
        const urlParams = new URLSearchParams(window.location.search);
        
        var mirrorUrl = null;
        if (urlParams.get("device") != null) {
            mirrorUrl = urlParams.get("device");
        } 
        else {
            mirrorUrl = sessionStorage.getItem("device");
        }

        if(mirrorUrl == null){
            reject("No concret mirror specified.");
            return;
        }
    
        sessionStorage.setItem("device",mirrorUrl);
        resolve(mirrorUrl);
    });
}


async function sendServicesUpdateRequest(servicesJsonArray) {
    return new Promise((resolve,reject)=>{
        //load old model
        loadDeviceUrl()
        .then(url => { loadConfig(url) })
        .then(config => {
            //override services
            config.services = servicesJsonArray;

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        resolve();
                    } else {
                        reject(this.status);
                    }
                }
            };
            xhttp.open("POST", "/update-services", true);
            xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp.send(JSON.stringify(config));
        });
    });
}

