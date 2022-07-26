import KarmaStats from "../stats";
import VotingHistory from "../voting-history";

export default {
  name: "alert",
  initialize(_, ctx) {
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
  },
};
