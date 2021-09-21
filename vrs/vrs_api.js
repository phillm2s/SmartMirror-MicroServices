
/**
 * 
 * @param {string} url specific url from 'vrs.de'
 */
function getTimetable(url) {
    var proxy_url = "http://localhost:8081/cors?url="+url

    return fetch(proxy_url)
    .then(res => res.json())
}

