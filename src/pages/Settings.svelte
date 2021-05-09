<script lang="ts">
    import { onMount } from "svelte";
    import * as backend from "../backend";
    import { add } from "../components/Toasts.svelte";

    let hasStoragePermission = false;

    onMount(() => {
        navigator?.storage?.persisted()?.then((result) => {
            hasStoragePermission = result;
        });
    });

    async function requestStorage() {
        if (navigator.storage && navigator.storage.persist) {
            hasStoragePermission = await navigator.storage.persist();
        } else {
            add({
                intent: "info",
                text: "Your browser does not seem to support persistent storage!",
            });
        }
    }

    async function rebuildProjections() {
        try {
            add({ intent: "info", text: "Projections will be recreated" });
            await backend.auth.commands.rebuildProjections();
            await backend.data.commands.rebuildProjections();
        } catch (e) {
            add({ intent: "danger", text: e.message });
        }
    }

    async function clearData() {
        add({ intent: "info", text: "All data is getting deleted" });

        await backend.data.commands.clearData();
        await backend.auth.commands.clearData();
        await backend.events.commands.clearData();
        await window.location.reload();
    }
</script>

<div class="text-2xl px-4 pt-4 p-8 text-center">Settings</div>
<div class="flex flex-col gap-2 py-2">
    <div class="bg-gray-100 flex flex-row p-2 gap-4">
        <div class="flex-1 flex items-center">Request the data for the service to be stored permanently.</div>
        <div class="w-36 flex items-center justify-center">
            <button
                on:click={requestStorage}
                class="bg-gray-200 flex-1 p-2 active:bg-yellow-400 active:text-white focus:outline-none border-2 border-gray-300 active:border-yellow-500 focus:border-yellow-400 flex flex-row items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-300"
                disabled={hasStoragePermission}
            >
                {#if hasStoragePermission}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                        />
                    </svg>
                {:else}
                    <span>Request storage</span>
                {/if}
            </button>
        </div>
    </div>
    <div class="bg-gray-100 flex flex-row p-2 gap-4">
        <div class="flex-1 flex items-center">Rebuild all data based on the event log.</div>
        <div class="w-36 flex items-center justify-center">
            <button
                on:click={rebuildProjections}
                class="bg-gray-200 flex-1 p-2 active:bg-yellow-400 active:text-white focus:outline-none border-2 border-gray-300 active:border-yellow-500 focus:border-yellow-400"
                >Rebuild</button
            >
        </div>
    </div>
    <div class="bg-gray-100 flex flex-row p-2 gap-4">
        <div class="flex-1 flex items-center">Delete all data associated with this service.</div>
        <div class="w-36 flex items-center justify-center">
            <button
                on:click={clearData}
                class="bg-red-500 flex-1 p-2 active:bg-red-600 text-white focus:outline-none border-2 border-red-400 focus:border-red-700"
                >Clear data</button
            >
        </div>
    </div>
</div>
