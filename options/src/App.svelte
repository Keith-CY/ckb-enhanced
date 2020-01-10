<script>
  import Setting from "./components/Setting.svelte";
  import Addresses from "./components/Addresses.svelte";
</script>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
  }
</style>

<main>
  <h1>Setting of CKB Enhanced</h1>
  <hr />
  <h2>General Setting</h2>
  <Setting />
  <hr />
  <h2>Addresses</h2>
  <Addresses />
</main>
