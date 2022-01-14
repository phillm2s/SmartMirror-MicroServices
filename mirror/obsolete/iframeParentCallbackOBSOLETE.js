// /**
//  * Optional Parameter could be: {expirationTimeSec: 30*60}
//  */
// function sendSucessfullLoadedCallback(optionalParameter ={}){
//     var dto = {
//         height: document.body.scrollHeight + "px", 
//         // only margin right will is not included...
//         width: (document.body.scrollWidth + parseInt(window.getComputedStyle(document.body).marginRight.slice(0,-2))) + "px", 
//         url: window.location.href,
//         optional: optionalParameter
//     };
//     console.log("send callback:");
//     console.log(dto);
//     parent.postMessage(dto,"*");
// }

// function useDefaultCallbackAndReziseHandler(optionalParameter = {}){
//     var lastBodyzise = {h: -1, w: -1};
//     new ResizeObserver(()=>{
//         //filer if body size didnt changed
//         var currentBodySize = {
//             h: document.body.offsetHeight,
//             w: document.body.offsetWidth,
//         }
//         if (currentBodySize.w != lastBodyzise.w || currentBodySize.h != lastBodyzise.h) {
//             sendSucessfullLoadedCallback(optionalParameter);
//             lastBodyzise = currentBodySize;
//         }
//     }).observe(document.documentElement); // observe the html element not the body to include margin and padding from boddy
// }

// function sendIframeLoadedCallback() {
//     parent.postMessage("loaded", "*");
// }