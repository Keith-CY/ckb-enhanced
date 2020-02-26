<script>
  import Balance from "./Balance.svelte";
  import CommandBar from "./CommandBar.svelte";
  import { loadFromStorage, storageKey, formatCKB } from "../utils.js";

  let xpub = "";

  const confirmWallet = () => {
    chrome.runtime.sendMessage({ action: "set-xpub", payload: xpub });
  };

  const removeXPub = () => {
    chrome.runtime.sendMessage({ action: "remove-xpub" });
  };

  const generateAddrs = () => {
    chrome.runtime.sendMessage({ action: "derive-address" });
  };

  let receiveAddrs = new Map();
  let changeAddrs = new Map();
  let walletBalances = new Map();
  let walletTotalBalance = "0";

  chrome.storage.onChanged.addListener(_changes => {
    if (_changes[storageKey.changes]) {
      changeAddrs = new Map(_changes[storageKey.changes].newValue);
    }
    if (_changes[storageKey.receives]) {
      receiveAddrs = new Map(_changes[storageKey.receives].newValue);
    }
    if (_changes[storageKey.walletBalances]) {
      walletBalances = new Map(_changes[storageKey.walletBalances].newValue);
    }
    if (_changes[storageKey.walletTotalBalance]) {
      walletTotalBalance = _changes[storageKey.walletTotalBalance].newValue;
    }
  });

  /**
   * init addresses
   */
  loadFromStorage([
    storageKey.receives,
    storageKey.changes,
    storageKey.walletBalances,
    storageKey.walletTotalBalance
  ]).then(_result => {
    const _receives = _result.get(storageKey.receives);
    const _changes = _result.get(storageKey.changes);
    const _walletBalances = _result.get(storageKey.walletBalances);
    const _walletTotalBalance = _result.get(storageKey.walletTotalBalance);
    if (Array.isArray(_receives)) {
      receiveAddrs = new Map(_receives);
    }
    if (Array.isArray(_changes)) {
      changeAddrs = new Map(_changes);
    }
    if (Array.isArray(_walletBalances)) {
      walletBalances = new Map(_walletBalances);
    }
    if (_walletTotalBalance) {
      walletTotalBalance = _walletTotalBalance;
    }
  });
</script>

<style>
  .command-bar {
    display: flex;
    align-items: stretch;
    width: 800px;
    height: 100%;
  }
  .command-bar button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background: transparent !important;
  }
  .command-bar button:hover {
    background: #f3f2f3 !important;
  }
  .xpub-input {
    margin: 10px 0;
  }
  .total-balance {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    align-items: center;
    font-weight: 400;
    font-size: 0.875rem;
    padding: 0 30px;
  }
  .total-balance > span {
    padding-right: 10px;
  }
  .total-balance > div {
    align-items: center;
  }
  .address-list {
    max-width: 800px;
    margin: 0 auto;
  }

  group-name {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 45px;
    padding: 0 15px;
    margin-top: 10px;
    font-size: 1rem;
    font-weight: 400px;
  }
  .address {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 24px;
    padding: 0 30px;
    font-family: "Courier New", Courier, monospace;
    font-size: 1rem;
    box-sizing: border-box;
    border-bottom: 1px solid #f3f2f1;
  }
  .address:hover {
    background: #eee;
  }
  .address-idx {
    width: 30px;
  }
  .balance {
    flex: 1;
    text-align: right;
  }
</style>

<section>
  <CommandBar>
    <div class="command-bar">
      <input bind:value={xpub} class="xpub-input" placeholder="xpub" />
      <button on:click={confirmWallet}>Save XPub</button>
      <button on:click={removeXPub}>Remove XPub</button>
      <button on:click={generateAddrs}>More Addresses</button>
      <div class="total-balance">
        <span>Total Balance:</span>
        <Balance {...formatCKB(walletTotalBalance)} />
      </div>
    </div>
  </CommandBar>
  <div class="address-list">
    <group-name>Receive Addresses</group-name>
    {#each [...receiveAddrs] as addr (addr[0])}
      <section class="address">
        <span class="address-idx">{addr[0].slice(15)}</span>
        <span>{addr[1]}</span>
        <span class="balance">
          {#if walletBalances.get(addr[1])}
            <Balance {...formatCKB(walletBalances.get(addr[1]))} />
          {:else}Not synced{/if}
        </span>
      </section>
    {/each}
    <group-name>Change Addresses</group-name>
    {#each [...changeAddrs] as addr (addr[0])}
      <section class="address">
        <span class="address-idx">{addr[0].slice(15)}</span>
        <span>{addr[1]}</span>
        <span class="balance">
          {#if walletBalances.get(addr[1])}
            <Balance {...formatCKB(walletBalances.get(addr[1]))} />
          {:else}Not synced{/if}
        </span>
      </section>
    {/each}
  </div>
</section>
