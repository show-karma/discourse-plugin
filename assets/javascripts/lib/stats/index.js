import { set } from "@ember/object";
import { shortenNumber } from "../shorten-number";
import { htmlSafe } from "@ember/template";

/**
 * Karma stats fetcher
 */
const KarmaStats = {
  url: "http://192.168.123.101:3001/api",
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

        userStats.delegatedVotes = shortenNumber(delegates.delegatedVotes || 0);
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

  toggleErrorMessage(hide = true, wrapperId) {
    const el = $(`${wrapperId} .__has-error`);
    if (el.length) {
      hide
        ? el.hide
        : (el.show(),
          this.toggleLoading(true, wrapperId),
          this.toggleScore(true, wrapperId));
    }
  },

  toggleLoading(hide = true, wrapperId) {
    const el = $(`${wrapperId} .__loading`);
    if (el.length) {
      hide
        ? el.hide()
        : (el.show(),
          this.toggleErrorMessage(true, wrapperId),
          this.toggleScore(true, wrapperId));
    }
  },

  toggleScore(hide = true, wrapperId) {
    const el = $(`${wrapperId} .__has-score`);
    hide
      ? el.hide()
      : (el.show(),
        this.toggleErrorMessage(true, wrapperId),
        this.toggleLoading(true, wrapperId));
  },

  getUsername(wrapperId) {
    const el = $(`${wrapperId} #__dao-username`);
    let username = el?.val()?.trim();
    // TODO: find another way to get the user in the page
    if (!username) {
      const url = location.pathname.split("/");
      username = url[2];
    }
    return username;
  },

  getSlots(wrapperId) {
    return {
      delegatedVotes: $(`${wrapperId} #__delegated-votes`),
      daoExp: $(`${wrapperId} #__dao-exp`),
      snapshotVotingStats: $(`${wrapperId} #__snapshot-voting-stats`),
      onChainVotingStats: $(`${wrapperId} #__on-chain-voting-stats`),
      healthScore: $(`${wrapperId} #__health-score`),
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
          href="https://www.showkarma.xyz/dao/link/forum?dao=${daoName}"
        >
            Link Wallet
        </a>`
      )
    );
  },

  async start(totalTries = 0, ctx, wrapperId = ".__karma-stats") {
    const { SiteSettings } = ctx;
    const {
      User_not_found_message: errMessage,
      DAO_name: daoName,
    } = SiteSettings;

    const user = this.getUsername(wrapperId);

    if (user && daoName) {
      if (errMessage && errMessage?.includes?.("[[KarmaDaoUrl]]")) {
        set(
          ctx.SiteSettings,
          "User_not_found_message",
          this.getErrorMessage(errMessage, daoName)
        );
      }

      this.toggleLoading(false, wrapperId);
      const stats = await KarmaStats.fetchUser(user, daoName);
      if (stats) {
        const wrapper = $(`${wrapperId} .__wrapper`)[0];

        if (wrapper) {
          wrapper.style.display = "initial";
        }

        const {
          delegatedVotes,
          daoExp,
          snapshotVotingStats,
          onChainVotingStats,
          healthScore,
        } = KarmaStats.getSlots(wrapperId);

        if (delegatedVotes) {
          delegatedVotes.html(stats.delegatedVotes?.toLocaleString("en-US"));
        }

        if (daoExp) {
          daoExp.html(stats.daoExp?.toLocaleString("en-US"));
        }

        if (healthScore) {
          healthScore.html(
            stats.gitcoinHealthScore?.toLocaleString("en-US") || 0
          );
        }

        if (snapshotVotingStats) {
          snapshotVotingStats.html(stats.snapshotVotingStats);
        }

        if (onChainVotingStats) {
          onChainVotingStats.html(stats.onChainVotingStats);
        }

        this.toggleScore(false, wrapperId);
      } else {
        this.toggleErrorMessage(false, wrapperId);
      }
    } else if (totalTries < 30) {
      setTimeout(() => KarmaStats.start(++totalTries, ctx), 250);
    }
    this.profile.username = user;
    return this.profile;
  },
};

export default KarmaStats;
