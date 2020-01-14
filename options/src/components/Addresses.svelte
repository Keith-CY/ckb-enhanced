<script>
  import { mapAddrGroupToGroupAddrs } from "../utils.js";
  const storageKeys = {
    addresses: "addresses",
    groups: "groups"
  };
  const ungroupedLabel = "ungrouped";

  let files = [];

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
          groups.forEach((g, a) => {
            if (!addresses.includes(a)) {
              groups.delete(a);
            }
          });
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
      return;
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

  const onImport = () => {
    if (files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const addrs = JSON.parse(e.target.result);
          Object.keys(addrs).forEach(addr => {
            if (!addr) return;
            const properties = addrs[addr];
            if (!addresses.includes(addr)) {
              addresses = [...addresses, addr];
            }
            addrGroupMap.set(addr, properties.group || ungroupedLabel);
          });
        } catch (err) {
          window.alert(err.message);
        }
        if (chrome && chrome.storage) {
          chrome.storage.local.set({
            [storageKeys.addresses]: addresses
          });
        }
        onSave();
        const mapping = mapAddrGroupToGroupAddrs(
          addresses,
          addrGroupMap,
          ungroupedLabel
        );
        groupAddrsMap = mapping;
      };
      reader.onerror = err => window.alert(err.message);
      reader.readAsText(files[0]);
    }
    document.querySelector("#upload").value = "";
  };

  const onExport = () => {
    if (!addresses.length) {
      window.alert(`There're no addresses`);
    }
    const plain = {};
    addresses.forEach(addr => {
      const g = addrGroupMap.get(addr) || ungroupedLabel;
      plain[addr] = { group: g };
    });
    const serialized = JSON.stringify(plain);
    const elm = document.createElement("a");
    elm.setAttribute("href", `data:text/plain;charset=utf-8,${serialized}`);
    elm.setAttribute("download", "addresses.json");
    elm.style.display = "none";
    document.body.appendChild(elm);
    elm.click();
    document.body.removeChild(elm);
  };
</script>

<style>
  button {
    margin: 0;
  }
  h3,
  input {
    margin: 0;
  }
  .address {
    font-family: "Courier New", Courier, monospace;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
  }
  .actions {
    display: flex;
    align-items: center;
  }
  .upload {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .upload button {
    margin-left: 5px;
  }
  .fake-button {
    appearance: button;
    color: #333;
    background: #f4f4f4;
    padding: 0.4em;
    box-sizing: border-box;
    border-radius: 2px;
    border: 1px solid #ccc;
  }
  .upload-input {
    opacity: 0;
    position: fixed;
    right: 0;
    bottom: 0;
    width: 0;
    height: 0;
  }
  .export {
    flex: 1;
  }
  .separator {
    display: flex;
    padding: 0 5px;
    justify-content: center;
    align-items: center;
  }
</style>

<div class="actions">
  <h3>Operations</h3>
  <span class="separator">:</span>
  <div class="add-group">
    <input type="text" bind:value={newGroupName} />
    <button
      disabled={!newGroupName || newGroupName === ungroupedLabel || [...groupAddrsMap].includes(newGroupName)}
      on:click={onAddGroup}>
      Add group
    </button>
  </div>
  <span class="separator">|</span>
  <div class="upload">
    <label for="upload">
      {#if files[0]}
        <span>{`selected file: ${files[0].name}`}</span>
      {:else}
        <span class="fake-button">Select addresses to import</span>
      {/if}
    </label>
    <input id="upload" class="upload-input" type="file" bind:files />
    {#if files.length}
      <button on:click={onImport}>Import</button>
    {/if}
  </div>
  <span class="separator">|</span>
  <div class="export">
    <button on:click={onExport}>Export addresses</button>
  </div>
  <span class="separator">|</span>
  <div class="save">
    <button on:click={onSave}>Save</button>
  </div>
</div>
<div>
  {#each [...groupAddrsMap.keys()].sort((a, b) => groupAddrsMap.get(b).length - groupAddrsMap.get(a).length) as group (group)}
    <section class="group">
      <h2>{group}({groupAddrsMap.get(group).length})</h2>
      {#each groupAddrsMap.get(group) as address, i (address)}
        <section class="address">
          <span>{i + 1}. {address}</span>
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
</div>
