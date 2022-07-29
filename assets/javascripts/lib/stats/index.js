import { set } from "@ember/object";
import { shortenNumber } from "../shorten-number";
import { htmlSafe } from "@ember/template";

/**
 * Karma stats fetcher
 */
const KarmaStats = {
  url: "https://api.showkarma.xyz/api",
  daoName: undefined,
  profile: {},

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
      this.profile = data;
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

  getUsername() {
    const el = document.getElementById("__dao-username");
    return el?.value.trim();
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

  getErrorMessage(msg, daoName) {
    return htmlSafe(
      msg.replace(
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
  },

  async start(totalTries = 0, ctx) {
    const { SiteSettings } = ctx;
    const { User_not_found_message: errMessage } = SiteSettings;
    const user = this.getUsername();
    const daoName = SiteSettings.DAO_name;

    if (user && daoName) {
      if (errMessage && errMessage?.includes?.("[[KarmaDaoUrl]]")) {
        set(
          ctx.SiteSettings,
          "User_not_found_message",
          this.getErrorMessage(errMessage, daoName)
        );
      }
      this.toggleLoading(false);
      const stats = await KarmaStats.fetchUser(user, daoName);
      if (stats) {
        const wrapper = document.getElementsByClassName("__wrapper")[0];

        if (wrapper) {
          wrapper.style.display = "initial";
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
    return this.profile;
  },
};

export default KarmaStats;
