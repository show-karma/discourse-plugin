import Component from "@ember/component";
import { action, computed, set } from "@ember/object";
import {
  getResults,
  getVoteBreakdownByProposal,
} from "../../lib/vote-breakdown";

const { BigInt } = window;

export default Component.extend({
  proposal: {},

  tokenContract: "",

  link: "",

  pointer: "",

  loading: false,

  text: computed(function () {
    return this.getText();
  }),

  getText() {
    return "View details";
  },

  @action
  redirect() {
    window.open(this.link, "_blank");
  },

  getLink() {
    let nLink = this.link;
    if (this.proposal.type === "Off-chain") {
      nLink = `https://snapshot.org/#/${this.proposal.snapshotId}/proposal/${this.proposal.id}`;
    } else {
      const proposalId = BigInt(this.proposal.id).toString();
      nLink = this.tokenContract
        ? `https://tally.xyz/governance/eip155:1:${this.tokenContract}/proposal/${proposalId}`
        : "";
    }
    if (nLink) {
      set(this, "pointer", "cursor:pointer");
    }
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
