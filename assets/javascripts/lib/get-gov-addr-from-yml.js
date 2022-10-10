export async function getGovAddrFromYml(daoName) {
  const yml = await fetch(
    "https://raw.githubusercontent.com/show-karma/subgraph-on-chain-voting/main/subgraph.yaml"
  ).then((r) => r.text());

  const parts = yml.split(/\n/gim);
  const tokens = [];

  parts.forEach((part) => {
    const curIdx = tokens.length - 1;
    if (part.match("- kind:")) {
      tokens.push({});
    } else if (part.match("address:")) {
      const address = part.split("address: ")[1].replace(/\W/gi, "");
      tokens[curIdx].address = address;
    } else if (part.match("abi:")) {
      tokens[curIdx].daoName = part
        .split("abi: ")[1]
        ?.replace(/(((govern(or|ance))|(token))(.?)+)$/gi, "")
        .toLowerCase();
    }
  });
  return daoName ? tokens.find((t) => t.daoName === daoName)?.address : tokens;
}
