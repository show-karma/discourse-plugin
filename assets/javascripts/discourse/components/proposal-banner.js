import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import { inject as service } from "@ember/service";
import { action, computed, set } from "@ember/object";
import { fetchActiveOnChainProposals } from "../../lib/voting-history/gql/on-chain-fetcher";
import { fetchActiveOffChainProposals } from "../../lib/voting-history/gql/off-chain-fetcher";
import { getGovAddrFromYml } from "../../lib/get-gov-addr-from-yml";

export default Component.extend({
  router: service(),

  openClass: "",

  proposals: [],

  availableToShow: 0,

  bannerHeight: "0",

  fetched: false,

  tokenContract: "",

  logo: computed(function () {
    return this.siteSettings.Custom_banner_icon_url || this.siteSettings.logo;
  }),

  @action
  toggleBanner() {
    set(this, "openClass", this.openClass === "opened" ? "" : "opened");
    this.setBannerHeight();
  },

  async getGovContractAddr() {
    const tokenAddress = await getGovAddrFromYml(this.siteSettings.DAO_name);
    set(this, "tokenContract", tokenAddress);
  },

  async fetchDataProposals() {
    const daoNames = [this.siteSettings.DAO_name];
    const { Banner_past_proposal_days: daysAgo } = this.siteSettings;

    if (!/\.eth$/g.test(daoNames[0])) {
      daoNames.push(`${daoNames[0]}.eth`);
    }

    const onChain = await fetchActiveOnChainProposals(daoNames, daysAgo);
    const offChain = await fetchActiveOffChainProposals(daoNames, daysAgo);
    const proposals = onChain
      .concat(offChain)
      .sort((a, b) => (moment(a.endsAt).isBefore(moment(b.endsAt)) ? 1 : -1));
    set(this, "proposals", proposals);
    set(this, "fetched", true);
    set(this, "availableToShow", proposals.length - 1);
  },

  setBannerHeight() {
    let bannerHeight = 0;
    const el = $(".proposal");

    if (el.length) {
      if (this.openClass !== "opened") {
        bannerHeight = el[0]?.clientHeight
          ? el[0]?.clientHeight > 115
            ? 115
            : el[0]?.clientHeight
          : 0;
      } else {
        el.each((_, item) => {
          bannerHeight += item.clientHeight + 15;
        });
      }
    }

    set(this, "bannerHeight", bannerHeight + "px");
  },

  @discourseComputed("router.currentURL")
  shouldShow(currentUrl) {
    return currentUrl === "/";
  },

  didUpdate() {
    this.setBannerHeight();
  },

  didReceiveAttrs() {
    this._super(...arguments);
    this.fetchDataProposals();
    this.getGovContractAddr();
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
