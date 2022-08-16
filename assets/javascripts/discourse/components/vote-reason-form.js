import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, computed, set } from "@ember/object";
import { throttle } from "@ember/runloop";

export default Component.extend({
  router: service(),

  proposalId: "",

  form: { reason: "", user: "" },

  profile: {},

  vote: {},

  message: "",

  hasSetReason: false,

  loading: false,

  visible: false,

  modalId: computed(function () {
    return this.vote.proposalId + "__karma-vote-form-modal";
  }),

  @action
  toggleModal() {
    const ttl = 100;
    const el = $(`#${this.modalId}`);
    if (this.visible) {
      el.animate(
        {
          opacity: "0",
          transform: "translateY(20px)",
        },
        ttl
      );

      setTimeout(() => el.hide(), ttl * 2);
      set(this, "visible", false);
    } else {
      el.show();
      el.animate(
        {
          opacity: "1",
          transform: "translateY(0)",
        },
        ttl
      );
      set(this, "visible", true);
    }
  },

  async send() {
    console.debug(
      `Send to karma ${JSON.stringify({
        ...this.form,
        proposalId: this.vote.proposalId,
      })}`
    );
    set(this, "loading", true);
    // eslint-disable-next-line no-restricted-globals
    await new Promise((r) =>
      setTimeout(() => {
        r(true);
      }, 2000)
    );
    set(this, "loading", false);

    setTimeout(() => {
      this.toggleModal();
    }, 2000);
    set(this, "message", "Thank you! You reason was submitted successfully.");
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
