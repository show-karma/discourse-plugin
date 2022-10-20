import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, computed, set } from "@ember/object";
import KarmaStats from "../../lib/stats/index";
import KarmaApiClient from "../../lib/karma-api-client";

export default Component.extend({
  router: service(),

  profile: {},

  wrapperId: "__karma-stats-summary",

  hasSetApiKey: false,

  shouldShowActionButtons: false,

  setProfile(profile) {
    set(this, "profile", profile);
  },

  @action
  async fetchProfile() {
    const profile = await KarmaStats.start(
      30,
      { SiteSettings: this.siteSettings },
      "#" + this.wrapperId
    );
    this.setProfile(profile);
    set(
      this,
      "shouldShowActionButtons",
      this.session &&
        profile.username &&
        this.currentUser &&
        profile?.username === this.currentUser?.username
    );
  },

  async init() {
    this._super(...arguments);
    const cli = new KarmaApiClient(this.siteSettings.DAO_name, "");
    if (this.session) {
      try {
        const { allowance } = await cli.isApiAllowed(this.session.csrfToken);
        set(this, "hasSetApiKey", !!allowance);
      } catch {}
    }
  },

  async didReceiveAttrs() {
    this._super(...arguments);
    await this.fetchProfile();
  },
});
