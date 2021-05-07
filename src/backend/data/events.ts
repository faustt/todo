import Dexie from "dexie";
import db from "./database";

export default {
    async "todo/created"(event) {
        // Do not simply put the new item into the database since some
        // browsers (firefox, i am sadly looking at you) do not register
        // auto incremented values in compound indices at the first write.
        // To mitigate this, simply write the item again since this time
        // we know the auto incremented values.
        await db.transaction("readwrite", "todos", async () => {
            const key = await db.table("todos").put({
                id: event.payload.id,
                userId: event.payload.userId,
                createdAt: event.timestamp,
                updatedAt: event.timestamp,
                title: event.payload.title,
            });
            const item = await db.table("todos").get(key);
            await db.table("todos").put(item);
        });
    },

    async "todo/deleted"(event) {
        await db.table("todos").where({ id: event.payload.id }).delete();
    },

    async "todo/position-changed"(event) {
        // ugly code to move todos in their position
        // the move is performed in a readwrite transaction over the relevant section of the table

        console.debug("DO MOVE");

        await db.transaction("readwrite", "todos", async (trans) => {
            const beforeId = event.payload.beforeId ?? event.payload.position?.beforeId ?? null;
            const afterId = event.payload.afterId ?? event.payload.position?.afterId ?? null;

            const todoToMove = await trans.db.table("todos").where({ id: event.payload.id }).first();
            if (todoToMove.id === beforeId || todoToMove.id === afterId) {
                return;
            }

            let todoToSwapWith: any;
            let swap: "before" | "after";
            if (event.payload.beforeId) {
                console.debug("BEFORE");
                todoToSwapWith = await trans.db.table("todos").where({ id: beforeId }).first();
                swap = "before";
            } else {
                console.debug("AFTER");
                todoToSwapWith = await trans.db.table("todos").where({ id: afterId }).first();
                swap = "after";
            }

            console.debug("SWAP", todoToMove, todoToSwapWith);

            if (todoToMove.position < todoToSwapWith.position) {
                await trans.db.table("todos").where({ id: todoToMove.id }).delete();
                const todosToMove = await trans.db
                    .table("todos")
                    .where(["userId", "position"])
                    .between(
                        [todoToMove.userId, todoToMove.position],
                        [todoToMove.userId, todoToSwapWith.position + (swap === "before" ? -1 : 0)],
                        true,
                        true,
                    )
                    .toArray();
                for (const todo of todosToMove) {
                    await trans.db.table("todos").where({ id: todo.id }).delete();
                    todo.position--;
                    await trans.db.table("todos").add(todo);
                }
                todoToMove.position = todoToSwapWith.position;
                await trans.db.table("todos").add(todoToMove);
                console.debug(todosToMove.map((td) => ({ title: td.title, position: td.position })));
            } else if (todoToMove.position > todoToSwapWith.position) {
                await trans.db.table("todos").where({ id: todoToMove.id }).delete();
                const todosToMove = await trans.db
                    .table("todos")
                    .where(["userId", "position"])
                    .between(
                        [todoToMove.userId, todoToSwapWith.position + (swap === "before" ? 0 : 1)],
                        [todoToMove.userId, todoToMove.position],
                        true,
                        true,
                    )
                    .reverse()
                    .toArray();
                for (const todo of todosToMove) {
                    await trans.db.table("todos").where({ id: todo.id }).delete();
                    todo.position++;
                    await trans.db.table("todos").add(todo);
                }
                todoToMove.position = todoToSwapWith.position + (swap === "before" ? 0 : 1);
                await trans.db.table("todos").add(todoToMove);
                console.debug(todosToMove.map((td) => ({ title: td.title, position: td.position })));
            }
        });
    },
};
