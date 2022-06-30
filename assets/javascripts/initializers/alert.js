import KarmaStats from "../karma-stats";

export default {
  name: "alert",
  initialize() {
    this.fetch();
    // eslint-disable-next-line no-alert
  },
  async fetch() {
    const results = await KarmaStats.fetchUser(
      "0xdd45542ccf17a16f5c515c20db7f7c7d8bb74cc5",
      "aave"
    );
    // eslint-disable-next-line no-console
    console.debug(results);
  },
};
