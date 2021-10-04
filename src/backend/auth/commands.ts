import { v4 as uuid } from "uuid";
import * as backend from "..";
import db from "./database";
import { bcrypt } from "./util";

export interface CreateUserArgs {
	name: string;
	password: string;
}

export interface LoginArgs {
	name: string;
	password: string;
}

export interface GetUserWithArgs {
	id?: string;
	name?: string;
}

export interface User {
	id: string;
	name: string;
	passwordHash: string;
}

export default {
	async createUser(args: CreateUserArgs) {
		if (
			typeof args.name !== "string" ||
			typeof args.password !== "string"
		) {
			throw new Error("Invalid data!");
		}

		if (args.name.length < 2) {
			throw new Error(
				"User name too short. Must be at least 2 characters long!",
			);
		}

		if (args.name.length > 32) {
			throw new Error(
				"User name too long. Must be at most 32 characters long!",
			);
		}

		if (args.password.length < 5) {
			throw new Error(
				"Password too short. Must be at least 5 characters long!",
			);
		}

		if (args.password.length > 64) {
			throw new Error(
				"User name too long. Must be at most 64 characters long!",
			);
		}

		const existingUser = await this.getUserWith({ name: args.name });
		if (existingUser) {
			throw new Error("User already exists!");
		}

		const hash = await bcrypt.hash({
			text: args.password,
			rounds: 14,
			progress(t) {
				console.debug(`hashing progress: ${Math.floor(t * 100)}%`);
			},
		});

		const id = uuid();

		backend.events.commands.publish({
			scope: "auth",
			event: "user.created",
			payload: {
				id,
				name: args.name,
				passwordHash: hash,
			},
		});

		return id;
	},

	async login(args: LoginArgs) {
		const fail = () => {
			backend.events.commands.publish({
				scope: "auth",
				event: "user.login-failed",
				payload: {
					name: args.name,
				},
			});

			throw new Error("Invalid username or password!");
		};

		const existingUser = (await this.getUserWith({
			name: args.name,
		})) as User;
		if (!existingUser) {
			fail();
		}

		const valid = await bcrypt.compare({
			text: args.password,
			hash: existingUser.passwordHash,
			progress(t) {
				console.debug(`comparing progress: ${Math.floor(t * 100)}%`);
			},
		});

		if (!valid) {
			fail();
		}

		backend.events.commands.publish({
			scope: "auth",
			event: "user.login-succeeded",
			payload: {
				id: existingUser.id,
				name: args.name,
			},
		});

		return existingUser.id;
	},

	async getUserWith(args: GetUserWithArgs): Promise<User | null> {
		return await db.table("users").where(args).first();
	},

	async rebuildProjections() {
		await db.table("users").clear();
		await backend.events.commands.resetEventProcessor({
			name: "auth",
		});
	},

	async clearData() {
		await db.delete();
		await backend.events.commands.resetEventProcessor({
			name: "auth",
		});
	},
};
