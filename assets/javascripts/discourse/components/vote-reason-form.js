import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, set } from "@ember/object";
import { throttle } from "@ember/runloop";

export default Component.extend({
  router: service(),

  form: { reason: "", user: "" },

  profile: {},

  vote: {},

  @action
  toggleModal() {
    $("#__karma-vote-form-modal").toggle();
  },

  send() {
    console.debug(`Send to karma ${JSON.stringify(this.form)}`);
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
