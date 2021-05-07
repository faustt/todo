import * as backend from "..";
import { v4 as uuid } from "uuid";
import db from "./database";

export interface CreateTodoArgs {
    userId: string;
    title: string;
}

export interface DeleteTodoArgs {
    id: string;
}

export type ChangeTodoPositionArgs =
    | {
          id: string;
          beforeId: string;
      }
    | {
          id: string;
          afterId: string;
      };

export default {
    async createTodo(args: CreateTodoArgs) {
        const id = uuid();

        backend.events.commands.publish({
            scope: "todo",
            event: "created",
            payload: {
                id,
                userId: args.userId,
                title: args.title,
            },
        });
    },

    async deleteTodo(args: DeleteTodoArgs) {
        backend.events.commands.publish({
            scope: "todo",
            event: "deleted",
            payload: {
                id: args.id,
            },
        });
    },

    async changeTodoPosition(args: ChangeTodoPositionArgs) {
        if ("beforeId" in args && "afterId" in args) {
            throw new Error("You can only provide either beforeId or afterId, not both!");
        }

        let position: any;
        if ("beforeId" in args) {
            position = { beforeId: args.beforeId };
        } else {
            position = { afterId: args.afterId };
        }

        backend.events.commands.publish({
            scope: "todo",
            event: "position-changed",
            payload: {
                id: args.id,
                ...position,
            },
        });
    },

    async rebuildProjections() {
        await db.table("todos").clear();
        await backend.events.commands.resetEventProcessor({
            name: "data",
        });
    },

    async clearData() {
        await db.delete();
        await backend.events.commands.resetEventProcessor({
            name: "data",
        });
    },
};
