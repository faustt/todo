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
    <div class="text-2xl p-4 mb-4 text-center bg-yellow-500 text-yellow-900">{$category.item.name}</div>
    <TodoList categoryId={$category.item.id} />
{/if}
<div class="h-24" />
