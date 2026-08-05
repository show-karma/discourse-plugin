import Component from "@ember/component";
import { action, computed, set } from "@ember/object";
import { htmlSafe } from "@ember/template";
import getProposalLink from "../../lib/get-proposal-link";
import { Mixpanel } from "../../lib/mixpanel";
import {
  getResults,
  getVoteBreakdownByProposal,
} from "../../lib/vote-breakdown";
import voting from "../../lib/snapshot/index";

export default Component.extend({
  proposal: {},

  tokenContract: "",

  link: "",

  pointer: "",

  loading: false,

  text: computed(function () {
    return this.getText(this.proposal);
  }),

  safeTitle: computed("proposal.title", function () {
    return htmlSafe(this.proposal.title);
  }),

  // Shutter-shielded proposals have encrypted vote choices until the
  // vote closes, so there is no breakdown to display while active
  shielded: computed(function () {
    return (
      this.proposal.privacy === "shutter" && this.proposal.state === "active"
    );
  }),

  showRedirectButton: computed(function () {
    return (
      (this.proposal.type === "Off-chain" &&
        this.siteSettings.See_on_Snapshot_button) ||
      (this.proposal.type === "On-chain" &&
        this.siteSettings.See_on_Tally_button)
    );
  }),

  /**
   * @param {import("karma-score").OffChainProposal} proposal
   */
  getText(proposal) {
    return proposal.type === "Off-chain" &&
      moment(proposal.voteStarts, "MMM D, YYYY").isAfter(moment())
      ? `Voting begins ${proposal.voteStarts}`
      : proposal.endsAt !== null
      ? (moment(proposal.endsAt, "MMM D, YYYY").isBefore(moment()) ? "Ended " : "Ends: ") +
        proposal.endsAt
      : "";
  },

  @action
  redirect() {
    Mixpanel.reportEvent({
      event: "bannerClick",
      properties: {
        target: this.proposal.type === "Off-chain" ? "Snapshot" : "Tally",
        url: this.link,
        handler: this.currentUser?.username,
      },
    });
    window.open(this.link, "_blank");
  },

  getLink() {
    const nLink = getProposalLink(
      this.proposal,
      this.tokenContract,
      this.siteSettings
    );

    set(this, "link", nLink);
  },

  async getBreakdown() {
    if (this.proposal.type !== "Off-chain") {
      return;
    }
    // Skip vote types we can't tally (e.g. copeland) and shielded votes,
    // whose choices are encrypted until the proposal closes
    if (this.shielded || !voting[this.proposal.proposalType]) {
      return;
    }
    set(this, "loading", true);
    try {
      const proposal = { ...this.proposal };
      const withScores = getVoteBreakdownByProposal(
        await getResults(proposal.space, proposal, proposal.votes)
      );

      set(this, "proposal", withScores);
    } catch (error) {
      // leave the proposal without a breakdown rather than
      // wedging the banner on the loading spinner
    } finally {
      set(this, "loading", false);
    }
  },

  init() {
    this._super(...arguments);
    this.getLink();
    this.getBreakdown();
  },
});
