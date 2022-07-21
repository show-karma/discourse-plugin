import { set } from "@ember/object";
import KarmaStats from "../stats/karma";

export default {
  name: "alert",
  initialize(_, ctx) {
    set(ctx, "Karma", {});
    $(() => {
      let showing = false;
      const karmaStats = () => {
        const elTrg = $(".__karma-stats");
        if (!showing && elTrg.length) {
          KarmaStats.start(0, ctx);
        }
        showing = !!elTrg.length;
      };

      setInterval(karmaStats, 100);
    });
  },
};
