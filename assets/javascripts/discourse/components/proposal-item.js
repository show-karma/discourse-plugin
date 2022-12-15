import Component from "@ember/component";
import { action, computed, set } from "@ember/object";
import getProposalLink from "../../lib/get-proposal-link";
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

  /**
   * @param {import("karma-score").OffChainProposal} proposal
   */
  getText(proposal) {
    return proposal.type === "Off-chain" &&
      moment(proposal.voteStarts).isAfter(moment())
      ? `Voting begins ${proposal.voteStarts}`
      : (moment(proposal.endsAt).isBefore(moment()) ? "Ended " : "Ends: ") +
          proposal.endsAt;
  },

  @action
  redirect() {
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
