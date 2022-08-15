import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, set } from "@ember/object";
import VotingHistory from "../../lib/voting-history";
import template from "../../lib/voting-history/template";

export default Component.extend({
  router: service(),

  profile: {},

  votes: [],

  didReceiveAttrs() {
    this._super(...arguments);
    const _this = this;
    VotingHistory.start(this.profile, { SiteSettings: this.siteSettings }).then(
      (votes) => {
        set(_this, "votes", votes);
      }
    );
  },
});
