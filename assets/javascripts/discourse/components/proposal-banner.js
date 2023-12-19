import Component from "@ember/component";
import { inject as service } from "@ember/service";
import discourseComputed from "discourse-common/utils/decorators";
import { action, computed, set } from "@ember/object";
import { fetchActiveOnChainProposals } from "../../lib/voting-history/gql/on-chain-fetcher";
import { fetchActiveOffChainProposals } from "../../lib/voting-history/gql/off-chain-fetcher";
import { getGovAddrFromYml } from "../../lib/get-gov-addr-from-yml";
import { fetchDaoSnapshotAndOnChainIds } from "../../lib/fetch-snapshot-onchain-ids";

export default Component.extend({
  router: service(),

  openClass: "",

  proposals: [],

  availableToShow: 0,

  bannerHeight: "0",

  fetched: false,

  tokenContract: "",

  daoName: "",

  availableDaos: [],

  logo: computed(function () {
    return this.siteSettings.Custom_banner_icon_url || this.siteSettings.logo;
  }),

  init() {
    this._super(...arguments);
    this.daoName = window.selectedDao;
    set(this, 'availableDaos', this.siteSettings.DAO_names?.split(",").map(
      name => ({ name, select: () => this.selectDao(name) })));
  },

  @action
  selectDao(daoName) {
    if (!daoName) { return; };
    if (!this.availableDaos.find(d => d.name === daoName)) { return; };
    set(this, 'daoName', daoName);
    window.selectedDao = daoName;
    set(this, 'fetched', false);
    this.fetchDataProposals();
  },

  @action
  toggleBanner() {
    set(this, "openClass", this.openClass === "opened" ? "" : "opened");
    this.setBannerHeight();
  },

  async getGovContractAddr() {
    const tokenAddress = await getGovAddrFromYml(this.daoName);
    set(this, "tokenContract", tokenAddress);
  },

  async fetchDataProposals() {
    const {
      Banner_past_proposal_days: daysAgo,
    } = this.siteSettings;
    // Fix this workaround when voting history is refactored into components
    const graphqlIds =
      (await fetchDaoSnapshotAndOnChainIds(this.daoName));

    let onChain = [];
    if (
      this.siteSettings.Show_on_chain_proposals &&
      graphqlIds.onChainId?.length
    ) {
      onChain = await fetchActiveOnChainProposals(
        [graphqlIds.onChainId].flat(),
        daysAgo
      );
    }

    let offChain = [];
    if (
      this.siteSettings.Show_off_chain_proposals &&
      graphqlIds.snapshotIds?.length
    ) {
      offChain = await fetchActiveOffChainProposals(
        [graphqlIds.snapshotIds].flat(),
        daysAgo
      );
    }

    const proposals = onChain
      .concat(
        offChain.filter((proposal) =>
          moment(proposal.voteStarts).isBefore(moment())
        )
      )
      .sort((a, b) => (moment(a.endsAt).isBefore(moment(b.endsAt)) ? 1 : -1));
    set(this, "proposals", proposals);
    set(this, "fetched", true);
    set(this, "availableToShow", proposals.length - 1);
    this.setBannerHeight();
  },

  setBannerHeight() {
    let bannerHeight = 0;
    const el = $(".proposal");

    if (el.length) {
      if (this.openClass !== "opened") {
        bannerHeight = el[0]?.clientHeight
          ? el[0]?.clientHeight > 235
            ? 235
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
