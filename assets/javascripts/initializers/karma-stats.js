import { withPluginApi } from "discourse/lib/plugin-api";
import KarmaStats from "../lib/stats/index";
import VotingHistory from "../lib/voting-history/index";

// TODO: !!Refactor this to ember components
function bootstrap(_, ctx) {
  function release(wrapperId = "#__karma-stats") {
    let showing = false;
    const karmaStats = () => {
      const elTrg = $(wrapperId);
      if (!showing && elTrg.length) {
        KarmaStats.start(0, ctx, wrapperId).then((profile) => {
          VotingHistory.start(profile, ctx, wrapperId).then((votes) => {
            VotingHistory.render(votes);
          });
        });
      }
      showing = !!elTrg.length;
    };
    setInterval(karmaStats, 100);
  }

  function userCard() {
    release(".__karma-stats");
  }

  $(() => {
    userCard();
  });
}

export default {
  name: "karma-stats",

  async initialize(container) {
    // eslint-disable-next-line no-console
    console.info("Karma Score (v1.3.7-beta4)");
    const SiteSettings = container.lookup("site-settings:main");
    if (SiteSettings.Enable_Karma_plugin) {
      withPluginApi("0.8.7", bootstrap, { SiteSettings, container });
    }
  },
};
