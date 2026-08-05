import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";
// "voteTemplate" (not "template") — Discourse's build injects its own
// `template` identifier when colocating the component's .hbs
import voteTemplate, { renderVote } from "../../lib/voting-history/template";

export default Component.extend({
  router: service(),

  vote: {},

  profile: {},

  wrapperId: "__karma-stats-summary",

  icon: computed(function () {
    return renderVote(this.vote.choice);
  }),

  item: computed(function () {
    return voteTemplate(
      this.vote.proposal,
      this.vote.voteMethod,
      this.vote.executed,
      this.vote.choice
    );
  }),
});
