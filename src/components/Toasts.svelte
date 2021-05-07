<script lang="ts" context="module">
    import { writable } from "svelte/store";

    let nextToastId = 1;
    let toasts = writable([]);

    export type Intent = "info" | "danger";

    export interface AddArgs {
        intent: Intent;
        text: string;
        duration?: number;
    }

    export function add(args: AddArgs) {
        const id = nextToastId++;

        toasts.update((toasts) => [
            {
                intent: args.intent,
                text: args.text,
                id,
            },
            ...toasts,
        ]);

        setTimeout(() => remove(id), args.duration ?? 5000);

        return id;
    }

    export function remove(id: number) {
        toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
    }
</script>

<script lang="ts">
    import { slide, fade } from "svelte/transition";
</script>

<div class="fixed top-0 left-0 right-0 z-50 px-4 py-2 pointer-events-none flex flex-col">
    {#each $toasts as toast (toast.id)}
        <div in:slide={{ duration: 500 }} out:slide={{ duration: 200, delay: 250 }} class="py-2">
            <div class="toast toast-intent-{toast.intent}">
                <div
                    in:fade={{ duration: 150, delay: 250 }}
                    out:fade={{ duration: 150 }}
                    class="flex flex-row items-center rounded text-white"
                >
                    <div class="toast-icon toast-icon-intent-{toast.intent}">
                        {#if toast.intent === "info"}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        {:else if toast.intent === "danger"}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        {/if}
                    </div>
                    <div>{toast.text}</div>
                </div>
            </div>
        </div>
    {/each}
</div>

<style lang="postcss">
    .toast {
        @apply p-4 pointer-events-auto rounded shadow-md;
    }

    .toast-icon {
        @apply border-r-2 pr-3 mr-3;
    }

    .toast-intent-info {
        @apply bg-blue-500;
    }

    .toast-icon-intent-info {
        @apply border-blue-600;
    }

    .toast-intent-danger {
        @apply bg-red-500;
    }

    .toast-icon-intent-danger {
        @apply border-red-600;
    }
</style>
