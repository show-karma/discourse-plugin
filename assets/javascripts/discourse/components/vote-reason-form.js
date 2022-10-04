import Component from "@ember/component";
import { action, computed, set } from "@ember/object";
import { throttle } from "@ember/runloop";
import postToTopic from "../../lib/post-to-topic";
import { fetchActiveOffChainProposals } from "../../lib/voting-history/gql/off-chain-fetcher";
import { fetchActiveOnChainProposals } from "../../lib/voting-history/gql/on-chain-fetcher";
import fetchUserThreads from "../../lib/fetch-user-threads";
import KarmaApiClient from "../../lib/karma-api-client";

export default Component.extend({
  form: { recommendation: "", summary: "", publicAddress: "", postId: null },

  vote: {},

  submittedVotes: [],

  proposals: [],

  threads: [],

  message: "",

  loading: false,

  proposalLoading: false,

  fetched: false,

  visible: false,

  errors: [],

  modalId: computed(function () {
    return this.vote.proposalId + "__karma-vote-form-modal";
  }),

  threadId: -1,

  proposalId: -1,

  proposalTitle: computed(function () {
    return this.proposals[this.proposalId]?.title;
  }),

  // proposalTitle: computed(function() {
  //   return this.proposal[this.form.proposalId]?.id
  // })

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
      const cli = new KarmaApiClient(
        this.siteSettings.DAO_name,
        this.form.publicAddress
      );

      const { id: postId } = await postToTopic({
        threadId: this.threadId,
        body: `${this.proposalTitle}

**Summary**: ${this.form.summary}

**Recommendation**: ${this.form.recommendation}`,

        csrf: this.session.csrfToken,
      });

      await cli.saveVoteReason(
        this.proposals[this.proposalId].id,
        {
          ...this.form,
          postId,
          threadId: this.threadId,
        },
        this.session.csrfToken
      );
    } catch (error) {
      console.error(error);
    }
  },

  checkErrors() {
    set(this, "errors", []);
    const raw = this.form.recommendation + this.form.summary;
    const errors = this.errors;

    if (this.threadId === -1) {
      errors.push("Reason thread is required.");
    }

    if (this.proposalId === -1) {
      errors.push("Proposal is required.");
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
            ...this.form,
            recommendation: "",
            proposalId: -1,
            summary: "",
          });
        }, 250);
      }, 2000);
      set(
        this,
        "message",
        "Thank you! Your recommendation was submitted successfully."
      );
    }
  },

  async fetchThreads() {
    try {
      const threads = await fetchUserThreads(this.currentUser.username);
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

    return proposals;
  },

  async fetchVoteReasons(proposals = []) {
    const cli = new KarmaApiClient(
      this.siteSettings.DAO_name,
      this.profile.address
    );
    const { reasons } = await cli.fetchVoteReasons();
    if (reasons && Array.isArray(reasons)) {
      proposals = proposals.map((proposal) => {
        const hasReason = reasons.find(
          (reason) => reason.proposalId === proposal.id
        );
        if (hasReason) {
          proposal.reason = hasReason;
          proposal.disabled = true;
        }
        return proposal;
      });
    }
    set(this, "proposals", proposals);
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
    this.setFormData("recommendation", e.target.value);
  },

  @action
  setSummary(e) {
    this.setFormData("summary", e.target.value);
  },

  @action
  setProposal(e) {
    set(this, "proposalId", e.target.value);
  },

  @action
  setThreadId(e) {
    const idx = +e.target.value;
    set(this, "threadId", this.threads[idx].id);
  },

  async didReceiveAttrs() {
    this._super(...arguments);
    if (this.profile.address) {
      set(this, "proposalLoading", true);
      const proposals = await this.fetchProposals();
      await this.fetchVoteReasons(proposals);
      set(this, "proposalLoading", false);
      set(this, "fetched", true);
      set(this, "form", { ...this.form, publicAddress: this.profile.address });
    }
    this.fetchThreads();
  },
});
