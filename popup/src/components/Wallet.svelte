<script>
  import { storageKey, formatCKB } from "../utils.js";
  import Balance from "./Balance.svelte";
  let xpub = "";
  let balance = "0";

  chrome.storage.onChanged.addListener(_changes => {
    if (_changes[storageKey.xpub]) {
      xpub = _changes[storageKey.xpub].newValue;
    }
    if (_changes[storageKey.walletTotalBalance]) {
      balance = _changes[storageKey.walletTotalBalance].newValue;
    }
  });

  chrome.storage.local.get(
    [storageKey.xpub, storageKey.walletTotalBalance],
    _local => {
      if (
        !_local ||
        !_local[storageKey.xpub] ||
        !_local[storageKey.walletTotalBalance]
      ) {
        return;
      }

      xpub = _local[storageKey.xpub];
      balance = _local[storageKey.walletTotalBalance];
    }
  );
</script>

<style>
  .wallet {
    padding: 0 15px;
  }
  .wallet-label {
    font-size: 1rem;
  }
  .balance {
    display: flex;
    justify-content: space-between;
  }
  .prmopt {
    color: #666;
    cursor: default;
  }
</style>

<div class="wallet">
  {#if !xpub}
    <span class="prmopt">Please import a wallet in settings</span>
  {:else}
    <div class="balance">
      <span class="wallet-label">Wallet Balance:</span>
      <Balance {...formatCKB(balance)} />
    </div>
  {/if}
</div>
