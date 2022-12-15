import { t_k } from "./consts";
/* eslint-disable */
function bootstrap(f, b) {
  if (!b.__SV) {
    let e, g, i, h;
    window.mixpanel = b;
    b._i = [];
    b.init = function (e, f, c) {
      function g(a, d) {
        let b = d.split(".");
        2 == b.length && ((a = a[b[0]]), (d = b[1]));
        a[d] = function () {
          a.push([d].concat(Array.prototype.slice.call(arguments, 0)));
        };
      }
      let a = b;
      "undefined" !== typeof c ? (a = b[c] = []) : (c = "mixpanel");
      a.people = a.people || [];
      a.toString = function (a) {
        let d = "mixpanel";
        "mixpanel" !== c && (d += "." + c);
        a || (d += " (stub)");
        return d;
      };
      a.people.toString = function () {
        return a.toString(1) + ".people (stub)";
      };
      i = "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(
        " "
      );
      for (h = 0; h < i.length; h++) g(a, i[h]);
      let j = "set set_once union unset remove delete".split(" ");
      a.get_group = function () {
        function b(c) {
          d[c] = function () {
            call2_args = arguments;
            call2 = [c].concat(Array.prototype.slice.call(call2_args, 0));
            a.push([e, call2]);
          };
        }
        for (
          var d = {},
            e = ["get_group"].concat(Array.prototype.slice.call(arguments, 0)),
            c = 0;
          c < j.length;
          c++
        )
          b(j[c]);
        return d;
      };
      b._i.push([e, f, c]);
    };
    b.__SV = 1.2;
    e = f.createElement("script");
    e.type = "text/javascript";
    e.async = !0;
    e.src = "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
    g = f.getElementsByTagName("script")[0];
    g.parentNode.insertBefore(e, g);
  }
}

let mp = undefined;
export function initMixpanel() {
  bootstrap(document, window.mixpanel || []);

  const g = () => {
    const { ms, __k: k } = window;
    if (!ms) return;
    const p = ms.split("");
    const d = p.map((i) => t_k[k[+i]]).join("");
    return d;
  };
  mp = window.mixpanel;
  // Enabling the debug mode flag is useful during implementation,
  // but it's recommended you remove it for production
  mp?.init(g());
  return mp;
}
const mixpanel = mp || initMixpanel();
/**
 * Reports a single event to mixpanel dashboard
 * @param {import("karma-score").MixpanelEvent} data
 * @returns {Promise<void>}
 */
function reportEvent(data, prefix = "plugin") {
  if (!mixpanel) throw new Error("Mixpanel is not available");

  return new Promise((resolve, reject) => {
    console.debug("reporting event");
    mixpanel.track(`${prefix}:${data.event}`, data.properties, (err) => {
      if (err) {
        console.debug("error happened", err);
        reject(err);
      } else {
        console.debug("reported event", data);
        resolve();
      }
    });
  });
}
const Mixpanel = { instance: mixpanel, reportEvent };
export { Mixpanel };
