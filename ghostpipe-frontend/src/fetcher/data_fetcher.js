// TODO: offline cacher

function determineAPIUrl(){
    if(location.hostname === "localhost"){
        return "http://localhost:3003";
    }else if(location.hostname.endsWith(".gitpod.io")){
        // Replace port number
        return "https://" + location.hostname.replace("3000","3003");
    }else if(localStorage.getItem("apiURL")){
        return localStorage.getItem("apiURL");
    }else{
        return "http://media-system" + "." + location.host.split(".").slice(1).join(".");
    }
}

console.log("Determined api url -> ",determineAPIUrl())

export function dfetch(url,fetchOptions,raw = false){
    let newUrl = url;
    if(!url.startsWith("http") || url.startsWith("/")){
        newUrl = determineAPIUrl() + url;
    }

    return (new Promise((resolve,reject) => {
        function doFetch(){
            console.log("Fetching URL",newUrl);
            fetch(newUrl,fetchOptions).then(resp => {
                console.log("Fetch response",newUrl,"got",resp.status);
                if(resp.ok || resp.status == 200){
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
                    setTimeout(doFetch, parseFloat(resp.headers.get("Retry-After")) * 1000 + 1000);
                }else{
                    console.log("Fetch Status failed");
                    reject(new Error(`Fetch failed: ${resp.status} ${resp.statusText}`));
                }
            }).catch(err => {
                // Offline Fetch Attempt
                if(fetchOptions.refetchOnNetworkDie){
                    console.log("Fetch failed, retrying in 5s",url.fetchOptions);
                    setTimeout(doFetch, 5000);
                }else{
                    reject(err);
                }
            });
        }
        doFetch();
    }));
}