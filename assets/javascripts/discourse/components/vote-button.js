import Component from "@ember/component";
import { action, computed, set } from "@ember/object";

export default Component.extend({
  proposal: undefined,

  link: computed(function () {
    return this.getLink();
  }),

  text: computed(function () {
    return this.getText();
  }),

  getLink() {
    if (this.proposal.type === "Off-chain") {
      return `https://snapshot.org/#/${this.proposal.snapshotId}/proposal/${this.proposal.id}`;
    }
    return ``;
  },

  getText() {
    let text = this.proposal.dateDescription ? "See" : "Vote";
    if (this.proposal.type === "Off-chain") {
      return text + " on Snapshot";
    } else {
      return text + " on Tally";
    }
  },

  didReceiveAttrs() {
    this._super(...arguments);
  },
});
