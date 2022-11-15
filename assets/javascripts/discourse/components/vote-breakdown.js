import Component from "@ember/component";
import { set } from "@ember/object";
import { shortenNumber } from "../../lib/shorten-number";

export default Component.extend({
  breakdown: {},

  values: [],

  loading: false,

  sortVotes(votes) {
    if (
      Array.isArray(votes) &&
      !(votes[0].name === "For" || votes[1].name === "Against")
    ) {
      return votes.sort((a, b) => (a.rawCount < b.rawCount ? 1 : -1));
    }
    return votes;
  },

  truncateVotesArray(votes) {
    if (Array.isArray(votes) && votes.length > 4) {
      const last = {
        name: "",
        shortname: "Others",
        rawCount: 0,
        count: "0",
        pct: "",
        fillPct: "0",
        color: votes[0].color,
      };
      votes.splice(3, votes.length).forEach((vote) => {
        last.name += `<b>${vote.name}</b>: ${vote.count} votes <br>`;
        last.rawCount += vote.rawCount;
      });
      const pct = (
        ((last.rawCount || 0) / (this.breakdown.total || 1)) *
        100
      ).toFixed(2);
      last.count = shortenNumber(last.rawCount);
      last.pct = pct + "%";
      last.fillPct = (pct >= 1 ? pct : 1) + "%";
      return votes.concat(last);
    }
    return votes;
  },

  didReceiveAttrs() {
    const keys = Object.keys(this.breakdown).map((k) => k);
    // const rgb = (i) =>
    //   `rgba(82, 152, 255, ${i === 0 ? 1 : "0." + (10 - (i + 1))})`;
    const votesPct = keys
      .filter((key) => !["undefined", "total"].includes(key))
      .map((key) => {
        const pct = +(
          ((+this.breakdown[key] || 0) / (+this.breakdown.total || 1)) *
          100
        ).toFixed(2);
        return {
          name: key,
          shortname: `${key.slice(0, 20).trim()}${
            key[20] && key[20] !== " " ? "..." : ""
          }`,
          rawCount: this.breakdown[key],
          count: shortenNumber(this.breakdown[key], 1),
          pct: pct + "%",
          fillPct: (pct >= 1 ? pct : 1) + "%",
          color: "rgba(82, 152, 255, 0.15)",
        };
      });
    const truncatedArray = this.truncateVotesArray(this.sortVotes(votesPct));
    set(this, "values", truncatedArray);
  },
});
