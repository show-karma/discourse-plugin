import { withPluginApi } from "discourse/lib/plugin-api";
import KarmaStats from "../lib/stats/index";
import VotingHistory from "../lib/voting-history/index";

function bootstrap(_, ctx) {
  function release(ctx, wrapperId = "#__karma-stats") {
    let showing = false;
    const karmaStats = () => {
      const elTrg = $(wrapperId);
      if (!showing && elTrg.length) {
        KarmaStats.start(0, ctx, wrapperId).then((profile) => {
          VotingHistory.start(profile, ctx, wrapperId);
        });
      }
      showing = !!elTrg.length;
    };

    setInterval(karmaStats, 100);
  }

  function summary() {
    release(ctx, "#__karma-stats-summary");
  }

  function userCard() {
    release(ctx, ".__karma-stats");
  }

  $(() => {
    summary();
    userCard();
  });
}

export default {
  name: "karma-stats",

  initialize(container) {
    const SiteSettings = container.lookup("site-settings:main");
    if (SiteSettings.Enable_Karma_plugin) {
      withPluginApi("0.8.7", bootstrap, { SiteSettings, container });
    }
  },
};
