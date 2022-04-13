import Dexie from 'dexie'

const db = new Dexie("ghostpipe")

db.version(5).stores({
    requests: "url, method",
    videoSegments: "filename, vid, time"
});

window.db = db; // debug

export default db;