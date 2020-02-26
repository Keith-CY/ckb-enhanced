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

export const getTotalBalance = (addresses, balances) => {
  return addresses
    .reduce((t, addr) => t + BigInt(balances.get(addr) || "0"), 0n)
    .toString();
}

export const timeFormat = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false
});

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
