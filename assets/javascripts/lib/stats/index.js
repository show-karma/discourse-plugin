import { set } from "@ember/object";
import { shortenNumber } from "../shorten-number";
import { htmlSafe } from "@ember/template";
import { karmaApiUrl } from "../consts";
import { Mixpanel } from "../mixpanel";
/**
 * Karma stats fetcher
 */
const KarmaStats = {
  url: karmaApiUrl,
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

    const url = `${KarmaStats.url}/forum-user/${userAddress}/${daoName}`.toLowerCase();
    try {
      const { data } = await fetch(url).then((res) => res.json());
      this.profile = data ?? {};
      const { delegates } = data;

      if (delegates) {
        const { stats } = delegates;
        userStats.delegatedVotes = `
        <a href="https://karmahq.xyz/dao/${daoName.toLowerCase()}/delegators/${data.ensName || data.address
          }" target="_blank">${shortenNumber(delegates.delegatedVotes || 0)}</a>`;

        userStats.snapshotVotingStats =
          (stats?.[0]?.offChainVotesPct || 0) + "%";
        userStats.onChainVotingStats = (stats?.[0]?.onChainVotesPct || 0) + "%";
        userStats.daoExp = stats?.[0]?.karmaScore || 0;
        userStats.gitcoinHealthScore = stats?.[0]?.gitcoinHealthScore || 0;
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
        ? el.hide()
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
      gitcoinHealthScore: $(`${wrapperId} #__health-score`),
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
          href="https://www.karmahq.xyz/dao/link/forum?dao=${daoName?.toLowerCase()}"
        >
            Link Wallet
        </a>`
      )
    );
  },

  async start(totalTries = 0, ctx, wrapperId = ".__karma-stats", username = null) {
    const { SiteSettings } = ctx;
    const daoName = this.daoName = window.selectedDao;

    const { User_not_found_message: errMessage, rawErrorStr } =
      SiteSettings;

    if (!rawErrorStr && errMessage) {
      set(
        ctx.SiteSettings,
        "rawErrorStr",
        errMessage
      );
    }

    const user = username || this.getUsername(wrapperId);

    if (user && daoName) {
      if (rawErrorStr && (rawErrorStr?.includes?.("[[KarmaDaoUrl]]"))) {
        set(
          ctx.SiteSettings,
          "User_not_found_message",
          this.getErrorMessage(rawErrorStr, daoName)
        );
      }

      this.toggleLoading(false, wrapperId);
      const stats = await KarmaStats.fetchUser(user, daoName);


      if (stats) {
        const wrapper = $(`${wrapperId} .__wrapper`)[0];

        if (wrapper) {
          wrapper.style.display = "initial";
        }

        const slots = KarmaStats.getSlots(wrapperId);

        Object.keys(slots).map((key) => {
          const isNum = typeof slots[key] === "number";
          slots[key].html(
            isNum ? stats[key]?.toLocaleString("en-US") : stats[key]
          );
        });

        this.toggleScore(false, wrapperId);
      } else if (!(stats && user)) {
        this.toggleErrorMessage(false, wrapperId);
      }
      Mixpanel.reportEvent({
        event: "profileStats",
        properties: {
          address: this.profile.address,
        },
      });
    } else if (totalTries < 30) {
      setTimeout(() => KarmaStats.start(++totalTries, ctx), 250);
    }

    this.profile.username = user;
    return this.profile;
  },
};

export default KarmaStats;
