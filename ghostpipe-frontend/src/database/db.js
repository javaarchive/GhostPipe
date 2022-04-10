import Dexie from 'dexie'

const db = new Dexie()

db.version(1).stores({
    requests: "url, method",
    videoSegements: "vid, section, format"
});

export default db;