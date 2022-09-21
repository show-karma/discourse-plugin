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
        color: votes[0].color,
      };
      votes.splice(3, votes.length).forEach((vote) => {
        last.name += `<b>${vote.name}</b>: ${vote.count} votes <br>`;
        last.rawCount += vote.rawCount;
      });
      last.count = shortenNumber(last.rawCount);
      last.pct = (last.rawCount / this.breakdown.total) * 100 + "%";
      return votes.concat(last);
    }
    return votes;
  },

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
        rawCount: this.breakdown[key],
        count: shortenNumber(this.breakdown[key], 1),
        pct: (this.breakdown[key] / this.breakdown.total) * 100 + "%",
        color: rgb(index),
      }));
    const truncatedArray = this.truncateVotesArray(this.sortVotes(votesPct));
    set(this, "values", truncatedArray);
  },
});
