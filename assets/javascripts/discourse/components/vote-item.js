import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";
import { htmlSafe } from "@ember/template";
// "voteTemplate" (not "template") — Discourse's build injects its own
// `template` identifier when colocating the component's .hbs
import voteTemplate, { renderVote } from "../../lib/voting-history/template";

export default Component.extend({
  router: service(),

  vote: {},

  profile: {},

  wrapperId: "__karma-stats-summary",

  icon: computed(function () {
    return htmlSafe(renderVote(this.vote.choice));
  }),

  safeProposal: computed("vote.proposal", function () {
    return htmlSafe(this.vote.proposal);
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
