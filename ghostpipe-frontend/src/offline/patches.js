import db from "../database/db"

export function patchFetch(){
    const realFetch = window.fetch;    
    window.fetch = (...args) => {
        if(!window.navigator.onLine || (new URLSearchParams(location.search)).get("offline")){
            return (new Promise(async (resolve,reject) => {
                try{
                    const url = args[0];
                    const urlSplit = url.slice(1).split("/");
                    if(urlSplit[0] = "offline"){
                        let matched = db.videoSegments.where({
                            filename: urlSplit[1]
                        }).toArray();
                        if(matched.length){
                            resolve(new Response(matched[0].data));
                        }else{
                            reject("Not found in cache");
                        }
                    }else{
                        reject("Offline, no cache entry found");
                    }
                }catch(ex){
                    reject(new Error("Cache fetch error"));
                }
            }))
        }
        return realFetch(...args);
    }
}