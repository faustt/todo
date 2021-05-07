import Dexie from "dexie";

const db = new Dexie("faustt.todo.auth");

db.version(1).stores({
    users: "&id, &name",
});

export default db;
