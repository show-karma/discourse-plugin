import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, computed, set } from "@ember/object";
import { throttle } from "@ember/runloop";
import postToTopic from "../../lib/post-to-topic";
import { fetchActiveOffChainProposals } from "../../lib/voting-history/gql/off-chain-fetcher";
import { fetchActiveOnChainProposals } from "../../lib/voting-history/gql/on-chain-fetcher";

export default Component.extend({
  form: { reason: "", user: "", proposalId: -1, summary: "" },

  vote: {},

  proposals: [],

  message: "",

  loading: false,

  fetched: false,

  visible: false,

  modalId: computed(function () {
    return this.vote.proposalId + "__karma-vote-form-modal";
  }),

  threadId: computed(function () {
    return this.siteSettings.Vote_reason_thread_id;
  }),

  proposalTitle: computed(function () {
    return this.proposals[this.form.proposalId]?.id;
  }),

  // proposalTitle: computed(function() {
  //   return this.proposal[this.form.proposalId]?.id
  // })

  init() {
    this._super(...arguments);
    this.fetchProposals();
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

  async post() {
    try {
      if (this.form.reason.length + this.form.summary.length < 20) {
        return false;
      }
      await postToTopic({
        threadId: this.threadId,
        body: `${this.proposalTitle}\n
          **Summary**: ${this.form.summary}\n
          **Recommendation**:
          ${this.form.reason}`,
        csrf: this.session.csrfToken,
      });
    } catch (error) {
      console.error(error);
    }
  },

  async send() {
    set(this, "loading", true);
    await this.post();
    set(this, "loading", false);
    setTimeout(() => {
      this.toggleModal();
    }, 2000);
    set(this, "message", "Thank you! You reason was submitted successfully.");
  },

  async fetchProposals() {
    const daoNames = [this.siteSettings.DAO_name];

    if (!/\.eth$/g.test(daoNames[0])) {
      daoNames.push(`${daoNames[0]}.eth`);
    }

    const onChain = await fetchActiveOnChainProposals(daoNames, 500);
    const offChain = await fetchActiveOffChainProposals(daoNames, 500);

    const proposals = onChain
      .concat(offChain)
      .sort((a, b) => (moment(a.endsAt).isBefore(moment(b.endsAt)) ? 1 : -1));
    set(this, "proposals", proposals);
    set(this, "fetched", true);
  },

  @action
  submit(e) {
    e.preventDefault();
    return throttle(this, this.send, 200);
  },

  setFormData(key, data) {
    set(this, "form", { ...this.form, [key]: data });
  },

  @action
  setReason(e) {
    this.setFormData("reason", e.target.value);
  },

  @action
  setSummary(e) {
    this.setFormData("summary", e.target.value);
  },

  @action
  setProposal(e) {
    this.setFormData("proposalId", e.target.value);
  },

  didReceiveAttrs() {
    this._super(...arguments);
    this.form.user = this.currentUser.username;
  },
});
