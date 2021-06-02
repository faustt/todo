<script>
    import * as backend from "../backend";
    import { _ } from "../i18n";
    import TodoList from "../components/TodoList.svelte";

    export let params = {};

    const category = backend.data.getters.getCategory({
        id: params.id,
    });
</script>

{#if $category.item}
    <div class="text-2xl px-4 pt-4 p-8 text-center">{$category.item.name}</div>
    <TodoList categoryId={$category.item.id} />
{/if}
<div class="h-24" />
