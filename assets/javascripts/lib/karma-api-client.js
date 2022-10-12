import { isTypeof } from "./is-typeof";
import { request } from "./request";

const apiUrl = "/karma-score";
const karmaUrl = "https://api.showkarma.xyz/api";
// const karmaUrl = "http://192.168.123.101:3001/api";
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

    this.voteUrl = `${karmaUrl}/dao/${daoName}/vote-reason/${publicAddress}`;
    this.pitchUrl = `${karmaUrl}/dao/${daoName}/delegate-pitch/${publicAddress}`;
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

    const url = `${apiUrl}/vote-reason.json`;
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
      `${apiUrl}/delegate-pitch.json`,
      {
        ...pitch,
        publicAddress: this.publicAddress,
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

  isApiAllowed(csrfToken) {
    return request(`${apiUrl}/allowance.json`, null, "GET", {
      "X-CSRF-Token": csrfToken,
    });
  }
}

export default KarmaApiClient;
