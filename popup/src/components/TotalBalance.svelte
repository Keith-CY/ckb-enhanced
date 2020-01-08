<script>
  import Balance from "./Balance.svelte";
  import { formatCKB, getTotalBalance } from "../utils.js";
  export let addresses = [];
  export let balances = new Map();
  $: total = getTotalBalance(addresses, balances);
</script>

<style>
  .total-balance {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    margin-top: 15px;
    font-size: 16px;
    cursor: default;
  }
  .label {
    font-weight: bold;
  }
</style>

<section class="total-balance">
  <span class="label">Total balance:</span>
  <Balance {...formatCKB(total)} />
</section>
