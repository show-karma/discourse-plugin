import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { set } from "@ember/object";
import KarmaStats from "../../lib/stats/index";

export default Component.extend({
  router: service(),

  profile: {},

  wrapperId: "__karma-stats-summary",

  setProfile(profile) {
    set(this, "profile", profile);
  },

  async init() {
    this._super(...arguments);
    const profile = await KarmaStats.start(
      30,
      { SiteSettings: this.siteSettings },
      "#" + this.wrapperId
    );

    this.setProfile(profile);
  },
});
