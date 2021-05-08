<script lang="ts">
    import * as backend from "../backend";

    let events = backend.events.commands.getEvents({
        desc: true,
    });

    const getDateKey = (date: Date) => {
        return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
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
            return "Todo item added";
        } else if (scopedEvent === "todo/position-changed") {
            return "Todo item moved";
        } else if (scopedEvent === "todo/deleted") {
            return "Todo item deleted";
        } else if (scopedEvent === "todo/done") {
            return "Todo item completed";
        } else if (scopedEvent === "todo/unfinished") {
            return "Todo item reverted to unfinished";
        }

        return `${event.scope}/${event.event}`;
    };
</script>

<div class="text-2xl px-4 pt-4 p-8 text-center">History</div>

<div class="flex flex-col gap-4">
    {#await events then items}
        {#each groupEventsByDay(items) as list (list.dateKey)}
            <div class="flex flex-col gap-2">
                <div class="bg-yellow-400 text-white px-4 py-2">
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
