import Dexie from "dexie";

const db = new Dexie("faustt.todo.events");

db.version(1).stores({
    events: "++order, id, [timestamp+order], [scope+order], [scopedEvent+order]",
    processors: "name",
});

export default db;
