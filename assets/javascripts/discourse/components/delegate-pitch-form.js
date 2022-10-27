import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, computed, observer, set } from "@ember/object";
import { throttle } from "@ember/runloop";
import postToTopic from "../../lib/post-to-topic";
import deletePost from "../../lib/delete-post";
import { isEthAddress } from "../../lib/is-eth-address";
import KarmaApiClient from "../../lib/karma-api-client";
import updatePost from "../../lib/update-post";
import parseFields from "../../lib/parse-fields";
import {
  createPostTextFromFields,
  getFieldValues,
  valuesToFields,
} from "../../lib/get-field-values";

export default Component.extend({
  router: service(),

  proposalId: "",

  reloadTree: () => {},

  hideButton: true,

  form: {
    publicAddress: "",
  },

  customFields: [],

  fields: [
    {
      label: "Enter your pitch here",
      type: "text",
    },
  ],

  postId: null,

  profile: {},

  vote: {},

  message: "",

  loading: false,

  visible: false,

  modalId: "__karma-vote-pitch-modal",

  threadId: computed(function () {
    return +this.siteSettings.Delegate_pitch_thread_id;
  }),

  getFields() {
    const { Delegate_pitch_fields: fields } = this.siteSettings;
    if (fields) {
      set(this, "fields", parseFields(fields));
    }
  },

  init() {
    this._super(...arguments);
    this.getFields();
  },

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
    if (createPostTextFromFields(this.fields) < 20) {
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
          const fields = valuesToFields(
            this.fields,
            delegatePitch.customFields || []
          );
          set(this, "customFields", fields);
          set(this, "postId", delegatePitch.postId);
        } else {
          set(this, "customFields", this.fields);
        }
      } catch {
        set(this, "customFields", this.fields);
      }
    }
  },

  async post() {
    let postId = this.postId;
    const karma = new KarmaApiClient(
      this.siteSettings.DAO_name,
      this.form.publicAddress
    );

    try {
      const body = createPostTextFromFields(this.customFields);
      if (postId) {
        await updatePost({
          postId: this.postId,
          body,
          csrf: this.session.csrfToken,
        });
      } else {
        const { id } = await postToTopic({
          threadId: this.threadId,
          body,
          csrf: this.session.csrfToken,
        });
        postId = id;
      }
    } catch (error) {
      throw new Error("We couldn't post your pitch");
    }

    try {
      const customFields = getFieldValues(this.customFields);
      await karma.saveDelegatePitch(
        {
          threadId: this.threadId,
          customFields,
          discourseHandle: this.currentUser.username,
          postId,
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
  @action
  submit(e) {
    e.preventDefault();
    return throttle(this, this.send, 200);
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
