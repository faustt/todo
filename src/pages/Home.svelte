<script lang="ts">
    import { replace } from "svelte-spa-router";

    import * as backend from "../backend";
    import ReorderList from "../components/ReorderList.svelte";
    import { add } from "../components/Toasts.svelte";

    let name = "";
    let password = "";

    async function createUser() {
        try {
            userId = await backend.auth.commands.createUser({
                name,
                password,
            });
        } catch (e) {}
    }

    $: todos = backend.data.getters.getTodos({ userId: userId, orderBy: "position" });

    let userId = localStorage.getItem("faustt.todo.userId") ?? "";
    let title = "";

    async function createTodo() {
        try {
            await backend.data.commands.createTodo({
                userId,
                title,
            });

            add({
                intent: "info",
                text: `Eintrag hinzugefügt: ${title}`,
                duration: 2000,
            });

            title = "";
        } catch {}
    }

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

<div class="flex flex-col p-4">
    <div class="flex flex-row gap-4 items-center justify-evenly">
        <input type="text" placeholder="name" bind:value={name} />
        <input type="password" placeholder="password" bind:value={password} />
        <button on:click={createUser}>Create user</button>
    </div>
</div>
<div class="flex flex-col p-4">
    <div class="flex flex-row gap-4 items-center justify-evenly">
        <input disabled={$todos.loading} type="text" placeholder="userId" bind:value={userId} />
        <input disabled={$todos.loading} data-test="todo-title" type="text" placeholder="title" bind:value={title} />
        <button disabled={$todos.loading} data-test="todo-submit" on:click={createTodo}>Create todo</button>
    </div>
</div>
<div>
    <button on:click={rebuildProjections}>Rebuild projections</button>
    <button on:click={clearData}>Clear data</button>
</div>
<div class="flex flex-col p-4 relative gap-2">
    {#if $todos.loading}
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
            <div class="p-2 flex-1">{item.title}</div>
            <button
                class="px-4 py-2 bg-red-500 focus:outline-none"
                on:click={() => deleteTodo(item.id)}
                on:touchstart|stopPropagation
                on:mousedown|stopPropagation>Delete</button
            >
        </div>
    </ReorderList>
</div>

<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex flex-row">
    <button
        class="text-gray-400 p-4 active:bg-gray-200 focus:outline-none flex-1 flex flex-col items-center"
        on:click={() => replace("/lists")}
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
                d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
            />
        </svg>
    </button>
    <button
        class="text-gray-400 p-4 active:bg-gray-200 focus:outline-none flex-1 flex flex-col items-center"
        on:click={() => replace("/settings")}
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
                fill-rule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clip-rule="evenodd"
            />
        </svg>
    </button>
</div>

<!-- <div
    style="width:512px;height:512px"
    class="m-4 bg-gradient-to-bl from-yellow-300 to-yellow-400 text-white flex items-center justify-center"
>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-96 w-96" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path
            fill-rule="evenodd"
            d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
            clip-rule="evenodd"
        />
    </svg>
</div> -->
