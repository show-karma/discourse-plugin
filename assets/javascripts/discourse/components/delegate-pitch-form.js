import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, computed, set } from "@ember/object";
import { throttle } from "@ember/runloop";
import postToTopic from "../../lib/post-to-topic";
import { isEthAddress } from "../../lib/is-eth-address";
import KarmaApiClient from "../../lib/karma-api-client";

export default Component.extend({
  router: service(),

  proposalId: "",

  form: {
    description: "",
    publicAddress: "",
  },

  postId: 0,

  profile: {},

  lockDelegateAddress: false,

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
    if (this.form.description.length < 20) {
      errors.push("Your message should have at least 20 chars.");
    }

    if (!isEthAddress(this.form.publicAddress)) {
      errors.push("The provided public address for delegate is invalid");
    }

    set(this, "errors", errors);
    return !!errors.length;
  },

  async fetchDelegatePitch() {
    if (this.profile.address) {
      const cli = new KarmaApiClient(
        this.siteSettings.DAO_name,
        this.profile.address
      );
      const { delegatePitch } = await cli.fetchDelegatePitch();
      if (delegatePitch) {
        set(this, "form", {
          ...this.form,
          description: delegatePitch.description,
        });
        set(this, "postId", delegatePitch.postId);
      }
    }
  },

  async post() {
    try {
      const cli = new KarmaApiClient(
        this.siteSettings.DAO_name,
        this.form.publicAddress
      );

      const { id: postId } = await postToTopic({
        threadId: this.threadId,
        body: this.form.description,
        csrf: this.session.csrfToken,
      });

      await cli.saveDelegatePitch({
        threadId: this.threadId,
        description: this.form.description,
        discourseHandle: this.currentUser.username,
        postId,
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
  @action
  setPublicAddress(e) {
    set(this, "form", { ...this.form, publicAddress: e.target.value });
  },

  didReceiveAttrs() {
    this._super(...arguments);
    if (this.profile?.address) {
      this.fetchDelegatePitch();
      set(this, "lockDelegateAddress", true);
      set(this, "form", {
        ...this.form,
        publicAddress: this.profile.address,
      });
    }
  },
});
