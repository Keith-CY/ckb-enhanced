<script>
  export let int = "0";
  export let deci = "";
</script>

<style>
  .balance {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    font-size: 14px;
    font-family: monospace;
  }
  .int {
    font-weight: 500;
    color: gray;
  }
  .deci {
    font-size: 12px;
    color: gray;
  }
  .unit {
    margin-left: 3px;
  }
</style>

<div class="balance">
  <span class="int">{int || '0'}</span>
  {#if deci}
    <span class="deci">.{deci}</span>
  {/if}
  <span class="unit">CKB</span>
</div>
