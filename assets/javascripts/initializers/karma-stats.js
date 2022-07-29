import { withPluginApi } from "discourse/lib/plugin-api";
import KarmaStats from "../lib/stats/index";
import VotingHistory from "../lib/voting-history/index";

function bootstrap(_, ctx) {
  $(() => {
    let showing = false;
    const karmaStats = () => {
      const elTrg = $(".__karma-stats");
      if (!showing && elTrg.length) {
        KarmaStats.start(0, ctx).then((profile) => {
          VotingHistory.start(profile, ctx);
        });
      }
      showing = !!elTrg.length;
    };

    setInterval(karmaStats, 100);
  });
}

export default {
  name: "karma-stats",

  initialize(container) {
    const SiteSettings = container.lookup("site-settings:main");
    if (SiteSettings.Enable_Karma_plugin) {
      withPluginApi("0.8.7", bootstrap, { SiteSettings });
    }
  },
};
