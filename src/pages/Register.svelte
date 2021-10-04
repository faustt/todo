<script lang="ts">
	import * as backend from "../backend";
	import { add as addToast } from "../components/Toasts.svelte";

	let name = "";
	let password = "";
	let isWorking = false;

	const register = async () => {
		try {
			isWorking = true;

			const id = await backend.auth.commands.createUser({
				name,
				password,
			});

			window.localStorage.setItem("faustt.todo.userId", id);
		} catch (e) {
			addToast({
				intent: "danger",
				text: `${e}`,
			});
		} finally {
			isWorking = false;
		}
	};
</script>

<form
	on:submit|preventDefault={register}
	class="m-auto mt-24 bg-white shadow-lg rounded-md max-w-sm p-4"
>
	<div class="flex flex-col gap-4">
		<div class="flex flex-row items-center">
			<div class="w-28 select-none">Name</div>
			<div class="flex-1 relative h-10">
				<input
					disabled={isWorking}
					type="text"
					class="input"
					bind:value={name}
				/>
			</div>
		</div>
		<div class="flex flex-row items-center">
			<div class="w-28 select-none">Password</div>
			<div class="flex-1 relative h-10">
				<input
					disabled={isWorking}
					type="password"
					class="input"
					bind:value={password}
				/>
			</div>
		</div>
		<button disabled={isWorking} class="button" type="submit"
			>Register</button
		>
	</div>
</form>

<style lang="postcss">
	.input {
		@apply absolute top-0 left-0 h-full w-full px-2 bg-white text-black disabled:bg-gray-200 disabled:text-gray-400 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:cursor-not-allowed;
	}

	.button {
		@apply bg-blue-500 text-white w-48 py-2 disabled:bg-blue-300 disabled:text-blue-500 self-center rounded border-2 border-blue-500  focus:border-blue-700 disabled:border-blue-400 disabled:cursor-not-allowed;
	}
</style>
