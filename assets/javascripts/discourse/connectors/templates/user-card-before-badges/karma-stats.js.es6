/* eslint-disable */

/**
 * Show karma api client
 */
const KarmStats = {
  url: "https://api.showkarma.xyz/api",
  daoName: undefined,

  async fetchUser(userAddress, daoName) {
    if (
      !(
        userAddress &&
        typeof userAddress === "string" &&
        daoName &&
        typeof daoName === "string"
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

    const url = `${KarmStats.url}/user/${userAddress}`;
    try {
      const { data } = await fetch(url).then((res) => res.json());
      const { delegates } = data;
      if (delegates && Array.isArray(delegates)) {
        const { stats } = delegates.find(
          (delegate) => delegate.daoName.toLowerCase() === daoName.toLowerCase()
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

  getDaoName () {
    let daoName = this.daoName;
    if(!daoName) {
      const input = document.getElementById('__dao-name');
      if(!input) return undefined;
      daoName = input.value;
      KarmStats.daoName = daoName;
    }
    return daoName;
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
    const el = document.getElementById('__dao-username')
    return el?.value.trim();
  },

  async start() {
    const user = KarmStats.getUsername();
    const daoName = KarmStats.getDaoName();
    console.debug('user', user, 'daoname', daoName)
    if (user && daoName) {
      const stats = await KarmStats.fetchUser(user, daoName);
      if (stats) {
        const el = document.getElementById("__karma-stats");
        if (el) el.style.display = "initial";
        const {
          delegatedVotes,
          daoExp,
          snapshotVotingStats,
          onChainVotingStats,
        } = KarmStats.getSlots();
        delegatedVotes.innerHTML = stats.delegatedVotes;
        daoExp.innerHTML = stats.daoExp;
        snapshotVotingStats.innerHTML = stats.snapshotVotingStats;
        onChainVotingStats.innerHTML = stats.onChainVotingStats;
      }
    } else setTimeout(KarmStats.start, 250);
  },
};

$(() => {
  const elTrg = $(".trigger-user-card");
  elTrg.on("click", KarmStats.start);
});

export default {};
