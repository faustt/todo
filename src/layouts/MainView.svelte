<script lang="ts">
	import Router, { push, location } from "svelte-spa-router";
	import Lists from "../pages/Lists.svelte";
	import List from "../pages/List.svelte";
	import Settings from "../pages/Settings.svelte";
	import History from "../pages/History.svelte";
	import colors from "tailwindcss/colors";
	import { version } from "../version.json";

	const routes = {
		"/lists": Lists,
		"/lists/:id": List,
		"/settings": Settings,
		"/history": History,
	};
</script>

<svelte:head>
	<meta name="theme-color" content={colors.yellow["500"]} />
</svelte:head>

<div class="fixed top-0 right-0 bottom-0 left-0 flex flex-col items-stretch">
	<div
		class="p-4 border-b-2 border-yellow-500 text-lg bg-yellow-400 text-yellow-900 font-semibold tracking-tight"
	>
		<span>Todo</span>
		<span
			class="inline-block text-xs sup -translate-y-2 text-yellow-900 opacity-40"
			>v{version}</span
		>
	</div>
	<div class="flex-1 self-stretch overflow-auto relative">
		<Router {routes} />
	</div>
	<div class="flex flex-row">
		<button
			class="menu-bar-item"
			class:active={/^\/history(?:$|\/)/.test($location)}
			on:click={() => push("/history")}
			><svg
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
					d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
		</button>
		<button
			class="menu-bar-item"
			class:active={/^\/lists(?:$|\/)/.test($location)}
			on:click={() => push("/lists")}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
				/>
			</svg>
		</button>
		<button
			class="menu-bar-item"
			class:active={/^\/settings(?:$|\/)/.test($location)}
			on:click={() => push("/settings")}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	</div>
</div>

<style lang="postcss">
	.menu-bar-item {
		@apply text-gray-400 p-4 active:bg-gray-200 focus:outline-none flex-1 flex flex-col items-center border-t-2 border-gray-300;
	}

	.menu-bar-item.active {
		@apply bg-yellow-400 text-yellow-900 border-yellow-500;
	}
</style>
