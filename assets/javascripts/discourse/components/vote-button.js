import Component from "@ember/component";
import { computed, set } from "@ember/object";
const { BigInt } = window;

export default Component.extend({
  proposal: undefined,

  link: "",

  tokenContract: "",

  text: computed(function () {
    return this.getText();
  }),

  getText() {
    let text = this.proposal.dateDescription ? "See" : "Vote";
    if (this.proposal.type === "Off-chain") {
      return text + " on Snapshot";
    } else {
      return text + " on Tally";
    }
  },

  getLink() {
    let nLink = this.link;
    if (this.proposal.type === "Off-chain") {
      nLink = `https://snapshot.org/#/${this.proposal.snapshotId}/proposal/${this.proposal.id}`;
    } else {
      const proposalId = BigInt(this.proposal.id).toString();
      // nLink = `https://tally.xyz/governance/eip:155:${this.tokenContract}/proposal/${proposalId}`;
      nLink = this.tokenContract
        ? `https://tally.xyz/governance/eip:155:${this.tokenContract}/proposal/${proposalId}`
        : "";
    }
    set(this, "link", nLink);
  },

  init() {
    this._super(...arguments);
    this.getLink();
  },

  didReceiveAttrs() {
    this._super(...arguments);
  },
});
