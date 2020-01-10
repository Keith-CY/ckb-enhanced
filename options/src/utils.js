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
