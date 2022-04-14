export function shouldTriggerOfflineMode(){
    if(new URLSearchParams(window.location.search).get("offline")){
        return true;
    }
    if(window.localStorage.getItem("forceOffline")){
        return true;
    }
    return false;
}