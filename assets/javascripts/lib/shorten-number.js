export function shortenNumber(number, decimals = 0) {
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const base = si.reverse().find((o) => +number >= o.value) || si[0];

  return (
    (+number / base.value).toFixed(decimals).replace(rx, "$1") + base.symbol
  );
}
