
function sendCallback(optionalParameter ={}){

    var dto ={
        height: document.documentElement.scrollHeight,
        width: document.documentElement.scrollWidth,
        url: window.location.href,
        optional: optionalParameter
    };
    parent.postMessage(dto,"*");
}