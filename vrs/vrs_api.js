

function getStationIDFromName(stationName) {
    var url = "https://apitest.vrsinfo.de:4443/vrs/cgi/service/ass";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    
    xhr.setRequestHeader("Content-Type", "application/xml");
    
    xhr.onreadystatechange = function () {
       if (xhr.readyState === 4) {
          console.log(xhr.status);
          console.log(xhr.responseText);
       }};
    
    var data = `<?xml version="1.0" encoding="ISO-8859-15"?>
            <Request>
            <ObjectInfo>
            <ObjectSearch>
            <String>bonn</String>
            <Classes>
            <Stop/>
            </Classes>
            </ObjectSearch>
            <Options>
            <Output>
            <SRSName>urn:adv:crs:ETRS89_UTM32</SRSName>
            </Output>
            </Options>
            </ObjectInfo>
            </Request>`;
    
    xhr.send(data);
}