import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, set } from "@ember/object";
import { throttle } from "@ember/runloop";

export default Component.extend({
  router: service(),

  form: { reason: "", user: "" },

  profile: {},

  vote: {},

  message: "",

  hasSetReason: false,

  loading: false,

  @action
  toggleModal() {
    $("#__karma-vote-form-modal").toggle();
  },

  async send() {
    console.debug(`Send to karma ${JSON.stringify(this.form)}`);
    set(this, "loading", true);
    // eslint-disable-next-line no-restricted-globals
    await new Promise((r) =>
      setTimeout(() => {
        r(true);
      }, 2000)
    );
    set(this, "loading", false);
    set(this, "message", "Confirmed!");
    set(this, "hasSetReason", true);
  },

  @action
  submit(e) {
    e.preventDefault();
    return throttle(this, this.send, 200);
  },

  @action
  setReason(e) {
    set(this, "form", { ...this.form, reason: e.target.value });
  },

  didReceiveAttrs() {
    this._super(...arguments);
    this.form.user = this.currentUser.username;
  },
});
