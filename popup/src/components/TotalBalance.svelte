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
    font-size: 1rem;
    cursor: default;
    font-weight: 400;
  }
  label {
    font-weight: 400;
    user-select: none;
    cursor: default;
  }
</style>

<section class="total-balance">
  <label>Subscribed Balance:</label>
  <Balance {...formatCKB(total)} />
</section>
