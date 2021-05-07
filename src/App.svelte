<script lang="ts">
    import Router from "svelte-spa-router";
    import Toasts from "./components/Toasts.svelte";
    import routes from "./routes";
</script>

<Toasts />
<Router {routes} />
