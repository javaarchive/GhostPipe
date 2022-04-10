// TODO: offline cacher

function determineAPIUrl(){
    if(location.hostname === "localhost"){
        return "http://localhost:3003";
    }else if(localStorage.getItem("apiURL")){
        return localStorage.getItem("apiURL");
    }else{
        return "http://media-system" + "." + location.host.split(".").slice(1).join(".");
    }
}

export function dfetch(url,fetchOptions,raw = false){
    let newUrl = url;
    if(!url.startsWith("http")){
        newUrl = determineAPIUrl() + url;
    }
    return (new Promise((resolve,reject) => {
        function doFetch(){
            fetch(newUrl,fetchOptions).then(resp => {
                if(resp.ok){
                    if(raw){
                        resolve(resp);
                    }else{
                        resp.json().then(json => {
                            resolve(json);
                        }).catch(err => reject(err));
                    }
                }else if(resp.status == 429 && !fetchOptions.skipAutoretry){
                    // Autoretry
                    console.log("Got 429 while fetching",url,"retry in",resp.headers.get("Retry-After"),"s");
                    setTimeout(doFetch, parseFloat(resp.headers.get("Retry-After")) * 1000);
                }else{
                    throw new Error(`Fetch failed: ${resp.status} ${resp.statusText}`);
                }
            }).catch(err => {
                // Offline Fetch Attempt
                
            });
        }
        doFetch();
    }));
}