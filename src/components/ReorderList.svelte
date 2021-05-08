<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";

    let className = "";
    export { className as class };
    export let items = [];
    export let id = (item: any) => item;
    export let disableDragging = false;

    const dispatch = createEventDispatcher();

    $: {
        items;

        itemsWereUpdated();
    }

    let rootElement: HTMLDivElement;
    let itemElements: HTMLDivElement[] = [];
    let draggingToIndex = -1;
    let draggingFromIndex = -1;
    let draggingYStart = -1;
    let draggingY = -1;
    let draggingElement = null;
    let clientY = -1;

    const isMouseEvent = (event: unknown): event is MouseEvent => {
        return (
            typeof event === "object" &&
            "type" in event &&
            (event["type"] === "mousedown" || event["type"] === "mousemove")
        );
    };

    const startDragging = (event: MouseEvent | TouchEvent, index: number) => {
        if (disableDragging) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        draggingToIndex = draggingFromIndex = index;
        draggingY = 0;
        draggingElement = event.currentTarget as HTMLDivElement;
        clientY = isMouseEvent(event) ? event.clientY : event.touches[0].clientY;
        draggingYStart =
            clientY - (draggingElement.getBoundingClientRect().top - rootElement.getBoundingClientRect().top);
        draggingY = clientY - draggingYStart;

        window.addEventListener("mousemove", dragging);
        window.addEventListener("touchmove", dragging);
        window.addEventListener("mouseup", stopDragging);
        window.addEventListener("touchend", stopDragging);

        console.log("startDrag", { draggingY, draggingToIndex, clientY });
    };

    const dragging = (event: MouseEvent | TouchEvent) => {
        clientY = isMouseEvent(event) ? event.clientY : event.touches[0].clientY;
        draggingY = clientY - draggingYStart;
        updateDraggingPosition();
    };

    const stopDragging = () => {
        if (draggingToIndex < 0) {
            return;
        }

        dispatch("itemmoved", {
            item: items[draggingToIndex],
            from: draggingFromIndex,
            to: draggingToIndex,
        });

        draggingToIndex = -1;

        window.removeEventListener("mousemove", dragging);
        window.removeEventListener("touchmove", dragging);
        window.removeEventListener("mouseup", stopDragging);
        window.removeEventListener("touchend", stopDragging);
    };

    const updateDraggingPosition = () => {
        let hasMoved = false;
        while (draggingToIndex > 0) {
            const previousElement = itemElements[draggingToIndex - 1];
            const previousElementBottom =
                previousElement.getBoundingClientRect().top + draggingElement.getBoundingClientRect().height;

            if (clientY < previousElementBottom) {
                let tmp = items[draggingToIndex - 1];
                items[draggingToIndex - 1] = items[draggingToIndex];
                items[draggingToIndex] = tmp;
                draggingToIndex -= 1;
                hasMoved = true;
            } else {
                break;
            }
        }

        if (hasMoved) return;

        while (draggingToIndex < items.length - 1) {
            const nextElement = itemElements[draggingToIndex + 1];
            const nextElementTop = nextElement.getBoundingClientRect().top;

            if (clientY > nextElementTop) {
                let tmp = items[draggingToIndex + 1];
                items[draggingToIndex + 1] = items[draggingToIndex];
                items[draggingToIndex] = tmp;
                draggingToIndex += 1;
            } else {
                break;
            }
        }
    };

    const itemsWereUpdated = () => {
        while (itemElements.length > items.length) itemElements.pop();
        while (itemElements.length < items.length) itemElements.push(null);
    };

    const itemWithId = (node: HTMLDivElement, args: { id: any }) => {
        const update = () => {
            const index = items.findIndex((item) => id(item) === args.id);
            if (index === -1) {
                return;
            }

            itemElements[index] = node;
        };

        update();

        return {
            update,
        };
    };

    onMount(() => {
        return () => {
            stopDragging();
        };
    });
</script>

<div class="flex flex-col relative {className}" class:select-none={draggingToIndex >= 0} bind:this={rootElement}>
    {#each items as item, index (id(item))}
        <div
            class="item"
            class:dragging={index === draggingToIndex}
            on:mousedown={(event) => startDragging(event, index)}
            on:touchstart={(event) => startDragging(event, index)}
            use:itemWithId={{ id: id(item) }}
        >
            <div class="content">
                <slot {item} {index} />
            </div>
        </div>
    {/each}
    {#if draggingToIndex >= 0}
        <div
            class="dragging-area"
            style="transform: translateY({draggingY}px); height: {window.getComputedStyle(draggingElement).height}"
        >
            <slot name="dragging-area">
                <div class="bg-gray-500 opacity-50" />
            </slot>
        </div>
    {/if}
</div>

<style lang="postcss">
    .item {
        @apply cursor-move;
    }

    .item.dragging {
        @apply bg-green-300;
    }

    .item.dragging .content {
        @apply opacity-0;
    }

    .dragging-area {
        @apply absolute top-0 left-0 w-full flex z-10;
    }

    .dragging-area > :global(*) {
        @apply flex-1;
    }
</style>
