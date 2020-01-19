<script>
  import Balance from "./Balance.svelte";
  import { formatCKB } from "../utils.js";

  export let addresses = [];
  export let balances = new Map();

  const onOpenAddr = addr => () =>
    chrome.tabs.create({
      url: `https://explorer.nervos.org/address/${addr}`
    });
</script>

<style>
  .address-list {
    width: 100%;
    padding: 5px 0 15px 0;
  }

  .item {
    display: flex;
    justify-content: space-between;
    align-content: center;
    width: 100%;
    padding: 5px 15px;
    box-sizing: border-box;
  }

  .item:hover {
    background: #f3f2f1;
    user-select: none;
    cursor: pointer;
  }

  .address {
    font-family: "Courier New", Courier, monospace;
    font-size: 16px;
  }
</style>

<section class="address-list">
  {#if addresses.length}
    {#each addresses as addr (addr)}
      <div class="item" on:click={onOpenAddr(addr)}>
        <span class="address" title={addr}>
          {`${addr.slice(0, 10)}...${addr.slice(-10)}`}:
        </span>
        <Balance {...formatCKB(balances.get(addr) || '')} />
      </div>
    {/each}
  {/if}
</section>
