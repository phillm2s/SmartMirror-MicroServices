class Logo extends HTMLElement {
    
    constructor() {
        super();
        var shadow = this.attachShadow({mode: 'open'});

        // load html file from template ------------
        fetch("./logo/logo.html").then((res)=>{
            return res.text();
        }, (err)=>{
            console.error(err);
            shadow.innerHTML +=`<p>CustomElement html file missing!</p>`;
        })
        .then((res)=>{
            shadow.innerHTML += res;
        });
        // ---------------------------------------
    }

    setVersion(versionText) {
        this.shadowRoot.getElementById("version").textContent = versionText;
    }


}

customElements.define("mirror-logo", Logo);