import defaultPreferences from "./default_pref"

class LocalStoragePreferenceManager {
    getPref(name){
        if(localStorage.getItem(name) === null){
            return defaultPreferences[name] || null;
        }else{
            return JSON.parse(localStorage.getItem(name));
        }
    }

    setPref(name, value){
        localStorage.setItem(name, JSON.stringify(name));
    }

    hasPref(name){
        return this.getPref(name) !== null;
    }
}

export {LocalStoragePreferenceManager};

const lspm = new LocalStoragePreferenceManager();

export default lspm;