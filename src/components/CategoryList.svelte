<script lang="ts">
	import { push } from "svelte-spa-router";
	import * as backend from "../backend";
	import ReorderList from "./ReorderList.svelte";
	import Dialog from "./Dialog.svelte";
	import { add } from "./Toasts.svelte";
	import { _ } from "../i18n";

	let isEditing = false;
	let userId = localStorage.getItem("faustt.todo.userId") ?? "";
	let isNewCategoryModalOpen = false;
	let isNewCategoryModalWorking = false;
	let newCategoryName = "";
	$: categories = backend.data.getters.getCategories({
		userId: userId,
		orderBy: "position",
	});

	async function deleteCategory(id: string) {
		try {
			await backend.data.commands.deleteCategory({
				id,
			});
		} catch {}
	}

	async function gotoCategory(item: any) {
		push(`/lists/${item.id}`);
	}

	async function handleItemMoved(event: CustomEvent) {
		const detail = event.detail as any;

		if ($categories.items.length <= 1) {
			return;
		}

		if (detail.to === 0) {
			await backend.data.commands.changeCategoryPosition({
				id: detail.item.id,
				beforeId: $categories.items[1].id,
			});
		} else {
			await backend.data.commands.changeCategoryPosition({
				id: detail.item.id,
				afterId: $categories.items[detail.to - 1].id,
			});
		}
	}

	const toggleEditing = () => {
		isEditing = !isEditing;
	};

	const createNewTodo = async () => {
		try {
			isNewCategoryModalWorking = true;

			if (newCategoryName.length < 1) {
				throw new Error("Name must not be empty!");
			}

			await backend.data.commands.createCategory({
				userId: "",
				name: newCategoryName,
			});

			newCategoryName = "";
			isNewCategoryModalOpen = false;
		} catch (e) {
			add({
				intent: "danger",
				text: e.message,
			});
		} finally {
			isNewCategoryModalWorking = false;
		}
	};

	const openNewCategoryModal = () => {
		isNewCategoryModalOpen = true;
	};
</script>

<div class="flex flex-col p-4 relative gap-4">
	{#if $categories.loading && $categories.items.length > 0}
		<div
			class="absolute top-0 right-0 bottom-0 left-0 z-20 flex justify-center items-center text-white cursor-wait"
		/>
	{/if}
	<ReorderList
		class="gap-4"
		items={$categories.items}
		id={(item) => item.id}
		let:item
		on:itemmoved={handleItemMoved}
		disableDragging={!isEditing}
	>
		<div
			class="bg-gray-100 flex flex-row rounded-md overflow-hidden shadow active:shadow-lg select-none {item.isDone
				? 'text-gray-300 bg-gray-50'
				: ''}"
			data-test="todo-category"
			data-test-name={item.name}
		>
			{#if isEditing}
				<div
					class="bg-gray-300 p-2 text-black flex items-center justify-center"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
						/>
					</svg>
				</div>
			{/if}
			<div
				class="p-4 flex-1 {isEditing
					? 'cursor-default'
					: 'cursor-pointer'}"
				class:ml-2={!isEditing}
				on:touchstart|stopPropagation
				on:mousedown|stopPropagation
				on:click={() => !isEditing && gotoCategory(item)}
			>
				{item.name}
			</div>
			{#if isEditing}
				<button
					class="p-2 bg-red-500 text-black focus:outline-none"
					on:click={() => deleteCategory(item.id)}
					on:touchstart|stopPropagation
					on:mousedown|stopPropagation
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</ReorderList>
	{#if isEditing}
		<button
			class="bg-gray-100 flex flex-row gap-2 py-2 px-4 rounded focus:outline-none border-2 border-gray-200 focus:border-yellow-400 active:border-yellow-500 active:bg-yellow-400 active:text-yellow-900"
			on:click={openNewCategoryModal}
		>
			<span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6v6m0 0v6m0-6h6m-6 0H6"
					/>
				</svg>
			</span>
			<span>{$_("Add category")}</span>
		</button>
	{/if}
</div>

<button
	class="fixed bottom-14 right-0 m-6 w-16 h-16 rounded-full {isEditing
		? 'bg-green-500 text-white'
		: 'bg-yellow-400 text-yellow-900'} focus:outline-none flex items-center justify-center shadow-lg"
	on:click={toggleEditing}
>
	{#if isEditing}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5 13l4 4L19 7"
			/>
		</svg>
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
			/>
		</svg>
	{/if}
</button>

<Dialog bind:open={isNewCategoryModalOpen}>
	<form
		class="flex flex-col gap-4"
		on:submit|preventDefault={createNewTodo}
		disabled={isNewCategoryModalWorking}
	>
		<div
			class="text-lg font-semibold tracking-tight text-gray-600 select-none"
		>
			{$_("Add item")}
		</div>
		<!-- svelte-ignore a11y-autofocus -->
		<input
			disabled={isNewCategoryModalWorking}
			type="text"
			placeholder={$_("description")}
			bind:value={newCategoryName}
			class="w-full border-2 border-gray-300 p-2 focus:outline-none focus:border-yellow-400 rounded"
			autofocus
		/>
		<button
			type="submit"
			class="px-4 py-2 bg-gray-200 rounded active:bg-yellow-400 focus:outline-none active:text-yellow-900 border-2 border-gray-300 active:border-yellow-500"
			>{$_("Add")}</button
		>
	</form>
</Dialog>
