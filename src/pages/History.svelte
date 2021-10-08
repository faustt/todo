<script lang="ts">
	// @hmr:keep-all

	import * as backend from "../backend";
	import { _ } from "../i18n";

	const todoNames = new Map<string, string>();
	const categoryNames = new Map<string, string>();

	let events = backend.events.commands
		.getEvents({
			desc: true,
		})
		.then((events) =>
			events
				.reverse()
				.map((event) => ({
					...event,
					description: getHumanReadableDescription(event),
				}))
				.reverse(),
		);

	const isSameDay = (a: Date, b: Date) => {
		return (
			a.getDate() === b.getDate() &&
			a.getMonth() === b.getMonth() &&
			a.getFullYear() === b.getFullYear()
		);
	};

	const today = () => new Date();
	const yesterday = () => {
		const date = new Date();
		date.setDate(date.getDate() - 1);
		return date;
	};

	const getDateKey = (date: Date) => {
		if (isSameDay(date, today())) {
			return $_("today");
		}
		if (isSameDay(date, yesterday())) {
			return $_("yesterday");
		}

		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear().toString().padStart(4, "0");

		return `${day}.${month}.${year}`;
	};

	const groupEventsByDay = (
		events: any[],
	): { dateKey: string; items: any[] }[] => {
		let result: any[] = [];
		let items: any[] = [];
		let currentDateKey: string | null = null;

		for (const event of events) {
			const newDateKey = getDateKey(event.timestamp);
			if (newDateKey !== currentDateKey) {
				if (items.length != 0) {
					result.push({ dateKey: currentDateKey, items });
					items = [];
				}
			}

			currentDateKey = newDateKey;
			items.push(event);
		}

		if (items.length !== 0) {
			result.push({ dateKey: currentDateKey, items });
			items = [];
		}

		return result;
	};

	const getTime = (date: Date) => {
		const m = date.getMinutes().toString().padStart(2, "0");
		const h = date.getHours().toString().padStart(2, "0");

		return `${h}:${m}`;
	};

	const getHumanReadableDescription = (event: any) => {
		const scopedEvent = `${event.scope}/${event.event}`;

		if (scopedEvent === "todo/created") {
			const name = event.payload.title;
			todoNames.set(event.payload.id, name);
			return $_("Todo item added") + ": " + name;
		} else if (scopedEvent === "todo/position-changed") {
			const name = todoNames.get(event.payload.id);
			return $_("Todo item moved") + ": " + name;
		} else if (scopedEvent === "todo/deleted") {
			const name = todoNames.get(event.payload.id);
			todoNames.delete(event.payload.id);
			return $_("Todo item deleted") + ": " + name;
		} else if (scopedEvent === "todo/done") {
			const name = todoNames.get(event.payload.id);
			return $_("Todo item completed") + ": " + name;
		} else if (scopedEvent === "todo/unfinished") {
			const name = todoNames.get(event.payload.id);
			return $_("Todo item reverted to unfinished") + ": " + name;
		} else if (scopedEvent === "category/created") {
			const name = event.payload.name;
			categoryNames.set(event.payload.id, name);
			return $_("Category created") + ": " + name;
		} else if (scopedEvent === "category/deleted") {
			const name = categoryNames.get(event.payload.id);
			categoryNames.delete(event.payload.id);
			return $_("Category deleted") + ": " + name;
		}

		return `${event.scope}/${event.event}`;
	};
</script>

<div class="text-2xl px-4 pt-4 p-8 text-center bg-yellow-500 text-yellow-900">
	{$_("History")}
</div>

<div class="flex flex-col">
	{#await events then items}
		{#each groupEventsByDay(items) as list (list.dateKey)}
			<div class="flex flex-col gap-2">
				<div
					class="bg-yellow-500 text-yellow-900 font-semibold px-4 py-2 sticky top-0 left-0 right-0"
				>
					{list.dateKey}
				</div>
				{#each list.items as item (item.id)}
					<div class="px-8 py-2">
						<div>{getTime(item.timestamp)}</div>
						<div>{item.description}</div>
					</div>
				{/each}
			</div>
		{/each}
	{/await}
</div>
