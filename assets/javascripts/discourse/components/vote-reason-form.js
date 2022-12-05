import Component from "@ember/component";
import { action, set } from "@ember/object";
import { throttle } from "@ember/runloop";
import postToTopic from "../../lib/post-to-topic";
import deletePost from "../../lib/delete-post";
import { fetchActiveOffChainProposals } from "../../lib/voting-history/gql/off-chain-fetcher";
import { fetchActiveOnChainProposals } from "../../lib/voting-history/gql/on-chain-fetcher";
import fetchUserThreads from "../../lib/fetch-user-threads";
import KarmaApiClient from "../../lib/karma-api-client";
import updatePost from "../../lib/update-post";
import getProposalLink from "../../lib/get-proposal-link";
import { fetchDaoSnapshotAndOnChainIds } from "../../lib/fetch-snapshot-onchain-ids";

export default Component.extend({
  form: { recommendation: "", summary: "", publicAddress: "", postId: null },

  vote: {},

  submittedVotes: [],

  proposals: [],

  reasons: [],

  threads: [],

  hideButton: true,

  message: "",

  loading: false,

  proposalLoading: false,

  fetched: false,

  visible: false,

  errors: [],

  modalId: "__karma-vote-form-modal",

  threadId: -1,

  proposalId: -1,

  onClose: function () {
    set(this, "visible", false);
  },

  proposalLink: function () {
    const proposal = this.proposals[this.proposalId];
    const link = getProposalLink(proposal);
    return link ? `[${proposal.title}](${link})` : `### ${proposal.title}`;
  },

  // proposalTitle: computed(function() {
  //   return this.proposal[this.form.proposalId]?.id
  // })

  resetForm() {
    set(this, "form", {
      ...this.form,
      recommendation: "",
      summary: "",
      postId: null,
    });
    set(this, "proposalId", -1);
  },

  dispatchToggleModal() {
    setTimeout(() => {
      // this.toggleModal();
      setTimeout(() => {
        set(this, "message", "");
        set(this, "errors", []);
        // this.resetForm();
      }, 250);
    }, 2000);
  },

  async createThread() {
    return false;
  },

  async post() {
    let postId;
    const { reason: hasReason } = this.proposals[this.proposalId];
    const hasSetReason = !!hasReason;
    const karma = new KarmaApiClient(
      this.siteSettings.DAO_name,
      this.form.publicAddress
    );
    const reason = `${this.proposalLink()}

${this.form.recommendation}`;

    try {
      if (hasReason?.postId) {
        postId = hasReason.postId;
        await updatePost({
          postId,
          body: reason,
          csrf: this.session.csrfToken,
        });
      } else {
        const { id } = await postToTopic({
          threadId: +this.threadId,
          body: reason,
          csrf: this.session.csrfToken,
        });
        postId = id;
      }
    } catch (error) {
      throw new Error("We couldn't post your pitch on Discourse.");
    }

    try {
      await karma.saveVoteReason(
        this.proposals[this.proposalId].id,
        {
          ...this.form,
          postId,
          threadId: this.threadId,
        },
        this.session.csrfToken,
        hasSetReason
      );
      set(this, "postId", postId);
      this.setPostReason(reason);
    } catch (error) {
      if (!hasSetReason && postId) {
        await deletePost({
          postId,
          csrf: this.session.csrfToken,
        });
      }
      throw new Error(
        `We couldn't send your vote to Karma. ${
          error.message ? "Rason: " + error.message : ""
        }`
      );
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
      try {
        if (this.threadId === -2) {
          await this.createThread();
        }
        await this.post();
        this.dispatchToggleModal();
        set(
          this,
          "message",
          "Thank you! Your recommendation was submitted successfully."
        );
      } catch (error) {
        set(this, "errors", [error.message]);
      } finally {
        set(this, "loading", false);
      }
    }
  },

  async fetchThreads() {
    try {
      const threads = await fetchUserThreads(this.currentUser?.username);
      set(
        this,
        "threads",
        threads.topic_list.topics.map((topic) => ({
          name: topic.fancy_title,
          id: topic.id,
        }))
      );
      // this.setDefaultThreadId();
    } catch {}
  },

  async fetchProposals() {
    const { daoIds, DAO_name } = this.siteSettings;

    const graphqlIds = (window.daoIds =
      window.daoIds ??
      daoIds ??
      (await fetchDaoSnapshotAndOnChainIds(DAO_name)));

    let onChain = [];
    if (graphqlIds.onChainId?.length) {
      onChain = await fetchActiveOnChainProposals(
        [graphqlIds.onChainId].flat(),
        500
      );
    }

    let offChain = [];
    if (graphqlIds.snapshotIds?.length) {
      offChain = await fetchActiveOffChainProposals(
        [graphqlIds.snapshotIds].flat(),
        500
      );
    }

    const proposals = onChain
      .concat(offChain)
      .sort((a, b) => (moment(a.endsAt).isBefore(moment(b.endsAt)) ? 1 : -1));

    return proposals;
  },

  async fetchVoteReasons(proposals = []) {
    const karma = new KarmaApiClient(
      this.siteSettings.DAO_name,
      this.profile.address
    );
    try {
      const { reasons } = await karma.fetchVoteReasons();
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
        set(this, "reasons", reasons);
      }
    } catch {}
    set(this, "proposals", proposals);
  },

  setPostReason() {
    const proposals = this.proposals.map((p) => ({ ...p }));
    proposals[this.proposalId].reason = {
      ...this.form,
      threadId: this.threadId,
      postId: this.postId,
    };

    set(this, "proposals", proposals);
  },

  setDefaultThreadId() {
    let threadId = this.threadId;
    if (this.reasons.length && this.threads.length) {
      if (this.reasons?.[0].threadId) {
        threadId = this.threads.findIndex(
          (t) => t.id === this.reasons[0].threadId
        );
      }
      set(this, "threadId", threadId);
    }
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
  @action
  isOutside(e) {
    if (!$(e.target).closest(".modal-content").length) {
      this.onClose();
    }
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
    const proposalId = +e.target.value;
    const { reason } = this.proposals[proposalId];

    if (reason) {
      set(this, "form", {
        ...this.form,
        ...reason,
      });
    } else {
      set(this, "form", {
        ...this.form,
        postId: null,
      });
    }
    set(this, "proposalId", proposalId);
  },

  @action
  setThreadId(e) {
    const idx = +e.target.value;
    if (idx !== "null") {
      set(this, "threadId", idx === -2 ? idx : this.threads[idx].id);
    }
  },
});
