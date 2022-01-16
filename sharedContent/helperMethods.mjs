export function sendIframeLoadedCallback() {
    parent.postMessage("loaded", "*");
}


/**
 * Scale the given element to 100% of its parent size but in a way the content fits the parent.
 * This means always scale by the smaler newHeight/oldHeight , newWeidth/oldWeidth ratio.
 * @param {HTMLElement} element
 * @param {HTMLElement} parent the parent element of 'element'
 */
export function scaleElementToParentSize(element, parent) {
    //var heightScaling  = Math.round((parent.offsetHeight / element.offsetHeight)*100);

    //scale element ONLY depending on the width
    let scaleWidth  = Math.round((parent.offsetWidth / element.offsetWidth)*100);
    let scaleHeight = Math.round((parent.offsetHeight / element.offsetHeight)*100);


    //check if new scaled height would be overlap the parent to avoid cut of
    let scaleRatio = scaleWidth;
    if(scaleWidth > scaleHeight) {
        scaleRatio = scaleHeight
    }

    element.style.transform = "scale(" + scaleRatio + "%," + scaleRatio + "%)";
    element.style.transformOrigin = "left top";
}


