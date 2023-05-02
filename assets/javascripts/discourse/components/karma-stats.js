import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, computed, set } from "@ember/object";
import KarmaStats from "../../lib/stats/index";

export default Component.extend({
  router: service(),

  profile: {},

  wrapperId: "__karma-stats-summary",

  hasSetApiKey: false,

  shouldShowActionButtons: false,

  karmaDelegatorsUrl: computed(function () {
    return `https://karmahq.xyz/dao/${this.siteSettings.DAO_name}/delegators/${this.profile.username}`;
  }),

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

  async didReceiveAttrs() {
    this._super(...arguments);
    await this.fetchProfile();
  },
});
