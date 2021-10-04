<script lang="ts">
	import { _ } from "../i18n";
	import { fade, fly } from "svelte/transition";

	let isOpen = true;

	function close() {
		isOpen = false;
		window.localStorage.setItem("faustt.todo.splash", "hide");
	}

	if (window.localStorage.getItem("faustt.todo.splash") === "hide") {
		isOpen = false;
	}
</script>

{#if isOpen}
	<div
		class="fixed top-0 right-0 bottom-0 left-0 bg-yellow-500 flex flex-col justify-center items-center select-none"
		out:fade={{ duration: 250, delay: 250 }}
	>
		<div
			in:fade={{ duration: 250, delay: 1000 }}
			class="py-4 font-semibold text-yellow-900 fixed top-0 left-0 right-0 text-center"
		>
			Todo
		</div>
		<div
			in:fly={{ duration: 250, delay: 1250, y: -5 }}
			out:fly={{ duration: 250, delay: 250, y: 5 }}
			class="p-4 bg-yellow-400 flex flex-col gap-4 rounded-md shadow-lg m-4"
			style="max-width: 20rem;"
		>
			<div>
				{$_(
					"Manage your daily chores and keep your tasks in order. Completely offline and without registration.",
				)}
			</div>
			<button
				on:click={close}
				class="px-4 py-2 self-center cursor-pointer rounded hover:font-semibold hover:bg-yellow-500 active:bg-yellow-500"
				>{$_("Get started!")}</button
			>
		</div>
	</div>
{/if}
