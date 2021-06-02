import Dexie from "dexie";

const db = new Dexie("faustt.todo.data");

db.version(1).stores({
    todos: "++position, &id, userId, [userId+createdAt], [userId+updatedAt], [userId+position]",
});

db.version(2)
    .stores({
        todos: "++position, &id, userId, [categoryId+createdAt], [categoryId+updatedAt], [categoryId+position]",
        categories: "++position, &id, userId, [userId+createdAt], [userId+updatedAt], [userId+position], [userId+id]",
    })
    .upgrade(async (trans) => {
        trans.db
            .table("todos")
            .toCollection()
            .modify((todo) => {
                todo.categoryId = "default";
            });
    });

export default db;
