import Component from "@ember/component";
import { computed } from "@ember/object";

export default Component.extend({
  breakdown: {},

  forPct: computed(function () {
    return (this.breakdown.for / this.breakdown.total) * 100 + "%";
  }),

  againstPct: computed(function () {
    return (this.breakdown.no / this.breakdown.total) * 100 + "%";
  }),

  abstainPct: computed(function () {
    return (this.breakdown.abs / this.breakdown.total) * 100 + "%";
  }),
});
