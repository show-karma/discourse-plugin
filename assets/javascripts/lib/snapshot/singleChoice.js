import { BaseScore } from "./BaseScore";

export default class SingleChoiceVoting extends BaseScore {
  static isValidChoice(voteChoice, proposalChoices = [""]) {
    return (
      typeof voteChoice === "number" &&
      proposalChoices?.[voteChoice - 1] !== undefined
    );
  }

  getValidVotes() {
    return this.votes.filter((vote) =>
      SingleChoiceVoting.isValidChoice(vote.choice, this.proposal.choices)
    );
  }

  getScores() {
    return this.proposal.choices.map((choice, i) => {
      const votes = this.getValidVotes().filter(
        (vote) => vote.choice === i + 1
      );
      const balanceSum = votes.reduce((a, b) => a + b.balance, 0);
      return balanceSum;
    });
  }

  getScoresByStrategy() {
    return this.proposal.choices.map((choice, i) => {
      const scores = this.strategies.map((strategy, sI) => {
        const votes = this.getValidVotes().filter(
          (vote) => vote.choice === i + 1
        );
        const scoreSum = votes.reduce((a, b) => a + b.scores[sI], 0);
        return scoreSum;
      });
      return scores;
    });
  }

  getScoresTotal() {
    return this.getValidVotes().reduce((a, b) => a + b.balance, 0);
  }

  getChoiceString() {
    return this.proposal.choices[this.selected - 1];
  }
}
