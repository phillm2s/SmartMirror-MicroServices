
/**
 * 
 * @param {string} url specific url from 'vrs.de'
 */
function getTimetable(url) {
    // Example url: https://www.vrs.de/index.php?eID=tx_vrsinfo_ass2_departuremonitor&i=368127af83643cb3586b9c357bb69a60
    var proxy_url = "http://localhost:8081/cors?url="+url

    return fetch(proxy_url)
    .then(res => res.json())
}

