
/**
 * 
 * @param {string} url specific url from 'vrs.de'
 */
function getTimetable(url="https://www.vrs.de/index?eID=tx_vrsinfo_ass2_departuremonitor&i=34a14adbc9c5eee8dd6ae160722676bc") {
    var proxy_url = "http://localhost:8081/cors?url="+url

    return fetch(proxy_url)
    .then(res => res.json())
}

