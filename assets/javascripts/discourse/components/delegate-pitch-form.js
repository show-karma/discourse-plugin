import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, computed, observer, set } from "@ember/object";
import { throttle } from "@ember/runloop";
import postToTopic from "../../lib/post-to-topic";
import deletePost from "../../lib/delete-post";
import { isEthAddress } from "../../lib/is-eth-address";
import KarmaApiClient from "../../lib/karma-api-client";
import updatePost from "../../lib/update-post";

export default Component.extend({
  router: service(),

  proposalId: "",

  reloadTree: () => {},

  hideButton: true,

  form: {
    description: "",
    publicAddress: "",
    interests: [],
    languages: [],
  },

  postId: null,
  // { id: 1, name: "Orange" },
  interests: [
    { id: 1, name: "DAOs" },
    { id: 2, name: "Economics" },
    { id: 3, name: "Governance" },
    { id: 4, name: "Identity" },
    { id: 5, name: "Social impact" },
    { id: 6, name: "Software Engineering" },
  ],

  languages: [
    { id: 1, name: "English" },
    { id: 2, name: "Mandarin" },
    { id: 3, name: "Hindi" },
    { id: 4, name: "Spanish" },
    { id: 5, name: "French" },
    { id: 6, name: "Arabic" },
    { id: 7, name: "Bengali" },
    { id: 8, name: "Portuguese" },
    { id: 9, name: "Indonesian" },
  ],

  profile: {},

  vote: {},

  message: "",

  loading: false,

  visible: false,

  modalId: "__karma-vote-pitch-modal",

  threadId: computed(function () {
    return +this.siteSettings.Delegate_pitch_thread_id;
  }),

  onClose: function () {
    set(this, "visible", false);
  },

  /**
   * @param {"interests"|"languages"} prop
   */
  stringToMultiselect(str = "", prop = "interests") {
    const values = str.split(",");
    if (!(values && Array.isArray(values) && this[prop])) {
      return [];
    }

    const unique = new Set();
    values.forEach((name) => {
      const idx = this[prop].findIndex((interest) => interest.name === name);
      if (idx > -1) {
        unique.add(idx + 1);
      }
    });
    return Array.from(unique);
  },

  parseMultiselect() {
    return {
      interests: this.form.interests
        .map((idx) => this.interests[idx - 1]?.name)
        .join(","),
      languages: this.form.languages
        .map((idx) => this.languages[idx - 1]?.name)
        .join(","),
    };
  },

  dispatchToggleModal() {
    setTimeout(() => {
      this.onClose?.();
      setTimeout(() => {
        set(this, "message", "");
        set(this, "errors", []);
      }, 250);
    }, 2000);
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
      const karma = new KarmaApiClient(
        this.siteSettings.DAO_name,
        this.profile.address
      );
      try {
        const { delegatePitch } = await karma.fetchDelegatePitch();
        if (delegatePitch) {
          set(this, "form", {
            ...this.form,
            description: delegatePitch.description,
            interests: this.stringToMultiselect(
              delegatePitch.interests,
              "interests"
            ),
            languages: this.stringToMultiselect(
              delegatePitch.languages,
              "languages"
            ),
          });
          set(this, "postId", delegatePitch.postId);
        }
      } catch {}
    }
  },

  async post() {
    let postId = this.postId;
    const karma = new KarmaApiClient(
      this.siteSettings.DAO_name,
      this.form.publicAddress
    );

    try {
      if (postId) {
        await updatePost({
          postId: this.postId,
          body: this.form.description,
          csrf: this.session.csrfToken,
        });
      } else {
        const { id } = await postToTopic({
          threadId: this.threadId,
          body: this.form.description,
          csrf: this.session.csrfToken,
        });
        postId = id;
      }
    } catch (error) {
      throw new Error("We couldn't post your pitch");
    }

    try {
      await karma.saveDelegatePitch(
        {
          threadId: this.threadId,
          description: this.form.description,
          discourseHandle: this.currentUser.username,
          postId,
          ...this.parseMultiselect(),
        },
        this.session.csrfToken,
        !!this.postId
      );
      set(this, "postId", postId);
    } catch (error) {
      if (!this.postId && postId) {
        deletePost({
          postId,
          csrf: this.session.csrfToken,
        }).catch();
      }
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
        this.dispatchToggleModal();
        set(
          this,
          "message",
          "Thank you! Your pitch was submitted successfully."
        );
        this.reloadTree();
        window?.open(`/p/${this.postId}`, "_blank");
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
      set(this, "form", {
        ...this.form,
        publicAddress: this.profile.address,
      });
    }
  },
});
