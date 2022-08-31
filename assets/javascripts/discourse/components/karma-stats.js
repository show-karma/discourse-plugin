import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { set } from "@ember/object";
import KarmaStats from "../../lib/stats/index";

export default Component.extend({
  router: service(),

  profile: {},

  wrapperId: "__karma-stats-summary",

  didReceiveAttrs() {
    this._super(...arguments);
    const _this = this;
    KarmaStats.start(
      30,
      { SiteSettings: this.siteSettings },
      "#" + this.wrapperId
    ).then((profile) => {
      set(_this, "profile", profile);
    });
  },
});
