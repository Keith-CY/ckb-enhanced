<script>
  export let time = "";
</script>

<style>
  .time {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-size: 12px;
    color: #999;
    padding: 0 15px 15px 0;
    cursor: default;
    user-select: none;
  }
  .time span:first-of-type {
    padding-right: 5px;
  }
</style>

<section class="time">
  <span>Updated at:</span>
  <span>{time}</span>
</section>
