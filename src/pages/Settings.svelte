<script lang="ts">
    import { onMount } from "svelte";
    import * as backend from "../backend";
    import Dialog from "../components/Dialog.svelte";
    import { add } from "../components/Toasts.svelte";
    import { _ } from "../i18n";

    let hasStoragePermission = false;
    let isClearDataDialogOpen = false;
    let clearDataDialogConfirmation = "";
    let inputElement: HTMLInputElement;
    let importedFiles: FileList;

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
                text: $_("Your browser does not seem to support persistent storage!"),
            });
        }
    }

    async function rebuildProjections() {
        try {
            add({ intent: "info", text: $_("Projections will be recreated") });
            await backend.auth.commands.rebuildProjections();
            await backend.data.commands.rebuildProjections();
        } catch (e) {
            add({ intent: "danger", text: e.message });
        }
    }

    function openClearDataDialog() {
        isClearDataDialogOpen = true;
    }

    async function exportData() {
        const now = new Date();
        const events = await backend.events.commands.getEvents();
        const data = {
            exportTimestamp: now.toISOString(),
            events,
        };

        download(JSON.stringify(data), `faustt-todo-${now.getTime()}.json`, "text/json");
    }

    async function importData() {
        console.log("test");

        if (importedFiles.length !== 1) {
            add({
                intent: "danger",
                text: $_("Please only provide a single file to import!"),
            });
            return;
        }

        let data: any;

        try {
            data = JSON.parse(await importedFiles[0].text());
        } catch {
            add({
                intent: "danger",
                text: $_("Invalid file format!"),
            });
            return;
        }

        await backend.data.commands.clearData();
        await backend.auth.commands.clearData();
        await backend.events.commands.clearEvents();

        for (const event of data.events) {
            await backend.events.commands.import(event);
        }

        window.location.reload();
    }

    $: {
        importedFiles;
        if (importedFiles?.length > 0) {
            importData();
        }
    }

    async function clearData() {
        if (clearDataDialogConfirmation !== "delete") {
            add({
                intent: "info",
                text: $_("Please type delete to confirm."),
            });
            return;
        }

        add({ intent: "info", text: $_("All data is getting deleted") });

        await backend.data.commands.clearData();
        await backend.auth.commands.clearData();
        await backend.events.commands.clearData();
        await window.location.reload();

        clearDataDialogConfirmation = "";
        isClearDataDialogOpen = false;
    }

    // https://stackoverflow.com/a/30832210
    function download(data, filename, type) {
        var file = new Blob([data], { type: type });
        if (window.navigator.msSaveOrOpenBlob)
            // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else {
            // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
</script>

<div class="text-2xl p-4 mb-4 text-center bg-yellow-500 text-yellow-900">{$_("Settings")}</div>
<div class="flex flex-col gap-2 py-2">
    <div class="bg-gray-100 flex flex-row p-2 gap-4">
        <div class="flex-1 flex items-center">{$_("Request the data for the service to be stored permanently.")}</div>
        <div class="w-36 flex items-center justify-center">
            <button
                on:click={requestStorage}
                class="bg-gray-200 flex-1 p-2 active:bg-yellow-400 active:text-yellow-900 focus:outline-none border-2 border-gray-300 active:border-yellow-500 focus:border-yellow-400 flex flex-row items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-300"
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
                    <span>{$_("Request storage")}</span>
                {/if}
            </button>
        </div>
    </div>
    <div class="bg-gray-100 flex flex-row p-2 gap-4">
        <div class="flex-1 flex items-center">{$_("Rebuild all data based on the event log.")}</div>
        <div class="w-36 flex items-center justify-center">
            <button
                on:click={rebuildProjections}
                class="bg-gray-200 flex-1 p-2 active:bg-yellow-400 active:text-yellow-900 focus:outline-none border-2 border-gray-300 active:border-yellow-500 focus:border-yellow-400"
                >{$_("Rebuild")}</button
            >
        </div>
    </div>
    <div class="bg-gray-100 flex flex-row p-2 gap-4">
        <div class="flex-1 flex items-center">{$_("Export all data stored in the service.")}</div>
        <div class="w-36 flex items-center justify-center">
            <button
                on:click={exportData}
                class="bg-gray-200 flex-1 p-2 active:bg-yellow-400 active:text-yellow-900 focus:outline-none border-2 border-gray-300 active:border-yellow-500 focus:border-yellow-400"
                >{$_("Export data")}</button
            >
        </div>
    </div>
    <div class="bg-gray-100 flex flex-row p-2 gap-4">
        <div class="flex-1 flex items-center">{$_("Import all data from an exported file.")}</div>
        <div class="w-36 flex items-center justify-center">
            <button
                on:click={() => inputElement.click()}
                class="bg-gray-200 flex-1 p-2 active:bg-yellow-400 active:text-yellow-900 focus:outline-none border-2 border-gray-300 active:border-yellow-500 focus:border-yellow-400"
                >{$_("Import data")}</button
            >
        </div>
        <input type="file" class="hidden" bind:this={inputElement} accept=".json" bind:files={importedFiles} />
    </div>
    <div class="bg-gray-100 flex flex-row p-2 gap-4">
        <div class="flex-1 flex items-center">{$_("Delete all data associated with this service.")}</div>
        <div class="w-36 flex items-center justify-center">
            <button
                on:click={openClearDataDialog}
                class="bg-red-500 flex-1 p-2 active:bg-red-600 text-white focus:outline-none border-2 border-red-400 focus:border-red-700"
                >{$_("Delete data")}</button
            >
        </div>
    </div>
</div>

<Dialog bind:open={isClearDataDialogOpen}>
    <form
        class="flex flex-col"
        disabled={clearDataDialogConfirmation !== "delete"}
        on:submit|preventDefault={clearData}
    >
        <div>{$_("Do you really want to delete all data?")}</div>
        <div class="font-bold">{$_("This cannot be undone!")}</div>
        <div class="mt-4">{$_("To confirm, please type delete in the field below:")}</div>
        <div class="relative h-12 mt-2">
            <!-- svelte-ignore a11y-autofocus -->
            <input
                type="text"
                placeholder=""
                bind:value={clearDataDialogConfirmation}
                class="w-full border-2 border-gray-300 p-2 focus:outline-none focus:border-yellow-400 rounded"
                autofocus
            />
        </div>
        <button
            disabled={clearDataDialogConfirmation !== "delete"}
            class="mt-4 bg-red-500 flex-1 p-2 active:bg-red-600 text-white focus:outline-none border-2 border-red-400 focus:border-red-700 disabled:bg-gray-200 disabled:border-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >{$_("Delete all data")}</button
        >
    </form>
</Dialog>
