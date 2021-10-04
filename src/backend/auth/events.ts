import db from "./database";

export default {
	async "auth/user.created"(event) {
		await db.table("users").put({
			id: event.payload.id,
			name: event.payload.name,
			passwordHash: event.payload.passwordHash,
			createdAt: event.timestamp,
			updatedAt: event.timestamp,
		});
	},
};
