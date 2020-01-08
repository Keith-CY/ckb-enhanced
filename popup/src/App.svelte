<script>
  import TotalBalance from "./components/TotalBalance.svelte";
  import AddressList from "./components/AddressList.svelte";
  import UpdateTime from "./components/UpdateTime.svelte";
  import { timeFormat } from "./utils.js";

  let addresses = [];
  let balances = new Map();
  let time = "";

  if (chrome && chrome.storage) {
    chrome.storage.local.get("addresses", s => {
      if (Array.isArray(s.addresses)) {
        addresses = s.addresses;
      }
    });

    chrome.storage.local.get("balances", s => {
      balances = new Map(s.balances);
    });

    chrome.storage.local.get("lastUpdateTime", s => {
      time = s.lastUpdateTime ? timeFormat.format(s.lastUpdateTime) : "";
    });

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
</script>

<style>
  main {
    display: flex;
    flex-direction: column;
    min-width: 500px;
  }
</style>

<main>
  {#if addresses.length}
    <TotalBalance {addresses} {balances} />
  {/if}
  <AddressList {addresses} {balances} />
  {#if time}
    <UpdateTime {time} />
  {/if}
</main>
