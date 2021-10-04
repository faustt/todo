<script>
	import { fade, fly } from "svelte/transition";
	import { _ } from "../i18n";
</script>

<div
	transition:fade={{ duration: 500 }}
	class="fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center"
>
	<div
		out:fly={{ y: 5, duration: 500 }}
		class="flex flex-col items-center justify-center text-center"
	>
		<div
			in:fly={{ y: 5, duration: 500, delay: 100 }}
			class="text-2xl font-semibold tracking-tight text-gray-700"
		>
			{$_("Not found")}
		</div>
		<div
			in:fly={{ y: 5, duration: 500, delay: 200 }}
			class="border-t border-gray-200 w-2/3 mt-4 mb-4"
		/>
		<div
			in:fly={{ y: 5, duration: 500, delay: 300 }}
			class="text-sm tracking-wide text-gray-500"
		>
			{$_("How did you get here? This page does not exist.")}
			<a href="#/" class="text-yellow-500 hover:underline"
				>{$_("Go home")}</a
			>
		</div>
	</div>
</div>
