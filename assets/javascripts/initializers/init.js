import KarmaStats from "../karma-stats";

export default {
  name: "alert",
  initialize() {
    window.KarmaStats = KarmaStats;
  },
};
