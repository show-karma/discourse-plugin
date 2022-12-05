import KarmaStats from "./stats";

export async function fetchDaoSnapshotAndOnChainIds(daoName) {
  const url = `${KarmaStats.url}/dao/${daoName}`;
  const { data } = await fetch(url).then((res) => res.json());
  return (
    data ?? {
      onChainId: null,
      snapshotIds: null,
    }
  );
}
