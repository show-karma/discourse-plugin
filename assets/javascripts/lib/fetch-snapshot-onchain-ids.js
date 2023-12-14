import KarmaStats from "../lib/stats/index";

export async function fetchDaoSnapshotAndOnChainIds(daoName) {
  console.log('fetchDaOIds',daoName)
  const url = `${KarmaStats.url}/dao/${daoName}`;
  const { data } = await fetch(url).then((res) => res.json());
  return (
    data ?? {
      onChainId: null,
      snapshotIds: null,
    }
  );
}
