<script lang="ts">
	import Router from "svelte-spa-router";
	import Toasts from "./components/Toasts.svelte";
	import Home from "./pages/Home.svelte";
	import Login from "./pages/Login.svelte";
	import Register from "./pages/Register.svelte";
	import MainView from "./layouts/MainView.svelte";
	import NotFound from "./pages/NotFound.svelte";
	import { onMount } from "svelte";
	import { changeLanguage } from "./i18n";
	import Splash from "./components/Splash.svelte";

	const routes = {
		"/": Home,
		"/lists": MainView,
		"/lists/*": MainView,
		"/settings": MainView,
		"/history": MainView,
		"/login": Login,
		"/register": Register,
		"*": NotFound,
	};

	onMount(() => {
		changeLanguage(navigator.language);
	});
</script>

<Toasts />
<Router {routes} />
<Splash />
