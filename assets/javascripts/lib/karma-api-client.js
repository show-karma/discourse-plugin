import { request } from "./request";

// const apiUrl = "https://api.showkarma.xyz/api/dao";
const apiUrl = "http://192.168.123.101:3001/api/dao";

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

    this.voteUrl = `${apiUrl}/${daoName}/vote-reason/${publicAddress}`;
    this.pitchUrl = `${apiUrl}/${daoName}/delegate-pitch/${publicAddress}`;
  }

  saveVoteReason(proposalId, reason) {
    if (!(reason.summary || reason.threadId || reason.recommendation)) {
      throw Error("Missing values for reason.");
    }

    const url = this.voteUrl + `/${proposalId}`;
    return request(url, reason, "POST");
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
  saveDelegatePitch(pitch) {
    if (!(pitch.description || pitch.threadId)) {
      throw new Error("Missing values for pitch.");
    }
    return request(this.pitchUrl, pitch, "POST");
  }

  /**
   * Fetches the delegate pitch if exists
   */
  fetchDelegatePitch() {
    return request(this.pitchUrl, null, "GET");
  }
}

export default KarmaApiClient;
