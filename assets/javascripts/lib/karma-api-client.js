import { karmaApiUrl } from "./consts";
import { isTypeof } from "./is-typeof";
import { request } from "./request";

const localApi = "/karma-score";
const karmaUrl = karmaApiUrl;
class KarmaApiClient {
  daoName;
  publicAddress;
  voteUrl;
  pitchUrl;

  constructor(daoName, publicAddress) {
    if (!daoName && publicAddress) {
      throw new Error("Dao Name and Public Address must be defined!");
    }

    this.daoName = daoName;
    this.publicAddress = publicAddress;

    this.voteUrl = `${karmaUrl}/forum-user/${daoName}/vote-reason/${publicAddress}`.toLowerCase();
    this.pitchUrl = `${karmaUrl}/forum-user/${daoName}/delegate-pitch/${publicAddress}`.toLowerCase();
  }

  checkHealth() {
    return request(`${karmaUrl}/app/env`, null, "GET");
  }

  saveVoteReason(proposalId, reason, csrfToken, isUpdate = false) {
    isTypeof(csrfToken, "string");
    if (
      !(
        reason.summary ||
        reason.threadId ||
        reason.recommendation ||
        reason.postId
      )
    ) {
      throw Error("Missing values for reason.");
    }

    const url = `${localApi}/vote-reason.json`;
    return request(
      url,
      {
        ...reason,
        proposalId,
        publicAddress: this.publicAddress,
      },
      isUpdate ? "PUT" : "POST",

      {
        "X-CSRF-Token": csrfToken,
      }
    );
  }

  fetchVoteReasons() {
    return request(this.voteUrl, null, "GET");
  }

  /**
   * Saves the delegate pitch to Karma Api
   * @param {string} pitch.description the actual pitch
   * @param {string} pitch.threadId the thread id
   * @param {string} pitch.postId the post id
   * @param {string} pitch.discourseHandle the discourse username
   */
  saveDelegatePitch(pitch, csrfToken, isUpdate = false) {
    isTypeof(csrfToken, "string");
    if (!(pitch.description || pitch.threadId)) {
      throw new Error("Missing values for pitch.");
    }

    return request(
      `${localApi}/delegate-pitch.json`,
      {
        ...pitch,
        publicAddress: this.publicAddress,
        forum: window.location.host,
      },
      isUpdate ? "PUT" : "POST",
      {
        "X-CSRF-Token": csrfToken,
      }
    );
  }

  /**
   * Fetches the delegate pitch if exists
   */
  fetchDelegatePitch() {
    return request(this.pitchUrl, null, "GET");
  }

  fetchUser(username) {
    isTypeof(username, "string");

    const url = `${karmaUrl}/forum-user/${username}/${this.daoName}`.toLowerCase();
    return request(url, null, "GET");
  }

  isApiAllowed(csrfToken) {
    return request(`${localApi}/allowance.json`, null, "GET", {
      "X-CSRF-Token": csrfToken,
    });
  }


  /**
   * @param {import('karma-score').KarmaApiVotesSummaryRes} summary
   * @returns {import('karma-score').ParsedProposal[]}
   */
  #parseVotingSummary = (summary) => {
    console.info('voting summary', summary)
    const { proposals, votes } = summary;
    const parsedVotes = [];

    votes.sort().forEach((vote) => {
      const [id, version] = vote.proposalId.split('-');
      console.log('id', id, 'version', version)
      const proposal = proposals.find(p => p.id === +id && p.version === version);
      console.log('proposal', proposal)
      if (!proposal) {
        return;
      }

      parsedVotes.push({
        title: proposal?.title,
        proposalId: proposal.id,
        voteMethod: "Off-chain",
        proposal: proposal?.title,
        choice: vote.reason,
        executed: moment(proposal.endDate).format("MMMM D, YYYY"),
      });
    })

    return parsedVotes.sort((a, b) => moment(a.executed).isBefore(moment(b.executed)) ? 1 : -1);
  }

  /**
   * Get voting summary for moonbeam and moonriver ONLY
   * @returns {Promise<import("karma-score").KarmaApiVotesSummaryRes>
   */
  async fetchVoteSummary() {
    console.info('fetching voting summary')
    if (!['moonbeam', 'moonriver', 'moonbase'].includes(this.daoName.toLowerCase())) {
      return { proposals: [], votes: [] };
    }
    const url = `${karmaUrl}/delegate/${this.daoName}/${this.publicAddress}/voting-history`.toLowerCase();
    return await request(url, null, "GET");
  }
}

export default KarmaApiClient;
