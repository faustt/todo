import Dexie from "dexie";

const db = new Dexie("faustt.todo.data");

db.version(1).stores({
    todos: "++position, &id, userId, [userId+createdAt], [userId+updatedAt], [userId+position]",
});

export default db;
