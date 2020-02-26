<script>
  import { createEventDispatcher } from "svelte";
  export let page = "addresses";

  const dispatch = new createEventDispatcher();

  const onPageChange = e => {
    dispatch("page-change", {
      page: e.target.dataset.page
    });
  };
</script>

<style>
  sidebar {
    display: flex;
    flex-direction: column;
    border-right: 1px solid #eee;
    box-shadow: 0 1px 5px #eee;
    cursor: default;
    font-weight: 300;
    font-size: 0.875rem;
  }
  sidebar > div {
    height: 45px;
    display: flex;
    align-items: center;
    padding-left: 15px;
    box-sizing: border-box;
  }
  sidebar > div:hover {
    background-color: #eee;
  }
  sidebar > div[data-active="true"] {
    font-weight: 900;
    background: #efefef70;
  }
</style>

<sidebar>
  <div
    data-active={page === 'addresses'}
    data-page="addresses"
    on:click={onPageChange}>
    Addresses
  </div>
  <div
    data-active={page === 'wallet'}
    data-page="wallet"
    on:click={onPageChange}>
    Wallet
  </div>
</sidebar>
