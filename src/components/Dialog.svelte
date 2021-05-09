<script lang="ts">
    export let open = false;

    const close = () => {
        open = false;
    };
</script>

{#if open}
    <div
        class="fixed top-0 right-0 bottom-0 left-0 bg-gray-700 bg-opacity-60 flex items-center justify-center p-4"
        on:click|self={close}
    >
        <div class="dialog flex flex-col gap-4 bg-white p-4 rounded-md">
            <slot />
        </div>
    </div>
{/if}

<style lang="postcss">
    .dialog {
        min-width: 16rem;
    }
</style>
