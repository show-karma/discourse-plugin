import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { computed, set } from "@ember/object";
import VotingHistory from "../../lib/voting-history/index";
import KarmaApiClient from "../../lib/karma-api-client";

export default Component.extend({
  router: service(),

  profile: {},

  votes: [],

  fetched: false,

  hasSetApiKey: false,

  shouldShowActionButtons: computed(function () {
    return (
      this.session &&
      this.profile.username &&
      this.currentUser &&
      this.profile?.username === this.currentUser?.username
    );
  }),

  async didReceiveAttrs() {
    const cli = new KarmaApiClient("ens", "");
    if (this.session) {
      try {
        const { allowance } = await cli.isApiAllowed(this.session.csrfToken);
        set(this, "hasSetApiKey", !!allowance);
      } catch {}
    }

    if (!this.votes.length) {
      this._super(...arguments);
      const votes = await VotingHistory.start(this.profile, {
        SiteSettings: this.siteSettings,
      });
      set(this, "fetched", true);
      if (!this.votes.length && votes.length) {
        set(this, "votes", votes);
      }
    }
  },
});
