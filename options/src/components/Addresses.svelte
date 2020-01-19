<script>
  import CommandBar from "./CommandBar.svelte";
  import { mapAddrGroupToGroupAddrs } from "../utils.js";
  let DialogOfAddGroup;

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
    if (DialogOfAddGroup && DialogOfAddGroup.open) {
      DialogOfAddGroup.close();
    }
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
      return;
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

  input {
    margin: 0;
  }
  error {
    color: #d0104c;
    font-size: 0.75rem;
    cursor: default;
    user-select: none;
  }
  dialog {
    border: 1px solid #f3f2f1;
    padding: 30px 28px 20px;
    min-width: 340px;
    box-sizing: border-box;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  dialog::backdrop {
    backdrop-filter: blur(1px);
  }
  dialog-header {
    display: block;
    font-size: 1.3125rem;
    font-weight: 100;
    margin-bottom: 15px;
    color: #333;
    user-select: none;
    cursor: default;
  }
  dialog-body {
    display: flex;
    flex-direction: column;
  }
  dialog-footer {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  dialog-footer button {
    margin-left: 10px;
  }

  .address-list {
    max-width: 800px;
    margin: 0 auto;
  }
  .command-bar {
    display: flex;
    align-items: stretch;
    width: 800px;
    height: 100%;
  }
  .command-bar button,
  .command-bar .fake-button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background: transparent !important;
  }
  .command-bar button[disabled] {
    color: #333;
  }
  .command-bar button:hover {
    background: #f3f2f3 !important;
  }
  .command-bar svg {
    height: 1rem;
    width: 1rem;
    fill: #4f726c;
    margin-right: 5px;
  }
  .command-bar button[disabled] svg {
    fill: #eee !important;
  }
  .upload {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .upload label {
    display: block;
    height: 100%;
  }
  .fake-button {
    appearance: button;
    color: #333;
    background: #fff;
    font-size: 0.875rem;
    padding: 0 1rem;
    box-sizing: border-box;
  }
  .fake-button:hover {
    background: #f3f2f3 !important;
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
  group-name {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 45px;
    padding: 0 15px;
    margin-top: 10px;
    font-size: 1rem;
    font-weight: 400px;
  }

  .address {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 45px;
    padding: 0 30px;
    font-family: "Courier New", Courier, monospace;
    font-size: 1rem;
    box-sizing: border-box;
    border-bottom: 1px solid #f3f2f1;
  }

  select {
    margin: 0;
    border-radius: 0;
    border: 1px solid #f3f2f1;
    background-color: #f3f2f1;
    color: #666;
  }
</style>

<CommandBar>
  <div class="command-bar">
    <div class="add-group">
      <button
        on:click={() => {
          DialogOfAddGroup && !DialogOfAddGroup.open && DialogOfAddGroup.showModal();
        }}>
        <svg class="bell-icon" aria-hidden="true">
          <use xlink:href="#icon-plus" />
        </svg>
        Add Group
      </button>
    </div>
    <div class="upload">
      <label for="upload">
        <span class="fake-button">
          <svg class="bell-icon" aria-hidden="true">
            <use xlink:href="#icon-upload" />
          </svg>
          Import Addresses
        </span>
      </label>
      <input
        id="upload"
        class="upload-input"
        type="file"
        bind:files
        on:change={onImport} />
    </div>
    <div class="export">
      <button on:click={onExport} disabled={!addresses.length}>
        <svg class="bell-icon" aria-hidden="true">
          <use xlink:href="#icon-download" />
        </svg>
        Export addresses
      </button>
    </div>
    <div class="save">
      <button on:click={onSave}>
        <svg class="bell-icon" aria-hidden="true">
          <use xlink:href="#icon-save" />
        </svg>
        Save
      </button>
    </div>
  </div>
</CommandBar>
<div class="address-list">
  {#each [...groupAddrsMap.keys()].sort((a, b) => groupAddrsMap.get(b).length - groupAddrsMap.get(a).length) as group (group)}
    <section class="group">
      <group-name>{group}({groupAddrsMap.get(group).length})</group-name>
      {#if !groupAddrsMap.get(group).length}
        <error>Empty group will be removed</error>
      {/if}
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

  <dialog
    bind:this={DialogOfAddGroup}
    on:close={() => {
      newGroupName = '';
    }}>
    <dialog-header>Add new group</dialog-header>
    <dialog-body>
      <input
        type="text"
        bind:value={newGroupName}
        placeholder="new group name" />
      {#if [...groupAddrsMap.keys()].includes(newGroupName)}
        <error>Group name is used</error>
      {/if}
      {#if /\s/.test(newGroupName)}
        <error>Group name should not include whitespaces</error>
      {/if}
      {#if newGroupName === ungroupedLabel}
        <error>{ungroupedLabel} is reserved</error>
      {/if}
    </dialog-body>
    <dialog-footer>
      <button
        primary="true"
        disabled={!newGroupName || newGroupName === ungroupedLabel || [...groupAddrsMap.keys()].includes(newGroupName) || /\s/.test(newGroupName)}
        on:click={onAddGroup}>
        Add
      </button>
      <button
        on:click={() => {
          DialogOfAddGroup && DialogOfAddGroup.close();
        }}>
        Cancel
      </button>
    </dialog-footer>
  </dialog>
</div>
