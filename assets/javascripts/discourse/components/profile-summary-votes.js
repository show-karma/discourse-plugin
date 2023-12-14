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

  count: 0,

  daoName: "",

  shouldShowActionButtons: computed(function () {
    return (
      this.session &&
      this.profile.username &&
      this.currentUser &&
      this.profile?.username === this.currentUser?.username
    );
  }),

  async fetchVotes() {
    set(this, "fetched", false);
    const votes = await VotingHistory.start(this.profile, {
      SiteSettings: this.siteSettings,
    });
    set(this, "fetched", true);
    set(this, "votes", votes);
  },

  async init() {
    this._super(...arguments);
    this.daoName = window.selectedDao;
    if (this.session) {
      const cli = new KarmaApiClient(this.daoName, "");
      try {
        const { allowance } = await cli.isApiAllowed(this.session.csrfToken);
        set(this, "hasSetApiKey", !!allowance);
      } catch {}
    }
  },

  async didReceiveAttrs() {
    this._super(...arguments);

    if (this.profile.address && !this.fetched) {
      this.fetchVotes();
    }
  },
});
