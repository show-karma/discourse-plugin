import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";
import { defaultHomepage } from "discourse/lib/utilities";

export default Component.extend({
  router: service(),

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

  proposals: computed(() => {
    const proposals = [
      {
        name: "Proposal Name",
        description: "Proposal description",
        dueDate: moment(moment().add(10, "day")).format("Y MMMM D"),
      },
      {
        name: "Proposal Name",
        description: "Proposal description",
        dueDate: moment(moment().add(10, "day")).format("Y MMMM D"),
      },
      {
        name: "Proposal Name",
        description: "Proposal description",
        dueDate: moment(moment().add(10, "day")).format("Y MMMM D"),
      },
      {
        name: "Proposal Name",
        description: "Proposal description",
        dueDate: moment(moment().add(10, "day")).format("Y MMMM D"),
      },
      {
        name: "Proposal Name",
        description: "Proposal description",
        dueDate: moment(moment().add(10, "day")).format("Y MMMM D"),
      },
      {
        name: "Proposal Name",
        description: "Proposal description",
        dueDate: moment(moment().add(10, "day")).format("Y MMMM D"),
      },
      {
        name: "Proposal Name",
        description: "Proposal description",
        dueDate: moment(moment().add(10, "day")).format("Y MMMM D"),
      },
      {
        name: "Proposal Name",
        description: "Proposal description",
        dueDate: moment(moment().add(10, "day")).format("Y MMMM D"),
      },
      {
        name: "Proposal Name",
        description: "Proposal description",
        dueDate: moment(moment().add(10, "day")).format("Y MMMM D"),
      },
      {
        name: "Proposal Name",
        description: "Proposal description",
        dueDate: moment(moment().add(10, "day")).format("Y MMMM D"),
      },
    ];
    return proposals;
  }),
});
