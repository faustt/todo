import Dexie from "dexie";
import * as store from "svelte/store";
import db from "./database";

export interface GetTodosArgs {
    categoryId: string;
    orderBy: "createdAt" | "updatedAt" | "position";
}

export interface GetCategoryArgs {
    id: string;
}

export interface GetCategoriesArgs {
    userId: string;
    orderBy: "createdAt" | "updatedAt" | "position";
}

export default {
    getTodos(args: GetTodosArgs) {
        let value = {
            loading: false,
            items: [],
        };

        const order = args.orderBy;

        return store.readable(value, (_set) => {
            let hasQuit = false;
            let notify: () => void | null = null;

            const setState = (state: any) => {
                Object.assign(value, state);
                _set(value);
            };

            const refresh = () => {
                notify?.();
                notify = null;
            };

            const invalidate = () => {
                setState({
                    loading: true,
                });
            };

            const notification = () => {
                return new Promise((resolve) => {
                    notify = resolve as () => void;
                });
            };

            storeRefreshers.add(refresh);
            storeInvalidators.add(invalidate);

            (async () => {
                while (!hasQuit) {
                    try {
                        setState({ loading: true });

                        const items = await db
                            .table("todos")
                            .where(`[categoryId+${order}]`)
                            .between([args.categoryId, Dexie.minKey], [args.categoryId, Dexie.maxKey])
                            .toArray();

                        setState({ loading: false, items });
                    } catch (e) {
                        console.error(e);
                    }

                    await notification();
                }
            })();

            return () => {
                hasQuit = true;
                refresh();

                storeRefreshers.delete(refresh);
                storeInvalidators.delete(invalidate);
            };
        });
    },

    getCategory(args: GetCategoryArgs) {
        let value = {
            loading: false,
            item: null,
        };

        return store.readable(value, (_set) => {
            let hasQuit = false;
            let notify: () => void | null = null;

            const setState = (state: any) => {
                Object.assign(value, state);
                _set(value);
            };

            const refresh = () => {
                notify?.();
                notify = null;
            };

            const invalidate = () => {
                setState({
                    loading: true,
                });
            };

            const notification = () => {
                return new Promise((resolve) => {
                    notify = resolve as () => void;
                });
            };

            storeRefreshers.add(refresh);
            storeInvalidators.add(invalidate);

            (async () => {
                while (!hasQuit) {
                    try {
                        setState({ loading: true });

                        const item = await db.table("categories").where("id").equals(args.id).first();

                        setState({ loading: false, item });
                    } catch (e) {
                        console.error(e);
                    }

                    await notification();
                }
            })();

            return () => {
                hasQuit = true;
                refresh();

                storeRefreshers.delete(refresh);
                storeInvalidators.delete(invalidate);
            };
        });
    },

    getCategories(args: GetCategoriesArgs) {
        let value = {
            loading: false,
            items: [],
        };

        const order = args.orderBy;

        return store.readable(value, (_set) => {
            let hasQuit = false;
            let notify: () => void | null = null;

            const setState = (state: any) => {
                Object.assign(value, state);
                _set(value);
            };

            const refresh = () => {
                notify?.();
                notify = null;
            };

            const invalidate = () => {
                setState({
                    loading: true,
                });
            };

            const notification = () => {
                return new Promise((resolve) => {
                    notify = resolve as () => void;
                });
            };

            storeRefreshers.add(refresh);
            storeInvalidators.add(invalidate);

            (async () => {
                while (!hasQuit) {
                    try {
                        setState({ loading: true });

                        const items = await db
                            .table("categories")
                            .where(`[userId+${order}]`)
                            .between([args.userId, Dexie.minKey], [args.userId, Dexie.maxKey])
                            .toArray();

                        setState({ loading: false, items });
                    } catch (e) {
                        console.error(e);
                    }

                    await notification();
                }
            })();

            return () => {
                hasQuit = true;
                refresh();

                storeRefreshers.delete(refresh);
                storeInvalidators.delete(invalidate);
            };
        });
    },
};

const storeRefreshers = new Set<() => void>();
const storeInvalidators = new Set<() => void>();

export function refresh() {
    for (const refresh of storeRefreshers) {
        refresh();
    }
}

export function invalidate() {
    for (const invalidator of storeInvalidators) {
        invalidator();
    }
}
