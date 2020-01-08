<script>
  import AddressList from "./components/AddressList.svelte";
  let addresses = [];
  let balances = new Map();
  if (chrome && chrome.storage) {
    chrome.storage.local.get("addresses", s => {
      if (Array.isArray(s.addresses)) {
        addresses = s.addresses;
      }
    });

    chrome.storage.local.get("balances", s => {
      balances = new Map(s.balances);
    });

    chrome.storage.onChanged.addListener(changes => {
      for (let key in changes) {
        const change = changes[key];
        if (key === "addresses") {
          addresses = change.newValue;
        } else if (key === "balances") {
          balances = new Map(change.newValue);
        }
      }
    });
  }
</script>

<style>
  main {
    display: flex;
    min-width: 500px;
  }
</style>

<main>
  <AddressList {addresses} {balances} />
</main>
