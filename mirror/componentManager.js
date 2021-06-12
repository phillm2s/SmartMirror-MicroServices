
class View {
    constructor(name, url, positioningParameter, serviceParameter) {
        var instance = this;
        this.name = name;
        this.parameters = serviceParameter = serviceParameter || {};
        this.url = url;

        var urlWithParams = url;
        var c = "?";  //start char for get request
        for (var key in serviceParameter) {
            urlWithParams += c + key + "=" + serviceParameter[key];
            c = "&"; // first param with "?" prefix
        }

        var loadIFrameContent = function(iframe, timeout=1000*15) { // 15sec
            return new Promise(function(resolve,reject){

                var timeoutHandler = setTimeout(()=>{
                    window.removeEventListener("message", messageReceivedEvent, false);
                    reject();
                },timeout);
                var messageReceivedEvent = function(event) {
                    //make sure its the callback from the correct iframe
                    if (event.data.url === urlWithParams) {
                        clearTimeout(timeoutHandler);
                        window.removeEventListener("message", messageReceivedEvent, false);
                        resolve(event);
                    }
                }
                window.addEventListener("message", messageReceivedEvent, false);

                iframe.src = urlWithParams;
            });
        };
        var hideFrame = function(iframe) {
            iframe.style.visibility="hidden";
        };
        var showFrame = function(iframe){
            iframe.style.visibility="visible";
        };

        //init iframes
        this.frame1 = document.createElement("iframe");
        this.frame2 = document.createElement("iframe");
        //after an duration remove iframe borders;
        setTimeout(()=>{
            instance.frame1.style.border = "0";
            instance.frame2.style.border = "0";
        }, 1000*30);

        this.activeFrame = this.frame2; //inertital state
        this.inaktiveFrame = this.frame1;
        [this.frame1, this.frame2].forEach((frame)=>{
            frame.className = name;

            frame.style.position = "absolute";

            for (key in positioningParameter) {
                frame.style.setProperty(key, positioningParameter[key]);
            }

            frame.style.overflow = "hidden";

            frame.height = positioningParameter.height || "150px";
            frame.width = positioningParameter.width || "300px";

            hideFrame(frame);
            document.body.appendChild(frame);
        });

        var instance = this;
        var connectionFailedCounter = 0;
        var refreshContent = function() {
            loadIFrameContent(instance.inaktiveFrame)
                .then((iFrameCallback)=>{
                    connectionFailedCounter = 0; //reset failures
                    console.log("Loading " + name + " succesfull.");
                    console.log(iFrameCallback);
                    let d = iFrameCallback.data;
                    //size priority order: ServiceParameter >> Callback >> default
                    instance.inaktiveFrame.width = positioningParameter.width || d.width || instance.inaktiveFrame.width;
                    instance.inaktiveFrame.height = positioningParameter.height || d.height || instance.inaktiveFrame.height;
                    hideFrame(instance.activeFrame);
                    showFrame(instance.inaktiveFrame);
                    //swap frames
                    let tmp = instance.activeFrame;
                    instance.activeFrame = instance.inaktiveFrame;
                    instance.inaktiveFrame = tmp;

                    if (d.optional.expirationTimeSec != null && d.optional.expirationTimeSec >=10){ //min 10 sec
                        console.log("Refresh " + name + " in " + d.optional.expirationTimeSec + " sec.")
                        setTimeout(()=>{refreshContent()},d.optional.expirationTimeSec*1000);
                    };
                },()=>{
                    connectionFailedCounter ++;
                    if (connectionFailedCounter <= 3){ var timeoutSec = 30; }
                    else if (connectionFailedCounter <= 4){ var timeoutSec = 120; }
                    else if (connectionFailedCounter <= 6){ var timeoutSec = 20*60; }
                    else if (connectionFailedCounter <= 7){ var timeoutSec = 90*60; }
                    else { var timeoutSec = 240*60; }
                    console.log("Loading " + name + " failed.");
                    console.log("Refresh " + name + " in " + timeoutSec + " sec.")
                    setTimeout(()=>{refreshContent()},timeoutSec*1000);
                })
                .catch((exception)=>{console.log(exception);});
        };

        //entry point
        refreshContent();
    }
}