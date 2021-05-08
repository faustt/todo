<script lang="ts">
    import Router from "svelte-spa-router";
    import Toasts from "./components/Toasts.svelte";
    import Home from "./pages/Home.svelte";
    import Login from "./pages/Login.svelte";
    import Register from "./pages/Register.svelte";
    import MainView from "./layouts/MainView.svelte";
    import NotFound from "./pages/NotFound.svelte";

    const routes = {
        "/": Home,
        "/lists": MainView,
        "/settings": MainView,
        "/history": MainView,
        "/login": Login,
        "/register": Register,
        "*": NotFound,
    };
</script>

<Toasts />
<Router {routes} />
