export function sendIframeLoadedCallback() {
    parent.postMessage("loaded", "*");
}


/**
 * Scale the given element to 100% of its parent size
 * The caling is oriented only by the width ratio !
 * @param {HTMLElement} element
 * @param {HTMLElement} parent the parent element of 'element'
 */
export function scaleElementToParentSize(element, parent) {
    //var heightScaling  = Math.round((parent.offsetHeight / element.offsetHeight)*100);
    let widthScaling  = Math.round((parent.offsetWidth / element.offsetWidth)*100);
    let heightScaling = widthScaling;

    element.style.transform = "scale(" + widthScaling + "%," + heightScaling + "%)";
    element.style.transformOrigin = "left top";
}


