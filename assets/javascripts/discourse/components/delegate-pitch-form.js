import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, computed, set } from "@ember/object";
import { throttle } from "@ember/runloop";
import postToTopic from "../../lib/post-to-topic";
import deletePost from "../../lib/delete-post";
import { isEthAddress } from "../../lib/is-eth-address";
import KarmaApiClient from "../../lib/karma-api-client";

export default Component.extend({
  router: service(),

  proposalId: "",

  form: {
    description: "",
    publicAddress: "",
  },

  postId: null,

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
    let postId;
    const cli = new KarmaApiClient(
      this.siteSettings.DAO_name,
      this.form.publicAddress
    );

    try {
      const { id } = await postToTopic({
        threadId: this.threadId,
        body: this.form.description,
        csrf: this.session.csrfToken,
      });
      postId = id;
    } catch (error) {
      throw new Error("We couldn't post your pitch");
    }

    try {
      await cli.saveDelegatePitch(
        {
          threadId: this.threadId,
          description: this.form.description,
          discourseHandle: this.currentUser.username,
          postId,
        },
        this.session.csrfToken
      );
    } catch (error) {
      deletePost({
        postId,
        csrf: this.session.csrfToken,
      }).catch();
      throw new Error(
        `We couldn't send your pitch to Karma. ${
          error.message ? "Rason: " + error.message : ""
        }`
      );
    }
  },

  async send() {
    const hasErrors = this.checkErrors();
    if (!hasErrors) {
      set(this, "loading", true);
      try {
        await this.post();
        setTimeout(() => {
          this.toggleModal();
          setTimeout(() => {
            set(this, "message", "");
            set(this, "errors", []);
          }, 250);
        }, 2000);
        set(
          this,
          "message",
          "Thank you! You pitch was submitted successfully."
        );
      } catch (error) {
        set(this, "errors", [error.message]);
      } finally {
        set(this, "loading", false);
      }
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
