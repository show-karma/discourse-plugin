import Component from "@ember/component";
import { computed } from "@ember/object";
import { htmlSafe } from "@ember/template";

export default Component.extend({
  label: "",

  safeLabel: computed("label", function () {
    return htmlSafe(this.label);
  }),
});
