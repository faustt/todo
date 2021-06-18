<script>
    import { _ } from "../i18n";
    import CategoryList from "../components/CategoryList.svelte";
</script>

<div class="text-2xl p-4 mb-4 text-center bg-yellow-500 text-yellow-900">{$_("Categories")}</div>
<CategoryList />
<div class="h-24" />
