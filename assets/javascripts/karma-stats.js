/**
 * Show karma api client
 */
const KarmaStats = {
  url: "https://api.showkarma.xyz/api",

  async fetchUser(userAddress, forumUrl) {
    if (
      !(
        userAddress &&
        typeof userAddress === "string" &&
        forumUrl &&
        typeof forumUrl === "string"
      )
    ) {
      throw new Error(
        `User address and dao name must be typeof string, received ${typeof userAddress}, ${typeof daoName}`
      );
    }

    const userStats = {
      delegatedVotes: 0,
      daoExp: 0,
      snapshotVotingStats: "0%",
      onChainVotingStats: "0%",
    };

    const url = `${KarmaStats.url}/user/${userAddress}`;
    try {
      const { data } = await fetch(url).then((res) => res.json());
      const { delegates } = data;

      if (delegates && Array.isArray(delegates)) {
        const { stats } = delegates.find((delegate) =>
          forumUrl.includes(delegate.daoName.toLowerCase())
        );

        userStats.delegatedVotes = stats?.[0]?.delegatedVotes || 0;
        userStats.snapshotVotingStats =
          (stats?.[0]?.offChainVotesPct || 0) + "%";
        userStats.onChainVotingStats = (stats?.[0]?.onChainVotesPct || 0) + "%";
        userStats.daoExp = stats?.[0]?.karmaScore || 0;
      }
      return userStats;
    } catch (error) {
      return undefined;
    }
  },
};

export default KarmaStats;
