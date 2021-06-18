<script lang="ts">
    // @hmr:keep-all

    import * as backend from "../backend";
    import { _ } from "../i18n";

    let events = backend.events.commands.getEvents({
        desc: true,
    });

    const isSameDay = (a: Date, b: Date) => {
        return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
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

    const groupEventsByDay = (events: any[]): { dateKey: string; items: any[] }[] => {
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
            return $_("Todo item added");
        } else if (scopedEvent === "todo/position-changed") {
            return $_("Todo item moved");
        } else if (scopedEvent === "todo/deleted") {
            return $_("Todo item deleted");
        } else if (scopedEvent === "todo/done") {
            return $_("Todo item completed");
        } else if (scopedEvent === "todo/unfinished") {
            return $_("Todo item reverted to unfinished");
        } else if (scopedEvent === "category/created") {
            return $_("Category created");
        } else if (scopedEvent === "category/deleted") {
            return $_("Category deleted");
        }

        return `${event.scope}/${event.event}`;
    };
</script>

<div class="text-2xl px-4 pt-4 p-8 text-center bg-yellow-500 text-yellow-900">{$_("History")}</div>

<div class="flex flex-col">
    {#await events then items}
        {#each groupEventsByDay(items) as list (list.dateKey)}
            <div class="flex flex-col gap-2">
                <div class="bg-yellow-500 text-yellow-900 font-semibold px-4 py-2 sticky top-0 left-0 right-0">
                    {list.dateKey}
                </div>
                {#each list.items as item (item.id)}
                    <div class="px-8 py-2">
                        <div>{getTime(item.timestamp)}</div>
                        <div>
                            {getHumanReadableDescription(item)}
                        </div>
                    </div>
                {/each}
            </div>
        {/each}
    {/await}
</div>
