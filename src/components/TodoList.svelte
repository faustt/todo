<script lang="ts">
    import * as backend from "../backend";
    import ReorderList from "../components/ReorderList.svelte";

    let userId = localStorage.getItem("faustt.todo.userId") ?? "";
    $: todos = backend.data.getters.getTodos({ userId: userId, orderBy: "position" });

    async function deleteTodo(id: string) {
        try {
            await backend.data.commands.deleteTodo({
                id,
            });
        } catch {}
    }

    async function handleItemMoved(event: CustomEvent) {
        const detail = event.detail as any;

        if ($todos.items.length <= 1) {
            return;
        }

        if (detail.to === 0) {
            await backend.data.commands.changeTodoPosition({
                id: detail.item.id,
                beforeId: $todos.items[1].id,
            });
        } else {
            await backend.data.commands.changeTodoPosition({
                id: detail.item.id,
                afterId: $todos.items[detail.to - 1].id,
            });
        }
    }

    async function rebuildProjections() {
        await backend.auth.commands.rebuildProjections();
        await backend.data.commands.rebuildProjections();
    }

    async function clearData() {
        await backend.data.commands.clearData();
        await backend.auth.commands.clearData();
        await backend.events.commands.clearData();
        await window.location.reload();
    }
</script>

<div class="flex flex-col p-4 relative gap-2">
    {#if $todos.loading && $todos.items.length > 0}
        <div
            class="absolute top-0 right-0 bottom-0 left-0 bg-gray-700 bg-opacity-10 z-20 flex justify-center items-center text-white"
        />
    {/if}
    <ReorderList
        class="gap-0.5 bg-gray-200 rounded overflow-hidden"
        items={$todos.items}
        id={(item) => item.id}
        let:item
        on:itemmoved={handleItemMoved}
    >
        <div class="bg-gray-100 flex flex-row" data-test="todo-item" data-test-title={item.title}>
            <div class="bg-gray-300 p-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                </svg>
            </div>
            <div class="p-2 flex-1" on:touchstart|stopPropagation on:mousedown|stopPropagation>
                {item.title}
            </div>
            <button
                class="p-2 bg-red-500 focus:outline-none"
                on:click={() => deleteTodo(item.id)}
                on:touchstart|stopPropagation
                on:mousedown|stopPropagation
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                        fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                    />
                </svg>
            </button>
        </div>
    </ReorderList>
</div>
