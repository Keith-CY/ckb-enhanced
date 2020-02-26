<script>
  import Header from "./components/Header.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import Addresses from "./components/Addresses.svelte";
  import Wallets from "./components/Wallets.svelte";

  let page = "addresses";
  const onPageChange = ({ detail }) => {
    if (detail && detail.page) {
      switch (detail.page) {
        case "addresses": {
          page = "addresses";
          break;
        }
        case "wallet": {
          page = "wallet";
          break;
        }
        default: {
          // ignore
        }
      }
    }
  };
</script>

<Header />
<Sidebar {page} on:page-change={onPageChange} />
<main>
  {#if page === 'addresses'}
    <Addresses />
  {:else}
    <Wallets />
  {/if}
</main>
