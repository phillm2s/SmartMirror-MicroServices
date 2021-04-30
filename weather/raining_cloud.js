customElements.define("rain-cloud",
    class MyElement extends HTMLElement {
        constructor() {
            super();
            var shadow = this.attachShadow({mode: 'open'});
            shadow.innerHTML= `
                <div class="container">
                    <div id="cloud">
                        <span class="shadow"></span>
                        <div class="rain">
                            <div class="drop d1"></div>
                            <div class="drop d2"></div>
                            <div class="drop d3"></div>
                            <div class="drop d4"></div>
                            <div class="drop d5"></div>
                            <div class="drop d6"></div>
                            <div class="drop d7"></div>
                            <div class="drop d8"></div>
                            <div class="drop d9"></div>
                            <div class="drop d10"></div>
                            <div class="drop d11"></div>
                            <div class="drop d12"></div>
                            <div class="drop d13"></div>
                            <div class="drop d14"></div>
                            <div class="drop d15"></div>
                        </div>
                    </div>
                </div>
            `;

            var styleSheets = document.createElement("link");
            shadow.append(styleSheets);
            styleSheets.rel="stylesheet";
            styleSheets.href="raining_clouds.css";
        }
    
        connectedCallback() {
        // browser calls this method when the element is added to the document
        // (can be called many times if an element is repeatedly added/removed)
        }
    
        disconnectedCallback() {
        // browser calls this method when the element is removed from the document
        // (can be called many times if an element is repeatedly added/removed)
        }
    
        static get observedAttributes() {
        return [/* array of attribute names to monitor for changes */];
        }
    
        attributeChangedCallback(name, oldValue, newValue) {
        // called when one of attributes listed above is modified
        }
    
        adoptedCallback() {
        // called when the element is moved to a new document
        // (happens in document.adoptNode, very rarely used)
        }
    
        // there can be other element methods and properties
    }
);