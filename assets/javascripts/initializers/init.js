import { set } from "@ember/object";
import { shortenNumber } from "../shorten-number";

/**
 * Karma stats fetcher
 */
const KarmaStats = {
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
      gitcoinHealthScore: 0,
    };

    const url = `${KarmaStats.url}/user/${userAddress}/${daoName}`;
    try {
      const { data } = await fetch(url).then((res) => res.json());
      const { delegates } = data;
      if (delegates) {
        const { stats } = delegates;

        userStats.delegatedVotes = shortenNumber(
          stats?.[0]?.delegatedVotes || 0
        );
        userStats.snapshotVotingStats =
          (stats?.[0]?.offChainVotesPct || 0) + "%";
        userStats.onChainVotingStats = (stats?.[0]?.onChainVotesPct || 0) + "%";
        userStats.daoExp = stats?.[0]?.karmaScore || 0;
        userStats.gitcoinHealthScore = stats?.[0].gitcoinHealthScore || 0;
      }
      return userStats;
    } catch (error) {
      return undefined;
    }
  },

  toggleErrorMessage(hide = true) {
    const el = $(".__has-error");
    if (el.length) {
      hide ? el.hide : (el.show(), this.toggleLoading(), this.toggleScore());
    }
  },

  toggleLoading(hide = true) {
    const el = $(".__loading");
    if (el.length) {
      hide
        ? el.hide()
        : (el.show(), this.toggleErrorMessage(), this.toggleScore());
    }
  },

  toggleScore(hide = true) {
    const el = $(".__has-score");
    hide
      ? el.hide()
      : (el.show(), this.toggleErrorMessage(), this.toggleLoading());
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

  async start(totalTries = 0, ctx) {
    const { User, SiteSettings } = ctx;
    const { User_not_found_message: errMessage } = SiteSettings;
    const user = User.current().username;
    const daoName = SiteSettings.DAO_name;

    if (user && daoName) {
      if (errMessage && errMessage.includes("[[KarmaDaoUrl]]")) {
        set(
          ctx.SiteSettings,
          "User_not_found_message",
          errMessage.replace(
            "[[KarmaDaoUrl]]",
            `
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://showkarma.xyz/dao/delegates/${daoName}"
            >
                ${daoName.toUpperCase()} leaderboard
            </a>`
          )
        );
        this.toggleLoading(false);
      } else {
        this.toggleScore(false);
      }
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
          delegatedVotes.innerHTML =
            stats.delegatedVotes?.toLocaleString("en-US");
        }

        if (daoExp) {
          set(ctx.Karma, "score", stats.daoExp);
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

        this.toggleScore(false);
      } else {
        this.toggleErrorMessage(false);
      }
    } else if (totalTries < 30) {
      setTimeout(() => KarmaStats.start(++totalTries), 250);
    }
  },
};

export default {
  name: "alert",
  initialize(_, ctx) {
    set(ctx, 'Karma', {});
    $(() => {
      let showing = false;
      const karmaStats = () => {
        const elTrg = $(".__karma-stats");
        if (!showing && elTrg.length) {
          KarmaStats.start(0, ctx);
        }
        showing = !!elTrg.length;
      };

      setInterval(karmaStats, 100);
    });
  },
};
