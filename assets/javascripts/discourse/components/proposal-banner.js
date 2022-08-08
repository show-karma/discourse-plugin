import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";
import { defaultHomepage } from "discourse/lib/utilities";

export default Component.extend({
  router: service(),

  bannerLinks: computed(function () {
    console.log(this);
    return JSON.parse(this.siteSettings.Banner_links);
  }),

  @discourseComputed("router.currentRouteName", "router.currentURL")
  showHere(currentRouteName, currentURL) {
    if (this.siteSettings.Show_banner_links === "all") {
      return true;
    }

    if (this.siteSettings.Show_banner_links === "discovery") {
      return currentRouteName.indexOf("discovery") > -1;
    }

    if (this.siteSettings.Show_banner_links === "homepage") {
      return currentRouteName == `discovery.${defaultHomepage()}`;
    }
  },
});
