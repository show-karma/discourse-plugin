/* eslint-disable */
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

  getSlots() {
    return {
      delegatedVotes: document.getElementById("delegated-votes"),
      daoExp: document.getElementById("dao-exp"),
      snapshotVotingStats: document.getElementById("snapshot-voting-stats"),
      onChainVotingStats: document.getElementById("on-chain-voting-stats"),
    };
  },

  getUsername() {
    const el = document.getElementsByClassName("name-username-wrapper")[0];
    return el?.innerHTML.trim();
  },

  async init() {
    const user = KarmaStats.getUsername();
    if (user) {
      const forumUrl = window.location.hostname;
      const stats = await KarmaStats.fetchUser(user, forumUrl);
      if (stats) {
        const el = document.getElementById("__karma-stats");
        if (el) el.style.display = "initial";
        const {
          delegatedVotes,
          daoExp,
          snapshotVotingStats,
          onChainVotingStats,
        } = KarmaStats.getSlots();
        delegatedVotes.innerHTML = stats.delegatedVotes;
        daoExp.innerHTML = stats.daoExp;
        snapshotVotingStats.innerHTML = stats.snapshotVotingStats;
        onChainVotingStats.innerHTML = stats.onChainVotingStats;
      }
    } else setTimeout(KarmaStats.init, 250);
  },
};

$(() => {
  const elTrg = $(".trigger-user-card");
  elTrg.on("click", KarmaStats.init);
});

export default KarmaStats;
