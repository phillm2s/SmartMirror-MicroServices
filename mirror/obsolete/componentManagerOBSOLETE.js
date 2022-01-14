
class View {
    constructor(name, url, positioningParameter, serviceParameter) {
        var instance = this;
        this.name = name;
        this.parameters = serviceParameter = serviceParameter || {};
        this.url = url;

        var connectionFailedCounter = 0;

        var urlWithParams = url;
        var c = "?";  //start char for get request
        for (var key in serviceParameter) {
            urlWithParams += c + key + "=" + serviceParameter[key];
            c = "&"; // first param with "?" prefix
        }

        // --- init iframes -------------------
        this.frame1 = document.createElement("iframe");
        this.frame2 = document.createElement("iframe");

        this.activeFrame = this.frame1;
        this.inaktiveFrame = this.frame2;
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
        // --------------------


        //after an duration remove iframe borders;
        setTimeout(()=>{
            instance.frame1.style.border = "0";
            instance.frame2.style.border = "0";
        }, 1000*30);


        refreshContent();

        function loadIFrameContent(iframe, timeout=1000*15) { // 15sec
            return new Promise(function(resolve,reject){

                var timeoutHandler = setTimeout(()=>{
                    window.removeEventListener("message", iframeLoadedSucessfullEvent, false);
                    window.removeEventListener("message", repeatableIframeCallback, false);
                    reject("callback timeout");
                },timeout);

                window.addEventListener("message", iframeLoadedSucessfullEvent, false);

                // remove event listenet and append it again to make sute there is never more then one "iframeCallbackHandler" listener.
                window.removeEventListener("message", repeatableIframeCallback, false);
                window.addEventListener("message", repeatableIframeCallback, false);

                iframe.src = urlWithParams;

                // messageRecivedEvent cant trigger only once!
                function iframeLoadedSucessfullEvent(event) {
                    //make sure its the callback from the correct iframe
                    if (event.data.url === urlWithParams) {
                        clearTimeout(timeoutHandler);
                        window.removeEventListener("message", iframeLoadedSucessfullEvent, false);

                        console.log("\n+++++++++++++++++++++++++\nRecived loaded callback from service '" + name + "'.");
                        console.log(event.data);
                        console.log("+++++++++++++++++++++++++\n");

                        resolve(event);
                    }
                }

                function repeatableIframeCallback(event) {
                    if (event.data.url === urlWithParams) {
                        console.log("\n+++++++++++++++++++++++++\nRecived repeatable callback from '" + name + "'.");
                        console.log(event.data);
                        console.log("+++++++++++++++++++++++++\n");
                        
                        [instance.frame1, instance.frame2].forEach((frame)=>{
                            //size priority order: ServiceParameter >> Callback >> default
                            frame.width = event.data.positioningParameter?.width || event.data.width || instance.inaktiveFrame.width;
                            frame.height = event.data.positioningParameter?.height || event.data.height || instance.inaktiveFrame.height;
                        });
                    }
                }
            });
        };

        function hideFrame(iframe) {
            iframe.style.visibility="hidden";
        };

        function showFrame(iframe){
            iframe.style.visibility="visible";
        };

        function refreshContent() {
            loadIFrameContent(instance.inaktiveFrame)
                .then((iFrameCallback)=>{
                    connectionFailedCounter = 0; //reset failures

                    hideFrame(instance.activeFrame);
                    showFrame(instance.inaktiveFrame);

                    //swap frames
                    let tmp = instance.activeFrame;
                    instance.activeFrame = instance.inaktiveFrame;
                    instance.inaktiveFrame = tmp;

                    let d = iFrameCallback.data;
                    if (d.optional.expirationTimeSec != null && d.optional.expirationTimeSec >=10){ //min 10 sec
                        console.log("Refresh " + name + " in " + d.optional.expirationTimeSec + " sec.");
                        setTimeout(()=>{refreshContent()},d.optional.expirationTimeSec*1000);
                    };
                },(error)=>{
                    connectionFailedCounter ++;
                    if (connectionFailedCounter <= 3){ var timeoutSec = Math.floor(30+Math.random() * 20); } //random numer between 0 and 18 +30
                    else if (connectionFailedCounter <= 5){ var timeoutSec = 120; }
                    else if (connectionFailedCounter <= 7){ var timeoutSec = 20*60; }
                    else { var timeoutSec = 60*60; }
                    console.log("\n++++++++++++++++++++\nLoading " + name + " failed.");
                    console.log(error);
                    console.log("Refresh " + name + " in " + timeoutSec + " sec.\n++++++++++++++++++++")
                    setTimeout(()=>{refreshContent()},timeoutSec*1000);
                })
                .catch((exception)=>{console.log(exception);});
        };

    }
}