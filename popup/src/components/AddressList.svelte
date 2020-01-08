<script>
  import Balance from "./Balance.svelte";
  export let addresses = [];
  export let balances = new Map();
  const formatCKB = ckb => {
    const int = (BigInt(ckb) / BigInt(10 ** 8))
      .toString()
      .split("")
      .reverse()
      .join("")
      .match(/\d{1,3}/g)
      .join(",")
      .split("")
      .reverse()
      .join("");
    const deci = ckb.slice(-8).replace(/0*$/, "");
    return { int, deci };
  };

  const onOpenAddr = addr => () =>
    chrome.tabs.create({
      url: `https://explorer.nervos.org/address/${addr}`
    });

  const onOpenExplorer = () =>
    chrome.tabs.create({
      url: "https://explorer.nervos.org/"
    });
</script>

<style>
  .address-list {
    width: 100%;
    padding: 15px 0;
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
    background: #e3e3e3;
    user-select: none;
    cursor: pointer;
  }

  .address {
    font-family: "Courier New", Courier, monospace;
    font-size: 16px;
  }

  .note {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
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
  {:else}
    <div class="note" on:click={onOpenExplorer}>
      Visit an address in CKB Explorer and click the subscribe to start
    </div>
  {/if}
</section>
