import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, computed, set } from "@ember/object";
import { throttle } from "@ember/runloop";
import postToTopic from "../../lib/post-to-topic";

export default Component.extend({
  router: service(),

  proposalId: "",

  form: { pitch: "", user: "" },

  profile: {},

  vote: {},

  message: "",

  hasSetReason: false,

  loading: false,

  visible: false,

  modalId: "__karma-vote-pitch-modal",

  threadId: computed(function () {
    return this.siteSettings.Delegate_pitch_thread_id;
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

  checkErrors() {
    set(this, "errors", []);
    const errors = this.errors;

    if (this.form.pitch.length < 20) {
      errors.push("Your message should have at least 20 chars.");
    }
    set(this, "errors", errors);
    return !!errors.length;
  },

  async post() {
    try {
      await postToTopic({
        threadId: this.threadId,
        body: this.form.pitch,
        csrf: this.session.csrfToken,
      });
    } catch (error) {
      console.error(error);
    }
  },

  async send() {
    const hasErrors = this.checkErrors();
    if (!hasErrors) {
      set(this, "loading", true);
      await this.post();
      set(this, "loading", false);
      setTimeout(() => {
        this.toggleModal();
        setTimeout(() => {
          set(this, "message", "");
          set(this, "errors", []);
        }, 250);
      }, 2000);
      set(this, "message", "Thank you! You pitch was submitted successfully.");
    }
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
