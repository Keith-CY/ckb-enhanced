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
    justify-content: center;
    align-items: center;
    height: 2.5rem;
    width: 2.5rem;
    background: transparent;
    border: none;
    border-radius: 50%;
    margin: 0;
    padding: 0;
  }
  .bell-icon {
    height: 1rem;
    width: 1rem;
    fill: #fff;
  }
</style>

<button on:click={onNotificationChange}>
  {#if isNotificationOn}
    <svg class="bell-icon" aria-hidden="true" title="Notification is On">
      <use xlink:href="#icon-bell" />
    </svg>
  {:else}
    <svg class="bell-icon" aria-hidden="true" title="Notification is Off">
      <use xlink:href="#icon-bell-off" />
    </svg>
  {/if}
</button>
