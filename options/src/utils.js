export const storageKey = {
  receives: "receives",
  changes: "changes",
  xpub: "xpub",
  walletBalances: 'wallet-balances',
  walletTotalBalance: 'wallet-total-balance',
};

export const mapAddrGroupToGroupAddrs = (addresses, addrGroupMap, ungroupedLabel) => {
  const mapping = new Map();
  addresses.forEach(addr => {
    const g = addrGroupMap.get(addr);
    if (g) {
      mapping.set(g, [...(mapping.get(g) || []), addr]);
    } else {
      mapping.set(ungroupedLabel, [
        ...(mapping.get(ungroupedLabel) || []),
        addr
      ]);
    }
  });
  return mapping;
};

export const loadFromStorage = (keys = []) => {
  return new Promise((resolve, reject) => {
    const result = new Map()
    chrome.storage.local.get(keys, _caches => {
      if (!_caches) {
        resolve(result)
      }
      keys.forEach(key => {
        if (_caches[key]) {
          result.set(key, _caches[key])
        }
      })
      resolve(result)
    })
  })
}

export const formatCKB = ckb => {
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
  return {
    int,
    deci
  };
};
