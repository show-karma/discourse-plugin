import { BaseScore } from "./BaseScore";

export default class ApprovalVoting extends BaseScore {
  static isValidChoice(voteChoice = [], proposalChoices = []) {
    return (
      Array.isArray(voteChoice) &&
      // If voteChoice index is not in proposalChoices, return false
      voteChoice.every(
        (choice) => proposalChoices?.[choice - 1] !== undefined
      ) &&
      // If any voteChoice is duplicated, return false
      voteChoice.length === new Set(voteChoice).size &&
      // If voteChoice is empty, return false
      voteChoice.length > 0
    );
  }

  getValidVotes() {
    return this.votes.filter((vote) =>
      ApprovalVoting.isValidChoice(vote.choice, this.proposal.choices)
    );
  }

  getScores() {
    return this.proposal.choices.map((choice, i) =>
      this.getValidVotes()
        .filter((vote) => vote.choice.includes(i + 1))
        .reduce((a, b) => a + b.balance, 0)
    );
  }

  getScoresByStrategy() {
    return this.proposal.choices.map((choice, i) =>
      this.strategies.map((strategy, sI) =>
        this.getValidVotes()
          .filter((vote) => vote.choice.includes(i + 1))
          .reduce((a, b) => a + b.scores[sI], 0)
      )
    );
  }

  getScoresTotal() {
    return this.getValidVotes().reduce((a, b) => a + b.balance, 0);
  }

  getChoiceString() {
    if (!this.selected) {
      return "";
    }
    return this.proposal.choices
      .filter((_, i) => this.selected.includes(i + 1))
      .join(", ");
  }
}
