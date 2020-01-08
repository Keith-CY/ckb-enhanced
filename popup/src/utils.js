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
