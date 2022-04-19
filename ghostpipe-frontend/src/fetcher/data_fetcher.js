import db from "../database/db";

import {shouldTriggerOfflineMode} from "../offline/trigger";

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

export function dfetch(url,fetchOptions = {method:"GET"},raw = false){
    let newUrl = url;
    if(!url.startsWith("http") || url.startsWith("/")){
        newUrl = determineAPIUrl() + url;
    }

    return (new Promise((resolve,reject) => {
        function doFetch(){
            console.log("Fetching URL",newUrl);
            if(shouldTriggerOfflineMode()){
                console.log("Fetching from offline cache");
                db.requests.where({
                    url: newUrl,
                    method: fetchOptions.method || "GET"
                }).toArray().then(matchedRequests => {
                    console.log(newUrl,"matched to ",matchedRequests);
                    if(matchedRequests.length){
                        if(raw){
                            resolve(new Response(matchedRequests[0].body, {
                                status: matchedRequests[0].status,
                                headers:{
                                    "Content-Type": matchedRequests[0].contentType
                                }
                            }));
                        }else{
                            matchedRequests[0].body.text().then(str => {
                                resolve(JSON.parse(str));
                            });
                        }
                    }
                });
                return; // don't fetch
            }
            fetch(newUrl,fetchOptions).then(resp => {
                console.log("Fetch response",newUrl,"got",resp.status);
                if(resp.ok || resp.status == 200){
                    if(raw){
                        resolve(resp);
                    }else{
                        resp.json().then(json => {
                            // Cache if we can
                            if(fetchOptions && fetchOptions.cache != "no-cache" && fetchOptions.method == "GET"){
                                console.log("Caching to store ",newUrl);
                                db.requests.put({
                                    method: fetchOptions.method,
                                    url: newUrl,
                                    time: Date.now(),
                                    status: resp.status,
                                    contentType: resp.headers.get("Content-Type"),
                                    body: new Blob([JSON.stringify(json)],{type: resp.headers.get("Content-Type")})
                                });
                            }
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
                console.log("Fetch net error",err);
                // Offline Fetch Attempt
                if(fetchOptions.refetchOnNetworkDie && navigator.onLine){
                    console.log("Fetch failed, retrying in 5s",url.fetchOptions);
                    setTimeout(doFetch, 5000);
                }else{
                    db.requests.where({
                        url: newUrl,
                        method: fetchOptions.method || "GET"
                    }).toArray().then(matchedRequests => {
                        console.log(newUrl,"matched to ",matchedRequests);
                        if(matchedRequests.length){
                            if(raw){
                                resolve(new Response(matchedRequests[0].body, {
                                    status: matchedRequests[0].status,
                                    headers:{
                                        "Content-Type": matchedRequests[0].contentType
                                    }
                                }));
                            }else{
                                resolve(JSON.parse(matchedRequests[0].body));
                            }
                        }else{
                            reject(err);
                        }
                    })
                    
                }
            });
        }
        doFetch();
    }));
}