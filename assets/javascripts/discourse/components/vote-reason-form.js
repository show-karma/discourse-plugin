import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action, computed, set } from "@ember/object";
import { throttle } from "@ember/runloop";
import postToTopic from "../../lib/post-to-topic";
import { fetchActiveOffChainProposals } from "../../lib/voting-history/gql/off-chain-fetcher";
import { fetchActiveOnChainProposals } from "../../lib/voting-history/gql/on-chain-fetcher";
import fetchUserThreads from "../../lib/fetch-user-threads";

export default Component.extend({
  form: { reason: "", user: "", proposalId: -1, summary: "", threadId: -1 },

  vote: {},

  proposals: [],

  threads: [],

  message: "",

  loading: false,

  fetched: false,

  visible: false,

  errors: [],

  modalId: computed(function () {
    return this.vote.proposalId + "__karma-vote-form-modal";
  }),

  threadId: -1,

  proposalTitle: computed(function () {
    return this.proposals[this.form.proposalId]?.title;
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

  async fetchThreads() {
    try {
      const threads = await fetchUserThreads(this.form.user);
      set(
        this,
        "threads",
        threads.topic_list.topics.map((topic) => ({
          name: topic.fancy_title,
          id: topic.id,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  },

  async post() {
    try {
      await postToTopic({
        threadId: this.threadId,
        body: `${this.proposalTitle}

**Summary**: ${this.form.summary}

**Recommendation**: ${this.form.reason}`,

        csrf: this.session.csrfToken,
      });
    } catch (error) {
      console.error(error);
    }
  },

  checkErrors() {
    set(this, "errors", []);
    const raw = this.form.reason + this.form.summary;
    const errors = this.errors;

    if (this.form.proposalId === -1) {
      errors.push("Proposal is required.");
    }

    if (this.form.threadId === -1) {
      errors.push("Reason thread is required.");
    }

    if (raw.length < 20) {
      errors.push("Your messages should have at least 20 chars.");
    }
    set(this, "errors", errors);
    return !!errors.length;
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
          set(this, "form", {
            reason: "",
            user: "",
            proposalId: -1,
            summary: "",
          });
        }, 250);
      }, 2000);
      set(this, "message", "Thank you! You reason was submitted successfully.");
    }
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
  @action
  setThreadId(e) {
    const idx = +e.target.value;
    this.setFormData("threadId", this.threads[idx].id);
  },

  didReceiveAttrs() {
    this._super(...arguments);
    this.form.user = this.currentUser.username;
    this.fetchThreads();
  },
});
