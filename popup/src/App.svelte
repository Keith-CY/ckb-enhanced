<script>
  import Wallet from "./components/Wallet.svelte";
  import TotalBalance from "./components/TotalBalance.svelte";
  import AddressList from "./components/AddressList.svelte";
  import UpdateTime from "./components/UpdateTime.svelte";
  import Balance from "./components/Balance.svelte";
  import {
    timeFormat,
    mapAddrGroupToGroupAddrs,
    formatCKB,
    getTotalBalance
  } from "./utils.js";

  let addresses = [];
  let groupAddrsMap = new Map([]);
  let balances = new Map();
  let time = "";

  if (chrome && chrome.storage) {
    chrome.storage.local.get(
      ["addresses", "balances", "lastUpdateTime", "groups"],
      s => {
        if (Array.isArray(s.addresses)) {
          addresses = s.addresses;
        }
        balances = new Map(s.balances);
        time = s.lastUpdateTime ? timeFormat.format(s.lastUpdateTime) : "";
        const mapping = mapAddrGroupToGroupAddrs(
          addresses,
          new Map(s.groups),
          "ungrouped"
        );
        groupAddrsMap = mapping;
      }
    );

    chrome.storage.onChanged.addListener(changes => {
      for (let key in changes) {
        const change = changes[key];
        if (key === "addresses") {
          addresses = change.newValue;
        } else if (key === "balances") {
          balances = new Map(change.newValue);
        } else if (key === "lastUpdateTime") {
          time = timeFormat.format(change.newValue);
        }
      }
    });
  }
  const onOpenSetting = () => {
    if (chrome && chrome.runtime) {
      const url = chrome.runtime.getURL("options/public/index.html");
      chrome.tabs.create({
        url
      });
    }
  };

  const onOpenExplorer = () =>
    chrome.tabs.create({
      url: "https://explorer.nervos.org/"
    });
</script>

<style>
  main {
    display: flex;
    flex-direction: column;
    min-width: 500px;
  }
  .setting-icon {
    height: 1rem;
    width: 1rem;
    align-self: flex-end;
    margin-top: 5px;
    margin-right: 5px;
  }
  .group {
    display: flex;
    flex-direction: column;
    margin-top: 15px;
    font-size: 14px;
  }
  group-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0 15px;
  }
  group-name {
    width: 100px;
    word-break: keep-all;
    white-space: nowrap;
  }
  group-balance {
    display: flex;
  }
  .balance-label {
    padding-right: 5px;
  }
  .note {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    padding: 0 0 15px 0;
  }
  .hr {
    width: 100%;
    height: 1px;
    background-color: #ddd;
    margin: 15px 0;
  }
</style>

<main>
  <svg class="setting-icon" aria-hidden="true" on:click={onOpenSetting}>
    <use xlink:href="#icon-settings" />
  </svg>
  <Wallet />
  <div class="hr" />
  {#if addresses.length}
    <TotalBalance {addresses} {balances} />
  {:else}
    <div class="note" on:click={onOpenExplorer}>
      Visit an address in CKB Explorer and click the subscribe to start
    </div>
  {/if}
  {#each [...groupAddrsMap.keys()].sort((a, b) => groupAddrsMap.get(b).length - groupAddrsMap.get(a).length) as group (group)}
    <section class="group">
      <group-header>
        <group-name>Group: {group}</group-name>
        <group-balance>
          <span class="balance-label">Balance:</span>
          <Balance
            {...formatCKB(getTotalBalance(groupAddrsMap.get(group), balances))} />
        </group-balance>
      </group-header>
      <AddressList addresses={groupAddrsMap.get(group)} {balances} />
    </section>
  {/each}
  {#if time}
    <UpdateTime {time} />
  {/if}
</main>
