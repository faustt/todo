import * as backend from "..";
import { v4 as uuid } from "uuid";
import db from "./database";
import { processor } from ".";

export interface CreateTodoArgs {
    userId: string;
    categoryId: string;
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

export interface MarkTodoAsDoneArgs {
    id: string;
}

export interface MarkTodoAsUnfinishedArgs {
    id: string;
}

export interface CreateCategoryArgs {
    userId: string;
    name: string;
}

export interface DeleteCategoryArgs {
    id: string;
}

export type ChangeCategoryPositionArgs =
    | {
          id: string;
          beforeId: string;
      }
    | {
          id: string;
          afterId: string;
      };

export default {
    ///////////
    // Todos //
    ///////////

    async createTodo(args: CreateTodoArgs) {
        const id = uuid();

        backend.events.commands.publish({
            scope: "todo",
            event: "created",
            payload: {
                id,
                userId: args.userId,
                categoryId: args.categoryId,
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

    async markTodoAsDone(args: MarkTodoAsDoneArgs) {
        backend.events.commands.publish({
            scope: "todo",
            event: "done",
            payload: {
                id: args.id,
            },
        });
    },

    async markTodoAsUnfinished(args: MarkTodoAsDoneArgs) {
        backend.events.commands.publish({
            scope: "todo",
            event: "unfinished",
            payload: {
                id: args.id,
            },
        });
    },

    ////////////////
    // Categories //
    ////////////////

    async createCategory(args: CreateCategoryArgs) {
        const id = uuid();

        backend.events.commands.publish({
            scope: "category",
            event: "created",
            payload: {
                id,
                userId: args.userId,
                name: args.name,
            },
        });
    },

    async deleteCategory(args: DeleteCategoryArgs) {
        backend.events.commands.publish({
            scope: "category",
            event: "deleted",
            payload: {
                id: args.id,
            },
        });
    },

    async changeCategoryPosition(args: ChangeCategoryPositionArgs) {
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
            scope: "category",
            event: "position-changed",
            payload: {
                id: args.id,
                ...position,
            },
        });
    },

    //////////
    // Misc //
    //////////

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
        processor.unsubscribe();
        window.localStorage.removeItem("faustt.todo.splash");
    },
};
