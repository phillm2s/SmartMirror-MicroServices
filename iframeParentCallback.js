
function sendSucessfullLoadedCallback(optionalParameter ={}){
    var dto ={
        height: document.documentElement.scrollHeight,
        width: document.documentElement.scrollWidth,
        url: window.location.href,
        optional: optionalParameter
    };
    console.log("send callback:");
    console.log(dto);
    parent.postMessage(dto,"*");
}