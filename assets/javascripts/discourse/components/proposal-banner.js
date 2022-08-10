import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import { inject as service } from "@ember/service";
import { computed, action, set } from "@ember/object";
import { defaultHomepage } from "discourse/lib/utilities";
import { fetchActiveOnChainProposals } from "../../lib/voting-history/gql/on-chain-fetcher";
import { fetchActiveOffChainProposals } from "../../lib/voting-history/gql/off-chain-fetcher";

export default Component.extend({
  router: service(),

  openClass: "",

  proposals: [],

  bannerHeight: "120px",

  @action
  toggleBanner() {
    set(this, "openClass", this.openClass === "opened" ? "" : "opened");
    this.setBannerHeight();
  },

  async fetchDataProposals() {
    const daoNames = [this.siteSettings.DAO_name];

    if (!/\.eth$/g.test(daoNames[0])) {
      daoNames.push(`${daoNames[0]}.eth`);
    }

    const onChain = await fetchActiveOnChainProposals(daoNames);
    const offChain = await fetchActiveOffChainProposals(daoNames);
    const proposals = onChain
      .concat(offChain)
      .sort((a, b) => (moment(a.endsAt).isBefore(moment(b.endsAt)) ? 1 : -1));
    set(this, "proposals", proposals);
  },

  setBannerHeight() {
    let bannerHeight = 0;
    const el = $(".proposal");

    if (el.length) {
      if (this.openClass !== "opened") {
        bannerHeight = el[0]?.clientHeight || 0;
      } else {
        el.each((_, item) => {
          bannerHeight += item.clientHeight;
        });
      }
    }

    set(this, "bannerHeight", bannerHeight + "px");
  },

  didInsertElement() {
    this._super(...arguments);
  },

  didUpdate() {
    this.setBannerHeight();
  },

  didReceiveAttrs() {
    this._super(...arguments);
    this.fetchDataProposals();
  },

  bannerLinks: computed(function () {
    const links = [
      {
        url: this.siteSettings.Banner_forum_rules_link,
        icon: this.siteSettings.Banner_forum_rules_icon,
        text: this.siteSettings.Banner_forum_rules_text,
      },
      {
        url: this.siteSettings.Banner_gov_docs_link,
        icon: this.siteSettings.Banner_gov_docs_icon,
        text: this.siteSettings.Banner_gov_docs_text,
      },
      {
        url: this.siteSettings.Banner_custom_link,
        icon: this.siteSettings.Banner_custom_link_icon,
        text: this.siteSettings.Banner_custom_link_text,
      },
    ];
    return links;
  }),
});