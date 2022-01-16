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


/**
 * Resolve imidialty with the element returned by the given method if the given method resolves.
 * If there is an error in the parameter method the system this method trys to invoke it again after the given timeout and increase the timeout index
 * @param {function} func Any function.
 * @param {number[]} timeouts The time on milliseconds waiting after a retry. If the number of retrys is bigger thant the amount of given timeouts the Promise rejects.
 * @param {boolean} infinite Optional, if true the last element in timeouts will be used until success.
 * @param {(retry: number, error: Error)=> void} failureCallback callback Function invoking after each failed attemp.
 */
 export async function circuitBreaker(func, timeouts, infinite=false, failureCallback=(retry, error)=>{}){
    let timeoutCounter=0; // maxsize is number of elements in tomouts array
    let realCounter=0; // increasing on every failure attemp
    
    while(timeoutCounter < timeouts.length){
        try{
            return await func();
        } catch(err){
            realCounter ++;

            failureCallback(realCounter, err);
            await new Promise(r=> setTimeout(r,timeouts[timeoutCounter]));

            // infinite mode and last element?
            if(infinite && timeoutCounter == timeouts.length-1){
                // dont increase;
            } else {
                timeoutCounter++;
            }

                
        }
    }
}


