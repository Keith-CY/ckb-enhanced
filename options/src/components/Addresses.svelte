<script>
  import { mapAddrGroupToGroupAddrs } from "../utils.js";
  const storageKeys = {
    addresses: "addresses",
    groups: "groups"
  };
  const ungroupedLabel = "ungrouped";
  let newGroupName = "";
  let addresses = [];

  let addrGroupMap = new Map();
  let groupAddrsMap = new Map();

  if (chrome && chrome.storage) {
    chrome.storage.local.get(
      [storageKeys.addresses, storageKeys.groups],
      result => {
        let groups = new Map();
        if (Array.isArray(result[storageKeys.addresses])) {
          addresses = result[storageKeys.addresses];
        }
        if (Array.isArray(result[storageKeys.groups])) {
          groups = new Map(result[storageKeys.groups]);
          addrGroupMap = groups;
        }
        const mapping = mapAddrGroupToGroupAddrs(
          addresses,
          groups,
          ungroupedLabel
        );
        groupAddrsMap = mapping;
      }
    );
    chrome.storage.onChanged.addListener(changes => {
      const groupsChange = changes[storageKeys.groups];
      if (groupsChange) {
        const groups = new Map(groupsChange.newValue);
        addrGroupMap = groups;
        const mapping = mapAddrGroupToGroupAddrs(
          addresses,
          groups,
          ungroupedLabel
        );
        groupAddrsMap = mapping;
      }
    });
  }

  const onAddGroup = () => {
    if (
      !newGroupName ||
      newGroupName === ungroupedLabel ||
      [...groupAddrsMap.keys()].includes(newGroupName)
    )
      return;
    if (/\s/.test(newGroupName)) {
      window.alert("Group name should not include whitespaces");
    }
    groupAddrsMap.set(newGroupName, []);
    newGroupName = "";
  };

  const onSave = () => {
    if (chrome && chrome.storage) {
      chrome.storage.local.set({
        [storageKeys.groups]: [...addrGroupMap.entries()]
      });
    }
  };
</script>

<style>
  .address {
    font-family: "Courier New", Courier, monospace;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
  }
</style>

<div>
  {#each [...groupAddrsMap.keys()].sort((a, b) => groupAddrsMap.get(b).length - groupAddrsMap.get(a).length) as group (group)}
    <section class="group">
      <h2>{group}({groupAddrsMap.get(group).length})</h2>
      {#each groupAddrsMap.get(group) as address, i (address)}
        <section class="address">
          <span>{i + 1}.</span>
          <span>{address}</span>
          <select
            value={group}
            on:change={e => {
              let newGroup = e.target.value;
              addrGroupMap.set(address, newGroup);
            }}>
            {#each [...groupAddrsMap.keys()] as option (option)}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </section>
      {/each}
    </section>
  {/each}
  <div>
    <input type="text" bind:value={newGroupName} />
    <button
      disabled={!newGroupName || newGroupName === ungroupedLabel || [...groupAddrsMap].includes(newGroupName)}
      on:click={onAddGroup}>
      Add group
    </button>
  </div>
</div>
<div class="actions">
  <button on:click={onSave}>Save</button>
</div>
