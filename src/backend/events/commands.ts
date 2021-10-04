import { v4 as uuid } from "uuid";
import db from "./database";

export interface PublishArgs {
	scope: string;
	event: string;
	payload: any;
}

export interface ImportArgs {
	order: number;
	timestamp: Date;
	scope: string;
	event: string;
	payload: any;
}

export interface CreateEventProcessorArgs {
	/**
	 * The name of the processor. Must be unique to the event store.
	 */
	name: string;

	/**
	 * Event handlers for each event.
	 * The event must be in scoped form: `${scope}/${event}`
	 */
	events: Record<string, EventHandler>;

	hooks?: {
		beforeKnownEvent?: (event: Event) => void | Promise<void>;
		afterKnownEvent?: (event: Event) => void | Promise<void>;
		onSuspend?: () => void | Promise<void>;
	};
}

export type EventHandler = (event: Event) => void | Promise<void>;

export interface ResetEventProcessorArgs {
	/**
	 * The name of the processor.
	 */
	name: string;
}

export interface GetEventsArgs {
	/**
	 * Whether or not to sort by descending order.
	 */
	desc?: boolean;
}

export default {
	async publish(args: PublishArgs) {
		pushToQueue({
			...args,
			id: uuid(),
			timestamp: new Date(),
		});
	},

	async import(args: ImportArgs) {
		await db.table("events").put({
			...args,
			timestamp: new Date(args.timestamp),
		});
	},

	async clearEvents() {
		await db.transaction("rw", "events", async (trans) => {
			await trans.table("events").clear();
		});
	},

	registerEventProcessor(args: CreateEventProcessorArgs) {
		let hasBeenUnsubscribed = false;
		let notifyResolve: () => void | null = null;

		const notification = () => {
			return new Promise((resolve) => {
				notifyResolve = resolve as () => void;
			});
		};

		eventProcessors.set(args.name, {
			notify() {
				notifyResolve?.();
				notifyResolve = null;
			},
			unsubscribe() {
				hasBeenUnsubscribed = true;
				notifyResolve?.();
			},
		});

		(async () => {
			console.debug(
				`%cEvent Processor%c${args.name}%c started`,
				"color:white;background:green;padding:0 0.5em",
				"color:white;background:blue;padding:0 0.5em",
				"color:black",
			);

			let entry: any;
			const refreshEntry = async () => {
				entry = await db
					.table("processors")
					.where({ name: args.name })
					.first();
				if (!entry) {
					entry = {
						name: args.name,
						lastEventId: null,
						lastEventOrder: -1,
					};
				}

				console.log(args.name, entry);
			};

			await refreshEntry();

			const batchSize = 10;
			let skippedEvents = 0;

			const printSkippedEvents = () => {
				if (skippedEvents) {
					console.debug(
						`%cEvent Processor%c${
							args.name
						}%c skipped ${skippedEvents} ${
							skippedEvents > 1 ? "events" : "event"
						}`,
						"color:white;background:green;padding:0 0.5em",
						"color:white;background:blue;padding:0 0.5em",
						"color:black",
					);

					skippedEvents = 0;
				}
			};

			while (!hasBeenUnsubscribed) {
				let events: Event[] = await db
					.table("events")
					.where("order")
					.above(entry.lastEventOrder)
					.limit(batchSize)
					.toArray();

				for (const event of events) {
					const scopedName = `${event.scope}/${event.event}`;
					const handler = args.events[scopedName];
					if (handler) {
						printSkippedEvents();

						console.debug(
							`%cEvent Processor%c${args.name}%c processing %c${event.scope}/${event.event} %c${event.id}`,
							"color:white;background:green;padding:0 0.5em",
							"color:white;background:blue;padding:0 0.5em",
							"color:black",
							"color:blue",
							"color:gray",
						);

						try {
							await args.hooks?.beforeKnownEvent?.(event);
						} catch (e) {
							console.error(
								`%cEvent Processor%c${args.name}%c error in %cbeforeKnownEvent%c hook %c${event.scope}/${event.event} %c${event.id}\n\n`,
								"color:white;background:green;padding:0 0.5em",
								"color:white;background:blue;padding:0 0.5em",
								"color:black",
								"color:yellow",
								"color:black",
								"color:blue",
								"color:gray",
								e,
							);
						}

						try {
							await handler(event);
						} catch (e) {
							console.error(
								`%cEvent Processor%c${args.name}%c error while processing %c${event.scope}/${event.event} %c${event.id}\n\n`,
								"color:white;background:green;padding:0 0.5em",
								"color:white;background:blue;padding:0 0.5em",
								"color:black",
								"color:blue",
								"color:gray",
								e,
							);
						}

						try {
							await args.hooks?.afterKnownEvent?.(event);
						} catch (e) {
							console.error(
								`%cEvent Processor%c${args.name}%c error in %cafterKnownEvent%c hook %c${event.scope}/${event.event} %c${event.id}\n\n`,
								"color:white;background:green;padding:0 0.5em",
								"color:white;background:blue;padding:0 0.5em",
								"color:black",
								"color:yellow",
								"color:black",
								"color:blue",
								"color:gray",
								e,
							);
						}
					} else {
						skippedEvents++;
					}

					entry.lastEventId = (event as any).id;
					entry.lastEventOrder = (event as any).order;

					try {
						await db.table("processors").put(entry);
					} catch (e) {
						console.error(
							`%cEvent Processor%c${args.name}%c error while saving state\n\n`,
							"color:white;background:green;padding:0 0.5em",
							"color:white;background:blue;padding:0 0.5em",
							"color:black",
							e,
						);
					}
				}

				if (events.length === 0) {
					printSkippedEvents();

					console.debug(
						`%cEvent Processor%c${args.name}%c suspended`,
						"color:white;background:green;padding:0 0.5em",
						"color:white;background:blue;padding:0 0.5em",
						"color:black",
					);

					try {
						await args.hooks?.onSuspend?.();
					} catch (e) {
						console.error(
							`%cEvent Processor%c${args.name}%c error in %conSuspend%c hook\n\n`,
							"color:white;background:green;padding:0 0.5em",
							"color:white;background:blue;padding:0 0.5em",
							"color:black",
							"color:yellow",
							"color:black",
							e,
						);
					}

					await notification();
					await refreshEntry();
				}
			}

			console.debug(
				`%cEvent Processor%c${args.name}%c stopped`,
				"color:white;background:green;padding:0 0.5em",
				"color:white;background:blue;padding:0 0.5em",
				"color:black",
			);
		})();

		return {
			unsubscribe() {
				eventProcessors.get(args.name).unsubscribe();
			},
		};
	},

	async resetEventProcessor(args: ResetEventProcessorArgs) {
		await db.table("processors").where({ name: args.name }).delete();
		notifyEventProcessor(args.name);
	},

	async clearData() {
		await db.delete();
	},

	async getEvents(args?: GetEventsArgs) {
		let collection = db.table("events").orderBy("[timestamp+order]");
		if (args?.desc) {
			collection = collection.reverse();
		}

		return await collection.toArray();
	},
};

