import Dexie from "dexie";

const db = new Dexie("faustt.todo.events");

db.version(1).stores({
	events:
		"++order, id, [timestamp+order], [scope+order], [scopedEvent+order]",
	processors: "name",
});

db.version(2).upgrade(async (trans) => {
	const db = trans.db;

	// Force the events to be written again to fix the compound index on
	// browsers that do not properly support compound indices with an auto-
	// incremented property.
	let lastOrder = -1;
	let item: any;
	do {
		item = await db.table("events").where("order").above(lastOrder).first();
		if (item) {
			lastOrder = await db.table("events").put(item);
		}
	} while (item);
});

export default db;
