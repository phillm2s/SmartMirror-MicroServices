/**
 * Optional Parameter could be: {expirationTimeSec: 30*60}
 */
function sendSucessfullLoadedCallback(optionalParameter ={}){
    var dto ={
        height: document.body.offsetHeight,
        width: document.body.offsetWidth, 
        url: window.location.href,
        optional: optionalParameter
    };
    console.log("send callback:");
    console.log(dto);
    parent.postMessage(dto,"*");
}

// function enableCallBackOnBodyRezise() {
//     sendSucessfullLoadedCallback(); // make sure it will send at least once

//     const observer = new ResizeObserver(entries => {
//         sendSucessfullLoadedCallback();
//     });
//     observer.observe(document.body);
// }