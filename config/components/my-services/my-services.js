customElements.define('my-services',
    class extends HTMLElement {
        constructor() {
            super();
            this._isInititalized = false;
        }
        connectedCallback() {
            if(this._isInititalized) {return;}
            //open = erlaubt zugriff von außern
            var shadow = this.attachShadow({mode: 'open'});
            this.shadow = shadow;
            shadow.innerHTML = `
                <div id="service-list">
            
                </div>
                `;

            // region: styles
            var stylesheetGlobal = document.createElement("link");
            stylesheetGlobal.rel = "stylesheet";
            stylesheetGlobal.href = "config.css";
            shadow.appendChild(stylesheetGlobal);

            var stylesheet = document.createElement("link");
            stylesheet.rel = "stylesheet";
            stylesheet.href = "components/my-services/my-services.css";
            shadow.appendChild(stylesheet);
            // endregion

            //addNewButton();


            function addNewButton() {    
                var newButton = document.createElement("div")
                // serviceDiv.className = "button1 service-div";
                // shadow.addEventListener("click", () => {
                //     window.location.href = "./new-service.html";
                // });
                // serviceDiv.style.marginTop = "3em";
                // shadow.getElementById("service-list").appendChild(serviceDiv);
        
                // var nameSpan = document.createElement("span");
                // nameSpan.className = "name-span";
                // nameSpan.textContent = "New";
                // nameSpan.style.color = "var(--color-special1)";
                // serviceDiv.appendChild(nameSpan);
            }
        }

        initServiceList(jsonServiceArray){
            var serviceListDiv = this.shadow.getElementById("service-list");
            jsonServiceArray?.forEach((service, index) => {
                // console.log("loaded config: '" + service.name + "' with data: ");
                // console.log(service);
                var serviceDiv = createServiceControllElement(service,index);
                serviceListDiv.appendChild(serviceDiv);
                // var serviceDiv = addServiceButton(serviceListDiv, index, service);
                // addDeleteFunction(serviceDiv, index, jsonServiceArray);
            });
            serviceListDiv.appendChild(createNewServiceControllElement());



            function createServiceControllElement(service, index) {
                var serviceDiv = document.createElement("div");
                serviceDiv.className = "service-div";

                var serviceButton = document.createElement("div");
                serviceButton.className = "service-button";
                serviceButton.textContent = service.name

                var serviceDeleteButton = document.createElement("div")
                serviceDeleteButton.className = "service-delete-button";
                var deleteSpan = document.createElement("span");
                deleteSpan.textContent= "Delete";
                serviceDeleteButton.appendChild(deleteSpan);

                serviceDiv.appendChild(serviceButton);
                serviceDiv.appendChild(serviceDeleteButton);

                return serviceDiv;
            }

            function createNewServiceControllElement() {
                var newButtonDiv = document.createElement("div");
                newButtonDiv.className = "service-div";
                newButtonDiv.id = "new-button-div";

                var newButton = document.createElement("div");
                newButton.className = "service-button";
                newButton.id = "new-button";
                newButton.textContent = "NEW +";

                newButtonDiv.appendChild(newButton);

                return newButtonDiv;
            }
        }
    }
);