interface Event {
	id: string;
	timestamp: Date;
	scope: string;
	event: string;
	payload: any;
}

interface EventProcessor {
	notify(): void;
	unsubscribe(): void;
}

let queue: Event[] = [];
let isQueueProcessing = false;
let eventProcessors = new Map<string, EventProcessor>();

function pushToQueue(event: Event) {
	queue.push(event);
	processQueue();
}

function processQueue() {
	if (isQueueProcessing) {
		return;
	}

	isQueueProcessing = true;
	(async () => {
		console.log("started event queue processing");

		while (queue.length !== 0) {
			const [event, ...rest] = queue;
			queue = rest;

			try {
				await db.transaction("readwrite", "events", async () => {
					// Fix for browsers that do not properly support auto-
					// incremented primary keys in compound indices (firefox).
					const key = await db.table("events").put(event);
					const actualData = await db.table("events").get(key);
					await db.table("events").put(actualData);
				});
			} catch {
				// TODO: handle error
			}

			notifyEventProcessors();
		}

		console.log("stopped event queue processing");
		isQueueProcessing = false;
	})();
}

function notifyEventProcessor(name: string) {
	const processor = eventProcessors.get(name);
	if (processor) {
		processor.notify();
	}
}

function notifyEventProcessors() {
	for (const processor of eventProcessors.values()) {
		processor.notify();
	}
}

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		for (const processor of eventProcessors.values()) {
			processor.unsubscribe();
		}
	});
}
