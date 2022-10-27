import Component from "@ember/component";
import { action, computed, set } from "@ember/object";
import KarmaApiClient from "../../lib/karma-api-client";

export default Component.extend({
  label: "",
  profile: {},
  isOpen: false,
  noneLabel: "delegate_actions.dropdown_none_label",

  delegateVisible: false,

  voteReasonVisible: false,

  shouldShow: computed(function () {
    return (
      this.currentUser?.username &&
      ((this.siteSettings.Show_delegate_pitch_form &&
        this.siteSettings.Delegate_pitch_thread_id) ||
        this.siteSettings.Show_vote_reason_form)
    );
  }),

  async fetchProfile() {
    const cli = new KarmaApiClient(this.siteSettings.DAO_name);
    const profile = await cli.fetchUser(this.currentUser?.username);
    set(this, "profile", profile);
  },

  async init() {
    this._super(...arguments);
    this.fetchProfile();
    this._super(...arguments);
    const cli = new KarmaApiClient(this.siteSettings.DAO_name, "");
    if (this.session) {
      try {
        const { allowance } = await cli.isApiAllowed(this.session.csrfToken);
        set(this, "hasSetApiKey", !!allowance);
      } catch {}
    }
  },

  toggleModal: function (modalId, visibility) {
    const ttl = 100;
    const el = $(`#${modalId}`);
    if (visibility) {
      el.animate(
        {
          opacity: "0",
          transform: "translateY(20px)",
        },
        ttl
      );

      setTimeout(() => el.hide(), ttl * 2);
    } else {
      el.show();
      el.animate(
        {
          opacity: "1",
          transform: "translateY(0)",
        },
        ttl
      );
    }
  },

  @action
  onClick() {
    set(this, "isOpen", !this.isOpen);
  },

  @action
  toggleDelegate() {
    this.toggleModal("__karma-vote-pitch-modal", this.delegateVisible);
    set(this, "delegateVisible", !this.delegateVisible);
  },

  @action
  toggleVote() {
    this.toggleModal("__karma-vote-form-modal", this.voteReasonVisible);
    set(this, "voteReasonVisible", !this.voteReasonVisible);
  },
});
