import Home from "./pages/Home.svelte";
import Login from "./pages/Login.svelte";
import Register from "./pages/Register.svelte";
import NotFound from "./pages/NotFound.svelte";

export default {
    "/": Home,
    "/login": Login,
    "/register": Register,
    "*": NotFound,
};
