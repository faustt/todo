<script>
    import { _ } from "../i18n";
    import CategoryList from "../components/CategoryList.svelte";
</script>

<div class="text-2xl px-4 pt-4 p-8 text-center">{$_("Categories")}</div>
<CategoryList />
<div class="h-24" />
