chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo && changeInfo.status === 'complete' && tab.url.startsWith('https://explorer.nervos.org/address/')) {
    chrome.tabs.sendMessage(tabId, {
      type: "AppendAddressBtn"
    })
  }
})

const formatCKB = ckb => {
  const int = (BigInt(ckb) / BigInt(10 ** 8))
    .toString()
    .split("")
    .reverse()
    .join("")
    .match(/\d{1,3}/g)
    .join(",")
    .split("")
    .reverse()
    .join("");
  const deci = ckb.slice(-8).replace(/0*$/, "");
  return `${int}${deci ? `.${deci}` : ""} CKB`;
};

chrome.storage.onChanged.addListener(async changes => {
  const enabledNotification = await new Promise((resolve) => {
    chrome.storage.local.get('notification', result => {
      return resolve(result && result.notification ? true : false)
    })
  })
  if (!enabledNotification || !changes.balances) return
  const {
    newValue,
    oldValue
  } = changes.balances
  const balances = newValue.map(([addr, newBalance], idx) => [addr, oldValue[idx][1], newBalance])
  const changedBalances = balances.filter(b => b[1] !== b[2])
  if (!changedBalances.length) return
  const iconUrl = chrome.runtime.getURL("images/ckb-enhanced.png");
  const message = changedBalances.map(
    ([addr, oldBalance, newBalance]) => `${addr.slice(0, 6)}...${addr.slice(-6)} changed from ${formatCKB(oldBalance || '0')} to ${formatCKB(newBalance || '0')}`
  ).join('\n')
  chrome.notifications.create(changedBalances[0][0], {
    type: "basic",
    title: 'Balance changed',
    message,
    iconUrl,
    buttons: [],
    silent: true,
  });
});

chrome.notifications.onClicked.addListener(addr => {
  chrome.tabs.create({
    url: `https://explorer.nervos.org/address/${addr}`
  })
})
