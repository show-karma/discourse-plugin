import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { set, computed } from "@ember/object";
import template, { renderVote } from "../../lib/voting-history/template";

export default Component.extend({
  router: service(),

  vote: {},

  profile: {},

  wrapperId: "__karma-stats-summary",

  icon: computed(function () {
    return renderVote(this.vote.choice);
  }),

  item: computed(function () {
    return template(
      this.vote.proposal,
      this.vote.voteMethod,
      this.vote.executed,
      this.vote.choice
    );
  }),
});
