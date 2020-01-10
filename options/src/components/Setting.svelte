<script>
  const storageKeys = {
    notification: "notification"
  };

  let isNotificationOn = false;
  if (chrome && chrome.storage) {
    chrome.storage.local.get(storageKeys.notification, result => {
      isNotificationOn = result && result[storageKeys.notification] === true;
    });
  }
  const onNotificationChange = e => {
    isNotificationOn = !isNotificationOn;
    if (chrome && chrome.storage) {
      chrome.storage.local.set({
        [storageKeys.notification]: isNotificationOn
      });
    }
  };
</script>

<style>
  button {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 2rem;
    width: 200px;
  }
  .bell-icon {
    height: 1rem;
    width: 1rem;
    margin-right: 5px;
  }
</style>

<button on:click={onNotificationChange}>
  {#if isNotificationOn}
    <svg class="bell-icon" aria-hidden="true">
      <use xlink:href="#icon-bell" />
    </svg>
    Notification on, turn off
  {:else}
    <svg class="bell-icon" aria-hidden="true">
      <use xlink:href="#icon-bell-off" />
    </svg>
    Notification off, turn on
  {/if}
</button>
