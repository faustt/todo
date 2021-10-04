import db from "./database";

export default {
	///////////
	// Todos //
	///////////

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
				categoryId: event.payload.categoryId,
				createdAt: event.timestamp,
				updatedAt: event.timestamp,
				title: event.payload.title,
				isDone: false,
			});
			const item = await db.table("todos").get(key);
			await db.table("todos").put(item);
		});
	},

	async "todo/deleted"(event) {
		await db.table("todos").where({ id: event.payload.id }).delete();
	},

	async "todo/done"(event) {
		await db
			.table("todos")
			.where({ id: event.payload.id })
			.modify({ isDone: true });
	},

	async "todo/unfinished"(event) {
		await db
			.table("todos")
			.where({ id: event.payload.id })
			.modify({ isDone: false });
	},

	async "todo/position-changed"(event) {
		// ugly code to move todos in their position
		// the move is performed in a readwrite transaction over the relevant section of the table

		console.debug("DO MOVE");

		await db.transaction("readwrite", "todos", async (trans) => {
			const beforeId =
				event.payload.beforeId ??
				event.payload.position?.beforeId ??
				null;
			const afterId =
				event.payload.afterId ??
				event.payload.position?.afterId ??
				null;

			const todoToMove = await trans.db
				.table("todos")
				.where({ id: event.payload.id })
				.first();
			if (todoToMove.id === beforeId || todoToMove.id === afterId) {
				return;
			}

			let todoToSwapWith: any;
			let swap: "before" | "after";
			if (event.payload.beforeId) {
				console.debug("BEFORE");
				todoToSwapWith = await trans.db
					.table("todos")
					.where({ id: beforeId })
					.first();
				swap = "before";
			} else {
				console.debug("AFTER");
				todoToSwapWith = await trans.db
					.table("todos")
					.where({ id: afterId })
					.first();
				swap = "after";
			}

			console.debug("SWAP", todoToMove, todoToSwapWith);

			if (todoToMove.position < todoToSwapWith.position) {
				await trans.db
					.table("todos")
					.where({ id: todoToMove.id })
					.delete();
				const todosToMove = await trans.db
					.table("todos")
					.where(["categoryId", "position"])
					.between(
						[todoToMove.categoryId, todoToMove.position],
						[
							todoToMove.categoryId,
							todoToSwapWith.position +
								(swap === "before" ? -1 : 0),
						],
						true,
						true,
					)
					.toArray();
				for (const todo of todosToMove) {
					await trans.db
						.table("todos")
						.where({ id: todo.id })
						.delete();
					todo.position--;
					await trans.db.table("todos").add(todo);
				}
				todoToMove.position = todoToSwapWith.position;
				await trans.db.table("todos").add(todoToMove);
				console.debug(
					todosToMove.map((td) => ({
						title: td.title,
						position: td.position,
					})),
				);
			} else if (todoToMove.position > todoToSwapWith.position) {
				await trans.db
					.table("todos")
					.where({ id: todoToMove.id })
					.delete();
				const todosToMove = await trans.db
					.table("todos")
					.where(["categoryId", "position"])
					.between(
						[
							todoToMove.categoryId,
							todoToSwapWith.position +
								(swap === "before" ? 0 : 1),
						],
						[todoToMove.categoryId, todoToMove.position],
						true,
						true,
					)
					.reverse()
					.toArray();
				for (const todo of todosToMove) {
					await trans.db
						.table("todos")
						.where({ id: todo.id })
						.delete();
					todo.position++;
					await trans.db.table("todos").add(todo);
				}
				todoToMove.position =
					todoToSwapWith.position + (swap === "before" ? 0 : 1);
				await trans.db.table("todos").add(todoToMove);
				console.debug(
					todosToMove.map((td) => ({
						title: td.title,
						position: td.position,
					})),
				);
			}
		});
	},

	////////////////
	// Categories //
	////////////////

	async "category/created"(event) {
		// Do not simply put the new item into the database since some
		// browsers (firefox, i am sadly looking at you) do not register
		// auto incremented values in compound indices at the first write.
		// To mitigate this, simply write the item again since this time
		// we know the auto incremented values.
		await db.transaction("readwrite", "categories", async () => {
			const key = await db.table("categories").put({
				id: event.payload.id,
				userId: event.payload.userId,
				createdAt: event.timestamp,
				updatedAt: event.timestamp,
				name: event.payload.name,
				isDone: false,
			});
			const item = await db.table("categories").get(key);
			await db.table("categories").put(item);
		});
	},

	async "category/deleted"(event) {
		await db.table("categories").where({ id: event.payload.id }).delete();
	},

	async "category/position-changed"(event) {
		// ugly code to move categories in their position
		// the move is performed in a readwrite transaction over the relevant section of the table

		console.debug("DO MOVE");

		await db.transaction("readwrite", "categories", async (trans) => {
			const beforeId =
				event.payload.beforeId ??
				event.payload.position?.beforeId ??
				null;
			const afterId =
				event.payload.afterId ??
				event.payload.position?.afterId ??
				null;

			const categoryToMove = await trans.db
				.table("categories")
				.where({ id: event.payload.id })
				.first();
			if (
				categoryToMove.id === beforeId ||
				categoryToMove.id === afterId
			) {
				return;
			}

			let categoryToSwapWith: any;
			let swap: "before" | "after";
			if (event.payload.beforeId) {
				console.debug("BEFORE");
				categoryToSwapWith = await trans.db
					.table("categories")
					.where({ id: beforeId })
					.first();
				swap = "before";
			} else {
				console.debug("AFTER");
				categoryToSwapWith = await trans.db
					.table("categories")
					.where({ id: afterId })
					.first();
				swap = "after";
			}

			console.debug("SWAP", categoryToMove, categoryToSwapWith);

			if (categoryToMove.position < categoryToSwapWith.position) {
				await trans.db
					.table("categories")
					.where({ id: categoryToMove.id })
					.delete();
				const categoriesToMove = await trans.db
					.table("categories")
					.where(["userId", "position"])
					.between(
						[categoryToMove.userId, categoryToMove.position],
						[
							categoryToMove.userId,
							categoryToSwapWith.position +
								(swap === "before" ? -1 : 0),
						],
						true,
						true,
					)
					.toArray();
				for (const category of categoriesToMove) {
					await trans.db
						.table("categories")
						.where({ id: category.id })
						.delete();
					category.position--;
					await trans.db.table("categories").add(category);
				}
				categoryToMove.position = categoryToSwapWith.position;
				await trans.db.table("categories").add(categoryToMove);
				console.debug(
					categoriesToMove.map((cat) => ({
						name: cat.name,
						position: cat.position,
					})),
				);
			} else if (categoryToMove.position > categoryToSwapWith.position) {
				await trans.db
					.table("categories")
					.where({ id: categoryToMove.id })
					.delete();
				const categoriesToMove = await trans.db
					.table("categories")
					.where(["userId", "position"])
					.between(
						[
							categoryToMove.userId,
							categoryToSwapWith.position +
								(swap === "before" ? 0 : 1),
						],
						[categoryToMove.userId, categoryToMove.position],
						true,
						true,
					)
					.reverse()
					.toArray();
				for (const category of categoriesToMove) {
					await trans.db
						.table("categories")
						.where({ id: category.id })
						.delete();
					category.position++;
					await trans.db.table("categories").add(category);
				}
				categoryToMove.position =
					categoryToSwapWith.position + (swap === "before" ? 0 : 1);
				await trans.db.table("categories").add(categoryToMove);
				console.debug(
					categoriesToMove.map((cat) => ({
						name: cat.name,
						position: cat.position,
					})),
				);
			}
		});
	},
};
