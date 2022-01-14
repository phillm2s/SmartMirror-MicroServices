// This component represents a Service loaded from any source via http.
//
// As core component it uses an Iframes to represent the content.
// Every Component have an "message" listener to comunicate with the loaded component from outside.

export class ServiceComponent extends HTMLElement {

    serviceName = undefined; // dont have to be unique
    serviceUrl = undefined;
    componentAttached = false;
    componentInitialized = false;



    // Component size can get in/decreased by user. But aspect ratio always stays fixed! ------------
    // The content of the iframe automaticaly gets scaled to this component and always fits its width

    // --------------------

    // Iframes display the main content
    // only one Iframe can be apendet at one time
    iframe = document.createElement("iframe");


    constructor() {
        super();
        var shadow = this.attachShadow({ mode: 'open' });

        // load stylesheet-----------------------
        let style = document.createElement("link");
        style.setAttribute("rel", "stylesheet");
        style.setAttribute("href", "./service-component/service-component.css");
        shadow.append(style);
        // -------------------------
        let body = document.createElement("body");
        shadow.append(body);

        body.appendChild(this.iframe);
    }


    /**
     * Gets called AUTOMATICALY each time the elements gets appended to the DOM.
     */
    connectedCallback() {
        if (this.componentAttached) { return; }
        this.componentAttached = true;

        this.serviceName = this.getAttribute("name") || (() => { throw new Error("'name' attribute missing.") })();
        this.serviceUrl = this.getAttribute("url") || (() => { throw new Error("'url' attribute missing.") })();

        this.width = this.getAttribute("width") || (() => { throw new Error("'width' attribute missing.") })();
        this.height = this.getAttribute("height") || (() => { throw new Error("'height' attribute missing.") })();

        // absolute positioning
        this.top = this.getAttribute("top") || (() => { throw new Error("'top' attribute missing.") })();
        this.left = this.getAttribute("left") || (() => { throw new Error("'left' attribute missing.") })();

        // Set size to 0 until content loaded succesfuly
        this.style.height = "0";
        this.style.width = "0";

        this.componentInitialized = true;
    }


    disconnectedCallback() {
        console.log("disconected fired");
        this.componentAttached = false;
    }


    contentLoadedCallback() {
        // if the content loaded sucessfuly resize the iframe to its expected size
        this.style.position = "absolute";
        this.style.top = this.top;
        this.style.left = this.left;

        // and to its expected position
        this.style.height = this.height;
        this.style.width = this.width;

        setTimeout(()=>{
            this.iframe.style.borderWidth = "0";
        },10*1000);
    }


    /**
     * Try loading the service content
     * @return {Promise} Resolve if receiving a 'loaded' callback from the service. Reject if timeout is reached without a callback
     */
    loadContent(timeout = 25*1000) {
        return new Promise((resolve,reject) => {
            if (this.componentInitialized == false) { reject(new Error("Component is not initialized. Attach it first.")); return; }
            
            var instance = this;

            var iframeCallback = function (event) {
                //make sure its the callback from the correct iframe, identifie by its id
                if (event.source === instance.iframe.contentWindow
                        && event.data === "loaded") {
    
                    // abort timout
                    window.clearTimeout(timeoutId);
                    // remove eventlistener so it cant get invoked again
                    window.removeEventListener("message", iframeCallback);
                    instance.contentLoadedCallback();
                    resolve();
                }
            }
    
            // reject after timeout is reached
            var timeoutId = window.setTimeout(()=>{

                // remove callback listener
                window.removeEventListener("message", iframeCallback);
                reject(new Error("Timeout while loading '" + this.getAttribute("name") + "' service."));

            }, timeout);

            window.addEventListener("message", iframeCallback);
    
            console.log("Start loading '" + this.getAttribute("name") + "' service.")
            
            // with setting the src attribute the iframe load the content
            instance.iframe.src = instance.serviceUrl;
        });
    }
}


customElements.define("service-component", ServiceComponent);

