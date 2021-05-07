<script>
    import TodoList from "../components/TodoList.svelte";
    import * as backend from "../backend";

    let isNewTodoModalOpen = false;
    let isNewTodoModalWorking = false;
    let newTodoTitle = "";

    const createNewTodo = async () => {
        try {
            isNewTodoModalWorking = true;

            await backend.data.commands.createTodo({
                userId: "",
                title: newTodoTitle,
            });

            newTodoTitle = "";
            isNewTodoModalOpen = false;
        } finally {
            isNewTodoModalWorking = false;
        }
    };

    const openNewTodoModal = () => {
        isNewTodoModalOpen = true;
    };

    const closeNewTodoModal = () => {
        isNewTodoModalOpen = false;
    };
</script>

<div class="text-2xl px-4 pt-4 p-8 text-center">Todo</div>
<TodoList />
<div class="h-24" />

<button
    class="fixed bottom-14 right-0 m-6 w-16 h-16 rounded-full bg-yellow-400 focus:outline-none text-white flex items-center justify-center shadow-lg"
    on:click={openNewTodoModal}
>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
</button>

{#if isNewTodoModalOpen}
    <div
        class="fixed top-0 right-0 bottom-0 left-0 bg-gray-700 bg-opacity-60 flex items-center justify-center p-4"
        on:click|self={closeNewTodoModal}
    >
        <form
            class="open-new-todo-modal flex flex-col gap-4"
            on:submit|preventDefault={createNewTodo}
            disabled={isNewTodoModalWorking}
        >
            <div class="text-lg font-semibold tracking-tight text-gray-600 select-none">Add entry</div>
            <!-- svelte-ignore a11y-autofocus -->
            <input
                disabled={isNewTodoModalWorking}
                type="text"
                placeholder="text"
                bind:value={newTodoTitle}
                class="w-full border-2 border-gray-300 p-2 focus:outline-none focus:border-yellow-400 rounded"
                autofocus
            />
        </form>
    </div>
{/if}

<style lang="postcss">
    .open-new-todo-modal {
        @apply bg-white p-4 rounded-md;
        min-width: 16rem;
    }
</style>
