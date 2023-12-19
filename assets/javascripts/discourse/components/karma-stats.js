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

  daoName: "",

  availableDaos: [],

  karmaDelegatorsUrl: computed(function () {
    return `https://karmahq.xyz/dao/${this.daoName?.toLowerCase()}/delegators/${this.profile.username}`;
  }),

  setProfile(profile) {
    set(this, "profile", profile);
  },

  init() {
    this._super(...arguments);
    set(this, 'daoName', window.selectedDao?.[0]?.toUpperCase() + window.selectedDao?.slice(1));
    set(this, 'availableDaos', this.siteSettings.DAO_names?.split(",").map(
      name => ({ name, select: () => this.selectDao(name) })));
  },

  async didReceiveAttrs() {
    this._super(...arguments);
    await this.fetchProfile();
  },

  @action
  selectDao(daoName) {
    if(!daoName) { return; };
    if(!this.availableDaos.find(d => d.name === daoName)) { return; };
    set(this, 'daoName', daoName);
    window.selectedDao = daoName;
    this.fetchProfile();
  },

  @action
  async fetchProfile() {
    const profile = await KarmaStats.start(
      30,
      { SiteSettings: this.siteSettings },
      "#" + this.wrapperId,
      this.username
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
});
