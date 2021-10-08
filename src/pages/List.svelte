<script>
	import { fade } from "svelte/transition";
	import * as backend from "../backend";
	import { _ } from "../i18n";
	import TodoList from "../components/TodoList.svelte";

	export let params = {};

	const category = backend.data.getters.getCategory({
		id: params.id,
	});
</script>

<div class="absolute inset-0">
	{#if $category.item}
		<div
			class="text-2xl p-4 mb-4 text-center bg-yellow-500 text-yellow-900"
		>
			<span in:fade={{ duration: 150 }}>
				{$category.item.name}
			</span>
		</div>
		<TodoList categoryId={$category.item.id} />
	{:else}
		<div
			class="text-2xl p-4 mb-4 text-center bg-yellow-500 text-yellow-900"
		>
			&nbsp;
		</div>
	{/if}
	<div class="h-24" />
</div>
