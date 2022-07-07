/* eslint-disable no-restricted-globals */
/**
 * Karma stats fetcher
 */
const KarmaStats = {
  url: "https://stageapi.showkarma.xyz/api",
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
      gitcoinHealthScore: 0
    };

    const url = `${KarmaStats.url}/user/${userAddress}/${daoName}`;
    try {
      const { data } = await fetch(url).then((res) => res.json());
      const { delegates } = data;
      if (delegates) {
        const { stats } = delegates;

        userStats.delegatedVotes = stats?.[0]?.delegatedVotes || 0;
        userStats.snapshotVotingStats =
          (stats?.[0]?.offChainVotesPct || 0) + "%";
        userStats.onChainVotingStats = (stats?.[0]?.onChainVotesPct || 0) + "%";
        userStats.daoExp = stats?.[0]?.karmaScore || 0;
        userStats.gitcoinHealthScore = stats?.[0].gitcoinHealthScore || 0
      }
      return userStats;
    } catch (error) {
      return undefined;
    }
  },

  getDaoName() {
    let daoName = KarmaStats.daoName;
    if (!daoName) {
      const input = document.getElementById("__dao-name");
      if (!input) {
        return undefined;
      }
      daoName = input.value;
      KarmaStats.daoName = daoName;
    }
    return daoName;
  },

  getSlots() {
    return {
      delegatedVotes: document.getElementById("__delegated-votes"),
      daoExp: document.getElementById("__dao-exp"),
      snapshotVotingStats: document.getElementById("__snapshot-voting-stats"),
      onChainVotingStats: document.getElementById("__on-chain-voting-stats"),
      healthScore: document.getElementById("__health-score"),
    };
  },

  getUsername() {
    const el = document.getElementById("__dao-username");
    return el?.value.trim();
  },

  async start(totalTries = 0) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const user = KarmaStats.getUsername();
    const daoName = KarmaStats.getDaoName();

    if (user && daoName) {
      const stats = await KarmaStats.fetchUser(user, daoName);
      if (stats) {
        const el = document.getElementsByClassName("__wrapper")[0];
        if (el) {
          el.style.display = "initial";
        }
        const {
          delegatedVotes,
          daoExp,
          snapshotVotingStats,
          onChainVotingStats,
          healthScore,
        } = KarmaStats.getSlots();

        if (delegatedVotes) {
          delegatedVotes.innerHTML = stats.delegatedVotes?.toLocaleString(
            "en-US"
          );
        }

        if (daoExp) {
          daoExp.innerHTML = stats.daoExp?.toLocaleString("en-US");
        }

        if (healthScore) {
          healthScore.innerHTML =
            stats.gitcoinHealthScore?.toLocaleString("en-US") || 0;
        }

        if (snapshotVotingStats) {
          snapshotVotingStats.innerHTML = stats.snapshotVotingStats;
        }

        if (onChainVotingStats) {
          onChainVotingStats.innerHTML = stats.onChainVotingStats;
        }
      }
    } else if (totalTries < 30) {
      setTimeout(() => KarmaStats.start(++totalTries), 250);
    }
  },
};

export default {
  name: "alert",
  initialize() {
    $(() => {
      let showing = false;
      const karmaStats = () => {
        const elTrg = $(".__karma-stats");
        if (!showing && elTrg.length) {
          KarmaStats.start(0);
        }
        showing = !!elTrg.length;
      };

      setInterval(karmaStats, 100);
    });
  },
};
