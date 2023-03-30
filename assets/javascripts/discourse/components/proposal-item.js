import Component from "@ember/component";
import { action, computed, set } from "@ember/object";
import getProposalLink from "../../lib/get-proposal-link";
import { Mixpanel } from "../../lib/mixpanel";
import {
  getResults,
  getVoteBreakdownByProposal,
} from "../../lib/vote-breakdown";

export default Component.extend({
  proposal: {},

  tokenContract: "",

  link: "",

  pointer: "",

  loading: false,

  text: computed(function () {
    return this.getText(this.proposal);
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
      moment(proposal.voteStarts).isAfter(moment())
      ? `Voting begins ${proposal.voteStarts}`
      : proposal.endsAt !== null
      ? (moment(proposal.endsAt).isBefore(moment()) ? "Ended " : "Ends: ") +
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
    const nLink = getProposalLink(this.proposal, this.tokenContract);

    set(this, "link", nLink);
  },

  async getBreakdown() {
    if (this.proposal.type === "Off-chain") {
      set(this, "loading", true);
      const proposal = { ...this.proposal };
      const withScores = getVoteBreakdownByProposal(
        await getResults(proposal.space, proposal, proposal.votes)
      );

      set(this, "proposal", withScores);
      set(this, "loading", false);
    }
  },

  init() {
    this._super(...arguments);
    this.getLink();
    this.getBreakdown();
  },
});
