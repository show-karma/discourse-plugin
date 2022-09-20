import Component from "@ember/component";
import { set } from "@ember/object";
import { shortenNumber } from "../../lib/shorten-number";

export default Component.extend({
  breakdown: {},

  values: [],

  didReceiveAttrs() {
    const keys = Object.keys(this.breakdown).map((k) => k);
    const rgb = (i) =>
      `rgba(226, 234, 245, ${i === 0 ? 1 : "0." + (10 - (i + 1))})`;
    const votesPct = keys
      .filter((key) => !["undefined", "total"].includes(key))
      .map((key, index) => ({
        name: key,
        shortname: `${key.slice(0, 4).trim()}${
          key[4] && key[4] !== " " ? "..." : ""
        }`,
        count: shortenNumber(this.breakdown[key], 1),
        pct: (this.breakdown[key] / this.breakdown.total) * 100 + "%",
        color: rgb(index),
      }));
    set(this, "values", votesPct);
  },
});
