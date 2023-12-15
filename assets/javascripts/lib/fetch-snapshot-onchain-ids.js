import KarmaStats from "../lib/stats/index";

export async function fetchDaoSnapshotAndOnChainIds(daoName) {
  const url = `${KarmaStats.url}/dao/${daoName}`.toLowerCase();
  const { data } = await fetch(url).then((res) => res.json());
  return (
    data ?? {
      onChainId: null,
      snapshotIds: null,
    }
  );
}
